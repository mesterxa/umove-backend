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
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, ADMIN_EMAIL_CONST } from "@/context/AuthContext";
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

export default function DashboardScreen() {
  const { t, isRTL } = useLanguage();
  const { profile, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const isAdmin = profile?.email?.toLowerCase() === ADMIN_EMAIL_CONST.toLowerCase();

  useEffect(() => {
    if (!profile?.uid) return;
    const q = query(
      collection(db, "orders"),
      where("clientId", "==", profile.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      setLoadingOrders(false);
    }, () => setLoadingOrders(false));
    return unsub;
  }, [profile?.uid]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace("/");
  };

  const statusColor = (s: string) =>
    s === "completed" ? C.success : s === "inProgress" ? C.orange : C.blue;

  const statusLabel = (s: string) =>
    s === "completed" ? t.completed : s === "inProgress" ? t.inProgress : t.pending;

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
              <Text style={styles.avatarText}>
                {profile?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </LinearGradient>
            <View>
              <Text style={[styles.headerGreeting, isRTL && styles.textRTL]}>
                {t.welcomeClient}
              </Text>
              <Text style={[styles.headerName, isRTL && styles.textRTL]}>
                {profile?.name || ""}
              </Text>
            </View>
          </View>
          <View style={[styles.headerActions, isRTL && styles.headerActionsRTL]}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => router.push("/settings")}
            >
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* Admin Quick Access */}
      {isAdmin && (
        <Pressable
          onPress={() => router.push("/admin")}
          style={styles.adminBanner}
        >
          <LinearGradient
            colors={[C.blue, C.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.adminBannerGradient}
          >
            <Ionicons name="shield" size={20} color="#fff" />
            <Text style={styles.adminBannerText}>{t.adminPanel}</Text>
            <Ionicons
              name={isRTL ? "arrow-back" : "arrow-forward"}
              size={18}
              color="#fff"
            />
          </LinearGradient>
        </Pressable>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Pressable
          onPress={() => router.push("/")}
          style={{ opacity: 1 }}
        >
          <LinearGradient
            colors={[C.blue, C.blueLight, C.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookNowBtn}
          >
            <MaterialCommunityIcons name="truck-fast" size={22} color="#fff" />
            <Text style={[styles.bookNowText, isRTL && styles.textRTL]}>{t.bookNow}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Orders */}
      <View style={styles.section}>
        <View style={[styles.sectionHeaderRow, isRTL && styles.sectionHeaderRowRTL]}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t.myOrders}</Text>
        </View>

        {loadingOrders ? (
          <ActivityIndicator color={C.blue} style={{ marginTop: 24 }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant" size={48} color={C.border} />
            <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>{t.noOrders}</Text>
            <Text style={[styles.emptyDesc, isRTL && styles.textRTL]}>{t.noOrdersDesc}</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={[styles.orderCardTop, isRTL && styles.orderCardTopRTL]}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor(order.status) + "18" },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusColor(order.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusColor(order.status) },
                      ]}
                    >
                      {statusLabel(order.status)}
                    </Text>
                  </View>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.orderRoute, isRTL && styles.orderRouteRTL]}>
                  <View style={[styles.routeItem, isRTL && styles.routeItemRTL]}>
                    <Ionicons name="location" size={14} color={C.blue} />
                    <Text style={[styles.routeText, isRTL && styles.textRTL]} numberOfLines={1}>
                      {order.pickup}
                    </Text>
                  </View>
                  <Ionicons
                    name={isRTL ? "arrow-back" : "arrow-forward"}
                    size={14}
                    color={C.textSecondary}
                  />
                  <View style={[styles.routeItem, isRTL && styles.routeItemRTL]}>
                    <Ionicons name="flag" size={14} color={C.orange} />
                    <Text style={[styles.routeText, isRTL && styles.textRTL]} numberOfLines={1}>
                      {order.delivery}
                    </Text>
                  </View>
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
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerRowRTL: { flexDirection: "row-reverse" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  headerGreeting: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  headerName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  headerActions: { flexDirection: "row", gap: 8 },
  headerActionsRTL: { flexDirection: "row-reverse" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminBanner: { marginHorizontal: 20, marginTop: -12, marginBottom: 4, borderRadius: 16, overflow: "hidden" },
  adminBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  adminBannerText: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff", marginHorizontal: 10 },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  sectionHeaderRowRTL: { flexDirection: "row-reverse" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text },
  bookNowBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  bookNowText: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: "#fff" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center" },
  ordersList: { gap: 12 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  orderCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderCardTopRTL: { flexDirection: "row-reverse" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  orderDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  orderRoute: { flexDirection: "row", alignItems: "center", gap: 6 },
  orderRouteRTL: { flexDirection: "row-reverse" },
  routeItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 4 },
  routeItemRTL: { flexDirection: "row-reverse" },
  routeText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: C.text },
  textRTL: { textAlign: "right" },
});
