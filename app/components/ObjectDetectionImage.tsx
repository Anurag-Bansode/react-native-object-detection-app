import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

import Colors from "../Colors";
import { Detection } from "../types/types";

interface ObjectDetectionImageProps {
  imageUri: string;
  imageSize: { width: number; height: number };
  detections: Detection[];
  displaySize: { width: number; height: number };
}

export default function ObjectDetectionImage({
  imageUri,
  imageSize,
  detections,
  displaySize,
}: ObjectDetectionImageProps) {
  // Calculate scaling factors
  const scaleX = displaySize.width / imageSize.width;
  const scaleY = displaySize.height / imageSize.height;

  return (
    <View style={[styles.imageContainer, displaySize]}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
        style={styles.svg}
      >
        {detections.map((d, i) => (
          // Using a React.Fragment to group the Rect and SvgText for each detection
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
    marginTop: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});