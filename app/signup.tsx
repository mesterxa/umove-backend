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
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Colors from "@/constants/colors";

const C = Colors.light;

export default function SignupScreen() {
  const { t, isRTL } = useLanguage();
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [role, setRole] = useState<"client" | "partner">("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const validate = () => {
    const errs = { name: "", email: "", phone: "", password: "", confirmPassword: "" };
    if (!name.trim()) errs.name = t.nameRequired;
    if (!email.trim()) errs.email = t.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = t.emailInvalid;
    if (!phone.trim()) errs.phone = t.phoneRequired;
    if (!password) errs.password = t.passwordRequired;
    else if (password.length < 6) errs.password = t.passwordMinLength;
    if (password !== confirmPassword) errs.confirmPassword = t.passwordMismatch;
    setFieldErrors(errs);
    return Object.values(errs).every((v) => !v);
  };

  const withTimeout = <T,>(p: Promise<T>, ms = 10000): Promise<T> =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

  const handleRegister = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await withTimeout(register(email.trim(), password, name.trim(), phone.trim(), role));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (role === "partner") {
        router.replace("/partner-setup");
      } else {
        router.replace("/dashboard");
      }
    } catch (e: unknown) {
      const msg = (e as { message?: string; code?: string })?.message || "";
      const code = (e as { code?: string })?.code || "";
      if (code.includes("email-already-in-use") || msg.includes("email-already-in-use")) {
        setError("هذا البريد مسجل مسبقاً / Cet email est déjà utilisé");
      } else if (code.includes("network") || msg.includes("network")) {
        setError("خطأ في الاتصال بالشبكة / Erreur réseau");
      } else if (code.includes("auth/operation-not-allowed") || msg.includes("operation-not-allowed")) {
        setError("يجب تفعيل المصادقة في Firebase Console / Activez l'authentification dans Firebase Console");
      } else if (msg === "timeout") {
        setError("انتهت مهلة الاتصال. تأكد من تفعيل Firebase Auth / Délai expiré. Vérifiez Firebase Console");
      } else {
        setError(msg || t.authError);
      }
      console.error("Signup error:", e);
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
          { paddingTop: topInset + 8, paddingBottom: bottomInset + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, isRTL && styles.backBtnRTL]}
        >
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={22}
            color={C.blue}
          />
        </Pressable>

        <View style={styles.headerSection}>
          <LinearGradient
            colors={[C.blue, C.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <MaterialCommunityIcons name="truck-fast" size={28} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t.signup}</Text>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{t.appName}</Text>
        </View>

        {/* Role Selector */}
        <View style={[styles.roleRow, isRTL && styles.roleRowRTL]}>
          <RoleCard
            icon="person"
            title={t.client}
            desc={t.clientDesc}
            selected={role === "client"}
            onPress={() => setRole("client")}
            isRTL={isRTL}
          />
          <RoleCard
            icon="truck"
            title={t.partner}
            desc={t.partnerDesc}
            selected={role === "partner"}
            onPress={() => setRole("partner")}
            isRTL={isRTL}
          />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AuthInput
            label={t.name}
            icon="person-outline"
            value={name}
            onChangeText={(v) => { setName(v); setFieldErrors((e) => ({ ...e, name: "" })); }}
            placeholder={isRTL ? "أحمد بن علي" : "Ahmed Benali"}
            error={fieldErrors.name}
            isRTL={isRTL}
          />
          <AuthInput
            label={t.email}
            icon="mail-outline"
            value={email}
            onChangeText={(v) => { setEmail(v); setFieldErrors((e) => ({ ...e, email: "" })); }}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={fieldErrors.email}
            isRTL={isRTL}
          />
          <AuthInput
            label={t.phone}
            icon="call-outline"
            value={phone}
            onChangeText={(v) => { setPhone(v); setFieldErrors((e) => ({ ...e, phone: "" })); }}
            placeholder="0550 123 456"
            keyboardType="phone-pad"
            error={fieldErrors.phone}
            isRTL={isRTL}
          />
          <AuthInput
            label={t.password}
            icon="lock-closed-outline"
            value={password}
            onChangeText={(v) => { setPassword(v); setFieldErrors((e) => ({ ...e, password: "" })); }}
            placeholder="••••••••"
            secureTextEntry={!showPass}
            error={fieldErrors.password}
            isRTL={isRTL}
            rightAction={
              <Pressable onPress={() => setShowPass((p) => !p)}>
                <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color={C.textSecondary} />
              </Pressable>
            }
          />
          <AuthInput
            label={t.confirmPassword}
            icon="shield-checkmark-outline"
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); setFieldErrors((e) => ({ ...e, confirmPassword: "" })); }}
            placeholder="••••••••"
            secureTextEntry={!showPass}
            error={fieldErrors.confirmPassword}
            isRTL={isRTL}
          />

          {!!error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={C.error} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleRegister}
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
                <Text style={styles.submitBtnText}>{t.signup}</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={[styles.switchRow, isRTL && styles.switchRowRTL]}>
            <Text style={styles.switchText}>{t.hasAccount}</Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.switchLink}> {t.login}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RoleCard({
  icon,
  title,
  desc,
  selected,
  onPress,
  isRTL,
}: {
  icon: string;
  title: string;
  desc: string;
  selected: boolean;
  onPress: () => void;
  isRTL?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleCard, selected && styles.roleCardSelected]}
    >
      {selected ? (
        <LinearGradient
          colors={[C.blue, C.orange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.roleIconCircle}
        >
          <Ionicons name={icon as any} size={22} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={[styles.roleIconCircle, { backgroundColor: C.inputBg }]}>
          <Ionicons name={icon as any} size={22} color={C.textSecondary} />
        </View>
      )}
      <Text style={[styles.roleTitle, selected && styles.roleTitleSelected, isRTL && styles.textRTL]}>
        {title}
      </Text>
      <Text style={[styles.roleDesc, selected && styles.roleDescSelected, isRTL && styles.textRTL]}>
        {desc}
      </Text>
      {selected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

function AuthInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  error,
  isRTL,
  rightAction,
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
  secureTextEntry?: boolean;
  error?: string;
  isRTL?: boolean;
  rightAction?: React.ReactNode;
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
          autoCapitalize={autoCapitalize || "sentences"}
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textAlign={isRTL ? "right" : "left"}
        />
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
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
  container: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, alignItems: "flex-start", justifyContent: "center", marginBottom: 16 },
  backBtnRTL: { alignSelf: "flex-end", alignItems: "flex-end" },
  headerSection: { alignItems: "center", marginBottom: 28 },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  roleRowRTL: { flexDirection: "row-reverse" },
  roleCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.border,
    gap: 8,
    position: "relative",
  },
  roleCardSelected: { borderColor: C.blue, backgroundColor: "#F0F5FF" },
  roleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text, textAlign: "center" },
  roleTitleSelected: { color: C.blue },
  roleDesc: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 16 },
  roleDescSelected: { color: C.blue },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { gap: 4 },
  fieldWrapper: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 8 },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
  },
  fieldBoxRTL: { flexDirection: "row-reverse" },
  fieldBoxFocused: { borderColor: C.blue, backgroundColor: "#F0F5FF" },
  fieldBoxError: { borderColor: C.error, backgroundColor: "#FFF5F5" },
  fieldIcon: { marginRight: 10 },
  fieldIconRTL: { marginLeft: 10 },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, padding: 0 },
  fieldInputRTL: { textAlign: "right" },
  rightAction: { marginLeft: 8 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  errorRowRTL: { flexDirection: "row-reverse", justifyContent: "flex-end" },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.error },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  errorBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: C.error },
  submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFFFFF", letterSpacing: 0.3 },
  switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 },
  switchRowRTL: { flexDirection: "row-reverse" },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  switchLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.blue },
  textRTL: { textAlign: "right" },
});
