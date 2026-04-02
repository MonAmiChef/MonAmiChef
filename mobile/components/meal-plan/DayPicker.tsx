import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';

interface DayPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

function getWeekDates(selectedDate: Date): Date[] {
  const dates: Date[] = [];
  const start = new Date(selectedDate);
  // Get Monday of the week containing selectedDate
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
  start.setDate(diff);

  for (let i = 0; i < 7; i++) {
    dates.push(new Date(start));
    start.setDate(start.getDate() + 1);
  }
  return dates;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function isPastDay(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export default function DayPicker({ selectedDate, onDateChange }: DayPickerProps) {
  const { t, i18n } = useTranslation();
  const weekDates = getWeekDates(selectedDate);
  const today = new Date();

  return (
    <View style={styles.container}>
      {weekDates.map((date, index) => {
        const isSelected = isSameDay(date, selectedDate);
        const isTodayDate = isSameDay(date, today);
        const isPast = isPastDay(date);

        // Get short day name (e.g. Mon, Lun)
        const dayName = date.toLocaleDateString(i18n.language, { weekday: 'short' }).toUpperCase().replace('.', '');
        const dayNumber = date.getDate();

        return (
          <Pressable
            key={index}
            onPress={() => onDateChange(date)}
            style={[
              styles.bubble,
              isSelected && styles.selectedBubble,
              !isSelected && isTodayDate && styles.todayBubble,
              !isSelected && isPast && styles.pastBubble,
            ]}
          >
            <Text
              style={[
                styles.dayLabel,
                isSelected && styles.selectedText,
                !isSelected && isPast && styles.pastText,
              ]}
            >
              {dayName}
            </Text>
            <Text
              style={[
                styles.dateLabel,
                isSelected && styles.selectedText,
                !isSelected && isPast && styles.pastText,
              ]}
            >
              {dayNumber}
            </Text>
            {isTodayDate && !isSelected && (
              <View style={styles.todayIndicator} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  bubble: {
    flex: 1,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  selectedBubble: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  todayBubble: {
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
  },
  pastBubble: {
    backgroundColor: '#f1f5f9',
    opacity: 0.6,
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#1e293b',
  },
  selectedText: {
    color: '#ffffff',
  },
  pastText: {
    color: '#94a3b8',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f97316',
  },
});
