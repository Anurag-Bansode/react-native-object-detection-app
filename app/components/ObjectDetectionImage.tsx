import { Image } from "expo-image";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

import Colors from "../Colors";
import { Detection } from "../types";

interface ObjectDetectionImageProps {
  imageUri: string;
  imageSize: { width: number; height: number };
  detections: Detection[];
  displaySize: { width: number; height: number };
  isProcessing: boolean;
  error?: string;
  onRetry: () => void;
}

export default function ObjectDetectionImage({
  imageUri,
  imageSize,
  detections,
  displaySize,
  isProcessing,
  error,
  onRetry,
}: ObjectDetectionImageProps) {
  // Calculate scaling factors
  const scaleX = displaySize.width / imageSize.width;
  const scaleY = displaySize.height / imageSize.height;

  return (
    <View style={[styles.imageContainer, displaySize]}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      )}
      {error && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.retryButton}>
            <Button title="Retry" onPress={onRetry} color="#fff" />
          </View>
        </View>
      )}
      <Svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
        style={styles.svg}
      >
        {detections.map((d, i) => (

          <Svg key={i}>
            <Rect
              x={d.box.x}
              y={d.box.y}
              width={d.box.width}
              height={d.box.height}
              stroke={Colors.light.detection}
              strokeWidth="2"
              fill="transparent"
            />
            <SvgText
              x={d.box.x + 5}
              y={d.box.y + 20}
              fill={Colors.light.detection}
              fontSize="20"
              fontWeight="bold"
            >
              {d.label}
            </SvgText>
          </Svg>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  errorText: {
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 10,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})