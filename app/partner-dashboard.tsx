import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Colors from "@/constants/colors";

const C = Colors.light;

type Order = {
  id: string;
  name: string;
  phone: string;
  pickup: string;
  delivery: string;
  status: "pending" | "inProgress" | "completed";
  createdAt: string;
};

export default function PartnerDashboardScreen() {
  const { t, isRTL, language } = useLanguage();
  const { profile, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecentOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace("/");
  };

  const statusColor = (s: string) =>
    s === "completed" ? C.success : s === "inProgress" ? C.orange : C.blue;
  const statusLabel = (s: string) =>
    s === "completed" ? t.completed : s === "inProgress" ? t.inProgress : t.pending;

  const pendingCount = recentOrders.filter((o) => o.status === "pending").length;
  const inProgressCount = recentOrders.filter((o) => o.status === "inProgress").length;
  const completedCount = recentOrders.filter((o) => o.status === "completed").length;

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
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[C.orange, C.orangeLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarCircle}
            >
              <MaterialCommunityIcons name="truck" size={22} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.headerGreeting, isRTL && styles.textRTL]}>
                {t.welcomePartner}
              </Text>
              <Text style={[styles.headerName, isRTL && styles.textRTL]}>
                {profile?.name || ""}
              </Text>
            </View>
          </View>
          <View style={[styles.headerActions, isRTL && styles.headerActionsRTL]}>
            <Pressable style={styles.iconBtn} onPress={() => router.push("/settings")}>
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Partner Badge */}
        <View style={[styles.partnerBadge, isRTL && styles.partnerBadgeRTL]}>
          <View style={styles.partnerDot} />
          <Text style={styles.partnerBadgeText}>
            {language === "ar" ? "شريك نشط" : language === "fr" ? "Partenaire actif" : "Active Partner"}
          </Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: t.pending, value: pendingCount, color: C.blue },
          { label: t.inProgress, value: inProgressCount, color: C.orange },
          { label: t.completed, value: completedCount, color: C.success },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, isRTL && styles.textRTL]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Orders Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t.allOrders}</Text>

        {loading ? (
          <ActivityIndicator color={C.blue} style={{ marginTop: 24 }} />
        ) : recentOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant-closed" size={48} color={C.border} />
            <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>{t.noOrders}</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {recentOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={[styles.orderTop, isRTL && styles.orderTopRTL]}>
                  <View style={[styles.clientInfo, isRTL && styles.clientInfoRTL]}>
                    <Ionicons name="person-circle" size={18} color={C.blue} />
                    <Text style={[styles.clientName, isRTL && styles.textRTL]}>{order.name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(order.status) + "18" }]}>
                    <Text style={[styles.statusText, { color: statusColor(order.status) }]}>
                      {statusLabel(order.status)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.routeRow, isRTL && styles.routeRowRTL]}>
                  <Ionicons name="location" size={13} color={C.blue} />
                  <Text style={[styles.routeText, isRTL && styles.textRTL]} numberOfLines={1}>
                    {order.pickup}
                  </Text>
                  <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={13} color={C.textSecondary} />
                  <Ionicons name="flag" size={13} color={C.orange} />
                  <Text style={[styles.routeText, isRTL && styles.textRTL]} numberOfLines={1}>
                    {order.delivery}
                  </Text>
                </View>
                <View style={[styles.phoneRow, isRTL && styles.phoneRowRTL]}>
                  <Ionicons name="call-outline" size={13} color={C.textSecondary} />
                  <Text style={styles.phoneText}>{order.phone}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  headerRowRTL: { flexDirection: "row-reverse" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  headerGreeting: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  headerName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  headerActions: { flexDirection: "row", gap: 8 },
  headerActionsRTL: { flexDirection: "row-reverse" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  partnerBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.12)", alignSelf: "flex-start", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  partnerBadgeRTL: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  partnerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80" },
  partnerBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#fff" },
  statsRow: { flexDirection: "row", gap: 12, marginHorizontal: 20, marginTop: 20 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: C.border },
  statValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 4, textAlign: "center" },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 16 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 15, fontFamily: "Inter_500Medium", color: C.textSecondary },
  ordersList: { gap: 12 },
  orderCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 10 },
  orderTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderTopRTL: { flexDirection: "row-reverse" },
  clientInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  clientInfoRTL: { flexDirection: "row-reverse" },
  clientName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  routeRowRTL: { flexDirection: "row-reverse" },
  routeText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  phoneRowRTL: { flexDirection: "row-reverse" },
  phoneText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  textRTL: { textAlign: "right" },
});
