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

export default function LoginScreen() {
  const { t, isRTL } = useLanguage();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const validate = () => {
    const errs = { email: "", password: "" };
    if (!email.trim()) errs.email = t.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = t.emailInvalid;
    if (!password) errs.password = t.passwordRequired;
    setFieldErrors(errs);
    return !errs.email && !errs.password;
  };

  const withTimeout = <T,>(p: Promise<T>, ms = 10000): Promise<T> =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

  const handleLogin = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await withTimeout(login(email.trim(), password));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/dashboard");
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message || t.authError;
      setError(getAuthErrorMessage(msg, t));
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
        {/* Back Button */}
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

        {/* Header */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={[C.blue, C.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <MaterialCommunityIcons name="truck-fast" size={28} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t.login}</Text>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            {t.appName}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AuthField
            label={t.email}
            icon="mail"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setFieldErrors((e) => ({ ...e, email: "" }));
            }}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={fieldErrors.email}
            isRTL={isRTL}
          />
          <AuthField
            label={t.password}
            icon="lock-closed"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setFieldErrors((e) => ({ ...e, password: "" }));
            }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            error={fieldErrors.password}
            isRTL={isRTL}
            rightAction={
              <Pressable onPress={() => setShowPassword((p) => !p)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={C.textSecondary}
                />
              </Pressable>
            }
          />

          {!!error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={C.error} />
              <Text style={[styles.errorBannerText, isRTL && styles.textRTL]}>
                {error}
              </Text>
            </View>
          )}

          <Pressable style={[styles.forgotBtn, isRTL && styles.forgotBtnRTL]}>
            <Text style={styles.forgotText}>{t.forgotPassword}</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={{ opacity: loading ? 0.75 : 1 }}
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
                <Text style={styles.submitBtnText}>{t.login}</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={[styles.switchRow, isRTL && styles.switchRowRTL]}>
            <Text style={styles.switchText}>{t.noAccount}</Text>
            <Pressable onPress={() => router.push("/signup")}>
              <Text style={styles.switchLink}> {t.signup}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AuthField({
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

function getAuthErrorMessage(msg: string, t: { authError: string }): string {
  if (msg.includes("unauthorized-domain")) {
    return "النطاق غير مرخص. أضف نطاق Replit في Firebase Console → Authentication → Settings → Authorized Domains";
  }
  if (msg === "timeout") {
    return "انتهت مهلة الاتصال. أضف نطاق Replit في Firebase Console → Authentication → Settings → Authorized Domains";
  }
  if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة / Email ou mot de passe incorrect";
  }
  if (msg.includes("too-many-requests")) {
    return "محاولات كثيرة جداً. حاول لاحقاً / Trop de tentatives. Réessayez plus tard";
  }
  if (msg.includes("operation-not-allowed")) {
    return "يجب تفعيل المصادقة في Firebase Console / Activez l'authentification Email dans Firebase Console";
  }
  return msg || t.authError;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 16,
  },
  backBtnRTL: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: C.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  form: {
    gap: 4,
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
  fieldBoxRTL: {
    flexDirection: "row-reverse",
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
  fieldIconRTL: {
    marginLeft: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.text,
    padding: 0,
  },
  fieldInputRTL: {
    textAlign: "right",
  },
  rightAction: {
    marginLeft: 8,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  errorRowRTL: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.error,
  },
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
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: C.error,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotBtnRTL: {
    alignSelf: "flex-start",
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: C.blue,
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  switchRowRTL: {
    flexDirection: "row-reverse",
  },
  switchText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  switchLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.blue,
  },
  textRTL: {
    textAlign: "right",
  },
});
