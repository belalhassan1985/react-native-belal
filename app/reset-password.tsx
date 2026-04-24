import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { authService } from '../src/services/authService';
import { Input, Button } from '../src/components';
import { COLORS, SPACING } from '../src/constants';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isFirstLoginMode = params.mode === 'first-login';
  const { skipFirstLoginReset, logout, profile, refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (profile?.email && !email) {
      setEmail(profile.email);
    }
  }, [profile]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!oldPassword) {
      newErrors.oldPassword = 'كلمة المرور الحالية مطلوبة';
    }

    if (!newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.resetFirstLogin({
        email: email.trim(),
        password: oldPassword,
        old_password: oldPassword,
        new_password: newPassword,
        password_confirmation: confirmPassword,
      });

      await refreshProfile();
      Alert.alert('نجاح', 'تم تغيير كلمة المرور بنجاح', [
        { text: 'حسناً', onPress: () => router.replace('/(tabs)/home') },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';

      if (message.includes('CREDENTIALS_ALREADY_RESET') || message.includes('already')) {
        await skipFirstLoginReset();
        router.replace('/(tabs)/home');
        return;
      }

      Alert.alert('خطأ', message || 'فشل تغيير كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await skipFirstLoginReset();
      router.replace('/(tabs)/home');
    } catch {
      router.replace('/(tabs)/home');
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
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔑</Text>
            </View>
            <Text style={styles.title}>تغيير كلمة المرور</Text>
            <Text style={styles.subtitle}>
              {isFirstLoginMode
                ? 'يُنصح بتغيير كلمة المرور المؤقتة'
                : 'أدخل بياناتك لتغيير كلمة المرور'}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="البريد الإلكتروني"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="أدخل بريدك الإلكتروني"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <Input
              label="كلمة المرور الحالية"
              value={oldPassword}
              onChangeText={(text) => {
                setOldPassword(text);
                if (errors.oldPassword) setErrors((p) => ({ ...p, oldPassword: undefined }));
              }}
              placeholder="أدخل كلمة المرور الحالية"
              secureTextEntry
              showPasswordToggle
              error={errors.oldPassword}
            />

            <Input
              label="كلمة المرور الجديدة"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: undefined }));
              }}
              placeholder="أدخل كلمة المرور الجديدة"
              secureTextEntry
              showPasswordToggle
              error={errors.newPassword}
            />

            <Input
              label="تأكيد كلمة المرور الجديدة"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              secureTextEntry
              showPasswordToggle
              error={errors.confirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <Button
              title="تغيير كلمة المرور"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />
          </View>

          <View style={styles.actions}>
            {isFirstLoginMode && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>تخطي الآن والمتابعة</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>تسجيل الخروج</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  submitButton: {
    marginTop: SPACING.sm,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  logoutText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
});
