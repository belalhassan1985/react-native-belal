import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { userService } from '../../src/services/userService';
import { UserProfile } from '../../src/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';

const getStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && value !== null) {
    return (value as Record<string, unknown>).name as string ?? (value as Record<string, unknown>).title as string ?? '';
  }
  return '';
};

const getDisplayValue = (value: unknown): string => {
  const str = getStringValue(value);
  return str || 'غير متوفر';
};

const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

const getGenderArabic = (gender: string | undefined): string => {
  if (!gender) return 'غير متوفر';
  return gender === 'male' ? 'ذكر' : gender === 'female' ? 'أنثى' : 'غير متوفر';
};

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(authProfile);
  const [isLoading, setIsLoading] = useState(!authProfile);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!authProfile) {
      loadProfile();
    }
  }, [authProfile]);

  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
    }
  }, [authProfile]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
    } catch {
      // Keep existing profile if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await logout();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>فشل تحميل البيانات</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = [
    profile.first_name,
    profile.second_name,
    profile.third_name,
    profile.fourth_name,
  ].filter(Boolean).join(' ');

  const roleLabel = profile.role === 'admin' ? 'مدير النظام' :
    profile.role === 'trainee' ? 'متدرب' :
    profile.role === 'trainer' ? 'مدرب' :
    profile.role === 'center_manager' ? 'مدير المركز' :
    getDisplayValue(profile.role);

  const initials = profile.nickname?.charAt(0) || profile.first_name?.charAt(0) || '؟';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark] as readonly [string, string, ...string[]]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              {profile.image_url ? (
                <Image
                  source={{ uri: profile.image_url.startsWith('http') ? profile.image_url : `https://api.tcms-iraq.com${profile.image_url}` }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </View>
            <Text style={styles.fullName}>{fullName || 'غير متوفر'}</Text>
            <Text style={styles.nickname}>{getDisplayValue(profile.nickname)}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{roleLabel}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="👤" label="الاسم الكامل" value={fullName} />
              <InfoRow icon="🏷️" label="اللقب" value={getDisplayValue(profile.nickname)} />
              <InfoRow icon="📧" label="البريد الإلكتروني" value={getDisplayValue(profile.email)} />
              <InfoRow icon="⚧" label="الجنس" value={getGenderArabic(profile.gender)} />
              <InfoRow icon="🎂" label="تاريخ الميلاد" value={formatDate(profile.birth_date) || 'غير متوفر'} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المعلومات الإدارية</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="🗺️" label="المحافظة" value={getDisplayValue(profile.state?.name)} />
              <InfoRow icon="🏢" label="مركز التدريب" value={getDisplayValue(profile.training_center)} />
              {profile.agency && profile.agency !== 'غير متوفر' && (
                <InfoRow icon="🏛️" label="الوكالة" value={getDisplayValue(profile.agency)} />
              )}
              {profile.general_department && profile.general_department !== 'غير متوفر' && (
                <InfoRow icon="📁" label="القسم العام" value={getDisplayValue(profile.general_department)} />
              )}
              {profile.department && profile.department !== 'غير متوفر' && (
                <InfoRow icon="📂" label="القسم" value={getDisplayValue(profile.department)} />
              )}
              {profile.section && profile.section !== 'غير متوفر' && (
                <InfoRow icon="📄" label="الشعبة" value={getDisplayValue(profile.section)} />
              )}
              <InfoRow icon="🔢" label="الرقم الوظيفي" value={String(profile.id) || 'غير متوفر'} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.editIcon}>✏️</Text>
            <Text style={styles.editText}>تعديل الملف الشخصي</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.passwordButton}
            onPress={() => router.push('/reset-password')}
            activeOpacity={0.8}
          >
            <Text style={styles.passwordIcon}>🔑</Text>
            <Text style={styles.passwordText}>تغيير كلمة المرور</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.8}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={COLORS.text} />
            ) : (
              <>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>تسجيل الخروج</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.version}>الإصدار 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Text style={styles.infoIcon}>{icon}</Text>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  headerGradient: {
    paddingBottom: SPACING.xl,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.surface,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.surface,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.md,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: SPACING.sm,
    marginStart: SPACING.xs,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 18,
    marginEnd: SPACING.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'left',
    flex: 1,
  },
  editButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editIcon: {
    fontSize: 18,
  },
  editText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  passwordButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordIcon: {
    fontSize: 18,
  },
  passwordText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  logoutButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  version: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    padding: SPACING.md,
  },
  retryText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});