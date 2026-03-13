import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Colors from "@/constants/colors";
import {
  type ApiOrder,
  acceptOrder,
  fetchAvailableOrders,
  updateOrderStatus,
} from "@/lib/partnerApi";

const C = Colors.light;
const REFRESH_INTERVAL_MS = 20_000;

type ActiveOrder = {
  id: string;
  clientName?: string;
  clientPhone?: string;
  pickupLocation?: { address: string; lat: number; lng: number };
  dropoffLocation?: { address: string; lat: number; lng: number };
  estimatedPrice?: number;
  paymentMethod?: string;
  status: string;
  driverId?: string;
};

type CompletedSummary = {
  clientName: string;
  estimatedPrice: number;
  paymentMethod: string;
  pickupAddress: string;
  dropoffAddress: string;
};

export default function PartnerDashboardScreen() {
  const { t, isRTL, language } = useLanguage();
  const { profile, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [availableOrders, setAvailableOrders] = useState<ApiOrder[]>([]);
  const [myActiveOrders, setMyActiveOrders] = useState<ActiveOrder[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isNotApproved, setIsNotApproved] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<CompletedSummary | null>(null);

  const locationRef = useRef<{ lat: number; lng: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevActiveOrderIdsRef = useRef<Set<string>>(new Set());

  const uid = profile?.uid ?? "";

  const paymentLabel = (method?: string) => {
    if (method === "cash") return t.cash;
    if (method === "card") return t.card;
    if (method === "mobile_payment") return t.mobilePayment;
    return method ?? "";
  };

  const activeStatusLabel = (status: string) => {
    if (status === "accepted") return t.statusAccepted;
    if (status === "arrived") return t.statusArrived;
    if (status === "in_transit") return t.statusInTransit;
    if (status === "completed") return t.completed;
    return status;
  };

  const activeStatusColor = (status: string) => {
    if (status === "accepted") return C.blue;
    if (status === "arrived") return C.orange;
    if (status === "in_transit") return "#7C3AED";
    if (status === "completed") return C.success;
    return C.textSecondary;
  };

  const loadAvailableOrders = useCallback(
    async (isManual = false) => {
      if (!uid) return;
      if (isManual) setRefreshing(true);
      try {
        const loc = locationRef.current;
        const orders = await fetchAvailableOrders(uid, loc?.lat, loc?.lng);
        setAvailableOrders(orders);
        setApiError(null);
        setIsNotApproved(false);
      } catch (err: any) {
        if (err?.status === 403) {
          setIsNotApproved(true);
          setAvailableOrders([]);
        } else {
          setApiError(err?.message ?? t.error);
        }
      } finally {
        setLoadingAvailable(false);
        if (isManual) setRefreshing(false);
      }
    },
    [uid, t.error]
  );

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            locationRef.current = {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
            };
          } catch {
            setLocationError(true);
          }
        } else {
          setLocationError(true);
        }
      }
      loadAvailableOrders();
    })();
  }, [loadAvailableOrders]);

  useEffect(() => {
    if (!uid) return;
    intervalRef.current = setInterval(() => loadAvailableOrders(), REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadAvailableOrders]);

  // Real-time listener for driver's own orders
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "orders"), where("driverId", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      const currentActiveIds = new Set<string>();
      const active: ActiveOrder[] = [];

      snap.docs.forEach((d) => {
        const data = d.data() as Omit<ActiveOrder, "id">;
        const order = { id: d.id, ...data };

        if (["accepted", "arrived", "in_transit"].includes(order.status)) {
          active.push(order);
          currentActiveIds.add(d.id);
        }

        // Detect transition to "completed" to show payment summary
        if (
          order.status === "completed" &&
          prevActiveOrderIdsRef.current.has(d.id)
        ) {
          setPaymentSummary({
            clientName: data.clientName ?? "—",
            estimatedPrice: data.estimatedPrice ?? 0,
            paymentMethod: data.paymentMethod ?? "cash",
            pickupAddress: data.pickupLocation?.address ?? "—",
            dropoffAddress: data.dropoffLocation?.address ?? "—",
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      });

      active.sort((a, b) => (a.status > b.status ? 1 : -1));
      setMyActiveOrders(active);
      prevActiveOrderIdsRef.current = currentActiveIds;
    });
    return unsub;
  }, [uid]);

  const handleAccept = useCallback(
    async (order: ApiOrder) => {
      if (!uid || acceptingId) return;

      // ── Yassir Driver Lock ──────────────────────────────────────────────────
      if (myActiveOrders.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          language === "ar" ? "لديك طلب نشط" : language === "fr" ? "Commande active" : "Active Order",
          language === "ar"
            ? "لا يمكنك قبول طلب جديد حتى تكمل طلبك الحالي."
            : language === "fr"
            ? "Terminez votre commande actuelle avant d'en accepter une nouvelle."
            : "You must complete your current order before accepting a new one."
        );
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAcceptingId(order.orderId);
      try {
        await acceptOrder(order.orderId, uid);
        setAvailableOrders((prev) => prev.filter((o) => o.orderId !== order.orderId));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Navigate to order details with the map
        const loc = locationRef.current;
        router.push({
          pathname: "/order-details",
          params: {
            orderId: order.orderId,
            clientName: order.clientName,
            clientPhone: order.clientPhone,
            pickupAddress: order.pickupLocation.address,
            pickupLat: String(order.pickupLocation.lat),
            pickupLng: String(order.pickupLocation.lng),
            dropoffAddress: order.dropoffLocation.address,
            dropoffLat: String(order.dropoffLocation.lat),
            dropoffLng: String(order.dropoffLocation.lng),
            estimatedPrice: String(order.estimatedPrice),
            paymentMethod: order.paymentMethod,
            driverLat: loc ? String(loc.lat) : "",
            driverLng: loc ? String(loc.lng) : "",
          },
        });
      } catch (err: any) {
        const msg = err?.message ?? t.error;
        if (err?.status === 409) {
          Alert.alert(
            language === "ar" ? "مشغول" : language === "fr" ? "Occupé" : "Already Busy",
            msg
          );
        } else {
          Alert.alert(t.error, msg);
        }
      } finally {
        setAcceptingId(null);
      }
    },
    [uid, acceptingId, myActiveOrders.length, language, t.error]
  );

  const handleStatusUpdate = useCallback(
    async (orderId: string, newStatus: "arrived" | "in_transit" | "completed") => {
      if (!uid || updatingId) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setUpdatingId(orderId);
      try {
        // Use API so backend can sync isBusy on completion
        await updateOrderStatus(orderId, uid, newStatus);
      } catch (err: any) {
        Alert.alert(t.error, err?.message ?? t.error);
      } finally {
        setUpdatingId(null);
      }
    },
    [uid, updatingId, t.error]
  );

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace("/");
  };

  const onRefresh = () => loadAvailableOrders(true);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.background }}
        contentContainerStyle={{ paddingBottom: bottomInset + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.blue}
            colors={[C.blue, C.orange]}
          />
        }
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={["#042770", C.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: topInset + 16 }]}
        >
          <View style={[styles.headerRow, isRTL && styles.rowRTL]}>
            <View style={[styles.headerLeft, isRTL && styles.rowRTL]}>
              <LinearGradient
                colors={[C.orange, C.orangeLight]}
                style={styles.avatarCircle}
              >
                <MaterialCommunityIcons name="truck" size={22} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={[styles.greetingText, isRTL && styles.textRight]}>
                  {t.welcomePartner}
                </Text>
                <Text style={[styles.nameText, isRTL && styles.textRight]}>
                  {profile?.name || ""}
                </Text>
              </View>
            </View>
            <View style={[styles.headerActions, isRTL && styles.rowRTL]}>
              <Pressable style={styles.iconBtn} onPress={() => router.push("/settings")}>
                <Ionicons name="settings-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View style={[styles.badgeRow, isRTL && styles.rowRTL]}>
            <View style={[styles.activeBadge, isRTL && styles.rowRTL]}>
              <View style={[styles.activeDot, myActiveOrders.length > 0 && { backgroundColor: C.orange }]} />
              <Text style={styles.activeBadgeText}>
                {myActiveOrders.length > 0
                  ? language === "ar" ? "مشغول" : language === "fr" ? "Occupé" : "Busy"
                  : language === "ar" ? "شريك نشط" : language === "fr" ? "Partenaire actif" : "Active Partner"}
              </Text>
            </View>
            <View style={[styles.statChips, isRTL && styles.rowRTL]}>
              <View style={styles.statChip}>
                <Text style={styles.statChipValue}>{availableOrders.length}</Text>
                <Text style={styles.statChipLabel}>
                  {language === "ar" ? "متاح" : language === "fr" ? "Dispo" : "Available"}
                </Text>
              </View>
              <View style={[styles.statChip, { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={styles.statChipValue}>{myActiveOrders.length}</Text>
                <Text style={styles.statChipLabel}>
                  {language === "ar" ? "نشط" : language === "fr" ? "Actif" : "Active"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Busy Banner ── */}
        {myActiveOrders.length > 0 && !isNotApproved && (
          <View style={[styles.infoBanner, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
            <Ionicons name="lock-closed" size={22} color={C.orange} />
            <View style={{ flex: 1, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}>
              <Text style={[styles.bannerTitle, { color: "#92400E" }, isRTL && styles.textRight]}>
                {language === "ar" ? "لديك طلب نشط" : language === "fr" ? "Commande en cours" : "You have an active order"}
              </Text>
              <Text style={[styles.bannerDesc, { color: "#92400E" }, isRTL && styles.textRight]}>
                {language === "ar"
                  ? "أكمل طلبك الحالي قبل قبول طلب جديد"
                  : language === "fr"
                  ? "Terminez la commande en cours avant d'en accepter une nouvelle"
                  : "Complete your current order before accepting a new one"}
              </Text>
            </View>
          </View>
        )}

        {/* ── Pending Approval Banner ── */}
        {isNotApproved && (
          <View style={styles.infoBanner}>
            <Ionicons name="time-outline" size={22} color="#92400E" />
            <View style={{ flex: 1, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }}>
              <Text style={[styles.bannerTitle, isRTL && styles.textRight]}>{t.pendingApproval}</Text>
              <Text style={[styles.bannerDesc, isRTL && styles.textRight]}>{t.pendingApprovalDesc}</Text>
            </View>
          </View>
        )}

        {/* ── Location Banner ── */}
        {locationError && !isNotApproved && (
          <View style={[styles.infoBanner, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
            <Ionicons name="location-outline" size={22} color={C.blue} />
            <Text style={[styles.bannerDesc, { flex: 1, color: "#1E40AF", marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }, isRTL && styles.textRight]}>
              {t.locationPermDenied}
            </Text>
          </View>
        )}

        {/* ── My Active Orders ── */}
        {myActiveOrders.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
              <View style={styles.sectionDot} />
              <Text style={[styles.sectionTitle, { color: C.orange }, isRTL && styles.textRight]}>
                {t.myActiveOrders}
              </Text>
            </View>
            {myActiveOrders.map((order) => (
              <View key={order.id} style={[styles.card, styles.activeCard]}>
                <View style={[styles.cardTop, isRTL && styles.rowRTL]}>
                  <View style={[styles.clientRow, isRTL && styles.rowRTL]}>
                    <Ionicons name="person-circle" size={18} color={C.blue} />
                    <Text style={[styles.clientName, isRTL && styles.textRight]}>
                      {order.clientName || "—"}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: activeStatusColor(order.status) + "18" }]}>
                    <Text style={[styles.statusText, { color: activeStatusColor(order.status) }]}>
                      {activeStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeBlock}>
                  <View style={[styles.routeLine, isRTL && styles.rowRTL]}>
                    <Ionicons name="ellipse" size={10} color={C.blue} />
                    <Text style={[styles.routeAddr, isRTL && styles.textRight]} numberOfLines={1}>
                      {order.pickupLocation?.address || "—"}
                    </Text>
                  </View>
                  <View style={styles.routeConnector} />
                  <View style={[styles.routeLine, isRTL && styles.rowRTL]}>
                    <Ionicons name="location" size={12} color={C.orange} />
                    <Text style={[styles.routeAddr, isRTL && styles.textRight]} numberOfLines={1}>
                      {order.dropoffLocation?.address || "—"}
                    </Text>
                  </View>
                </View>

                <View style={[styles.cardFooter, isRTL && styles.rowRTL]}>
                  <Text style={styles.priceText}>
                    {order.estimatedPrice} {t.dzd}
                  </Text>
                  <View style={styles.payBadge}>
                    <Text style={styles.payBadgeText}>{paymentLabel(order.paymentMethod)}</Text>
                  </View>
                </View>

                {/* View Map Button */}
                <Pressable
                  style={styles.viewMapBtn}
                  onPress={() => {
                    const loc = locationRef.current;
                    router.push({
                      pathname: "/order-details",
                      params: {
                        orderId: order.id,
                        clientName: order.clientName ?? "",
                        clientPhone: order.clientPhone ?? "",
                        pickupAddress: order.pickupLocation?.address ?? "",
                        pickupLat: String(order.pickupLocation?.lat ?? 0),
                        pickupLng: String(order.pickupLocation?.lng ?? 0),
                        dropoffAddress: order.dropoffLocation?.address ?? "",
                        dropoffLat: String(order.dropoffLocation?.lat ?? 0),
                        dropoffLng: String(order.dropoffLocation?.lng ?? 0),
                        estimatedPrice: String(order.estimatedPrice ?? 0),
                        paymentMethod: order.paymentMethod ?? "cash",
                        driverLat: loc ? String(loc.lat) : "",
                        driverLng: loc ? String(loc.lng) : "",
                      },
                    });
                  }}
                >
                  <Ionicons name="map-outline" size={14} color={C.blue} />
                  <Text style={styles.viewMapBtnText}>
                    {language === "ar" ? "عرض الخريطة" : language === "fr" ? "Voir la carte" : "View Map"}
                  </Text>
                </Pressable>

                <View style={[styles.actionRow, isRTL && styles.rowRTL]}>
                  {order.status === "accepted" && (
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: C.orange + "15", borderColor: C.orange }]}
                      onPress={() => handleStatusUpdate(order.id, "arrived")}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? (
                        <ActivityIndicator size="small" color={C.orange} />
                      ) : (
                        <>
                          <Ionicons name="navigate" size={14} color={C.orange} />
                          <Text style={[styles.actionBtnText, { color: C.orange }]}>{t.markArrived}</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                  {order.status === "arrived" && (
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: "#7C3AED15", borderColor: "#7C3AED" }]}
                      onPress={() => handleStatusUpdate(order.id, "in_transit")}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? (
                        <ActivityIndicator size="small" color="#7C3AED" />
                      ) : (
                        <>
                          <Ionicons name="car" size={14} color="#7C3AED" />
                          <Text style={[styles.actionBtnText, { color: "#7C3AED" }]}>{t.startDelivery}</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                  {order.status === "in_transit" && (
                    <Pressable
                      style={[styles.actionBtn, { backgroundColor: C.success + "15", borderColor: C.success }]}
                      onPress={() => handleStatusUpdate(order.id, "completed")}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? (
                        <ActivityIndicator size="small" color={C.success} />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={14} color={C.success} />
                          <Text style={[styles.actionBtnText, { color: C.success }]}>{t.markComplete}</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Available Orders ── */}
        {!isNotApproved && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
              <View style={[styles.sectionDot, { backgroundColor: C.blue }]} />
              <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t.availableOrders}</Text>
              <Text style={styles.refreshHint}>{t.autoRefresh}</Text>
            </View>

            {loadingAvailable ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={C.blue} />
                <Text style={[styles.hintText, { marginTop: 12 }]}>{t.loading}</Text>
              </View>
            ) : apiError ? (
              <View style={styles.centered}>
                <Ionicons name="cloud-offline-outline" size={44} color={C.border} />
                <Text style={[styles.emptyTitle, { marginTop: 12 }]}>{t.error}</Text>
                <Text style={styles.hintText}>{apiError}</Text>
                <Pressable style={styles.retryBtn} onPress={() => loadAvailableOrders(true)}>
                  <Text style={styles.retryText}>{t.retry}</Text>
                </Pressable>
              </View>
            ) : availableOrders.length === 0 ? (
              <View style={styles.centered}>
                <MaterialCommunityIcons name="package-variant-closed" size={52} color={C.border} />
                <Text style={[styles.emptyTitle, { marginTop: 16 }]}>{t.noAvailableOrders}</Text>
                <Text style={[styles.hintText, { textAlign: "center" }]}>{t.noAvailableOrdersDesc}</Text>
              </View>
            ) : (
              availableOrders.map((order) => (
                <View key={order.orderId} style={[styles.card, myActiveOrders.length > 0 && styles.cardLocked]}>
                  <View style={[styles.cardTop, isRTL && styles.rowRTL]}>
                    <View style={[styles.clientRow, isRTL && styles.rowRTL]}>
                      <Ionicons name="person-circle" size={20} color={C.blue} />
                      <View style={{ marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }}>
                        <Text style={[styles.clientName, isRTL && styles.textRight]}>
                          {order.clientName}
                        </Text>
                        <Text style={styles.phoneText}>{order.clientPhone}</Text>
                      </View>
                    </View>
                    {order.distanceKm != null && (
                      <View style={styles.distanceBadge}>
                        <Ionicons name="navigate-circle" size={13} color={C.blue} />
                        <Text style={styles.distanceText}>
                          {order.distanceKm < 10
                            ? order.distanceKm.toFixed(1)
                            : Math.round(order.distanceKm)}{" "}
                          {t.kmAway}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.routeBlock}>
                    <View style={[styles.routeLine, isRTL && styles.rowRTL]}>
                      <Ionicons name="ellipse" size={10} color={C.blue} />
                      <Text style={[styles.routeAddr, isRTL && styles.textRight]} numberOfLines={1}>
                        {order.pickupLocation.address}
                      </Text>
                    </View>
                    <View style={styles.routeConnector} />
                    <View style={[styles.routeLine, isRTL && styles.rowRTL]}>
                      <Ionicons name="location" size={13} color={C.orange} />
                      <Text style={[styles.routeAddr, isRTL && styles.textRight]} numberOfLines={1}>
                        {order.dropoffLocation.address}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.cardFooter, isRTL && styles.rowRTL]}>
                    <View style={[styles.priceRow, isRTL && styles.rowRTL]}>
                      <Ionicons name="cash-outline" size={15} color={C.success} />
                      <Text style={styles.priceText}>
                        {order.estimatedPrice.toLocaleString()} {t.dzd}
                      </Text>
                    </View>
                    <View style={styles.payBadge}>
                      <Text style={styles.payBadgeText}>{paymentLabel(order.paymentMethod)}</Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleAccept(order)}
                    disabled={!!acceptingId}
                    style={({ pressed }) => [
                      styles.acceptBtnWrap,
                      pressed && { opacity: 0.85 },
                      !!acceptingId && acceptingId !== order.orderId && styles.btnDisabled,
                      myActiveOrders.length > 0 && styles.btnDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={myActiveOrders.length > 0 ? ["#94A3B8", "#CBD5E1"] : [C.orange, C.orangeLight]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.acceptBtnGradient}
                    >
                      {acceptingId === order.orderId ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons
                            name={myActiveOrders.length > 0 ? "lock-closed" : "checkmark-circle-outline"}
                            size={18}
                            color="#fff"
                          />
                          <Text style={styles.acceptBtnText}>
                            {myActiveOrders.length > 0
                              ? language === "ar" ? "مشغول" : language === "fr" ? "Occupé" : "Busy"
                              : t.acceptOrder}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Payment Summary Modal ── */}
      <Modal
        visible={!!paymentSummary}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentSummary(null)}
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
              {language === "ar" ? "تم إكمال الطلب!" : language === "fr" ? "Commande terminée !" : "Order Completed!"}
            </Text>

            <View style={styles.modalDivider} />

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>
                {language === "ar" ? "العميل" : language === "fr" ? "Client" : "Client"}
              </Text>
              <Text style={styles.modalValue}>{paymentSummary?.clientName}</Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>
                {language === "ar" ? "المبلغ" : language === "fr" ? "Montant" : "Amount"}
              </Text>
              <Text style={[styles.modalValue, { color: C.success, fontFamily: "Inter_700Bold", fontSize: 18 }]}>
                {(paymentSummary?.estimatedPrice ?? 0).toLocaleString()} DZD
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>
                {language === "ar" ? "طريقة الدفع" : language === "fr" ? "Paiement" : "Payment"}
              </Text>
              <Text style={styles.modalValue}>
                {paymentSummary?.paymentMethod === "cash"
                  ? language === "ar" ? "نقداً" : language === "fr" ? "Espèces" : "Cash"
                  : paymentSummary?.paymentMethod === "card"
                  ? language === "ar" ? "بطاقة" : "Carte / Card"
                  : language === "ar" ? "دفع إلكتروني" : "Mobile Payment"}
              </Text>
            </View>

            <View style={styles.modalDivider} />

            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setPaymentSummary(null)}
            >
              <LinearGradient
                colors={[C.blue, C.orange]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalCloseBtnGrad}
              >
                <Text style={styles.modalCloseBtnText}>
                  {language === "ar" ? "جاهز للطلب التالي" : language === "fr" ? "Prêt pour la prochaine" : "Ready for Next Order"}
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
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerActions: { flexDirection: "row", gap: 8 },
  rowRTL: { flexDirection: "row-reverse" },
  textRight: { textAlign: "right" },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  greetingText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  nameText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },

  badgeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  activeBadge: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80" },
  activeBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#fff" },
  statChips: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12, overflow: "hidden" },
  statChip: { paddingHorizontal: 14, paddingVertical: 6, alignItems: "center" },
  statChipValue: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  statChipLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },

  infoBanner: { margin: 16, marginBottom: 0, backgroundColor: "#FFFBEB", borderColor: "#FCD34D", borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bannerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#92400E", marginBottom: 3 },
  bannerDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#78350F", lineHeight: 18 },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.light.text, flex: 1 },
  refreshHint: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: Colors.light.border, gap: 10 },
  activeCard: { borderColor: C.orange + "50", borderWidth: 1.5 },
  cardLocked: { opacity: 0.6 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  clientRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  clientName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  phoneText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  distanceBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.light.inputBg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  distanceText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.blue },

  routeBlock: { gap: 2 },
  routeLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  routeConnector: { width: 2, height: 12, backgroundColor: Colors.light.border, marginLeft: 4 },
  routeAddr: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.text },

  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  priceText: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.success },
  payBadge: { backgroundColor: Colors.light.inputBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  payBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary },

  viewMapBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: C.blue + "10", borderRadius: 8, alignSelf: "flex-start" },
  viewMapBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: C.blue },

  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  acceptBtnWrap: { borderRadius: 12, overflow: "hidden" },
  acceptBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  acceptBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  btnDisabled: { opacity: 0.5 },

  centered: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.light.textSecondary },
  hintText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  retryBtn: { marginTop: 8, backgroundColor: C.blue + "15", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.blue },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: "center", gap: 14 },
  modalIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginTop: -12 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.light.text },
  modalDivider: { width: "100%", height: 1, backgroundColor: Colors.light.border },
  modalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
  modalLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  modalValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  modalCloseBtn: { width: "100%", borderRadius: 14, overflow: "hidden", marginTop: 4 },
  modalCloseBtnGrad: { paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  modalCloseBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
