import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/colors";

const C = Colors.light;

function escapeForJs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, " ");
}

function buildMapHtml({
  driverLat,
  driverLng,
  hasDriver,
  pickupLat,
  pickupLng,
  pickupAddress,
  dropoffLat,
  dropoffLng,
  dropoffAddress,
}: {
  driverLat: number;
  driverLng: number;
  hasDriver: boolean;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
}): string {
  const centerLat = pickupLat || 36.9;
  const centerLng = pickupLng || 7.76;

  const waypointCoords = hasDriver
    ? `${driverLng},${driverLat};${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}`
    : `${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}`;

  const driverMarkerJs = hasDriver
    ? `
    const driverDot = L.divIcon({
      html: '<div style="background:#0A3D8F;width:16px;height:16px;border-radius:8px;border:3px solid #fff;box-shadow:0 0 0 2px #0A3D8F,0 2px 8px rgba(0,0,0,0.4)"></div>',
      className: '',
      iconAnchor: [8, 8]
    });
    L.marker([${driverLat}, ${driverLng}], { icon: driverDot })
      .addTo(map)
      .bindPopup('<b>🚛 Your Location</b>');
    allPoints.push([${driverLat}, ${driverLng}]);
    `
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; background: #e5e7eb; }
    #map { width: 100%; height: 100vh; }
    .leaflet-control-attribution { font-size: 9px; opacity: 0.7; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: true }).setView([${centerLat}, ${centerLng}], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    const allPoints = [];

    const pickupIcon = L.divIcon({
      html: '<div style="background:#F47A20;width:18px;height:18px;border-radius:9px;border:3px solid #fff;box-shadow:0 0 0 2px #F47A20,0 2px 8px rgba(0,0,0,0.4)"></div>',
      className: '',
      iconAnchor: [9, 9]
    });
    L.marker([${pickupLat}, ${pickupLng}], { icon: pickupIcon })
      .addTo(map)
      .bindPopup('<b>📦 Pickup</b><br/>${escapeForJs(pickupAddress)}');
    allPoints.push([${pickupLat}, ${pickupLng}]);

    const dropoffIcon = L.divIcon({
      html: '<div style="background:#DC2626;width:18px;height:18px;border-radius:9px;border:3px solid #fff;box-shadow:0 0 0 2px #DC2626,0 2px 8px rgba(0,0,0,0.4)"></div>',
      className: '',
      iconAnchor: [9, 9]
    });
    L.marker([${dropoffLat}, ${dropoffLng}], { icon: dropoffIcon })
      .addTo(map)
      .bindPopup('<b>🏁 Dropoff</b><br/>${escapeForJs(dropoffAddress)}');
    allPoints.push([${dropoffLat}, ${dropoffLng}]);

    ${driverMarkerJs}

    fetch('https://router.project-osrm.org/route/v1/driving/${waypointCoords}?overview=full&geometries=geojson')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(function(c) {
            return [c[1], c[0]];
          });
          const line = L.polyline(coords, {
            color: '#0A3D8F',
            weight: 5,
            opacity: 0.85,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map);
          map.fitBounds(line.getBounds(), { padding: [28, 28] });
        } else {
          if (allPoints.length > 1) {
            map.fitBounds(allPoints, { padding: [28, 28] });
          }
        }
      })
      .catch(function() {
        if (allPoints.length > 1) {
          map.fitBounds(allPoints, { padding: [28, 28] });
        }
      });
  </script>
