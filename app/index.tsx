import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
  Animated,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const C = Colors.light;

type ServiceKey = "residential" | "office" | "furniture";

const SERVICES: {
  key: ServiceKey;
  icon: string;
  iconLib: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome5";
  title: string;
  description: string;
}[] = [
  {
    key: "residential",
    icon: "home",
    iconLib: "Ionicons",
    title: "Déménagement\nRésidentiel",
    description: "Transport sécurisé de vos biens personnels avec soin et précision.",
  },
  {
    key: "office",
    icon: "office-building",
    iconLib: "MaterialCommunityIcons",
    title: "Déménagement\nBureaux",
    description: "Solutions professionnelles pour le déménagement d'entreprises et bureaux.",
  },
  {
    key: "furniture",
    icon: "couch",
    iconLib: "MaterialCommunityIcons",
    title: "Montage de\nMeubles",
    description: "Assemblage expert de tous types de meubles rapidement et efficacement.",
  },
];

function ServiceIcon({
  iconLib,
  icon,
  size,
  color,
}: {
  iconLib: string;
  icon: string;
  size: number;
  color: string;
}) {
  if (iconLib === "MaterialCommunityIcons") {
    return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  }
  if (iconLib === "FontAwesome5") {
    return <FontAwesome5 name={icon as any} size={size} color={color} />;
  }
  return <Ionicons name={icon as any} size={size} color={color} />;
}

