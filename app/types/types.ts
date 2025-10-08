export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  box: BoundingBox;
  label: string;
}
export interface ImageState {
  uri: string;
  size: { width: number; height: number };
  detections: Detection[];
}