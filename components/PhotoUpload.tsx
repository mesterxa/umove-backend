import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const C = Colors.light;

type Props = {
  label: string;
  iconName: string;
  storagePath: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  tapToUploadText: string;
  changePhotoText: string;
  uploadingText: string;
  isRTL?: boolean;
};

export default function PhotoUpload({
  label,
  iconName,
  storagePath,
  value,
  onChange,
  error,
  tapToUploadText,
  changePhotoText,
  uploadingText,
  isRTL,
}: Props) {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const camLib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (camLib.status !== "granted") {
        Alert.alert(
          "Permission requise",
          "L'accès à la galerie est nécessaire pour télécharger une photo."
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (fromCamera: boolean) => {
    const granted = await requestPermissions();
    if (!granted) return;

    let result: ImagePicker.ImagePickerResult;
    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    };

    if (fromCamera) {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.status !== "granted") return;
      result = await ImagePicker.launchCameraAsync(pickerOptions);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    }

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      onChange(downloadUrl);
    } catch (e) {
      console.error("Photo upload error:", e);
      Alert.alert("Erreur", "Échec du téléchargement. Réessayez.");
    } finally {
      setUploading(false);
    }
  };

  const handlePress = () => {
    if (Platform.OS === "web") {
      pickImage(false);
      return;
    }
    Alert.alert(label, undefined, [
      { text: isRTL ? "الكاميرا" : "Camera", onPress: () => pickImage(true) },
      {
        text: isRTL ? "معرض الصور" : "Gallery",
        onPress: () => pickImage(false),
      },
      { text: isRTL ? "إلغاء" : "Cancel", style: "cancel" },
    ]);
  };

  const hasPhoto = !!value;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, isRTL && styles.labelRTL]}>{label}</Text>
      <Pressable
        onPress={uploading ? undefined : handlePress}
        style={[
          styles.uploadBox,
          hasPhoto && styles.uploadBoxFilled,
          !!error && styles.uploadBoxError,
          uploading && styles.uploadBoxLoading,
        ]}
      >
        {uploading ? (
          <View style={styles.uploadContent}>
            <ActivityIndicator color={C.blue} size="small" />
            <Text style={styles.uploadingText}>{uploadingText}</Text>
          </View>
        ) : hasPhoto ? (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: value }} style={styles.preview} />
            <View style={styles.changeOverlay}>
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={styles.changeText}>{changePhotoText}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.uploadContent}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name={iconName as any}
                size={28}
                color={C.blue}
              />
            </View>
            <Text style={styles.uploadHint}>{tapToUploadText}</Text>
          </View>
        )}
      </Pressable>
      {!!error && (
        <Text style={[styles.errorText, isRTL && styles.labelRTL]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  labelRTL: { textAlign: "right" },
  uploadBox: {
    height: 120,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.border,
    borderStyle: "dashed",
    backgroundColor: C.inputBg,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadBoxFilled: {
    borderStyle: "solid",
    borderColor: C.blue,
    borderWidth: 2,
  },
  uploadBoxError: {
    borderColor: C.error,
    borderStyle: "solid",
  },
  uploadBoxLoading: {
    opacity: 0.7,
  },
  uploadContent: { alignItems: "center", gap: 8 },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: C.blue + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadHint: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: C.textSecondary,
  },
  uploadingText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: C.blue,
    marginTop: 4,
  },
  previewWrapper: { width: "100%", height: "100%" },
  preview: { width: "100%", height: "100%", resizeMode: "cover" },
  changeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  changeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  errorText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.error,
  },
});
