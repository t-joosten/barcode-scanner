export {};

declare global {
  interface BarcodeDetector {
    detect: Function; // whatever type you want to give. (any,number,float etc)
  }
}
