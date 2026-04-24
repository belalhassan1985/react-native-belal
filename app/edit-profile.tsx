import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { userService } from '../src/services/userService';
import { Input } from '../src/components';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../src/constants';

interface EditProfileForm {
  nickname: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();

  const [form, setForm] = useState<EditProfileForm>({
    nickname: profile?.nickname || '',
  });
  const [errors, setErrors] = useState<{ nickname?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const validate = (): boolean => {
    const newErrors: { nickname?: string } = {};

    if (!form.nickname.trim()) {
      newErrors.nickname = 'اللقب مطلوب';
    } else if (form.nickname.trim().length < 2) {
      newErrors.nickname = 'اللقب يجب أن يكون حرفين على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setErrors({});

    try {
      await userService.updateProfile({
        nickname: form.nickname.trim(),
      });

      await refreshProfile();

      Alert.alert('نجاح', 'تم تحديث الملف الشخصي بنجاح', [
        {
          text: 'متابعة',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل تحديث الملف الشخصي';
      Alert.alert('خطأ', message);
    } finally {
      setIsSaving(false);
    }
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.infoCard}>
              <Text style={styles.infoNote}>
                ⚠️ تعديل البريد الإلكتروني وكلمة المرور يتطلب التواصل مع الدعم الفني.
              </Text>
            </View>

            <Input
              label="اللقب"
              value={form.nickname}
              onChangeText={(text: string) => {
                setForm(prev => ({ ...prev, nickname: text }));
                if (errors.nickname) setErrors(prev => ({ ...prev, nickname: undefined }));
              }}
              placeholder="أدخل اللقب"
              error={errors.nickname}
              maxLength={30}
            />

            <View style={styles.readOnlySection}>
              <Text style={styles.readOnlyTitle}>معلومات لا يمكن تعديلها</Text>

              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>البريد الإلكتروني</Text>
                <Text style={styles.readOnlyValue}>
                  {profile?.email || 'غير متوفر'}
                </Text>
              </View>

              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>الاسم</Text>
                <Text style={styles.readOnlyValue}>
                  {[profile?.first_name, profile?.second_name, profile?.third_name, profile?.fourth_name]
                    .filter(Boolean)
                    .join(' ') || 'غير متوفر'}
                </Text>
              </View>

              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>الجنس</Text>
                <Text style={styles.readOnlyValue}>
                  {profile?.gender === 'male' ? 'ذكر' : profile?.gender === 'female' ? 'أنثى' : 'غير متوفر'}
                </Text>
              </View>

              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>المحافظة</Text>
                <Text style={styles.readOnlyValue}>
                  {profile?.state?.name || 'غير متوفر'}
                </Text>
              </View>

              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>مركز التدريب</Text>
                <Text style={styles.readOnlyValue}>
                  {profile?.training_center || 'غير متوفر'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
              )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  form: {
    width: '100%',
  },
  infoCard: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
  },
  infoNote: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning,
    textAlign: 'center',
    lineHeight: 20,
  },
  readOnlySection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  readOnlyTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  readOnlyField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  readOnlyLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  readOnlyValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'left',
    flex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
});