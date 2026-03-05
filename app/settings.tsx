import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { type Language, languageLabels } from "@/lib/i18n";
import Colors from "@/constants/colors";

const C = Colors.light;
const LANGUAGES: Language[] = ["ar", "fr", "en"];
const LANG_ICONS: Record<Language, string> = { ar: "🌍", fr: "🇫🇷", en: "🇬🇧" };

export default function SettingsScreen() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { profile, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLanguageSelect = (lang: Language) => {
    if (lang === language) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS !== "web") {
      Alert.alert(
        lang === "ar" ? "تغيير اللغة" : lang === "fr" ? "Changer la langue" : "Change Language",
        t.restartRequired,
        [
          { text: lang === "ar" ? "إلغاء" : "Annuler / Cancel", style: "cancel" },
          { text: lang === "ar" ? "تطبيق" : "Appliquer / Apply", onPress: () => setLanguage(lang) },
        ]
      );
    } else {
      setLanguage(lang);
    }
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace("/");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={["#042770", C.blue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <View style={[styles.headerRow, isRTL && styles.headerRowRTL]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={22}
              color="#fff"
            />
          </Pressable>
          <Text style={styles.headerTitle}>{t.settings}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Profile Card */}
      {profile && (
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[C.blue, C.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileAvatar}
          >
            <Text style={styles.profileAvatarText}>
              {profile.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isRTL && styles.textRTL]}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: profile.role === "partner" ? C.orange + "18" : C.blue + "18" }]}>
              <Text style={[styles.roleText, { color: profile.role === "partner" ? C.orange : C.blue }]}>
                {profile.role === "partner" ? t.partner : profile.role === "admin" ? t.adminPanel : t.client}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>{t.chooseLanguage}</Text>
        <View style={styles.langList}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang}
              onPress={() => handleLanguageSelect(lang)}
              style={[
                styles.langCard,
                language === lang && styles.langCardActive,
                isRTL && styles.langCardRTL,
              ]}
            >
              <Text style={styles.langFlag}>{LANG_ICONS[lang]}</Text>
              <Text style={[styles.langName, language === lang && styles.langNameActive, isRTL && styles.textRTL]}>
                {languageLabels[lang]}
              </Text>
              {language === lang && (
                <Ionicons name="checkmark-circle" size={20} color={C.blue} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
          {language === "ar" ? "عن التطبيق" : language === "fr" ? "À propos" : "About"}
        </Text>
        <View style={styles.infoCard}>
          <View style={[styles.infoRow, isRTL && styles.infoRowRTL]}>
            <LinearGradient colors={[C.blue, C.orange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.infoIcon}>
              <MaterialCommunityIcons name="truck-fast" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, isRTL && styles.textRTL]}>UMOVE ANNABA</Text>
              <Text style={[styles.infoSub, isRTL && styles.textRTL]}>{t.slogan}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <Text style={[styles.versionText, isRTL && styles.textRTL]}>Version 1.0.0</Text>
        </View>
      </View>

      {/* Logout */}
      <View style={[styles.section, { marginTop: 8 }]}>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={C.error} />
          <Text style={styles.logoutText}>{t.logout}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerRowRTL: { flexDirection: "row-reverse" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  profileAvatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 17, fontFamily: "Inter_700Bold", color: C.text },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  roleBadge: { alignSelf: "flex-start", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  roleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary, letterSpacing: 0.5, marginBottom: 12, textTransform: "uppercase" },
  langList: { gap: 8 },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  langCardRTL: { flexDirection: "row-reverse" },
  langCardActive: { borderColor: C.blue, backgroundColor: "#F0F5FF" },
  langFlag: { fontSize: 24 },
  langName: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium", color: C.text },
  langNameActive: { color: C.blue, fontFamily: "Inter_600SemiBold" },
  infoCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoRowRTL: { flexDirection: "row-reverse" },
  infoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.text },
  infoSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  infoDivider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  versionText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.error + "12",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: C.error + "30",
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.error },
  textRTL: { textAlign: "right" },
});
