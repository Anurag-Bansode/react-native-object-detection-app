import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "./Colors";
import ObjectDetectionImage from "./components/ObjectDetectionImage";
import { Detection, ImageState } from "./types";


const BASE_URL = "http://localhost:8082";

export default function Index() {
  const [images, setImages] = useState<ImageState[]>([]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (result.canceled) {
      return;
    }

    try {
      const newImages: ImageState[] = result.assets.map((asset) => ({
        uri: asset.uri,
        size: { width: asset.width, height: asset.height },
        detections: [],
        processing: true,
        error: undefined,
      }));
      setImages((prevImages) => {
        const updatedImages = [...prevImages, ...newImages];
        newImages.forEach((image, index) => {
          const imageIndex = prevImages.length + index;
          // We pass the index to detectObjects to update the correct image state
          detectObjects(image.uri, imageIndex);
        });
        return updatedImages;
      });
    } catch (error) {
      Alert.alert("Error", "Failed to process image.");
      console.error(error);
    }
  };

  const retryDetection = (imageIndex: number) => {
    const imageToRetry = images[imageIndex];
    if (imageToRetry) {
      // Reset error and set processing to true for the specific image
      setImages((currentImages) =>
        currentImages.map((img, idx) =>
          idx === imageIndex ? { ...img, processing: true, error: undefined } : img
        )
      );
      detectObjects(imageToRetry.uri, imageIndex);
    }
  };

  const detectObjects = async (uri: string, imageIndex: number) => {
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("image", {
        uri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${BASE_URL}/api/detect`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
        } catch (e) {
          console.error("Error parsing server response:", e);
        }
        throw new Error(errorMessage);
      }

      const detections: Detection[] = await response.json();

      setImages((currentImages) =>
        currentImages.map((img, idx) =>
          idx === imageIndex
            ? { ...img, detections: detections, processing: false }
            : img
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Object detection failed for image", uri, errorMessage);
      Alert.alert("Detection Error", errorMessage);
      setImages((currentImages) =>
        currentImages.map((img, idx) =>
          idx === imageIndex ? { ...img, processing: false, error: errorMessage } : img
        )
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Object Detection</Text>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick Images</Text>
        </Pressable>
        {images.length > 0 && (
          <Pressable
            style={[styles.button, styles.clearButton]}
            onPress={() => setImages([])}
          >
            <Text style={styles.buttonText}>Clear All</Text>
          </Pressable>
        )}
      </View>
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.list}
      >
        {images.map((image, index) => {
          const screenWidth = Dimensions.get("window").width - 32; // padding
          const aspectRatio = image.size.width / image.size.height;
          const displaySize = {
            width: screenWidth,
            height: screenWidth / (aspectRatio || 1),
          };
          return (
            <ObjectDetectionImage
              key={index}
              imageUri={image.uri}
              imageSize={image.size}
              detections={image.detections}
              displaySize={displaySize}
              isProcessing={image.processing}
              error={image.error}
              onRetry={() => retryDetection(index)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.light.text,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    width: "100%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.light.button,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  clearButton: {
    backgroundColor: Colors.light.danger,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    width: "100%",
  },
  list: {
    alignItems: "center",
    paddingBottom: 40,
  },
});
