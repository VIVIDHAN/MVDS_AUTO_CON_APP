import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import { colors } from '../theme/colors';

interface Base64ImageProps {
  base64String?: string | null;
  style?: StyleProp<ImageStyle>;
  vehicleType?: string;
  brand?: string | null;
  compact?: boolean;
}

export const Base64Image: React.FC<Base64ImageProps> = ({
  base64String,
  style,
  vehicleType = 'Vehicle',
  brand,
  compact = false
}) => {
  const [hasError, setHasError] = useState(false);

  const getImageUri = (raw?: string | null): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (trimmed.startsWith('data:image/')) {
      return trimmed;
    }
    return `data:image/jpeg;base64,${trimmed}`;
  };

  const imageUri = getImageUri(base64String);

  if (!imageUri || hasError) {
    return (
      <View style={[styles.fallbackContainer, compact && styles.fallbackCompact, style]}>
        <View style={styles.fallbackEmblem}>
          <Text style={styles.fallbackEmblemText}>MVDS</Text>
        </View>
        {!compact && (
          <View style={styles.fallbackTextWrap}>
            <Text style={styles.fallbackBrand}>{brand?.toUpperCase() || 'MANI VEHICLES'}</Text>
            <Text style={styles.fallbackSub}>{vehicleType.toUpperCase()} SHOWROOM</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={[styles.image, style]}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#F1F5F9',
    width: '100%'
  },
  fallbackContainer: {
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    minHeight: 120
  },
  fallbackCompact: {
    minHeight: 50,
    borderRadius: 8
  },
  fallbackEmblem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 6
  },
  fallbackEmblemText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1
  },
  fallbackTextWrap: {
    alignItems: 'center'
  },
  fallbackBrand: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  fallbackSub: {
    color: colors.accentGreen,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2
  }
});