</body>
</html>`;
}

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    orderId: string;
    clientName: string;
    clientPhone: string;
    pickupAddress: string;
    pickupLat: string;
    pickupLng: string;
    dropoffAddress: string;
    dropoffLat: string;
    dropoffLng: string;
    estimatedPrice: string;
    paymentMethod: string;
    driverLat: string;
    driverLng: string;
  }>();

  const pickupLat = parseFloat(params.pickupLat || "0");
  const pickupLng = parseFloat(params.pickupLng || "0");
  const dropoffLat = parseFloat(params.dropoffLat || "0");
  const dropoffLng = parseFloat(params.dropoffLng || "0");
  const driverLat = parseFloat(params.driverLat || "0");
  const driverLng = parseFloat(params.driverLng || "0");
  const hasDriverCoords = !isNaN(driverLat) && driverLat !== 0;

  const mapHtml = useMemo(() => buildMapHtml({
    driverLat,
    driverLng,
    hasDriver: hasDriverCoords,
    pickupLat,
    pickupLng,
    pickupAddress: params.pickupAddress || "",
    dropoffLat,
    dropoffLng,
    dropoffAddress: params.dropoffAddress || "",
  }), []);

  const openNavigation = () => {
    const url = hasDriverCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${driverLat},${driverLng}&destination=${dropoffLat},${dropoffLng}&waypoints=${pickupLat},${pickupLng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${dropoffLat},${dropoffLng}&waypoints=${pickupLat},${pickupLng}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open navigation app.")
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <LinearGradient
        colors={["#042770", C.blue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <Pressable onPress={openNavigation} style={styles.headerBtn}>
          <Ionicons name="navigate" size={18} color="#fff" />
        </Pressable>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* ── Map (OpenStreetMap via Leaflet.js) ── */}
        <View style={styles.mapContainer}>
          {Platform.OS !== "web" ? (
            <WebView
              style={styles.map}
              source={{ html: mapHtml }}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            // On web, render an iframe pointing to OSM
            <View style={styles.webFallback}>
              <Ionicons name="map-outline" size={44} color={C.border} />
              <Text style={styles.webFallbackText}>
                Map view is available on the mobile app
              </Text>
              <Pressable onPress={openNavigation} style={styles.openNavBtn}>
                <LinearGradient
                  colors={[C.blue, C.orange]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.openNavBtnGrad}
                >
                  <Ionicons name="navigate" size={16} color="#fff" />
                  <Text style={styles.openNavBtnText}>Open Navigation</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* Legend */}
          <View style={styles.legend}>
            {hasDriverCoords && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: C.blue }]} />
                <Text style={styles.legendLabel}>You</Text>
              </View>
            )}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: C.orange }]} />
              <Text style={styles.legendLabel}>Pickup</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
              <Text style={styles.legendLabel}>Dropoff</Text>
            </View>
          </View>
        </View>

        {/* ── Info Cards ── */}
        <View style={styles.infoSection}>

          {/* Client */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Client</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={18} color={C.blue} />
              <Text style={styles.infoValue}>{params.clientName || "—"}</Text>
            </View>
            {!!params.clientPhone && (
              <Pressable
                style={styles.infoRow}
                onPress={() => Linking.openURL(`tel:${params.clientPhone}`)}
              >
                <Ionicons name="call" size={18} color={C.success} />
                <Text style={[styles.infoValue, { color: C.success }]}>
                  {params.clientPhone}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Route */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Route</Text>
            <View style={styles.routeBlock}>
              <View style={styles.routeLine}>
                <View style={[styles.routeDot, { backgroundColor: C.orange }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeTag}>Pickup</Text>
                  <Text style={styles.routeAddr} numberOfLines={2}>
                    {params.pickupAddress || "—"}
                  </Text>
                </View>
              </View>
              <View style={styles.routeConnector} />
              <View style={styles.routeLine}>
                <View style={[styles.routeDot, { backgroundColor: "#DC2626" }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeTag}>Dropoff</Text>
                  <Text style={styles.routeAddr} numberOfLines={2}>
                    {params.dropoffAddress || "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Payment</Text>
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={18} color={C.success} />
              <Text style={styles.priceText}>
                {Number(params.estimatedPrice || 0).toLocaleString()} DZD
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="wallet-outline" size={18} color={C.blue} />
              <Text style={styles.infoValue}>
                {params.paymentMethod === "cash"
                  ? "Cash"
                  : params.paymentMethod === "card"
                  ? "Card"
                  : "Mobile Payment"}
              </Text>
            </View>
          </View>

          {/* Navigate Button */}
          <Pressable onPress={openNavigation}>
            <LinearGradient
              colors={["#042770", C.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.navBtn}
            >
              <Ionicons name="navigate-circle" size={20} color="#fff" />
              <Text style={styles.navBtnText}>Start Navigation</Text>
            </LinearGradient>
          </Pressable>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },

  mapContainer: {
    height: 300,
    width: "100%",
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
    position: "relative",
  },
  map: { flex: 1 },

  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#F3F4F6",
  },
  webFallbackText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: C.textSecondary,
  },
  openNavBtn: { borderRadius: 12, overflow: "hidden", marginTop: 4 },
  openNavBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  openNavBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },

  legend: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.text },

  infoSection: { padding: 16, gap: 12 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  infoCardLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoValue: { fontSize: 15, fontFamily: "Inter_500Medium", color: C.text, flex: 1 },
  priceText: { fontSize: 20, fontFamily: "Inter_700Bold", color: C.success },

  routeBlock: { gap: 2 },
  routeLine: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, flexShrink: 0 },
  routeTag: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  routeAddr: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.text, lineHeight: 20, marginTop: 2 },
  routeConnector: { width: 2, height: 18, backgroundColor: C.border, marginLeft: 5, marginVertical: 2 },

  navBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  navBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
