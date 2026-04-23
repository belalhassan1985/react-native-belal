import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/hooks/useAuth';
import { userService } from '../../src/services/userService';
import { UserProfile } from '../../src/types';
import { SPACING, BORDER_RADIUS } from '../../src/constants';

const getStringValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && value !== null) {
    return value.name ?? value.title ?? value.label ?? '';
  }
  return '';
};

const getDisplayValue = (value: any): string => {
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
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
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
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#EEF2FF', '#F8FAFC']}
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
                  <Text style={styles.avatarText}>
                    {profile.nickname?.charAt(0) || profile.first_name?.charAt(0) || '?'}
                  </Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.fullName}>{fullName || 'غير متوفر'}</Text>
            <Text style={styles.nickname}>{getDisplayValue(profile.nickname)}</Text>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.roleBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.roleBadgeText}>{roleLabel}</Text>
            </LinearGradient>
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
              <InfoRow icon="🗺️" label="المحافظة" value={getDisplayValue(profile.state)} />
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
            style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.8}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
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
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  fullName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  roleBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 20,
    marginLeft: SPACING.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  logoutButton: {
    marginTop: SPACING.xl,
    backgroundColor: '#EF4444',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  version: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: SPACING.md,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    padding: SPACING.md,
  },
  retryText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
