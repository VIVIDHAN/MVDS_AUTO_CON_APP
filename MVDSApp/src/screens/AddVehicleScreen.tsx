import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Animated
} from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { colors } from '../theme/colors';
import { api } from '../api/client';
import { Vehicle, VehicleType, VehicleStatus } from '../types';
import { Base64Image } from '../components/Base64Image';
import {
  PRESET_SPORTS_BIKE,
  PRESET_COMMUTER_BIKE,
  PRESET_SCOOTER,
  PRESET_CAR,
  getPresetForType
} from '../theme/presetImages';

interface AddVehicleScreenProps {
  vehicleToEdit?: Vehicle | null;
  onBack: () => void;
  onSuccess: () => void;
}

export const AddVehicleScreen: React.FC<AddVehicleScreenProps> = ({
  vehicleToEdit,
  onBack,
  onSuccess
}) => {
  const isEditing = !!vehicleToEdit;

  const [name, setName] = useState(vehicleToEdit?.vehicle_name || '');
  const [brand, setBrand] = useState(vehicleToEdit?.brand || '');
  const [modelYear, setModelYear] = useState(vehicleToEdit?.model_year ? String(vehicleToEdit.model_year) : '2023');
  const [regNumber, setRegNumber] = useState(vehicleToEdit?.registration_number || '');
  const [vehicleType, setVehicleType] = useState<VehicleType>(vehicleToEdit?.vehicle_type || 'Cars');
  const [boughtPrice, setBoughtPrice] = useState(vehicleToEdit?.bought_price ? String(vehicleToEdit.bought_price) : '');
  const [priceCode, setPriceCode] = useState(vehicleToEdit?.price_code || '');
  const [sellingPrice, setSellingPrice] = useState(vehicleToEdit?.selling_price ? String(vehicleToEdit.selling_price) : '');
  const [status, setStatus] = useState<VehicleStatus>(vehicleToEdit?.status || 'AVAILABLE');
  const [notes, setNotes] = useState(vehicleToEdit?.notes || '');
  const [imageBase64, setImageBase64] = useState<string>(
    vehicleToEdit?.image_base64 || getPresetForType('Cars', 'Car')
  );
  const [imageSourceLabel, setImageSourceLabel] = useState<string>(
    vehicleToEdit?.image_base64 ? 'Existing Photo' : 'Category Preset'
  );
  const [loading, setLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);

  // Smooth micro-animation on image update
  const previewScale = useRef(new Animated.Value(1)).current;
  const triggerPreviewAnimation = () => {
    Animated.sequence([
      Animated.timing(previewScale, {
        toValue: 1.03,
        duration: 140,
        useNativeDriver: true
      }),
      Animated.spring(previewScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true
      })
    ]).start();
  };

  // Request Android Camera Permission
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Access Required',
          message: 'Mani Auto Counsalting requires camera access to take live photos of vehicles for dealership stock.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Grant Permission'
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Camera permission request error:', err);
      return false;
    }
  };

  // Launch Live Camera
  const handleLaunchCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Camera Permission Needed',
        'Please grant camera permission in Android settings to take vehicle photos.'
      );
      return;
    }

    setImageProcessing(true);
    try {
      const result: ImagePickerResponse = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 900,
        saveToPhotos: true
      });

      if (result.didCancel) {
        setImageProcessing(false);
        return;
      }

      if (result.errorCode) {
        Alert.alert('Camera Notice', result.errorMessage || 'Unable to open camera.');
        setImageProcessing(false);
        return;
      }

      if (result.assets && result.assets[0]?.base64) {
        const fullBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImageBase64(fullBase64);
        setImageSourceLabel('Live Camera Capture');
        triggerPreviewAnimation();
      }
    } catch (e: any) {
      console.error('Launch camera error:', e);
      Alert.alert('Camera Error', 'Could not capture photo: ' + e.message);
    } finally {
      setImageProcessing(false);
    }
  };

  // Launch Photo Gallery / Library
  const handleLaunchGallery = async () => {
    setImageProcessing(true);
    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 900,
        selectionLimit: 1
      });

      if (result.didCancel) {
        setImageProcessing(false);
        return;
      }

      if (result.errorCode) {
        Alert.alert('Gallery Notice', result.errorMessage || 'Unable to open photos.');
        setImageProcessing(false);
        return;
      }

      if (result.assets && result.assets[0]?.base64) {
        const fullBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImageBase64(fullBase64);
        setImageSourceLabel('Uploaded from Phone Photos');
        triggerPreviewAnimation();
      }
    } catch (e: any) {
      console.error('Launch gallery error:', e);
      Alert.alert('Photos Error', 'Could not pick photo: ' + e.message);
    } finally {
      setImageProcessing(false);
    }
  };

  // Auto-generate price code based on selling price or bought price + 20-25%
  const autoGenerateCode = () => {
    const target = Number(sellingPrice) || (Number(boughtPrice) * 1.25);
    if (!target) return;
    if (target >= 100000) {
      const lakhs = (target / 100000).toFixed(2);
      setPriceCode(`MV-${lakhs}L`);
    } else {
      const thousands = Math.round(target / 1000);
      setPriceCode(`MV-${thousands}K`);
    }
  };

  const handleSelectPreset = (t: VehicleType) => {
    const preset = getPresetForType(t, name);
    setImageBase64(preset);
    setImageSourceLabel(`${t} Preset`);
    triggerPreviewAnimation();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Vehicle name is required.');
      return;
    }
    if (!boughtPrice.trim() || isNaN(Number(boughtPrice))) {
      Alert.alert('Validation Error', 'Please enter a valid bought price.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicle_name: name.trim(),
        name: name.trim(),
        brand: brand.trim() || null,
        model_year: modelYear ? parseInt(modelYear, 10) : null,
        registration_number: regNumber.trim().toUpperCase() || null,
        vehicle_type: vehicleType,
        bought_price: parseFloat(boughtPrice),
        price_code: priceCode.trim() || `MV-${Math.round(Number(boughtPrice) * 1.2 / 1000)}K`,
        selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
        status,
        notes: notes.trim() || null,
        image_base64: imageBase64
      };

      if (isEditing && vehicleToEdit) {
        await api.updateVehicle(vehicleToEdit.id, payload);
        Alert.alert('Success', 'Vehicle record updated successfully in MySQL.');
      } else {
        await api.createVehicle(payload);
        Alert.alert('Success', 'New vehicle saved to Mani Auto Counsalting inventory.');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Save vehicle error:', err);
      Alert.alert('Save Failed', err.message || 'Could not save vehicle to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.topBarTitleWrap}>
          <Text style={styles.topBarShop}>MANI AUTO COUNSALTING</Text>
          <Text style={styles.topBarTitle}>
            {isEditing ? 'Edit Vehicle Record' : 'Add Vehicle to Stock'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Real Vehicle Photo Section */}
        <View style={styles.imagePreviewSection}>
          <View style={styles.imageSectionHeaderRow}>
            <Text style={styles.fieldSectionHeader}>VEHICLE PHOTO (64-BIT BASE64 IN MYSQL)</Text>
            <View style={styles.sourcePill}>
              <View style={styles.greenDot} />
              <Text style={styles.sourcePillText}>{imageSourceLabel}</Text>
            </View>
          </View>

          {/* Animated 16:9 Photo Box */}
          <Animated.View style={[styles.previewBox, { transform: [{ scale: previewScale }] }]}>
            <Base64Image
              base64String={imageBase64}
              style={styles.previewImage}
              vehicleType={vehicleType}
              brand={brand}
            />
            {imageProcessing && (
              <View style={styles.imageProcessingOverlay}>
                <ActivityIndicator color="#FFFFFF" size="large" />
                <Text style={styles.processingText}>Processing Base64 Photo...</Text>
              </View>
            )}
          </Animated.View>

          {/* Direct Camera and Phone Photos Action Buttons */}
          <View style={styles.photoActionButtonsRow}>
            {/* Live Camera Button */}
            <TouchableOpacity
              style={styles.cameraActionBtn}
              onPress={handleLaunchCamera}
              disabled={imageProcessing}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircleWhite}>
                <View style={styles.cameraIconBox}>
                  <View style={styles.cameraLensMini} />
                </View>
              </View>
              <View style={styles.btnTextCol}>
                <Text style={styles.cameraBtnTitle}>Take Live Photo</Text>
                <Text style={styles.cameraBtnSub}>Camera Capture</Text>
              </View>
            </TouchableOpacity>

            {/* Phone Photos Library Button */}
            <TouchableOpacity
              style={styles.galleryActionBtn}
              onPress={handleLaunchGallery}
              disabled={imageProcessing}
              activeOpacity={0.85}
            >
              <View style={styles.iconCircleBlue}>
                <View style={styles.galleryIconBox}>
                  <View style={styles.galleryFrameMini} />
                </View>
              </View>
              <View style={styles.btnTextCol}>
                <Text style={styles.galleryBtnTitle}>Upload from Photos</Text>
                <Text style={styles.galleryBtnSub}>Device Gallery</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Visiting Card Category Demo Presets */}
          <Text style={styles.presetLabel}>Or Select Visiting Card Category Preset (A to Z):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
            {(['Cars', 'Two Wheelers', 'JCB / Earth Movers', 'Tractors', 'Pickup', 'Tippers', 'Trucks', 'Buses', 'Vans', 'Special Vehicles'] as VehicleType[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.presetChip, vehicleType === cat && styles.presetChipActive]}
                onPress={() => {
                  setVehicleType(cat);
                  handleSelectPreset(cat);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.presetChipText, vehicleType === cat && styles.presetChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Section 1: Identification */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>1. VEHICLE IDENTITY & CLASSIFICATION</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>VEHICLE NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mahindra 575 DI Tractor, JCB 3DX, Swift VXi"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfCol]}>
              <Text style={styles.label}>BRAND / MAKE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mahindra, JCB, Tata"
                placeholderTextColor={colors.textMuted}
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfCol]}>
              <Text style={styles.label}>MODEL YEAR</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2023"
                placeholderTextColor={colors.textMuted}
                value={modelYear}
                onChangeText={setModelYear}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>REGISTRATION NUMBER</Text>
            <TextInput
              style={[styles.input, styles.monoInput]}
              placeholder="e.g. TN 24 AB 9901"
              placeholderTextColor={colors.textMuted}
              value={regNumber}
              onChangeText={setRegNumber}
              autoCapitalize="characters"
            />
          </View>

          {/* Visiting Card 10 Category Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>VEHICLE CATEGORY (A TO Z VISITING CARD)</Text>
            <View style={styles.typeSelector}>
              {(['Cars', 'Two Wheelers', 'JCB / Earth Movers', 'Tractors', 'Pickup', 'Tippers', 'Trucks', 'Buses', 'Vans', 'Special Vehicles'] as VehicleType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeOption, vehicleType === t && styles.typeOptionActive]}
                  onPress={() => {
                    setVehicleType(t);
                    handleSelectPreset(t);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeOptionText, vehicleType === t && styles.typeOptionTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Section 2: Pricing Matrix */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>2. FINANCIALS & SELLING MARGIN</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>BOUGHT PRICE (₹) *</Text>
            <TextInput
              style={[styles.input, styles.monoInput]}
              placeholder="e.g. 1850000"
              placeholderTextColor={colors.textMuted}
              value={boughtPrice}
              onChangeText={(text) => {
                setBoughtPrice(text);
              }}
              onBlur={autoGenerateCode}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfCol]}>
              <View style={styles.labelWithAction}>
                <Text style={styles.label}>SECRET PRICE CODE</Text>
                <TouchableOpacity onPress={autoGenerateCode}>
                  <Text style={styles.actionLink}>Auto-Code</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.monoInput, styles.codeHighlight]}
                placeholder="e.g. MV-22.4L"
                placeholderTextColor={colors.textMuted}
                value={priceCode}
                onChangeText={setPriceCode}
                autoCapitalize="characters"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfCol]}>
              <Text style={styles.label}>SELLING QUOTE (₹)</Text>
              <TextInput
                style={[styles.input, styles.monoInput]}
                placeholder="e.g. 2240000"
                placeholderTextColor={colors.textMuted}
                value={sellingPrice}
                onChangeText={setSellingPrice}
                onBlur={autoGenerateCode}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>INVENTORY STATUS</Text>
            <View style={styles.statusSelector}>
              {(['AVAILABLE', 'BOOKED', 'SOLD'] as VehicleStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusOption, status === s && styles.statusOptionActive]}
                  onPress={() => setStatus(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Section 3: Notes & Inspections */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>3. INSPECTION NOTES & SPECIFICATIONS</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Engine condition, tire wear, single owner, RC book validity, insurance..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Large Action Button */}
        <TouchableOpacity
          style={[styles.bigSaveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} size="small" />
          ) : (
            <Text style={styles.bigSaveBtnText}>
              {isEditing ? 'Update Vehicle Record →' : 'Save to Showroom Inventory →'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle
  },
  backBtnText: {
    color: colors.primary,
    fontSize: 12.5,
    fontWeight: '800'
  },
  topBarTitleWrap: {
    alignItems: 'center'
  },
  topBarShop: {
    color: colors.textMuted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  topBarTitle: {
    color: colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '900'
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8
  },
  saveBtnDisabled: {
    opacity: 0.6
  },
  saveBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '900'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  imagePreviewSection: {
    marginBottom: 16
  },
  imageSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  fieldSectionHeader: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 5
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.available
  },
  sourcePillText: {
    color: colors.available,
    fontSize: 10,
    fontWeight: '800'
  },
  previewBox: {
    height: 185,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: '#0F172A',
    position: 'relative'
  },
  previewImage: {
    width: '100%',
    height: 185
  },
  imageProcessingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  photoActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  cameraActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.available,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 9,
    shadowColor: colors.available,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  iconCircleWhite: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraIconBox: {
    width: 15,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraLensMini: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF'
  },
  galleryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  iconCircleBlue: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  galleryIconBox: {
    width: 15,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  galleryFrameMini: {
    width: 7,
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 1
  },
  btnTextCol: {
    flex: 1
  },
  cameraBtnTitle: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900'
  },
  cameraBtnSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9.5,
    fontWeight: '700'
  },
  galleryBtnTitle: {
    color: colors.primary,
    fontSize: 11.5,
    fontWeight: '900'
  },
  galleryBtnSub: {
    color: colors.textMuted,
    fontSize: 9.5,
    fontWeight: '700'
  },
  presetLabel: {
    color: colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6
  },
  presetScroll: {
    gap: 6,
    paddingVertical: 2
  },
  presetChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  presetChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary
  },
  presetChipText: {
    color: colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '700'
  },
  presetChipTextActive: {
    color: colors.primary,
    fontWeight: '900'
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 12
  },
  inputGroup: {
    marginBottom: 13
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 5
  },
  labelWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  actionLink: {
    color: colors.primary,
    fontSize: 10.5,
    fontWeight: '800'
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9.5,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700'
  },
  monoInput: {
    letterSpacing: 0.4
  },
  codeHighlight: {
    borderColor: colors.availableBorder,
    backgroundColor: colors.availableBg,
    color: colors.available
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  halfCol: {
    flex: 1
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  typeOption: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  typeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  typeOptionText: {
    color: colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '700'
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  statusOption: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  statusOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary
  },
  statusOptionText: {
    color: colors.textMuted,
    fontSize: 10.5,
    fontWeight: '700'
  },
  statusOptionTextActive: {
    color: colors.primary,
    fontWeight: '900'
  },
  bigSaveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  bigSaveBtnText: {
    color: colors.textInverse,
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.3
  }
});
