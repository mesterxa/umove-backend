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

const C = Colors.light;

const TRUCK_TYPES_AR = ["شاحنة صغيرة", "شاحنة متوسطة", "شاحنة كبيرة", "فان"];
const TRUCK_TYPES_FR = ["Petit camion", "Camion moyen", "Grand camion", "Fourgonnette"];
const TRUCK_TYPES_EN = ["Small Truck", "Medium Truck", "Large Truck", "Van"];

export default function PartnerSetupScreen() {
  const { t, isRTL, language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const TRUCK_TYPES =
    language === "ar" ? TRUCK_TYPES_AR : language === "fr" ? TRUCK_TYPES_FR : TRUCK_TYPES_EN;

  const [truckType, setTruckType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ truckType: "", licensePlate: "" });

  const validate = () => {
    const errs = { truckType: "", licensePlate: "" };
    if (!truckType) errs.truckType = t.truckTypeRequired;
    if (!licensePlate.trim()) errs.licensePlate = t.licensePlateRequired;
    setErrors(errs);
    return !errs.truckType && !errs.licensePlate;
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
          truckType,
          licensePlate: licensePlate.trim().toUpperCase(),
          status: "active",
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
      await updateDoc(doc(db, "users", user.uid), {
        needsTruckSetup: false,
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
        {/* Header */}
        <LinearGradient
          colors={["#042770", C.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <MaterialCommunityIcons name="truck-check" size={40} color="#fff" />
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{t.truckInfo}</Text>
          <Text style={[styles.heroSub, isRTL && styles.textRTL]}>
            {language === "ar"
              ? "أضف بيانات شاحنتك للانضمام إلى شبكة شركائنا"
              : language === "fr"
              ? "Ajoutez les informations de votre camion pour rejoindre notre réseau"
              : "Add your truck details to join our partner network"}
          </Text>
        </LinearGradient>

        {/* Truck Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>{t.truckType}</Text>
          <View style={[styles.typeGrid, isRTL && styles.typeGridRTL]}>
            {TRUCK_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => {
                  setTruckType(type);
                  setErrors((e) => ({ ...e, truckType: "" }));
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.typeCard,
                  truckType === type && styles.typeCardSelected,
                  !!errors.truckType && styles.typeCardError,
                ]}
              >
                <MaterialCommunityIcons
                  name="truck"
                  size={24}
                  color={truckType === type ? "#fff" : C.textSecondary}
                />
                <Text
                  style={[
                    styles.typeCardText,
                    truckType === type && styles.typeCardTextSelected,
                    isRTL && styles.textRTL,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
          {!!errors.truckType && (
            <View style={[styles.errorRow, isRTL && styles.errorRowRTL]}>
              <Ionicons name="alert-circle" size={12} color={C.error} />
              <Text style={styles.errorText}>{errors.truckType}</Text>
            </View>
          )}
        </View>

        {/* License Plate */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>{t.licensePlate}</Text>
          <View
            style={[
              styles.plateField,
              !!errors.licensePlate && styles.plateFieldError,
              isRTL && styles.plateFieldRTL,
            ]}
          >
            <MaterialCommunityIcons
              name="card-text-outline"
              size={20}
              color={errors.licensePlate ? C.error : C.textSecondary}
              style={isRTL ? styles.plateIconRTL : styles.plateIcon}
            />
            <TextInput
              style={[styles.plateInput, isRTL && styles.plateInputRTL]}
              value={licensePlate}
              onChangeText={(v) => {
                setLicensePlate(v);
                setErrors((e) => ({ ...e, licensePlate: "" }));
              }}
              placeholder={language === "ar" ? "مثال: 12345-67-89" : "ex: 12345-67-89"}
              placeholderTextColor="#A0AEC0"
              autoCapitalize="characters"
              textAlign={isRTL ? "right" : "left"}
            />
          </View>
          {!!errors.licensePlate && (
            <View style={[styles.errorRow, isRTL && styles.errorRowRTL]}>
              <Ionicons name="alert-circle" size={12} color={C.error} />
              <Text style={styles.errorText}>{errors.licensePlate}</Text>
            </View>
          )}
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={{ opacity: loading ? 0.75 : 1, marginTop: 8 }}
        >
          <LinearGradient
            colors={[C.blue, C.blueLight, C.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>{t.registerTruck}</Text>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24 },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 20,
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
    marginBottom: 12,
  },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeGridRTL: { flexDirection: "row-reverse" },
  typeCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: C.border,
  },
  typeCardSelected: { backgroundColor: C.blue, borderColor: C.blue },
  typeCardError: { borderColor: C.error },
  typeCardText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: C.text,
    textAlign: "center",
  },
  typeCardTextSelected: { color: "#fff" },
  plateField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  plateFieldRTL: { flexDirection: "row-reverse" },
  plateFieldError: { borderColor: C.error, backgroundColor: "#FFF5F5" },
  plateIcon: { marginRight: 10 },
  plateIconRTL: { marginLeft: 10 },
  plateInput: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.text, padding: 0, letterSpacing: 1 },
  plateInputRTL: { textAlign: "right" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  errorRowRTL: { flexDirection: "row-reverse", justifyContent: "flex-end" },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.error },
  submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFFFFF", letterSpacing: 0.3 },
  textRTL: { textAlign: "right" },
});
