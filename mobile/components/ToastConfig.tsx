import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import type { ToastConfig } from 'react-native-toast-message';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface ToastProps {
  text1?: string;
  text2?: string;
  type: 'success' | 'error' | 'info';
}

const PremiumToast = ({ text1, text2, type }: ToastProps) => {
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;
  const accentColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  const borderColor = type === 'success' ? 'rgba(16, 185, 129, 0.2)' : type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)';

  return (
    <View style={styles.outerContainer}>
      <BlurView intensity={80} tint="light" style={[styles.container, { borderColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
          <Icon size={18} color={accentColor} strokeWidth={2.5} />
        </View>
        <View style={styles.textWrapper}>
          {text1 ? <Text style={styles.title}>{text1}</Text> : null}
          {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
        </View>
      </BlurView>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <PremiumToast text1={text1} text2={text2} type="success" />
  ),
  error: ({ text1, text2 }) => (
    <PremiumToast text1={text1} text2={text2} type="error" />
  ),
  info: ({ text1, text2 }) => (
    <PremiumToast text1={text1} text2={text2} type="info" />
  ),
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 40,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 18,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
    lineHeight: 16,
  },
});
