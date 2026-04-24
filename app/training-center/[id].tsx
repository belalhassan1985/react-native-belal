import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trainingCenterService } from '../../src/services/trainingCenterService';
import { TrainingCenter, TrainingCenterNote } from '../../src/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';

export default function TrainingCenterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const centerId = Number(id);
  const router = useRouter();

  const [center, setCenter] = useState<TrainingCenter | null>(null);
  const [notes, setNotes] = useState<TrainingCenterNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenterData = useCallback(async () => {
    if (!centerId || centerId <= 0) {
      setError('معرف مركز التدريب غير صالح');
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      const [centerRes, notesRes] = await Promise.allSettled([
        trainingCenterService.getTrainingCenter(centerId),
        trainingCenterService.getAllNotes(centerId),
      ]);

      if (centerRes.status === 'fulfilled' && centerRes.value.status === 'success') {
        setCenter(centerRes.value.data);
      } else {
        setError('لم يتم العثور على مركز التدريب');
      }

      if (notesRes.status === 'fulfilled' && notesRes.value.status === 'success') {
        setNotes(notesRes.value.data || []);
      }
    } catch {
      setError('فشل تحميل البيانات');
    } finally {
      setIsLoading(false);
      setIsLoadingNotes(false);
    }
  }, [centerId]);

  useEffect(() => {
    fetchCenterData();
  }, [fetchCenterData]);

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'غير محدد';
    try {
      return new Date(dateStr).toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'غير محدد';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !center) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>مركز التدريب</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error || 'فشل تحميل البيانات'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCenterData}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مركز التدريب</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {center.image_url && (
          <Image
            source={{ uri: center.image_url }}
            style={styles.centerImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.heroSection}>
          <Text style={styles.centerName}>{center.name}</Text>
          {center.description && (
            <Text style={styles.centerDescription}>{center.description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المركز</Text>
          <View style={styles.infoCard}>
            {center.city && (
              <InfoItem icon="📍" label="المدينة" value={center.city} />
            )}
            {center.address && (
              <InfoItem icon="🏠" label="العنوان" value={center.address} />
            )}
            {center.phone && (
              <InfoItem icon="📞" label="الهاتف" value={center.phone} />
            )}
            {center.email && (
              <InfoItem icon="📧" label="البريد الإلكتروني" value={center.email} />
            )}

            {!center.city && !center.address && !center.phone && !center.email && (
              <Text style={styles.noInfo}>لا توجد معلومات إضافية</Text>
            )}
          </View>
        </View>

        {notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الإعلانات والملاحظات</Text>
            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteContent}>{note.content}</Text>
                <Text style={styles.noteDate}>{formatDate(note.created_at)}</Text>
              </View>
            ))}
          </View>
        )}

        {notes.length === 0 && (
          <View style={styles.section}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>لا توجد إعلانات حالياً</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const safeValue = value ?? '';
  if (!safeValue) return null;
  
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{safeValue}</Text>
      </View>
    </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  centerImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surface,
  },
  heroSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  centerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  centerDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIcon: {
    fontSize: 18,
    marginEnd: SPACING.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  noInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.md,
  },
  noteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  noteContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  noteDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});