function GradientButton({
  label,
  onPress,
  style,
  loading,
}: {
  label: string;
  onPress: () => void;
  style?: object;
  loading?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient
          colors={[C.blue, C.blueLight, C.orange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBtn}
        >
          {loading ? (
            <Ionicons name="refresh" size={20} color="#fff" />
          ) : (
            <Text style={styles.gradientBtnText}>{label}</Text>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function ServiceCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[number];
  index: number;
}) {
  const isMiddle = index === 1;
  return (
    <View style={[styles.serviceCard, isMiddle && styles.serviceCardMiddle]}>
      {isMiddle ? (
        <LinearGradient
          colors={[C.blue, C.orange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.serviceIconCircle}
        >
          <ServiceIcon iconLib={service.iconLib} icon={service.icon} size={28} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={[styles.serviceIconCircle, { backgroundColor: C.inputBg }]}>
          <ServiceIcon iconLib={service.iconLib} icon={service.icon} size={28} color={C.blue} />
        </View>
      )}
      <Text style={[styles.serviceTitle, isMiddle && styles.serviceTitleActive]}>
        {service.title}
      </Text>
      <Text style={[styles.serviceDesc, isMiddle && styles.serviceDescActive]}>
        {service.description}
      </Text>
    </View>
  );
}

function SuccessView({ onReset }: { onReset: () => void }) {
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
      <Text style={styles.successTitle}>Demande Envoyée !</Text>
      <Text style={styles.successDesc}>
        Votre demande de devis a été reçue. Notre équipe vous contactera dans les plus brefs délais.
      </Text>
      <GradientButton label="Nouvelle Demande" onPress={onReset} style={{ marginTop: 8 }} />
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    pickup: "",
    delivery: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim()) newErrors.name = "Le nom est requis";
    if (!form.phone.trim()) newErrors.phone = "Le téléphone est requis";
    else if (!/^[\d\s\+\-]{8,}$/.test(form.phone.trim()))
      newErrors.phone = "Numéro invalide";
    if (!form.pickup.trim()) newErrors.pickup = "L'adresse de départ est requise";
    if (!form.delivery.trim()) newErrors.delivery = "L'adresse d'arrivée est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = () => {
    setForm({ name: "", phone: "", pickup: "", delivery: "" });
    setErrors({});
    setSubmitted(false);
  };

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
          style={[styles.hero, { paddingTop: topInset + 20 }]}
        >
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircleOrange} />

          {/* Logo / Brand */}
          <View style={styles.logoRow}>
            <LinearGradient
              colors={[C.orange, C.orangeLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <MaterialCommunityIcons name="truck-fast" size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.logoTextBox}>
              <Text style={styles.logoU}>U</Text>
              <Text style={styles.logoMove}>MOVE</Text>
              <View style={styles.logoSeparator} />
              <Text style={styles.logoAnnaba}>ANNABA</Text>
            </View>
          </View>

          {/* Greeting */}
          <Text style={styles.greeting}>Bienvenue chez</Text>
          <Text style={styles.heroTitle}>UMOVE ANNABA</Text>
          <View style={styles.sloganRow}>
            <View style={styles.sloganAccent} />
            <Text style={styles.slogan}>Déménagement Intelligent et Connecté</Text>
          </View>
          <Text style={styles.heroSub}>
            Votre partenaire de confiance pour tous vos déménagements à Annaba et alentours.
          </Text>

          {/* CTA chip */}
          <Pressable
            style={styles.ctaChip}
            onPress={() => {
              Haptics.selectionAsync();
            }}
          >
            <Text style={styles.ctaChipText}>Disponible 7j/7</Text>
            <View style={styles.ctaDot} />
          </Pressable>

          {/* Wave bottom */}
          <View style={styles.heroWave} />
        </LinearGradient>

        {/* STATS STRIP */}
        <View style={styles.statsStrip}>
          {[
            { value: "500+", label: "Clients" },
            { value: "3", label: "Services" },
            { value: "24h", label: "Réponse" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < 2 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* SERVICES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTag}>NOS SERVICES</Text>
            <Text style={styles.sectionTitle}>Solutions complètes pour votre déménagement</Text>
          </View>
          <View style={styles.servicesRow}>
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.key} service={s} index={i} />
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
          <Text style={styles.whySectionTitle}>Pourquoi nous choisir ?</Text>
          <View style={styles.whyGrid}>
            {[
              { icon: "shield-checkmark", label: "Sécurisé" },
              { icon: "flash", label: "Rapide" },
              { icon: "people", label: "Équipe pro" },
              { icon: "wallet", label: "Prix juste" },
            ].map((item) => (
              <View key={item.label} style={styles.whyItem}>
                <View style={styles.whyIconBox}>
                  <Ionicons name={item.icon as any} size={20} color={C.orange} />
                </View>
                <Text style={styles.whyLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* BOOKING FORM */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTag}>DEVIS GRATUIT</Text>
            <Text style={styles.sectionTitle}>Demandez votre estimation</Text>
          </View>

          <View style={styles.formCard}>
            {submitted ? (
              <SuccessView onReset={handleReset} />
            ) : (
              <>
                <FormField
                  label="Nom complet"
                  icon="person"
                  value={form.name}
                  onChangeText={(v) => {
                    setForm((f) => ({ ...f, name: v }));
                    setErrors((e) => ({ ...e, name: undefined }));
                  }}
                  placeholder="ex: Ahmed Benali"
                  error={errors.name}
                />
                <FormField
                  label="Téléphone"
                  icon="call"
                  value={form.phone}
                  onChangeText={(v) => {
                    setForm((f) => ({ ...f, phone: v }));
                    setErrors((e) => ({ ...e, phone: undefined }));
                  }}
                  placeholder="ex: 0550 123 456"
                  keyboardType="phone-pad"
                  error={errors.phone}
                />
                <FormField
                  label="Adresse de départ"
                  icon="location"
                  value={form.pickup}
                  onChangeText={(v) => {
                    setForm((f) => ({ ...f, pickup: v }));
                    setErrors((e) => ({ ...e, pickup: undefined }));
                  }}
                  placeholder="Rue, Quartier, Ville"
                  error={errors.pickup}
                />
                <FormField
                  label="Adresse d'arrivée"
                  icon="flag"
                  value={form.delivery}
                  onChangeText={(v) => {
                    setForm((f) => ({ ...f, delivery: v }));
                    setErrors((e) => ({ ...e, delivery: undefined }));
                  }}
                  placeholder="Rue, Quartier, Ville"
                  error={errors.delivery}
                />

                <GradientButton
                  label={loading ? "Envoi en cours..." : "Demander un Devis Gratuit"}
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.submitBtnWrapper}
                />

                <View style={styles.formFootnote}>
                  <Ionicons name="lock-closed" size={12} color={C.textSecondary} />
                  <Text style={styles.formFootnoteText}>
                    Vos données sont confidentielles et sécurisées
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
            style={styles.footerAccentLine}
          />
          <View style={styles.footerLogoRow}>
            <MaterialCommunityIcons name="truck-fast" size={18} color={C.blue} />
            <Text style={styles.footerBrand}>UMOVE ANNABA</Text>
          </View>
          <Text style={styles.footerTagline}>Déménagement Intelligent et Connecté</Text>
          <View style={styles.footerContactRow}>
            <Ionicons name="location-outline" size={14} color={C.textSecondary} />
            <Text style={styles.footerContact}>Annaba, Algérie</Text>
          </View>
          <Text style={styles.footerCopy}>© 2025 UMOVE ANNABA. Tous droits réservés.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad";
  error?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.fieldBox,
          focused && styles.fieldBoxFocused,
          !!error && styles.fieldBoxError,
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={focused ? C.blue : error ? C.error : C.textSecondary}
          style={styles.fieldIcon}
        />
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          keyboardType={keyboardType || "default"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={12} color={C.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    overflow: "hidden",
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: -60,
    right: -60,
  },
  decorCircle2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: 20,
    left: -40,
  },
  decorCircleOrange: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(244,122,32,0.15)",
    top: 80,
    right: 30,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTextBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logoU: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: C.orange,
    letterSpacing: 1,
  },
  logoMove: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  logoSeparator: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 6,
  },
  logoAnnaba: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 2,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sloganRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sloganAccent: {
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: C.orange,
  },
  slogan: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.92)",
    flex: 1,
    lineHeight: 22,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ctaChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
  ctaDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  heroWave: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: C.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  statsStrip: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: -20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 10,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: C.blue,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: C.border,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTag: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: C.orange,
    letterSpacing: 2,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: C.text,
    lineHeight: 30,
  },
  servicesRow: {
    flexDirection: "row",
    gap: 10,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  serviceCardMiddle: {
    backgroundColor: C.blue,
    borderColor: C.blue,
    transform: [{ scale: 1.03 }],
  },
  serviceIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 8,
  },
  serviceTitleActive: {
    color: "#FFFFFF",
  },
  serviceDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  serviceDescActive: {
    color: "rgba(255,255,255,0.75)",
  },
  whySection: {
    marginHorizontal: 24,
    marginTop: 36,
    borderRadius: 24,
    padding: 24,
  },
  whySectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  whyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  whyItem: {
    width: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  whyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(244,122,32,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  whyLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    flex: 1,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
    marginBottom: 8,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  fieldBoxFocused: {
    borderColor: C.blue,
    backgroundColor: "#F0F5FF",
  },
  fieldBoxError: {
    borderColor: C.error,
    backgroundColor: "#FFF5F5",
  },
  fieldIcon: {
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.text,
    padding: 0,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.error,
  },
  submitBtnWrapper: {
    marginTop: 8,
  },
  gradientBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  formFootnote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },
  formFootnoteText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
  successDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  footerAccentLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
    marginBottom: 8,
  },
  footerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerBrand: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: C.blue,
    letterSpacing: 1,
  },
  footerTagline: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    fontStyle: "italic",
  },
  footerContactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  footerContact: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  footerCopy: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#B0BEC5",
    marginTop: 4,
  },
});
