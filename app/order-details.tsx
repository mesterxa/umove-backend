import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/colors";

const C = Colors.light;

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Simple polyline decoder (Google's encoded polyline algorithm)
function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

async function fetchRoute(
  origin: { lat: number; lng: number },
  waypoint: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ latitude: number; longitude: number }[]> {
  if (!GOOGLE_MAPS_API_KEY) return [];

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.lat},${destination.lng}` +
    `&waypoints=${waypoint.lat},${waypoint.lng}` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.routes?.length) return [];

  const encoded = data.routes[0].overview_polyline?.points;
  return encoded ? decodePolyline(encoded) : [];
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

  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Polyline, setPolyline] = useState<any>(null);
  const [mapsReady, setMapsReady] = useState(false);

  const pickupLat = parseFloat(params.pickupLat || "0");
  const pickupLng = parseFloat(params.pickupLng || "0");
  const dropoffLat = parseFloat(params.dropoffLat || "0");
  const dropoffLng = parseFloat(params.dropoffLng || "0");
  const driverLat = parseFloat(params.driverLat || "0");
  const driverLng = parseFloat(params.driverLng || "0");

  const hasDriverCoords = !isNaN(driverLat) && driverLat !== 0;
  const hasApiKey = Boolean(GOOGLE_MAPS_API_KEY);

  // Dynamically load react-native-maps on native platforms
  useEffect(() => {
    if (Platform.OS === "web") {
      setMapsReady(false);
      return;
    }
    (async () => {
      try {
        const maps = await import("react-native-maps");
        setMapView(() => maps.default);
        setMarker(() => maps.Marker);
        setPolyline(() => maps.Polyline);
        setMapsReady(true);
      } catch {
        setMapsReady(false);
      }
    })();
  }, []);

  // Fetch directions route
  useEffect(() => {
    if (!hasApiKey || pickupLat === 0 || dropoffLat === 0) return;
    setLoadingRoute(true);
    const origin = hasDriverCoords
      ? { lat: driverLat, lng: driverLng }
      : { lat: pickupLat, lng: pickupLng };

    fetchRoute(origin, { lat: pickupLat, lng: pickupLng }, { lat: dropoffLat, lng: dropoffLng })
      .then(setRouteCoords)
      .catch(() => setRouteCoords([]))
      .finally(() => setLoadingRoute(false));
  }, []);

  const initialRegion = {
    latitude: pickupLat || 36.9,
    longitude: pickupLng || 7.76,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${driverLat},${driverLng}&destination=${dropoffLat},${dropoffLng}&waypoints=${pickupLat},${pickupLng}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open Google Maps.")
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={["#042770", C.blue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        {hasDriverCoords && (
          <Pressable onPress={openInGoogleMaps} style={styles.mapsBtn}>
            <Ionicons name="navigate" size={18} color="#fff" />
          </Pressable>
        )}
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Map Area */}
        <View style={styles.mapContainer}>
          {Platform.OS !== "web" && mapsReady && MapView ? (
            <>
              <MapView
                style={styles.map}
                provider="google"
                initialRegion={initialRegion}
                showsUserLocation={hasDriverCoords}
                showsMyLocationButton={false}
              >
                {/* Driver Marker */}
                {hasDriverCoords && (
                  <Marker
                    coordinate={{ latitude: driverLat, longitude: driverLng }}
                    title="Your Location"
                    pinColor={C.blue}
                  />
                )}
                {/* Pickup Marker */}
                {pickupLat !== 0 && (
                  <Marker
                    coordinate={{ latitude: pickupLat, longitude: pickupLng }}
                    title="Pickup"
                    description={params.pickupAddress}
                    pinColor={C.orange}
                  />
                )}
                {/* Dropoff Marker */}
                {dropoffLat !== 0 && (
                  <Marker
                    coordinate={{ latitude: dropoffLat, longitude: dropoffLng }}
                    title="Dropoff"
                    description={params.dropoffAddress}
                    pinColor="#DC2626"
                  />
                )}
                {/* Route Polyline */}
                {routeCoords.length > 0 && (
                  <Polyline
                    coordinates={routeCoords}
                    strokeColor={C.blue}
                    strokeWidth={4}
                  />
                )}
              </MapView>
              {loadingRoute && (
                <View style={styles.routeLoadingOverlay}>
                  <ActivityIndicator color={C.blue} />
                  <Text style={styles.routeLoadingText}>Loading route...</Text>
                </View>
              )}
              {!hasApiKey && (
                <View style={styles.noKeyBanner}>
                  <Ionicons name="warning-outline" size={14} color="#92400E" />
                  <Text style={styles.noKeyText}>
                    Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to enable live routing
                  </Text>
                </View>
              )}
            </>
          ) : Platform.OS === "web" ? (
            <View style={styles.webMapFallback}>
              <Ionicons name="map-outline" size={48} color={C.border} />
              <Text style={styles.webMapText}>Map view available on the mobile app</Text>
              {hasDriverCoords && (
                <Pressable onPress={openInGoogleMaps} style={styles.openMapsBtn}>
                  <LinearGradient
                    colors={[C.blue, C.orange]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.openMapsBtnGrad}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.openMapsBtnText}>Open in Google Maps</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.webMapFallback}>
              <ActivityIndicator color={C.blue} />
              <Text style={styles.webMapText}>Loading map...</Text>
            </View>
          )}
        </View>

        {/* Order Info */}
        <View style={styles.infoSection}>
          {/* Client */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Client</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={18} color={C.blue} />
              <Text style={styles.infoValue}>{params.clientName || "—"}</Text>
            </View>
            {params.clientPhone ? (
              <Pressable
                style={styles.infoRow}
                onPress={() => Linking.openURL(`tel:${params.clientPhone}`)}
              >
                <Ionicons name="call" size={18} color={C.success} />
                <Text style={[styles.infoValue, { color: C.success }]}>{params.clientPhone}</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Route */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Route</Text>
            <View style={styles.routeBlock}>
              <View style={styles.routeLine}>
                <View style={[styles.routeDot, { backgroundColor: C.blue }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeLabel}>Pickup</Text>
                  <Text style={styles.routeAddr} numberOfLines={2}>{params.pickupAddress || "—"}</Text>
                </View>
              </View>
              <View style={styles.routeConnector} />
              <View style={styles.routeLine}>
                <View style={[styles.routeDot, { backgroundColor: "#DC2626" }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeLabel}>Dropoff</Text>
                  <Text style={styles.routeAddr} numberOfLines={2}>{params.dropoffAddress || "—"}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Payment</Text>
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={18} color={C.success} />
              <Text style={styles.priceText}>
                {Number(params.estimatedPrice || 0).toLocaleString()} DZD
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="wallet" size={18} color={C.blue} />
              <Text style={styles.infoValue}>
                {params.paymentMethod === "cash"
                  ? "Cash"
                  : params.paymentMethod === "card"
                  ? "Card"
                  : "Mobile Payment"}
              </Text>
            </View>
          </View>

          {/* Open Maps CTA for native */}
          {Platform.OS !== "web" && hasDriverCoords && (
            <Pressable onPress={openInGoogleMaps} style={{ marginTop: 4 }}>
              <LinearGradient
                colors={["#042770", C.blue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.navBtn}
              >
                <Ionicons name="navigate-circle" size={20} color="#fff" />
                <Text style={styles.navBtnText}>Navigate with Google Maps</Text>
              </LinearGradient>
            </Pressable>
          )}
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
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  mapsBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: { height: 280, width: "100%", backgroundColor: "#E5E7EB", overflow: "hidden" },
  map: { flex: 1 },
  routeLoadingOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  routeLoadingText: { fontSize: 12, fontFamily: "Inter_500Medium", color: C.text },
  noKeyBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFBEB",
    borderTopWidth: 1,
    borderTopColor: "#FCD34D",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  noKeyText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: "#92400E" },
  webMapFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#F3F4F6",
  },
  webMapText: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.textSecondary },
  openMapsBtn: { borderRadius: 12, overflow: "hidden", marginTop: 4 },
  openMapsBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  openMapsBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  infoSection: { padding: 16, gap: 12 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  infoCardTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoValue: { fontSize: 15, fontFamily: "Inter_500Medium", color: C.text, flex: 1 },
  priceText: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.success },
  routeBlock: { gap: 2 },
  routeLine: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  routeLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 },
  routeAddr: { fontSize: 14, fontFamily: "Inter_500Medium", color: C.text, lineHeight: 20, marginTop: 2 },
  routeConnector: { width: 2, height: 20, backgroundColor: C.border, marginLeft: 5, marginVertical: 2 },
  navBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  navBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
