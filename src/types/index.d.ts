export {};

declare global {
  interface BarcodeDetector {
    detect: Promise<DetectedBarcode>; // whatever type you want to give. (any,number,float etc)
  }

  interface DetectedBarcode {
    boundingBox: DOMRectReadOnly,
    cornerPoints: CornerPoint[],
    format: string,
    rawValue: string
  }

  interface CornerPoint {
    x: number,
    y: number
  }
}
