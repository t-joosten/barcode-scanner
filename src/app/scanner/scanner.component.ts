import { Component, OnInit, ViewChild } from '@angular/core';
import { filter, from, map } from "rxjs";
// @ts-ignore
import * as bark from 'bark-js'

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit {
  @ViewChild('scannerVideo', { static: true }) scannerVideo: HTMLVideoElement;
  @ViewChild('scannerCanvas', { static: true }) scannerCanvas: HTMLCanvasElement;
  @ViewChild('scannerImage', { static: true }) scannerImage: HTMLImageElement;

    public mediaStream: MediaStream;
    public availableCameras: MediaDeviceInfo[];
    public currentCamera: MediaDeviceInfo;
    public scannedBarcodes: Map<string, number> = new Map<string, number>();

    // @ts-ignore
    private imageCapture: ImageCapture = null;
    private constraints: any;
    private barcodeDetector: BarcodeDetector;

  public ngOnInit(): void {
    this.getCameras();
  }

  public getCameras(): void {
    from(navigator.mediaDevices.enumerateDevices())
      .pipe(
        map(devices => devices.filter(device => device.kind === 'videoinput')),
        filter(devices => !!devices))
      .subscribe(devices => {
        console.log(devices);
        this.availableCameras = devices
      })
  }

  public setCamera(deviceId: string): void {
    this.currentCamera = this.availableCameras.find(camera => camera.deviceId === deviceId);

    if (this.currentCamera && this.currentCamera?.deviceId) {
      this.getCameraStream();
    }
  }

  public getCameraStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
    }

    if (this.currentCamera.deviceId) {
      this.constraints = { "video": { deviceId: {exact : this.currentCamera.deviceId } } };

      navigator.mediaDevices.getUserMedia(this.constraints)
        .then(mediaStream => {
          const scannerVideo = document.getElementById('scanner-video') as HTMLVideoElement;
          scannerVideo.srcObject = mediaStream;
          scannerVideo.autoplay = true;
          this.mediaStream = mediaStream;
          this.renderLoop();
          // this.imageCapture = new (window as any).ImageCapture(mediaStream.getVideoTracks()[0])
          // setInterval(() => this.grabFrame(), 100);
        })
        .catch(error => {
          console.log('getUserMedia error: ', error);
        });
    }
  }

  public grabFrame(): void {
    this.imageCapture.grabFrame().then((imageBitmap: ImageBitmap) => {
      console.log('Grabbed frame:', imageBitmap);
      const scannerCanvas = document.getElementById('scanner-canvas') as HTMLCanvasElement;
      scannerCanvas.width = imageBitmap.width;
      scannerCanvas.height = imageBitmap.height;
      this.clearCanvas(scannerCanvas, imageBitmap.width, imageBitmap.height);
      // scannerCanvas.getContext('2d').drawImage(imageBitmap, 0, 0);
      // scannerCanvas.classList.remove('hidden');
      // this.detect(imageBitmap);
    }).catch((error: string) => {
      console.log('grabFrame() error: ', error);
    });
  }

  public parseBarcode(barcode: DetectedBarcode): any {
    const parsedBarcode = {};
    let barcodeRemaining = barcode.rawValue;

    if(barcode.format === 'code_128')
    {
      // Removes ]C1
      barcodeRemaining = barcodeRemaining.substring(3, barcodeRemaining.length)
      console.log('barcode: ', barcodeRemaining);
      // @ts-ignore
      parsedBarcode['barcode'] = barcodeRemaining;
      console.log(barcodeRemaining[0]+barcodeRemaining[1]);
    }
    if (barcodeRemaining[0]+barcodeRemaining[1] === '01') {
      const gtin = barcodeRemaining.substring(2, 16);

      console.log('gtin: ', gtin);
      // @ts-ignore
      parsedBarcode['01'] = gtin;
      barcodeRemaining = barcodeRemaining.substring(16, barcodeRemaining.length);
      console.log('barcode: ', barcodeRemaining);
    }
    if (barcodeRemaining[0]+barcodeRemaining[1] === '17') {
      const date = barcodeRemaining.substring(2, 6);

      console.log('date: ', date);
      // @ts-ignore
      parsedBarcode['17'] = date;
      barcodeRemaining = barcodeRemaining.substring(6, barcodeRemaining.length);
      console.log('barcode: ', barcodeRemaining);
    }
    console.log(parsedBarcode);

    return parsedBarcode;
  }

  private initBarcodeDetector(): void {
    if (!('BarcodeDetector' in window)) {
      const footer = document.getElementsByTagName('footer')[0];
      footer.innerHTML = "Barcode Detection not supported";
      console.error('Barcode Detection not supported');
      return;
    }

    // @ts-ignore
    this.barcodeDetector = new BarcodeDetector();
  }

  private renderLoop(): void {
    requestAnimationFrame(() => this.renderLoop());
    this.detectBarcodes(this.scannerVideo);
  }

  private detectBarcodes(video: HTMLVideoElement): void {
    if(!!this.barcodeDetector) {
      console.log('decoding');
      // @ts-ignore
      this.barcodeDetector.detect(video)
        .then((barcodes: DetectedBarcode[]) => {
          const scannerCanvas = document.getElementById('scanner-canvas') as HTMLCanvasElement;
          if (barcodes) {
            scannerCanvas.classList.remove('hidden');
          }

          barcodes.forEach(barcode => {
            const lastCornerPoint = barcode.cornerPoints[barcode.cornerPoints.length - 1]
            const ctx = scannerCanvas.getContext('2d');
            ctx.moveTo(lastCornerPoint.x, lastCornerPoint.y)
            barcode.cornerPoints.forEach(point => ctx.lineTo(point.x, point.y))

            ctx.lineWidth = 3
            ctx.strokeStyle = '#00e000ff'
            ctx.stroke()
          })

          console.log(barcodes);

          barcodes.forEach(barcode => {
            if (!this.scannedBarcodes.has(barcode.rawValue)) {
              this.scannedBarcodes.set(barcode.rawValue, 1);
            } else {
              const count = this.scannedBarcodes.get(barcode.rawValue);
              this.scannedBarcodes.set(barcode.rawValue, count+1);
            }
            console.log(bark(barcode.rawValue));
          });
        })
        .catch(console.error);
    }
  }

  private clearCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);
  }
}
