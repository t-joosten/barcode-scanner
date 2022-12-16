import { Component, OnInit, ViewChild } from '@angular/core';
import { MultiFormatReader } from "@zxing/library";
import { from, map } from "rxjs";
import { BarcodeFormat } from "../../types/barcode-format.enum";

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
    public scannedBarcodes: string[];

    private reader = new MultiFormatReader();
    private formats = [ BarcodeFormat.CODE128, BarcodeFormat.EAN13, BarcodeFormat.EAN8 ];
    private imageCapture: ImageCapture;
    private constraints: any;

  //     'aztec',
  // 'code_128',
  // 'code_39',
  // 'code_93',
  // 'codabar',
  // 'data_matrix',
  // 'ean_13',
  // 'ean_8',
  // 'itf',
  // 'pdf417',
  // 'qr_code',
  // 'upc_a',
  // 'upc_e',

  public ngOnInit(): void {
    this.getCameras();
  }

  public getCameras(): void {
    from(navigator.mediaDevices.enumerateDevices())
      .pipe(map(devices => devices.filter(device => device.kind === 'videoinput')))
      .subscribe(devices => this.availableCameras = devices)
  }

  public setCamera(deviceId: string): void {
    this.currentCamera = this.availableCameras.find(camera => camera.deviceId === deviceId);

    this.getCameraStream();
  }

  public getCameraStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
    }

    this.constraints = { "video": { deviceId: {exact : this.currentCamera.deviceId } } };

    navigator.mediaDevices.getUserMedia(this.constraints)
      .then(mediaStream => {
        const scannerVideo = document.getElementById('scanner-video') as HTMLVideoElement;
        scannerVideo.srcObject = mediaStream;
        this.mediaStream = mediaStream;
        this.imageCapture = new ImageCapture(mediaStream.getVideoTracks()[0])
      })
      .catch(error => {
        console.log('getUserMedia error: ', error);
      });
  }

  public grabFrame(): void {
    this.imageCapture.grabFrame().then(imageBitmap => {
      console.log('Grabbed frame:', imageBitmap);
      const scannerCanvas = document.getElementById('scanner-canvas') as HTMLCanvasElement;
      scannerCanvas.width = imageBitmap.width;
      scannerCanvas.height = imageBitmap.height;
      scannerCanvas.getContext('2d').drawImage(imageBitmap, 0, 0);
      scannerCanvas.classList.remove('hidden');
      this.detect(imageBitmap);
    }).catch(function(error) {
      console.log('grabFrame() error: ', error);
    });
  }


  private detect(image: ImageBitmap | Blob): void {
      if (!('BarcodeDetector' in window)) {
        var footer = document.getElementsByTagName('footer')[0];
        footer.innerHTML = "Barcode Detection not supported";
        console.error('Barcode Detection not supported');
        return;
      }

    // @ts-ignore
    const barcodeDetector = new BarcodeDetector({ formats });
    console.log('decoding');

    barcodeDetector
      .detect(image)
      .then((barcodes: DetectedBarcode[]) => {
        barcodes.forEach(barcode => {
          const lastCornerPoint = barcode.cornerPoints[barcode.cornerPoints.length - 1]

          const scannerCanvas = document.getElementById('scanner-canvas') as HTMLCanvasElement;
          const ctx = scannerCanvas.getContext('2d');
          ctx.moveTo(lastCornerPoint.x, lastCornerPoint.y)
          barcode.cornerPoints.forEach(point => ctx.lineTo(point.x, point.y))

          ctx.lineWidth = 3
          ctx.strokeStyle = '#00e000ff'
          ctx.stroke()
        })

        console.log(barcodes);
        let pre = document.createElement('pre');
        // pre.innerHTML = JSON.stringify(barcodes, null, 2);

        barcodes.forEach(barcode => barcode.rawValue)
        var footer = document.getElementsByTagName('footer')[0];
        footer.after(pre);
      })
      .catch(console.error);
  }

  private securityCheck(): void {
    var isSecureOrigin = location.protocol === 'https:' ||
      location.host === 'localhost';
    if (!isSecureOrigin) {
      alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
        '\n\nChanging protocol to HTTPS');
      location.protocol = 'HTTPS';
    }
  }

}
