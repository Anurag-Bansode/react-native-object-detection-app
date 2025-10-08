import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ObjectDetectionImage from "./components/ObjectDetectionImage";
import { Detection, ImageState } from "./types/types";

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
      const newImages: ImageState[] = result.assets.map((asset) => {
        const { uri, width, height } = asset;

        // Mock detection results
        const mockDetections: Detection[] = [
          {
            box: {
              x: width * 0.1,
              y: height * 0.2,
              width: width * 0.5,
              height: height * 0.6,
            },
            label: "Cat",
          },
          {
            box: {
              x: width * 0.65,
              y: height * 0.4,
              width: width * 0.25,
              height: height * 0.3,
            },
            label: "Dog",
          },
        ];

        return {
          uri,
          size: { width, height },
          detections: mockDetections,
        };
      });

      setImages((prevImages) => [...prevImages, ...newImages]);
    } catch (error) {
      Alert.alert("Error", "Failed to process image.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Object Detection</Text>
      <View style={styles.buttonContainer}>
        <Button title="Pick images from camera roll" onPress={pickImage} />
        {images.length > 0 && (
          <Button title="Clear" onPress={() => setImages([])} color="red" />
        )}
      </View>
      <ScrollView contentContainerStyle={styles.list}>
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
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  list: {
    alignItems: "center",
  },
});
