import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WILAYAS, getWilayaName, getCommuneName, type Wilaya, type Commune } from "@/lib/algeria-data";
import Colors from "@/constants/colors";

const C = Colors.light;

export type WilayaSelection = {
  wilayaCode: string;
  wilayaName: string;
  communeCode: string;
  communeName: string;
};

type Props = {
  label: string;
  placeholder: string;
  value: WilayaSelection | null;
  onChange: (selection: WilayaSelection) => void;
  error?: string;
  isRTL?: boolean;
  language: string;
};

type Step = "wilaya" | "commune";

export default function WilayaSelector({
  label,
  placeholder,
  value,
  onChange,
  error,
  isRTL,
  language,
}: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("wilaya");
  const [search, setSearch] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);

  const openModal = () => {
    setStep("wilaya");
    setSearch("");
    setSelectedWilaya(null);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSearch("");
    setSelectedWilaya(null);
    setStep("wilaya");
  };

  const filteredWilayas = useMemo(() => {
    if (!search.trim()) return WILAYAS;
    const q = search.toLowerCase();
    return WILAYAS.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.nameAr.includes(search) ||
        w.nameFr.toLowerCase().includes(q) ||
        w.code.includes(search)
    );
  }, [search]);

  const filteredCommunes = useMemo(() => {
    if (!selectedWilaya) return [];
    if (!search.trim()) return selectedWilaya.communes;
    const q = search.toLowerCase();
    return selectedWilaya.communes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameAr.includes(search) ||
        c.nameFr.toLowerCase().includes(q)
    );
  }, [search, selectedWilaya]);

  const handleWilayaSelect = useCallback(
    (w: Wilaya) => {
      setSelectedWilaya(w);
      setSearch("");
      setStep("commune");
    },
    []
  );

  const handleCommuneSelect = useCallback(
    (c: Commune) => {
      if (!selectedWilaya) return;
      onChange({
        wilayaCode: selectedWilaya.code,
        wilayaName: getWilayaName(selectedWilaya, language),
        communeCode: c.code,
        communeName: getCommuneName(c, language),
      });
      closeModal();
    },
    [selectedWilaya, language, onChange]
  );

  const displayText = value
    ? `${value.wilayaName} › ${value.communeName}`
    : "";

  const modalTitle =
    step === "wilaya"
      ? language === "ar"
        ? "اختر الولاية"
        : language === "fr"
        ? "Choisir la wilaya"
        : "Select Wilaya"
      : language === "ar"
      ? `اختر البلدية — ${selectedWilaya?.nameAr}`
      : language === "fr"
      ? `Choisir la commune — ${selectedWilaya?.nameFr}`
      : `Select Commune — ${selectedWilaya?.name}`;

  const searchPlaceholder =
    step === "wilaya"
      ? language === "ar"
        ? "ابحث عن ولاية..."
        : language === "fr"
        ? "Rechercher une wilaya..."
        : "Search wilaya..."
      : language === "ar"
      ? "ابحث عن بلدية..."
      : language === "fr"
      ? "Rechercher une commune..."
      : "Search commune...";

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, isRTL && styles.textRight]}>{label}</Text>
      <Pressable
        onPress={openModal}
        style={[
          styles.trigger,
          !!error && styles.triggerError,
          isRTL && styles.triggerRTL,
        ]}
      >
        {!isRTL && (
          <Ionicons
            name="location-outline"
            size={18}
            color={error ? C.error : C.textSecondary}
            style={styles.triggerIcon}
          />
        )}
        <Text
          style={[
            styles.triggerText,
            !displayText && styles.triggerPlaceholder,
            isRTL && styles.textRight,
            { flex: 1 },
          ]}
          numberOfLines={1}
        >
          {displayText || placeholder}
        </Text>
        {isRTL && (
          <Ionicons
            name="location-outline"
            size={18}
            color={error ? C.error : C.textSecondary}
            style={styles.triggerIconRTL}
          />
        )}
        <Ionicons
          name="chevron-down"
          size={16}
          color={C.textSecondary}
          style={isRTL ? { marginRight: 6 } : { marginLeft: 6 }}
        />
      </Pressable>
      {!!error && (
        <View style={[styles.errorRow, isRTL && styles.errorRowRTL]}>
          <Ionicons name="alert-circle" size={12} color={C.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === "ios" ? insets.top : 16 }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, isRTL && styles.rowRTL]}>
            {step === "commune" && (
              <Pressable
                onPress={() => { setStep("wilaya"); setSearch(""); }}
                style={[styles.backBtn, isRTL && { marginLeft: 8, marginRight: 0 }]}
              >
                <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color={C.blue} />
              </Pressable>
            )}
            <Text style={[styles.modalTitle, isRTL && styles.textRight, { flex: 1 }]} numberOfLines={1}>
              {modalTitle}
            </Text>
            <Pressable onPress={closeModal} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={C.text} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={[styles.searchBox, isRTL && styles.rowRTL]}>
            <Ionicons name="search" size={18} color={C.textSecondary} style={isRTL ? styles.searchIconRTL : styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, isRTL && styles.textRight]}
              value={search}
              onChangeText={setSearch}
              placeholder={searchPlaceholder}
              placeholderTextColor="#A0AEC0"
              autoCorrect={false}
              textAlign={isRTL ? "right" : "left"}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={C.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* List */}
          {step === "wilaya" ? (
            <FlatList
              data={filteredWilayas}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.listItem, isRTL && styles.rowRTL]}
                  onPress={() => handleWilayaSelect(item)}
                >
                  <View style={styles.codeChip}>
                    <Text style={styles.codeChipText}>{item.code}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, isRTL && styles.textRight]}>
                      {language === "ar" ? item.nameAr : language === "fr" ? item.nameFr : item.name}
                    </Text>
                    {language !== "ar" && (
                      <Text style={[styles.itemNameSub, isRTL && styles.textRight]}>{item.nameAr}</Text>
                    )}
                  </View>
                  <Ionicons
                    name={isRTL ? "chevron-back" : "chevron-forward"}
                    size={16}
                    color={C.textSecondary}
                  />
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <FlatList
              data={filteredCommunes}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.listItem, isRTL && styles.rowRTL]}
                  onPress={() => handleCommuneSelect(item)}
                >
                  <Ionicons name="location" size={16} color={C.blue} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                  <Text style={[styles.itemName, { flex: 1 }, isRTL && styles.textRight]}>
                    {language === "ar" ? item.nameAr : language === "fr" ? item.nameFr : item.name}
                  </Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text, marginBottom: 8 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
  },
  triggerRTL: { flexDirection: "row-reverse" },
  triggerError: { borderColor: C.error, backgroundColor: "#FFF5F5" },
  triggerIcon: { marginRight: 10 },
  triggerIconRTL: { marginLeft: 10 },
  triggerText: { fontSize: 15, fontFamily: "Inter_500Medium", color: C.text },
  triggerPlaceholder: { color: "#A0AEC0" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  errorRowRTL: { flexDirection: "row-reverse", justifyContent: "flex-end" },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.error },
  textRight: { textAlign: "right" },
  rowRTL: { flexDirection: "row-reverse" },
  modalContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { marginRight: 8, padding: 4 },
  closeBtn: { padding: 4 },
  modalTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.text },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  searchIcon: { marginRight: 8 },
  searchIconRTL: { marginLeft: 8 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, padding: 0 },
  listContent: { paddingBottom: 40 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  codeChip: {
    backgroundColor: C.blue + "18",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 12,
    minWidth: 36,
    alignItems: "center",
  },
  codeChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.blue },
  itemName: { fontSize: 15, fontFamily: "Inter_500Medium", color: C.text },
  itemNameSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
  separator: { height: 1, backgroundColor: C.border, marginLeft: 16 },
});
