import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Colors from "@/constants/colors";
import PhotoUpload from "@/components/PhotoUpload";

const C = Colors.light;

const TRUCK_TYPES_AR = ["شاحنة صغيرة", "شاحنة متوسطة", "شاحنة كبيرة", "فان"];
const TRUCK_TYPES_FR = ["Petit camion", "Camion moyen", "Grand camion", "Fourgonnette"];
const TRUCK_TYPES_EN = ["Small Truck", "Medium Truck", "Large Truck", "Van"];

type OptionCard<T> = { value: T; labelKey: keyof ReturnType<typeof useLanguage>["t"]; icon: string; descKey?: keyof ReturnType<typeof useLanguage>["t"] };

export default function PartnerSetupScreen() {
  const { t, isRTL, language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const TRUCK_TYPES =
    language === "ar" ? TRUCK_TYPES_AR : language === "fr" ? TRUCK_TYPES_FR : TRUCK_TYPES_EN;

  const [entityType, setEntityType] = useState<"company" | "freelance" | "">("");
  const [truckType, setTruckType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [workersProvided, setWorkersProvided] = useState<boolean | null>(null);
  const [numberOfWorkers, setNumberOfWorkers] = useState("");
  const [serviceSpec, setServiceSpec] = useState<"furniture_assembly" | "transport_only" | "">("");
  const [coverageScope, setCoverageScope] = useState<"local" | "national" | "">("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");
  const [vehicleUrl, setVehicleUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!entityType) errs.entityType = t.entityTypeRequired;
    if (!truckType) errs.truckType = t.truckTypeRequired;
    if (!licensePlate.trim()) errs.licensePlate = t.licensePlateRequired;
    if (workersProvided === null) errs.workersProvided = t.requiredField;
    if (workersProvided === true) {
      if (!numberOfWorkers.trim()) errs.numberOfWorkers = t.numberOfWorkersRequired;
      else {
        const n = parseInt(numberOfWorkers, 10);
        if (isNaN(n) || n < 1 || n > 50) errs.numberOfWorkers = t.numberOfWorkersInvalid;
      }
    }
    if (!serviceSpec) errs.serviceSpec = t.serviceSpecRequired;
    if (!coverageScope) errs.coverageScope = t.coverageScopeRequired;
    if (!selfieUrl) errs.selfieUrl = t.photoRequired;
    if (!licenseUrl) errs.licenseUrl = t.photoRequired;
    if (!vehicleUrl) errs.vehicleUrl = t.photoRequired;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(
        doc(db, "partners", user.uid),
        {
          uid: user.uid,
          entityType,
          truckType,
          licensePlate: licensePlate.trim().toUpperCase(),
          workersProvided: workersProvided ?? false,
          numberOfWorkers: workersProvided ? parseInt(numberOfWorkers, 10) : 0,
          serviceSpecialization: serviceSpec,
          coverageScope,
          selfieUrl,
          drivingLicenseUrl: licenseUrl,
          vehicleUrl,
          status: "pending",
          isApproved: false,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
      await updateDoc(doc(db, "users", user.uid), {
        needsTruckSetup: false,
        entityType,
        coverageScope,
        serviceSpecialization: serviceSpec,
      });
      await refreshProfile();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/partner-dashboard");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (key: string) =>
    setErrors((e) => { const next = { ...e }; delete next[key]; return next; });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#042770", C.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <MaterialCommunityIcons name="truck-check" size={40} color="#fff" />
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{t.partnerSetupTitle}</Text>
          <Text style={[styles.heroSub, isRTL && styles.textRTL]}>{t.partnerSetupSub}</Text>
        </LinearGradient>

        {/* 1. Entity Type */}
        <SectionBlock label={t.entityType} error={errors.entityType} isRTL={isRTL}>
          <View style={[styles.twoColGrid, isRTL && styles.rowRTL]}>
            {(
              [
                { value: "company", icon: "office-building", label: t.company },
                { value: "freelance", icon: "account-hard-hat", label: t.freelance },
              ] as { value: "company" | "freelance"; icon: string; label: string }[]
            ).map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => { setEntityType(opt.value); clearError("entityType"); Haptics.selectionAsync(); }}
                style={[
                  styles.optCard,
                  entityType === opt.value && styles.optCardSelected,
                  !!errors.entityType && styles.optCardError,
                ]}
              >
                <MaterialCommunityIcons
                  name={opt.icon as any}
                  size={26}
                  color={entityType === opt.value ? "#fff" : C.blue}
                />
                <Text style={[styles.optCardText, entityType === opt.value && styles.optCardTextSel, isRTL && styles.textRTL]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionBlock>

        {/* 2. Truck Type */}
        <SectionBlock label={t.truckType} error={errors.truckType} isRTL={isRTL}>
          <View style={[styles.twoColGrid, isRTL && styles.rowRTL]}>
            {TRUCK_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => { setTruckType(type); clearError("truckType"); Haptics.selectionAsync(); }}
                style={[
                  styles.optCard,
                  truckType === type && styles.optCardSelected,
                  !!errors.truckType && styles.optCardError,
                ]}
              >
                <MaterialCommunityIcons name="truck" size={24} color={truckType === type ? "#fff" : C.textSecondary} />
                <Text style={[styles.optCardText, truckType === type && styles.optCardTextSel, isRTL && styles.textRTL]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionBlock>

        {/* 3. License Plate */}
        <SectionBlock label={t.licensePlate} error={errors.licensePlate} isRTL={isRTL}>
          <View style={[styles.inputRow, !!errors.licensePlate && styles.inputRowError, isRTL && styles.rowRTL]}>
            <MaterialCommunityIcons
              name="card-text-outline"
              size={20}
              color={errors.licensePlate ? C.error : C.textSecondary}
              style={isRTL ? styles.iconRTL : styles.icon}
            />
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              value={licensePlate}
              onChangeText={(v) => { setLicensePlate(v); clearError("licensePlate"); }}
              placeholder={language === "ar" ? "مثال: 12345-67-89" : "ex: 12345-67-89"}
              placeholderTextColor="#A0AEC0"
              autoCapitalize="characters"
              textAlign={isRTL ? "right" : "left"}
            />
          </View>
        </SectionBlock>

        {/* 4. Workers Provided */}
        <SectionBlock label={t.workersProvided} error={errors.workersProvided} isRTL={isRTL}>
          <View style={[styles.twoColGrid, isRTL && styles.rowRTL]}>
            {(
              [
                { value: true, icon: "account-group", label: t.yes },
                { value: false, icon: "account-cancel", label: t.no },
              ] as { value: boolean; icon: string; label: string }[]
            ).map((opt) => (
              <Pressable
                key={String(opt.value)}
                onPress={() => {
                  setWorkersProvided(opt.value);
                  if (!opt.value) setNumberOfWorkers("");
                  clearError("workersProvided");
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.optCard,
                  workersProvided === opt.value && styles.optCardSelected,
                  !!errors.workersProvided && styles.optCardError,
                ]}
              >
                <MaterialCommunityIcons
                  name={opt.icon as any}
                  size={26}
                  color={workersProvided === opt.value ? "#fff" : C.blue}
                />
                <Text style={[styles.optCardText, workersProvided === opt.value && styles.optCardTextSel, isRTL && styles.textRTL]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Number of workers (conditional) */}
          {workersProvided === true && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.subLabel, isRTL && styles.textRTL]}>{t.numberOfWorkers}</Text>
              <View style={[styles.inputRow, !!errors.numberOfWorkers && styles.inputRowError, isRTL && styles.rowRTL]}>
                <MaterialCommunityIcons
                  name="account-multiple"
                  size={20}
                  color={errors.numberOfWorkers ? C.error : C.textSecondary}
                  style={isRTL ? styles.iconRTL : styles.icon}
                />
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL]}
                  value={numberOfWorkers}
                  onChangeText={(v) => { setNumberOfWorkers(v.replace(/[^0-9]/g, "")); clearError("numberOfWorkers"); }}
                  placeholder="1 - 50"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="number-pad"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>
              {!!errors.numberOfWorkers && <ErrorHint text={errors.numberOfWorkers} isRTL={isRTL} />}
            </View>
          )}
        </SectionBlock>

        {/* 5. Service Specialization */}
        <SectionBlock label={t.serviceSpecialization} error={errors.serviceSpec} isRTL={isRTL}>
          <View style={[styles.twoColGrid, isRTL && styles.rowRTL]}>
            {(
              [
                { value: "furniture_assembly", icon: "sofa", label: t.furnitureAssemblyService },
                { value: "transport_only", icon: "truck-fast", label: t.transportOnly },
              ] as { value: "furniture_assembly" | "transport_only"; icon: string; label: string }[]
            ).map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => { setServiceSpec(opt.value); clearError("serviceSpec"); Haptics.selectionAsync(); }}
                style={[
                  styles.optCard,
                  serviceSpec === opt.value && styles.optCardSelected,
                  !!errors.serviceSpec && styles.optCardError,
                ]}
              >
                <MaterialCommunityIcons
                  name={opt.icon as any}
                  size={26}
                  color={serviceSpec === opt.value ? "#fff" : C.blue}
                />
                <Text style={[styles.optCardText, serviceSpec === opt.value && styles.optCardTextSel, isRTL && styles.textRTL]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionBlock>

        {/* 6. Coverage Scope */}
        <SectionBlock label={t.coverageScope} error={errors.coverageScope} isRTL={isRTL}>
          <View style={[styles.twoColGrid, isRTL && styles.rowRTL]}>
            {(
              [
                { value: "local", icon: "map-marker-radius", label: t.local, desc: t.localDesc },
                { value: "national", icon: "map", label: t.national, desc: t.nationalDesc },
              ] as { value: "local" | "national"; icon: string; label: string; desc: string }[]
            ).map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => { setCoverageScope(opt.value); clearError("coverageScope"); Haptics.selectionAsync(); }}
                style={[
                  styles.optCard,
                  coverageScope === opt.value && styles.optCardSelected,
                  !!errors.coverageScope && styles.optCardError,
                ]}
              >
                <MaterialCommunityIcons
                  name={opt.icon as any}
                  size={26}
                  color={coverageScope === opt.value ? "#fff" : C.blue}
                />
                <Text style={[styles.optCardText, coverageScope === opt.value && styles.optCardTextSel, isRTL && styles.textRTL]}>
                  {opt.label}
                </Text>
                <Text style={[styles.optCardDesc, coverageScope === opt.value && { color: "rgba(255,255,255,0.8)" }, isRTL && styles.textRTL]}>
                  {opt.desc}
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionBlock>

        {/* 7. Verification Photos */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
            <MaterialCommunityIcons name="shield-check" size={18} color={C.blue} />
            <Text style={[styles.sectionLabel, { marginBottom: 0 }, isRTL && styles.textRTL]}>
              {t.verificationPhotos}
            </Text>
          </View>
          <Text style={[styles.verificationDesc, isRTL && styles.textRTL]}>{t.verificationPhotosDesc}</Text>

          <View style={styles.photosGrid}>
            <PhotoUpload
              label={t.selfiePhoto}
              iconName="face-man"
              storagePath={user ? `partners/${user.uid}/selfie` : ""}
              value={selfieUrl}
              onChange={(url) => { setSelfieUrl(url); clearError("selfieUrl"); }}
              error={errors.selfieUrl}
              tapToUploadText={t.tapToUpload}
              changePhotoText={t.changePhoto}
              uploadingText={t.uploadingPhoto}
              isRTL={isRTL}
            />
            <PhotoUpload
              label={t.drivingLicensePhoto}
              iconName="card-account-details"
              storagePath={user ? `partners/${user.uid}/driving_license` : ""}
              value={licenseUrl}
              onChange={(url) => { setLicenseUrl(url); clearError("licenseUrl"); }}
              error={errors.licenseUrl}
              tapToUploadText={t.tapToUpload}
              changePhotoText={t.changePhoto}
              uploadingText={t.uploadingPhoto}
              isRTL={isRTL}
            />
            <PhotoUpload
              label={t.vehiclePhoto}
              iconName="truck"
              storagePath={user ? `partners/${user.uid}/vehicle` : ""}
              value={vehicleUrl}
              onChange={(url) => { setVehicleUrl(url); clearError("vehicleUrl"); }}
              error={errors.vehicleUrl}
              tapToUploadText={t.tapToUpload}
              changePhotoText={t.changePhoto}
              uploadingText={t.uploadingPhoto}
              isRTL={isRTL}
            />
          </View>
        </View>

        {/* Submit */}
        <Pressable onPress={handleSubmit} disabled={loading} style={{ opacity: loading ? 0.75 : 1, marginTop: 8 }}>
          <LinearGradient
            colors={[C.blue, C.blueLight, C.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{t.registerPartner}</Text>}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionBlock({
  label,
  error,
  isRTL,
  children,
}: {
  label: string;
  error?: string;
  isRTL?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>{label}</Text>
      {children}
      {!!error && <ErrorHint text={error} isRTL={isRTL} />}
    </View>
  );
}

function ErrorHint({ text, isRTL }: { text: string; isRTL?: boolean }) {
  return (
    <View style={[styles.errorRow, isRTL && styles.errorRowRTL]}>
      <Ionicons name="alert-circle" size={12} color={C.error} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20 },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 12 },
  subLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary, marginBottom: 8 },
  twoColGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  rowRTL: { flexDirection: "row-reverse" },
  textRTL: { textAlign: "right" },
  optCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: C.border,
  },
  optCardSelected: { backgroundColor: C.blue, borderColor: C.blue },
  optCardError: { borderColor: C.error },
  optCardText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: C.text,
    textAlign: "center",
  },
  optCardTextSel: { color: "#fff" },
  optCardDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  inputRowError: { borderColor: C.error, backgroundColor: "#FFF5F5" },
  icon: { marginRight: 10 },
  iconRTL: { marginLeft: 10 },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.text, padding: 0, letterSpacing: 1 },
  inputRTL: { textAlign: "right" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  errorRowRTL: { flexDirection: "row-reverse", justifyContent: "flex-end" },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.error },
  submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFFFFF", letterSpacing: 0.3 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  verificationDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginBottom: 16, lineHeight: 18 },
  photosGrid: { gap: 12 },
});
