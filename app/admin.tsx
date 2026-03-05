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
import { router } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
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
  status: string;
  createdAt: string;
};

type UserDoc = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
};

type PartnerDoc = {
  id: string;
  truckType: string;
  licensePlate: string;
  status: string;
};

type ActiveTab = "orders" | "users" | "partners";

export default function AdminScreen() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [tab, setTab] = useState<ActiveTab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [partners, setPartners] = useState<PartnerDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.email?.toLowerCase() === ADMIN_EMAIL_CONST.toLowerCase();

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }

    setLoading(true);
    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserDoc)));
    });

    const unsubPartners = onSnapshot(collection(db, "partners"), (snap) => {
      setPartners(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PartnerDoc)));
    });

    return () => {
      unsubOrders();
      unsubUsers();
      unsubPartners();
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

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
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={22}
              color="#fff"
            />
          </Pressable>
          <View style={styles.headerCenter}>
            <Ionicons name="shield" size={22} color={C.orange} />
            <Text style={styles.headerTitle}>{t.adminPanel}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatChip icon="list" value={orders.length} label={t.totalOrders} />
          <StatChip icon="people" value={users.length} label={t.totalUsers} />
          <StatChip icon="truck" value={partners.length} label={t.totalPartners} iconLib="material" />
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabRow, isRTL && styles.tabRowRTL]}>
        {(["orders", "users", "partners"] as ActiveTab[]).map((tabKey) => (
          <Pressable
            key={tabKey}
            onPress={() => setTab(tabKey)}
            style={[styles.tab, tab === tabKey && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === tabKey && styles.tabTextActive]}>
              {tabKey === "orders" ? t.orders : tabKey === "users" ? t.users : t.partners}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={C.blue} style={{ marginTop: 32 }} />
        ) : tab === "orders" ? (
          orders.length === 0 ? (
            <EmptyState icon="package-variant" text={t.noOrders} />
          ) : (
            <View style={styles.list}>
              {orders.map((o) => (
                <View key={o.id} style={styles.card}>
                  <View style={[styles.cardTop, isRTL && styles.cardTopRTL]}>
                    <View>
                      <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>{o.name}</Text>
                      <Text style={styles.cardSub}>{o.phone}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor(o.status) + "18" }]}>
                      <Text style={[styles.statusText, { color: statusColor(o.status) }]}>
                        {statusLabel(o.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.routeRow, isRTL && styles.routeRowRTL]}>
                    <Ionicons name="location" size={12} color={C.blue} />
                    <Text style={[styles.routeText, isRTL && styles.textRTL]} numberOfLines={1}>{o.pickup}</Text>
                    <Ionicons name="arrow-forward" size={12} color={C.textSecondary} />
                    <Ionicons name="flag" size={12} color={C.orange} />
                    <Text style={[styles.routeText, isRTL && styles.textRTL]} numberOfLines={1}>{o.delivery}</Text>
                  </View>
                  <Text style={[styles.dateText, isRTL && styles.textRTL]}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )
        ) : tab === "users" ? (
          users.length === 0 ? (
            <EmptyState icon="account-group" text={t.allUsers} />
          ) : (
            <View style={styles.list}>
              {users.map((u) => (
                <View key={u.id} style={styles.card}>
                  <View style={[styles.cardTop, isRTL && styles.cardTopRTL]}>
                    <View style={[styles.userAvatar, { backgroundColor: u.role === "partner" ? C.orange + "22" : C.blue + "18" }]}>
                      <Ionicons name={u.role === "partner" ? "truck" : "person"} size={18} color={u.role === "partner" ? C.orange : C.blue} />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>{u.name}</Text>
                      <Text style={styles.cardSub}>{u.email}</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: u.role === "admin" ? "#7C3AED18" : u.role === "partner" ? C.orange + "18" : C.blue + "18" }]}>
                      <Text style={[styles.roleText, { color: u.role === "admin" ? "#7C3AED" : u.role === "partner" ? C.orange : C.blue }]}>
                        {u.role}
                      </Text>
                    </View>
                  </View>
                  {u.phone && (
                    <View style={[styles.routeRow, isRTL && styles.routeRowRTL]}>
                      <Ionicons name="call-outline" size={12} color={C.textSecondary} />
                      <Text style={styles.routeText}>{u.phone}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )
        ) : partners.length === 0 ? (
          <EmptyState icon="truck" text={t.allPartners} />
        ) : (
          <View style={styles.list}>
            {partners.map((p) => (
              <View key={p.id} style={styles.card}>
                <View style={[styles.cardTop, isRTL && styles.cardTopRTL]}>
                  <View style={[styles.truckIconBox]}>
                    <MaterialCommunityIcons name="truck" size={22} color={C.blue} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>{p.truckType}</Text>
                    <Text style={styles.cardSub}>{p.licensePlate}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: p.status === "active" ? C.success + "18" : C.error + "18" }]}>
                    <Text style={[styles.statusText, { color: p.status === "active" ? C.success : C.error }]}>
                      {p.status === "active" ? t.active : t.inactive}
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

function StatChip({ icon, value, label, iconLib }: { icon: string; value: number; label: string; iconLib?: string }) {
  return (
    <View style={styles.statChip}>
      {iconLib === "material" ? (
        <MaterialCommunityIcons name={icon as any} size={16} color="rgba(255,255,255,0.8)" />
      ) : (
        <Ionicons name={icon as any} size={16} color="rgba(255,255,255,0.8)" />
      )}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name={icon as any} size={48} color={C.border} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerRowRTL: { flexDirection: "row-reverse" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  statsRow: { flexDirection: "row", gap: 10 },
  statChip: { flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", textAlign: "center" },
  tabRow: { flexDirection: "row", marginHorizontal: 20, marginTop: 20, backgroundColor: C.inputBg, borderRadius: 14, padding: 4, gap: 2 },
  tabRowRTL: { flexDirection: "row-reverse" },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#fff" },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.textSecondary },
  tabTextActive: { color: C.blue, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  list: { gap: 10 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTopRTL: { flexDirection: "row-reverse" },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  routeRowRTL: { flexDirection: "row-reverse" },
  routeText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary },
  dateText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSecondary },
  userAvatar: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  userInfo: { flex: 1 },
  roleBadge: { borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 },
  roleText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  truckIconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.blue + "18", alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: C.textSecondary },
  textRTL: { textAlign: "right" },
});
