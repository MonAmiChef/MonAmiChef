import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import type { ToastConfig } from 'react-native-toast-message';

interface ToastProps {
  text1?: string;
  text2?: string;
}

const SuccessToast = ({ text1, text2 }: ToastProps) => (
  <View style={styles.container}>
    <View style={[styles.accent, { backgroundColor: '#16a34a' }]} />
    <CheckCircle2 size={20} color="#16a34a" style={styles.icon} />
    <View style={styles.textWrapper}>
      {text1 ? <Text style={styles.title}>{text1}</Text> : null}
      {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
    </View>
  </View>
);

const ErrorToast = ({ text1, text2 }: ToastProps) => (
  <View style={styles.container}>
    <View style={[styles.accent, { backgroundColor: '#ef4444' }]} />
    <XCircle size={20} color="#ef4444" style={styles.icon} />
    <View style={styles.textWrapper}>
      {text1 ? <Text style={styles.title}>{text1}</Text> : null}
      {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
    </View>
  </View>
);

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <SuccessToast text1={text1} text2={text2} />
  ),
  error: ({ text1, text2 }) => (
    <ErrorToast text1={text1} text2={text2} />
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#fff8f2',
    borderRadius: 16,
    paddingVertical: 14,
    paddingRight: 16,
    overflow: 'hidden',
    shadowColor: '#00000026',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 12,
    marginLeft: 4,
  },
  icon: {
    marginRight: 10,
    flexShrink: 0,
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1a1a1a',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6b6b6b',
  },
});
