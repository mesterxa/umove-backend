import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Animated,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Colors from "@/constants/colors";

const C = Colors.light;

export default function HomeScreen() {
  const { t, isRTL } = useLanguage();
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [form, setForm] = useState({ name: "", phone: "", pickup: "", delivery: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = t.nameRequired;
    if (!form.phone.trim()) errs.phone = t.phoneRequired;
    else if (!/^[\d\s\+\-]{8,}$/.test(form.phone.trim())) errs.phone = t.phoneInvalid;
    if (!form.pickup.trim()) errs.pickup = t.pickupRequired;
    if (!form.delivery.trim()) errs.delivery = t.deliveryRequired;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const withTimeout = <T,>(p: Promise<T>, ms = 10000): Promise<T> =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

  const handleSubmit = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setSubmitError("");
    try {
      await withTimeout(addDoc(collection(db, "orders"), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        pickup: form.pickup.trim(),
        delivery: form.delivery.trim(),
        status: "pending",
        clientId: user?.uid || "anonymous",
        createdAt: new Date().toISOString(),
        createdTimestamp: serverTimestamp(),
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch (e) {
      console.error("Order submit error:", e);
      const msg = (e as { message?: string })?.message || "";
      if (msg === "timeout") {
        setSubmitError("انتهت مهلة الاتصال. تأكد من إعداد Firestore في Firebase Console");
      } else {
        setSubmitError(msg || "حدث خطأ، حاول مجدداً / Une erreur est survenue");
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ name: "", phone: "", pickup: "", delivery: "" });
    setErrors({});
    setSubmitted(false);
  };

  const SERVICES = [
    { icon: "home", iconLib: "Ionicons", title: t.residentialMoving, description: t.residentialDesc },
    { icon: "office-building", iconLib: "MaterialCommunityIcons", title: t.officeMoving, description: t.officeDesc },
    { icon: "tools", iconLib: "MaterialCommunityIcons", title: t.furnitureAssembly, description: t.furnitureDesc },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomInset + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO */}
        <LinearGradient
          colors={["#042770", C.blue, "#1A5BC4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: topInset + 16 }]}
        >
          {/* Decorative */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircleOrange} />

          {/* Top Nav */}
          <View style={[styles.navRow, isRTL && styles.navRowRTL]}>
            {/* Brand */}
            <View style={[styles.logoRow, isRTL && styles.logoRowRTL]}>
              <LinearGradient
                colors={[C.orange, C.orangeLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBadge}
              >
                <MaterialCommunityIcons name="truck-fast" size={20} color="#fff" />
              </LinearGradient>
              <View style={[styles.logoTextBox, isRTL && styles.logoTextBoxRTL]}>
                <Text style={styles.logoU}>U</Text>
                <Text style={styles.logoMove}>MOVE</Text>
                <View style={styles.logoSep} />
                <Text style={styles.logoAnnaba}>ANNABA</Text>
              </View>
            </View>

            {/* Auth Buttons */}
            <View style={[styles.authBtns, isRTL && styles.authBtnsRTL]}>
              {user && profile ? (
                <Pressable
                  onPress={() =>
                    router.push(
                      profile.role === "partner" ? "/partner-dashboard" : "/dashboard"
                    )
                  }
                  style={styles.authChip}
                >
                  <Ionicons name="person-circle" size={16} color="#fff" />
                  <Text style={styles.authChipText} numberOfLines={1}>
                    {profile.name?.split(" ")[0]}
                  </Text>
                </Pressable>
              ) : (
                <>
                  <Pressable onPress={() => router.push("/login")} style={styles.loginChip}>
                    <Text style={styles.loginChipText}>{t.login}</Text>
                  </Pressable>
                  <Pressable onPress={() => router.push("/signup")}>
                    <LinearGradient
                      colors={[C.orange, C.orangeLight]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.signupChip}
                    >
                      <Text style={styles.signupChipText}>{t.signup}</Text>
                    </LinearGradient>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={[styles.greeting, isRTL && styles.textRTL]}>{t.welcomeTo}</Text>
            <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>UMOVE ANNABA</Text>
            <View style={[styles.sloganRow, isRTL && styles.sloganRowRTL]}>
              {!isRTL && <View style={styles.sloganAccent} />}
              <Text style={[styles.slogan, isRTL && styles.textRTL]}>{t.slogan}</Text>
              {isRTL && <View style={styles.sloganAccent} />}
            </View>
            <Text style={[styles.heroSub, isRTL && styles.textRTL]}>{t.heroSub}</Text>

            {/* CTA Row */}
            <View style={[styles.ctaRow, isRTL && styles.ctaRowRTL]}>
              <View style={styles.availableChip}>
                <View style={styles.availableDot} />
                <Text style={styles.availableText}>{t.available247}</Text>
              </View>

              {/* Be a Partner Button */}
              <Pressable
                onPress={() => router.push("/signup")}
                style={styles.partnerChip}
              >
                <LinearGradient
                  colors={[C.orange, C.orangeLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.partnerChipGrad}
                >
                  <MaterialCommunityIcons name="truck-check" size={14} color="#fff" />
                  <Text style={styles.partnerChipText}>{t.beAPartner}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* Wave */}
          <View style={styles.heroWave} />
        </LinearGradient>

        {/* STATS */}
        <View style={styles.statsStrip}>
          {[
            { value: "500+", label: t.clients },
            { value: "3", label: t.services },
            { value: "24h", label: t.response },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={[styles.statLabel, isRTL && styles.textRTL]}>{s.label}</Text>
              </View>
              {i < 2 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* SERVICES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTag, isRTL && styles.textRTL]}>{t.ourServices}</Text>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t.servicesSubtitle}</Text>
          </View>
          <View style={[styles.servicesRow, isRTL && styles.servicesRowRTL]}>
            {SERVICES.map((s, i) => (
              <ServiceCard key={i} service={s} index={i} isRTL={isRTL} />
            ))}
          </View>
        </View>

        {/* WHY US */}
        <LinearGradient
          colors={["#042770", C.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.whySection}
        >
          <Text style={[styles.whySectionTitle, isRTL && styles.textRTL]}>{t.whyChooseUs}</Text>
          <View style={[styles.whyGrid, isRTL && styles.whyGridRTL]}>
            {[
              { icon: "shield-checkmark", label: t.secure },
              { icon: "flash", label: t.fast },
              { icon: "people", label: t.proTeam },
              { icon: "wallet", label: t.fairPrice },
            ].map((item) => (
              <View key={item.label} style={[styles.whyItem, isRTL && styles.whyItemRTL]}>
                <View style={styles.whyIconBox}>
                  <Ionicons name={item.icon as any} size={20} color={C.orange} />
                </View>
                <Text style={[styles.whyLabel, isRTL && styles.textRTL]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* BOOKING FORM */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTag, isRTL && styles.textRTL]}>{t.freeQuote}</Text>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t.requestEstimate}</Text>
          </View>
          <View style={styles.formCard}>
            {submitted ? (
              <SuccessView onReset={handleReset} t={t} isRTL={isRTL} />
            ) : (
              <>
                <FormField
                  label={t.fullName}
                  icon="person"
                  value={form.name}
                  onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); setErrors((e) => ({ ...e, name: undefined })); }}
                  placeholder={isRTL ? "أحمد بن علي" : "Ahmed Benali"}
                  error={errors.name}
                  isRTL={isRTL}
                />
                <FormField
                  label={t.phone}
                  icon="call"
                  value={form.phone}
                  onChangeText={(v) => { setForm((f) => ({ ...f, phone: v })); setErrors((e) => ({ ...e, phone: undefined })); }}
                  placeholder="0550 123 456"
                  keyboardType="phone-pad"
                  error={errors.phone}
                  isRTL={isRTL}
                />
                <FormField
                  label={t.pickupAddress}
                  icon="location"
                  value={form.pickup}
                  onChangeText={(v) => { setForm((f) => ({ ...f, pickup: v })); setErrors((e) => ({ ...e, pickup: undefined })); }}
                  placeholder={isRTL ? "الشارع، الحي، المدينة" : "Rue, Quartier, Ville"}
                  error={errors.pickup}
                  isRTL={isRTL}
                />
                <FormField
                  label={t.deliveryAddress}
                  icon="flag"
                  value={form.delivery}
                  onChangeText={(v) => { setForm((f) => ({ ...f, delivery: v })); setErrors((e) => ({ ...e, delivery: undefined })); }}
                  placeholder={isRTL ? "الشارع، الحي، المدينة" : "Rue, Quartier, Ville"}
                  error={errors.delivery}
                  isRTL={isRTL}
                />

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
                      <Text style={styles.submitBtnText}>{t.requestQuote}</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {submitError ? (
                  <View style={{ backgroundColor: "#FEE2E2", borderRadius: 8, padding: 12, marginTop: 8 }}>
                    <Text style={{ color: "#DC2626", textAlign: isRTL ? "right" : "left", fontSize: 13 }}>{submitError}</Text>
                  </View>
                ) : null}

                <View style={[styles.footnote, isRTL && styles.footnoteRTL]}>
                  <Ionicons name="lock-closed" size={12} color={C.textSecondary} />
                  <Text style={[styles.footnoteText, isRTL && styles.textRTL]}>
                    {t.dataConfidential}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <LinearGradient
            colors={[C.blue, C.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.footerLine}
          />
          <View style={[styles.footerBrandRow, isRTL && styles.footerBrandRowRTL]}>
            <MaterialCommunityIcons name="truck-fast" size={18} color={C.blue} />
            <Text style={styles.footerBrand}>UMOVE ANNABA</Text>
          </View>
          <Text style={[styles.footerSlogan, isRTL && styles.textRTL]}>{t.slogan}</Text>
          <View style={[styles.footerLocRow, isRTL && styles.footerLocRowRTL]}>
            <Ionicons name="location-outline" size={14} color={C.textSecondary} />
            <Text style={styles.footerLoc}>{t.algeria}</Text>
          </View>
          <Text style={styles.footerCopy}>© 2025 UMOVE ANNABA. {t.allRightsReserved}.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ServiceCard({
  service,
  index,
  isRTL,
}: {
  service: { icon: string; iconLib: string; title: string; description: string };
  index: number;
  isRTL: boolean;
}) {
  const isMiddle = index === 1;
  const ServiceIcon = () => {
    if (service.iconLib === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={service.icon as any} size={28} color={isMiddle ? "#fff" : C.blue} />;
    }
    return <Ionicons name={service.icon as any} size={28} color={isMiddle ? "#fff" : C.blue} />;
  };

  return (
    <View style={[styles.serviceCard, isMiddle && styles.serviceCardMiddle]}>
      {isMiddle ? (
        <LinearGradient
          colors={[C.blue, C.orange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.serviceIconCircle}
        >
          <ServiceIcon />
        </LinearGradient>
      ) : (
        <View style={[styles.serviceIconCircle, { backgroundColor: C.inputBg }]}>
          <ServiceIcon />
        </View>
      )}
      <Text style={[styles.serviceTitle, isMiddle && styles.serviceTitleActive, isRTL && styles.textRTL]}>
        {service.title}
      </Text>
      <Text style={[styles.serviceDesc, isMiddle && styles.serviceDescActive, isRTL && styles.textRTL]}>
        {service.description}
      </Text>
    </View>
  );
}

function SuccessView({
  onReset,
  t,
  isRTL,
}: {
  onReset: () => void;
  t: { requestSent: string; requestSentDesc: string; newRequest: string };
  isRTL: boolean;
}) {
  return (
    <View style={styles.successContainer}>
      <LinearGradient
        colors={[C.blue, C.orange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.successIcon}
      >
        <Ionicons name="checkmark" size={40} color="#fff" />
      </LinearGradient>
      <Text style={[styles.successTitle, isRTL && styles.textRTL]}>{t.requestSent}</Text>
      <Text style={[styles.successDesc, isRTL && styles.textRTL]}>{t.requestSentDesc}</Text>
      <Pressable onPress={onReset} style={{ marginTop: 8 }}>
        <LinearGradient
          colors={[C.blue, C.blueLight, C.orange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitBtn}
        >
          <Text style={styles.submitBtnText}>{t.newRequest}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function FormField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  isRTL,
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad";
  error?: string;
  isRTL?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{label}</Text>
      <View
        style={[
          styles.fieldBox,
          focused && styles.fieldBoxFocused,
          !!error && styles.fieldBoxError,
          isRTL && styles.fieldBoxRTL,
        ]}
      >
        {!isRTL && (
          <Ionicons
            name={icon as any}
            size={18}
            color={focused ? C.blue : error ? C.error : C.textSecondary}
            style={styles.fieldIcon}
          />
        )}
        <TextInput
          style={[styles.fieldInput, isRTL && styles.fieldInputRTL]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          keyboardType={keyboardType || "default"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textAlign={isRTL ? "right" : "left"}
        />
        {isRTL && (
          <Ionicons
            name={icon as any}
            size={18}
            color={focused ? C.blue : error ? C.error : C.textSecondary}
            style={styles.fieldIconRTL}
          />
        )}
      </View>
      {!!error && (
        <View style={[styles.errorRow, isRTL && styles.errorRowRTL]}>
          <Ionicons name="alert-circle" size={12} color={C.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 60, overflow: "hidden", position: "relative" },
  decorCircle1: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.04)", top: -60, right: -60 },
  decorCircle2: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.05)", bottom: 20, left: -40 },
  decorCircleOrange: { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(244,122,32,0.15)", top: 80, right: 30 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  navRowRTL: { flexDirection: "row-reverse" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoRowRTL: { flexDirection: "row-reverse" },
  logoBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoTextBox: { flexDirection: "row", alignItems: "center", gap: 3 },
  logoTextBoxRTL: { flexDirection: "row-reverse" },
  logoU: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.orange },
  logoMove: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  logoSep: { width: 1, height: 14, backgroundColor: "rgba(255,255,255,0.3)", marginHorizontal: 4 },
  logoAnnaba: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)", letterSpacing: 1.5 },
  authBtns: { flexDirection: "row", gap: 8, alignItems: "center" },
  authBtnsRTL: { flexDirection: "row-reverse" },
  authChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  authChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff", maxWidth: 80 },
  loginChip: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  loginChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#fff" },
  signupChip: { borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  signupChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  heroContent: { gap: 8 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 },
  heroTitle: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
  sloganRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sloganRowRTL: { flexDirection: "row-reverse" },
  sloganAccent: { width: 3, height: 26, borderRadius: 2, backgroundColor: C.orange },
  slogan: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.92)", flex: 1, lineHeight: 22 },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", lineHeight: 20 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  ctaRowRTL: { flexDirection: "row-reverse" },
  availableChip: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  availableDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#4ADE80" },
  availableText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#fff" },
  partnerChip: { borderRadius: 20, overflow: "hidden" },
  partnerChipGrad: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20 },
  partnerChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  heroWave: { position: "absolute", bottom: -1, left: 0, right: 0, height: 30, backgroundColor: C.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  statsStrip: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: -16,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 10,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 21, fontFamily: "Inter_700Bold", color: C.blue },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: C.border },
  section: { paddingHorizontal: 20, paddingTop: 32 },
  sectionHeader: { marginBottom: 20 },
  sectionTag: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.orange, letterSpacing: 2, marginBottom: 5 },
  sectionTitle: { fontSize: 21, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 28 },
  servicesRow: { flexDirection: "row", gap: 10 },
  servicesRowRTL: { flexDirection: "row-reverse" },
  serviceCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  serviceCardMiddle: { backgroundColor: C.blue, borderColor: C.blue, transform: [{ scale: 1.03 }] },
  serviceIconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  serviceTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.text, textAlign: "center", lineHeight: 18 },
  serviceTitleActive: { color: "#fff" },
  serviceDesc: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 15 },
  serviceDescActive: { color: "rgba(255,255,255,0.75)" },
  whySection: { marginHorizontal: 20, marginTop: 32, borderRadius: 24, padding: 22 },
  whySectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 18, textAlign: "center" },
  whyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  whyGridRTL: { flexDirection: "row-reverse" },
  whyItem: { width: "47%", flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  whyItemRTL: { flexDirection: "row-reverse" },
  whyIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(244,122,32,0.15)", alignItems: "center", justifyContent: "center" },
  whyLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff", flex: 1 },
  formCard: { backgroundColor: "#fff", borderRadius: 24, padding: 22, shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 10, borderWidth: 1, borderColor: C.border },
  fieldWrapper: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 7 },
  fieldBox: { flexDirection: "row", alignItems: "center", backgroundColor: C.inputBg, borderRadius: 14, borderWidth: 1.5, borderColor: "transparent", paddingHorizontal: 14, paddingVertical: Platform.OS === "ios" ? 13 : 10 },
  fieldBoxRTL: { flexDirection: "row-reverse" },
  fieldBoxFocused: { borderColor: C.blue, backgroundColor: "#F0F5FF" },
  fieldBoxError: { borderColor: C.error, backgroundColor: "#FFF5F5" },
  fieldIcon: { marginRight: 10 },
  fieldIconRTL: { marginLeft: 10 },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, padding: 0 },
  fieldInputRTL: { textAlign: "right" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  errorRowRTL: { flexDirection: "row-reverse", justifyContent: "flex-end" },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.error },
  submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff", letterSpacing: 0.3 },
  footnote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 },
  footnoteRTL: { flexDirection: "row-reverse" },
  footnoteText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  successContainer: { alignItems: "center", paddingVertical: 24, gap: 12 },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  successDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 22, paddingHorizontal: 8 },
  footer: { marginTop: 40, alignItems: "center", paddingHorizontal: 24, gap: 7 },
  footerLine: { width: 60, height: 3, borderRadius: 2, marginBottom: 6 },
  footerBrandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerBrandRowRTL: { flexDirection: "row-reverse" },
  footerBrand: { fontSize: 14, fontFamily: "Inter_700Bold", color: C.blue, letterSpacing: 1 },
  footerSlogan: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, fontStyle: "italic" },
  footerLocRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  footerLocRowRTL: { flexDirection: "row-reverse" },
  footerLoc: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  footerCopy: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#B0BEC5", marginTop: 2 },
  textRTL: { textAlign: "right" },
});
