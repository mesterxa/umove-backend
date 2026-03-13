import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
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
import { cancelOrder } from "@/lib/partnerApi";

const C = Colors.light;

type Order = {
  id: string;
  name: string;
  phone: string;
  pickup: string;
  delivery: string;
  status: "pending" | "searching" | "accepted" | "arrived" | "in_transit" | "completed" | "cancelled";
  createdAt: string;
  estimatedPrice?: number;
  paymentMethod?: string;
  clientId?: string;
};

type CompletedSummary = {
  orderId: string;
  estimatedPrice: number;
  paymentMethod: string;
  pickup: string;
  delivery: string;
};

export default function DashboardScreen() {
  const { t, isRTL } = useLanguage();
  const { profile, user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [completedSummary, setCompletedSummary] = useState<CompletedSummary | null>(null);

  const prevOrderStatusRef = React.useRef<Map<string, string>>(new Map());

  const isAdmin = profile?.email?.toLowerCase() === ADMIN_EMAIL_CONST.toLowerCase();

  useEffect(() => {
    if (!profile?.uid) return;
    const q = query(
      collection(db, "orders"),
      where("clientId", "==", profile.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const newOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));

        // Detect transitions to "completed"
        newOrders.forEach((order) => {
          const prevStatus = prevOrderStatusRef.current.get(order.id);
          if (
            order.status === "completed" &&
            prevStatus &&
            prevStatus !== "completed"
          ) {
            setCompletedSummary({
              orderId: order.id,
              estimatedPrice: order.estimatedPrice ?? 0,
              paymentMethod: order.paymentMethod ?? "cash",
              pickup: order.pickup,
              delivery: order.delivery,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        });

        prevOrderStatusRef.current = new Map(newOrders.map((o) => [o.id, o.status]));
        setOrders(newOrders);
        setLoadingOrders(false);
      },
      () => setLoadingOrders(false)
    );
    return unsub;
  }, [profile?.uid]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace("/");
  };

  const handleCancel = async (order: Order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      isRTL ? "إلغاء الطلب" : "Cancel Order",
      isRTL
        ? "هل أنت متأكد أنك تريد إلغاء هذا الطلب؟"
        : "Are you sure you want to cancel this order?",
      [
        { text: isRTL ? "لا" : "No", style: "cancel" },
        {
          text: isRTL ? "نعم، إلغاء" : "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            setCancellingId(order.id);
            try {
              const idToken = await user.getIdToken();
              await cancelOrder(order.id, idToken);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err: any) {
              Alert.alert(
                isRTL ? "خطأ" : "Error",
                err?.message ?? (isRTL ? "فشل الإلغاء" : "Failed to cancel order")
              );
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const statusColor = (s: string) => {
    if (s === "completed") return C.success;
    if (s === "in_transit" || s === "inProgress") return "#7C3AED";
    if (s === "arrived") return C.orange;
    if (s === "accepted") return C.blue;
    if (s === "cancelled") return C.error;
    return C.blue;
  };

  const statusLabel = (s: string) => {
    if (s === "completed") return t.completed;
    if (s === "in_transit" || s === "inProgress") return t.inProgress;
    if (s === "arrived") return isRTL ? "وصل السائق" : "Driver Arrived";
    if (s === "accepted") return isRTL ? "قيد القبول" : "Accepted";
    if (s === "cancelled") return isRTL ? "ملغى" : "Cancelled";
    return t.pending;
  };

  const canCancel = (s: string) =>
    ["pending", "searching", "accepted"].includes(s);

  return (
    <>
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
          <Pressable onPress={() => router.push("/")} style={{ opacity: 1 }}>
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
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
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

                  {/* Cancel Button */}
                  {canCancel(order.status) && (
                    <Pressable
                      style={styles.cancelBtn}
                      onPress={() => handleCancel(order)}
                      disabled={cancellingId === order.id}
                    >
                      {cancellingId === order.id ? (
                        <ActivityIndicator size="small" color={C.error} />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={16} color={C.error} />
                          <Text style={styles.cancelBtnText}>
                            {isRTL ? "إلغاء الطلب" : "Cancel Order"}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Payment Summary Modal ── */}
      <Modal
        visible={!!completedSummary}
        transparent
        animationType="slide"
        onRequestClose={() => setCompletedSummary(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient
              colors={[C.success, "#16A34A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalIconWrap}
            >
              <Ionicons name="checkmark-circle" size={40} color="#fff" />
            </LinearGradient>

            <Text style={styles.modalTitle}>
              {isRTL ? "تم توصيل طلبك!" : "Your Order is Delivered!"}
            </Text>

            <View style={styles.modalDivider} />

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>{isRTL ? "من" : "From"}</Text>
              <Text style={styles.modalValue} numberOfLines={1}>
                {completedSummary?.pickup}
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>{isRTL ? "إلى" : "To"}</Text>
              <Text style={styles.modalValue} numberOfLines={1}>
                {completedSummary?.delivery}
              </Text>
            </View>

            <View style={styles.modalDivider} />

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>{isRTL ? "المبلغ المدفوع" : "Amount Paid"}</Text>
              <Text style={[styles.modalValue, { color: C.success, fontFamily: "Inter_700Bold", fontSize: 20 }]}>
                {(completedSummary?.estimatedPrice ?? 0).toLocaleString()} DZD
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>{isRTL ? "طريقة الدفع" : "Payment Method"}</Text>
              <Text style={styles.modalValue}>
                {completedSummary?.paymentMethod === "cash"
                  ? isRTL ? "نقداً" : "Cash"
                  : completedSummary?.paymentMethod === "card"
                  ? isRTL ? "بطاقة" : "Card"
                  : isRTL ? "دفع إلكتروني" : "Mobile Payment"}
              </Text>
            </View>

            <View style={styles.modalDivider} />

            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setCompletedSummary(null)}
            >
              <LinearGradient
                colors={[C.blue, C.orange]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalCloseBtnGrad}
              >
                <Text style={styles.modalCloseBtnText}>
                  {isRTL ? "شكراً لك!" : "Thank you!"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerRowRTL: { flexDirection: "row-reverse" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  headerGreeting: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  headerName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  headerActions: { flexDirection: "row", gap: 8 },
  headerActionsRTL: { flexDirection: "row-reverse" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  adminBanner: { marginHorizontal: 20, marginTop: -12, marginBottom: 4, borderRadius: 16, overflow: "hidden" },
  adminBannerGradient: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16 },
  adminBannerText: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff", marginHorizontal: 10 },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  sectionHeaderRowRTL: { flexDirection: "row-reverse" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text },
  bookNowBtn: { borderRadius: 18, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  bookNowText: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: "#fff" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: C.textSecondary },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center" },
  ordersList: { gap: 12 },
  orderCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 12 },
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
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.error + "10",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.error + "30",
    alignSelf: "flex-start",
  },
  cancelBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.error },
  textRTL: { textAlign: "right" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: "center", gap: 14 },
  modalIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginTop: -12 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: C.text, textAlign: "center" },
  modalDivider: { width: "100%", height: 1, backgroundColor: C.border },
  modalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 12 },
  modalLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary },
  modalValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text, flex: 1, textAlign: "right" },
  modalCloseBtn: { width: "100%", borderRadius: 14, overflow: "hidden", marginTop: 4 },
  modalCloseBtnGrad: { paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  modalCloseBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
