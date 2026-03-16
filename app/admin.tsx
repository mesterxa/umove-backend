import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  getDoc,
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
  isApproved?: boolean;
  entityType?: string;
  coverageScope?: string;
  serviceSpecialization?: string;
  selfieUrl?: string;
  drivingLicenseUrl?: string;
  vehicleUrl?: string;
  numberOfWorkers?: number;
  workersProvided?: boolean;
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
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({});
  const [partnerEmails, setPartnerEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin =
    profile?.email?.toLowerCase() === ADMIN_EMAIL_CONST.toLowerCase();

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
      const usersData = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as UserDoc)
      );
      setUsers(usersData);
      const names: Record<string, string> = {};
      const emails: Record<string, string> = {};
      usersData.forEach((u) => {
        names[u.id] = u.name || "";
        emails[u.id] = u.email || "";
      });
      setPartnerNames(names);
      setPartnerEmails(emails);
    });

    const unsubPartners = onSnapshot(collection(db, "partners"), (snap) => {
      setPartners(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as PartnerDoc))
      );
    });

    return () => {
      unsubOrders();
      unsubUsers();
      unsubPartners();
    };
  }, [isAdmin]);

  const handleApprove = async (partnerId: string) => {
    setActionLoading(partnerId + "_approve");
    try {
      await updateDoc(doc(db, "partners", partnerId), {
        isApproved: true,
        status: "active",
        approvedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, "users", partnerId), {
        isApproved: true,
      });
    } catch (e) {
      Alert.alert("Error", "Failed to approve partner.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (partnerId: string) => {
    Alert.alert(
      t.reject,
      isRTL
        ? "هل أنت متأكد من رفض هذا الشريك؟"
        : "Are you sure you want to reject this partner?",
      [
        { text: isRTL ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: t.reject,
          style: "destructive",
          onPress: async () => {
            setActionLoading(partnerId + "_reject");
            try {
              await updateDoc(doc(db, "partners", partnerId), {
                isApproved: false,
                status: "rejected",
                rejectedAt: new Date().toISOString(),
              });
              await updateDoc(doc(db, "users", partnerId), {
                isApproved: false,
              });
            } catch {
              Alert.alert("Error", "Failed to reject partner.");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  if (!isAdmin) return null;

  const statusColor = (s: string) =>
    s === "completed"
      ? C.success
      : s === "inProgress"
      ? C.orange
      : C.blue;
  const statusLabel = (s: string) =>
    s === "completed"
      ? t.completed
      : s === "inProgress"
      ? t.inProgress
      : t.pending;

  const pendingPartners = partners.filter(
    (p) => p.isApproved === false && p.status !== "rejected"
  );
  const approvedPartners = partners.filter((p) => p.isApproved === true);
  const rejectedPartners = partners.filter((p) => p.status === "rejected");

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
          <StatChip
            icon="truck"
            value={partners.length}
            label={t.totalPartners}
            iconLib="material"
          />
          {pendingPartners.length > 0 && (
            <StatChip
              icon="clock-alert"
              value={pendingPartners.length}
              label={t.pendingPartners}
              iconLib="material"
              highlight
            />
          )}
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
            <Text
              style={[
                styles.tabText,
                tab === tabKey && styles.tabTextActive,
              ]}
            >
              {tabKey === "orders"
                ? t.orders
                : tabKey === "users"
                ? t.users
                : t.partners}
            </Text>
            {tabKey === "partners" && pendingPartners.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {pendingPartners.length}
                </Text>
              </View>
            )}
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
                      <Text
                        style={[
                          styles.cardTitle,
                          isRTL && styles.textRTL,
                        ]}
                      >
                        {o.name}
                      </Text>
                      <Text style={styles.cardSub}>{o.phone}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusColor(o.status) + "18",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusColor(o.status) },
                        ]}
                      >
                        {statusLabel(o.status)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.routeRow,
                      isRTL && styles.routeRowRTL,
                    ]}
                  >
                    <Ionicons name="location" size={12} color={C.blue} />
                    <Text
                      style={[
                        styles.routeText,
                        isRTL && styles.textRTL,
                      ]}
                      numberOfLines={1}
                    >
                      {o.pickup}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={12}
                      color={C.textSecondary}
                    />
                    <Ionicons name="flag" size={12} color={C.orange} />
                    <Text
                      style={[
                        styles.routeText,
                        isRTL && styles.textRTL,
                      ]}
                      numberOfLines={1}
                    >
                      {o.delivery}
                    </Text>
                  </View>
                  <Text
                    style={[styles.dateText, isRTL && styles.textRTL]}
                  >
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
                  <View
                    style={[styles.cardTop, isRTL && styles.cardTopRTL]}
                  >
                    <View
                      style={[
                        styles.userAvatar,
                        {
                          backgroundColor:
                            u.role === "partner"
                              ? C.orange + "22"
                              : C.blue + "18",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          (u.role === "partner" ? "car" : "person") as any
                        }
                        size={18}
                        color={
                          u.role === "partner" ? C.orange : C.blue
                        }
                      />
                    </View>
                    <View style={styles.userInfo}>
                      <Text
                        style={[
                          styles.cardTitle,
                          isRTL && styles.textRTL,
                        ]}
                      >
                        {u.name}
                      </Text>
                      <Text style={styles.cardSub}>{u.email}</Text>
                    </View>
                    <View
                      style={[
                        styles.roleBadge,
                        {
                          backgroundColor:
                            u.role === "admin"
                              ? "#7C3AED18"
                              : u.role === "partner"
                              ? C.orange + "18"
                              : C.blue + "18",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          {
                            color:
                              u.role === "admin"
                                ? "#7C3AED"
                                : u.role === "partner"
                                ? C.orange
                                : C.blue,
                          },
                        ]}
                      >
                        {u.role}
                      </Text>
                    </View>
                  </View>
                  {u.phone && (
                    <View
                      style={[
                        styles.routeRow,
                        isRTL && styles.routeRowRTL,
                      ]}
                    >
                      <Ionicons
                        name="call-outline"
                        size={12}
                        color={C.textSecondary}
                      />
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
            {/* Pending section */}
            {pendingPartners.length > 0 && (
              <View>
                <View style={[styles.sectionHeaderRow, isRTL && styles.rowRTL]}>
                  <MaterialCommunityIcons
                    name="clock-alert"
                    size={16}
                    color={C.orange}
                  />
                  <Text style={styles.sectionHeaderText}>
                    {t.pendingPartners} ({pendingPartners.length})
                  </Text>
                </View>
                {pendingPartners.map((p) => (
                  <PartnerCard
                    key={p.id}
                    partner={p}
                    name={partnerNames[p.id]}
                    email={partnerEmails[p.id]}
                    isRTL={isRTL}
                    t={t}
                    onApprove={() => handleApprove(p.id)}
                    onReject={() => handleReject(p.id)}
                    approveLoading={
                      actionLoading === p.id + "_approve"
                    }
                    rejectLoading={
                      actionLoading === p.id + "_reject"
                    }
                  />
                ))}
              </View>
            )}

            {/* Approved section */}
            {approvedPartners.length > 0 && (
              <View>
                <View style={[styles.sectionHeaderRow, isRTL && styles.rowRTL]}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={C.success}
                  />
                  <Text style={styles.sectionHeaderText}>
                    {t.approved} ({approvedPartners.length})
                  </Text>
                </View>
                {approvedPartners.map((p) => (
                  <PartnerCard
                    key={p.id}
                    partner={p}
                    name={partnerNames[p.id]}
                    email={partnerEmails[p.id]}
                    isRTL={isRTL}
                    t={t}
                  />
                ))}
              </View>
            )}

            {/* Rejected section */}
            {rejectedPartners.length > 0 && (
              <View>
                <View style={[styles.sectionHeaderRow, isRTL && styles.rowRTL]}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={16}
                    color={C.error}
                  />
                  <Text style={styles.sectionHeaderText}>
                    {t.rejected} ({rejectedPartners.length})
                  </Text>
                </View>
                {rejectedPartners.map((p) => (
                  <PartnerCard
                    key={p.id}
                    partner={p}
                    name={partnerNames[p.id]}
                    email={partnerEmails[p.id]}
                    isRTL={isRTL}
                    t={t}
                    onApprove={() => handleApprove(p.id)}
                    approveLoading={
                      actionLoading === p.id + "_approve"
                    }
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function PartnerCard({
  partner,
  name,
  email,
  isRTL,
  t,
  onApprove,
  onReject,
  approveLoading,
  rejectLoading,
}: {
  partner: PartnerDoc;
  name?: string;
  email?: string;
  isRTL: boolean;
  t: ReturnType<typeof useLanguage>["t"];
  onApprove?: () => void;
  onReject?: () => void;
  approveLoading?: boolean;
  rejectLoading?: boolean;
}) {
  const [showPhotos, setShowPhotos] = useState(false);
  const isApproved = partner.isApproved === true;
  const isRejected = partner.status === "rejected";
  const isPending = !isApproved && !isRejected;

  const statusColor = isApproved ? C.success : isRejected ? C.error : C.orange;
  const statusLabel = isApproved ? t.approved : isRejected ? t.rejected : t.pending;

  const hasPhotos =
    !!(partner.selfieUrl || partner.drivingLicenseUrl || partner.vehicleUrl);

  return (
    <View style={[styles.card, styles.partnerCard]}>
      {/* Top row: icon + info + status */}
      <View style={[styles.cardTop, isRTL && styles.cardTopRTL]}>
        <View style={styles.truckIconBox}>
          <MaterialCommunityIcons name="truck" size={22} color={C.blue} />
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
            {name || partner.truckType || "Partner"}
          </Text>
          {email ? (
            <Text style={styles.cardSub}>{email}</Text>
          ) : null}
          <Text style={styles.cardSub}>
            {partner.truckType} · {partner.licensePlate}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor + "18" },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Details row */}
      <View style={[styles.detailsRow, isRTL && styles.rowRTL]}>
        {partner.entityType && (
          <View style={styles.detailChip}>
            <MaterialCommunityIcons
              name={
                partner.entityType === "company"
                  ? "office-building"
                  : "account-hard-hat"
              }
              size={12}
              color={C.blue}
            />
            <Text style={styles.detailChipText}>{partner.entityType}</Text>
          </View>
        )}
        {partner.coverageScope && (
          <View style={styles.detailChip}>
            <MaterialCommunityIcons
              name={
                partner.coverageScope === "national" ? "map" : "map-marker-radius"
              }
              size={12}
              color={C.blue}
            />
            <Text style={styles.detailChipText}>{partner.coverageScope}</Text>
          </View>
        )}
        {partner.serviceSpecialization && (
          <View style={styles.detailChip}>
            <MaterialCommunityIcons name="wrench" size={12} color={C.blue} />
            <Text style={styles.detailChipText}>
              {partner.serviceSpecialization === "furniture_assembly"
                ? "Assembly"
                : "Transport"}
            </Text>
          </View>
        )}
      </View>

      {/* Photos toggle */}
      {hasPhotos && (
        <Pressable
          onPress={() => setShowPhotos((v) => !v)}
          style={[styles.photosToggle, isRTL && styles.rowRTL]}
        >
          <Ionicons
            name={showPhotos ? "images" : "images-outline"}
            size={14}
            color={C.blue}
          />
          <Text style={styles.photosToggleText}>
            {showPhotos
              ? isRTL
                ? "إخفاء الصور"
                : "Hide Photos"
              : isRTL
              ? "عرض صور التحقق"
              : "View Verification Photos"}
          </Text>
          <Ionicons
            name={showPhotos ? "chevron-up" : "chevron-down"}
            size={14}
            color={C.blue}
          />
        </Pressable>
      )}

      {/* Photo thumbnails */}
      {showPhotos && hasPhotos && (
        <View style={styles.photosRow}>
          {partner.selfieUrl ? (
            <View style={styles.photoThumbWrap}>
              <Image
                source={{ uri: partner.selfieUrl }}
                style={styles.photoThumb}
              />
              <Text style={styles.photoThumbLabel}>
                {isRTL ? "سيلفي" : "Selfie"}
              </Text>
            </View>
          ) : null}
          {partner.drivingLicenseUrl ? (
            <View style={styles.photoThumbWrap}>
              <Image
                source={{ uri: partner.drivingLicenseUrl }}
                style={styles.photoThumb}
              />
              <Text style={styles.photoThumbLabel}>
                {isRTL ? "رخصة" : "License"}
              </Text>
            </View>
          ) : null}
          {partner.vehicleUrl ? (
            <View style={styles.photoThumbWrap}>
              <Image
                source={{ uri: partner.vehicleUrl }}
                style={styles.photoThumb}
              />
              <Text style={styles.photoThumbLabel}>
                {isRTL ? "المركبة" : "Vehicle"}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Action buttons for pending or rejected */}
      {(isPending || isRejected) && (onApprove || onReject) && (
        <View style={[styles.actionRow, isRTL && styles.rowRTL]}>
          {onApprove && (
            <Pressable
              onPress={onApprove}
              disabled={!!approveLoading}
              style={[styles.approveBtn, approveLoading && { opacity: 0.6 }]}
            >
              {approveLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>{t.approve}</Text>
                </>
              )}
            </Pressable>
          )}
          {onReject && isPending && (
            <Pressable
              onPress={onReject}
              disabled={!!rejectLoading}
              style={[styles.rejectBtn, rejectLoading && { opacity: 0.6 }]}
            >
              {rejectLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>{t.reject}</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function StatChip({
  icon,
  value,
  label,
  iconLib,
  highlight,
}: {
  icon: string;
  value: number;
  label: string;
  iconLib?: string;
  highlight?: boolean;
}) {
  return (
    <View
      style={[
        styles.statChip,
        highlight && { backgroundColor: C.orange + "33", borderColor: C.orange, borderWidth: 1 },
      ]}
    >
      {iconLib === "material" ? (
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={highlight ? C.orange : "rgba(255,255,255,0.8)"}
        />
      ) : (
        <Ionicons
          name={icon as any}
          size={16}
          color="rgba(255,255,255,0.8)"
        />
      )}
      <Text style={[styles.statValue, highlight && { color: C.orange }]}>
        {value}
      </Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerRowRTL: { flexDirection: "row-reverse" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  statsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statChip: {
    flex: 1,
    minWidth: 70,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    gap: 3,
  },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: C.inputBg,
    borderRadius: 14,
    padding: 4,
    gap: 2,
  },
  tabRowRTL: { flexDirection: "row-reverse" },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  tabActive: { backgroundColor: "#fff" },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: C.textSecondary,
  },
  tabTextActive: { color: C.blue, fontFamily: "Inter_600SemiBold" },
  tabBadge: {
    backgroundColor: C.orange,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  list: { gap: 10 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  rowRTL: { flexDirection: "row-reverse" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
    marginBottom: 2,
  },
  partnerCard: { borderWidth: 1.5 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTopRTL: { flexDirection: "row-reverse" },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  routeRowRTL: { flexDirection: "row-reverse" },
  routeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: { flex: 1 },
  roleBadge: { borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 },
  roleText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  truckIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.blue + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.blue + "10",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailChipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: C.blue,
  },
  photosToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  photosToggleText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: C.blue,
  },
  photosRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 4,
  },
  photoThumbWrap: { alignItems: "center", gap: 4 },
  photoThumb: {
    width: 90,
    height: 70,
    borderRadius: 10,
    backgroundColor: C.inputBg,
  },
  photoThumbLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: C.textSecondary,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.success,
    borderRadius: 10,
    paddingVertical: 10,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.error,
    borderRadius: 10,
    paddingVertical: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: C.textSecondary,
  },
  textRTL: { textAlign: "right" },
});
