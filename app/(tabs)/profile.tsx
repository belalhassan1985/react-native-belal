import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { userService } from '../../src/services/userService';
import { UserProfile } from '../../src/types';
import { COLORS, API_BASE_URL } from '../../src/constants';

const getFullName = (profile: UserProfile): string => {
  return [
    profile.first_name,
    profile.second_name,
    profile.third_name,
    profile.fourth_name,
  ].filter(Boolean).join(' ');
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const getGenderArabic = (gender: string): string => {
  return gender === 'male' ? 'ذكر' : gender === 'female' ? 'أنثى' : 'غير متوفر';
};

const getImageUri = (imageUrl: string): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            await logout();
            router.replace('/login');
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
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>فشل تحميل البيانات</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = getFullName(profile);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.imageSection}>
            {profile.image_url ? (
              <Image
                source={{ uri: getImageUri(profile.image_url) }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile.nickname?.charAt(0) || profile.first_name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {profile.role === 'admin' ? 'مدير النظام' : profile.role}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الاسم الكامل</Text>
              <Text style={styles.infoValue}>{fullName || 'غير متوفر'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>اللقب</Text>
              <Text style={styles.infoValue}>{profile.nickname || 'غير متوفر'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>البريد الإلكتروني</Text>
              <Text style={styles.infoValue}>{profile.email || 'غير متوفر'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الجنس</Text>
              <Text style={styles.infoValue}>{getGenderArabic(profile.gender)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>تاريخ الميلاد</Text>
              <Text style={styles.infoValue}>
                {profile.birth_date ? formatDate(profile.birth_date) : 'غير متوفر'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الإدارية</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>المحافظة</Text>
              <Text style={styles.infoValue}>
                {profile.state?.name || 'غير متوفر'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>مركز التدريب</Text>
              <Text style={styles.infoValue}>
                {profile.training_center || 'غير متوفر'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الرقم الوظيفي</Text>
              <Text style={styles.infoValue}>{profile.id}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 20,
  },
  imageSection: {
    marginEnd: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    marginStart: 4,
  },
  infoCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  infoLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginStart: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});