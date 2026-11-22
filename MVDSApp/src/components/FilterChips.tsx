import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selectedKey,
  onSelect
}) => {
  return (
    <View style={styles.outer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {options.map((option, idx) => {
          const isSelected = option.key === selectedKey;
          const isLast = idx === options.length - 1;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                !isLast && styles.chipMargin
              ]}
              onPress={() => onSelect(option.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected
                ]}
              >
                {option.label}
              </Text>
              {option.count !== undefined && (
                <View style={[styles.badge, isSelected ? styles.badgeSelected : styles.badgeUnselected]}>
                  <Text style={[styles.badgeText, isSelected ? styles.badgeTextSelected : styles.badgeTextUnselected]}>
                    {option.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    marginVertical: 8
  },
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5
  },
  chipMargin: {
    marginRight: 8
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700'
  },
  chipTextSelected: {
    color: colors.textInverse,
    fontWeight: '900'
  },
  chipTextUnselected: {
    color: colors.textSecondary
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  badgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)'
  },
  badgeUnselected: {
    backgroundColor: colors.surfaceSubtle
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  badgeTextSelected: {
    color: colors.textInverse
  },
  badgeTextUnselected: {
    color: colors.textMuted
  }
});
