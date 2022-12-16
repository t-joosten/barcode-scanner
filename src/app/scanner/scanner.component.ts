import { Component, OnInit, ViewChild } from '@angular/core';
import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HybridBinarizer,
  MultiFormatReader,
  RGBLuminanceSource
} from "@zxing/library";
import { from, map, Observable } from "rxjs";

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

    private reader = new MultiFormatReader();
    private formats = [ 'code_128', 'ean_13' ];
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

  // public gotStream(stream: MediaStream): void {
  //   this.getCapabilities();
  // }

  // public getCapabilities(): void {
  //   this.imageCapture.getPhotoCapabilities().then(capabilities => {
  //     console.log('Camera capabilities:', capabilities);
  //     /*if (capabilities.zoom.max > 0) {
  //       this.scannerZoomInput.min = capabilities.zoom.min;
  //       zoomInput.max = capabilities.zoom.max;
  //       zoomInput.value = capabilities.zoom.current;
  //       zoomInput.classList.remove('hidden');
  //     }*/
  //   }).catch(function(error) {
  //     console.log('getCapabilities() error: ', error);
  //   });
  // }

// Get an ImageBitmap from the currently selected camera source and
// display this with a canvas element.
  public grabFrame(): void {
    this.imageCapture.grabFrame().then(imageBitmap => {
      console.log('Grabbed frame:', imageBitmap);
      const scannerCanvas = document.getElementById('scanner-canvas') as HTMLCanvasElement;
      scannerCanvas.width = imageBitmap.width;
      scannerCanvas.height = imageBitmap.height;
      scannerCanvas.getContext('2d').drawImage(imageBitmap, 0, 0);
      scannerCanvas.classList.remove('hidden');
      this.decoder(imageBitmap);
    }).catch(function(error) {
      console.log('grabFrame() error: ', error);
    });
  }

  public takePhoto(): void {
    this.imageCapture.takePhoto().then(blob => {
      const scannerImage = document.getElementById('scanner-image') as HTMLImageElement;
      console.log('Took photo:', blob);
      scannerImage.classList.remove('hidden');
      scannerImage.src = URL.createObjectURL(blob);
      this.decoder(blob);
    }).catch(function (error) {
      console.log('takePhoto() error: ', error);
    });
  }

  // public start(): void {
  //   // We want to select the environment-facing camera, but currently
  //   // that's not straightforward, instead, get the last enumerated one.
  //   navigator.mediaDevices.enumerateDevices()
  //     .then((devices) => {
  //       var videoSource = null;
  //       devices.forEach((device) => {
  //         if (device.kind == 'videoinput') {
  //           videoSource = device.deviceId;
  //         }
  //       });
  //       const constraints = { "video": { deviceId: {exact : videoSource}, width: { max: 320 } } };
  //       return navigator.mediaDevices.getUserMedia(this.constraints);
  //     })
  //     .then(stream => {
  //       const scannerVideo = document.getElementById('scanner-video') as HTMLVideoElement;
  //       scannerVideo.srcObject = stream;
  //       // document.getElementById('start').disabled = true;
  //       // document.getElementById('detect').disabled = false;
  //       this.stream = stream;
  //     })
  //     .catch(e => { console.error('getUserMedia() failed: ', e); });
  // }
  //
  // public detect(): void {
  //   if (!('BarcodeDetector' in window) || this.stream === null) {
  //     var footer = document.getElementsByTagName('footer')[0];
  //     footer.innerHTML = "Barcode Detection not supported";
  //     console.error('Barcode Detection not supported');
  //     return;
  //   }
  //
  //   var capturer = new ImageCapture(this.stream.getVideoTracks()[0]);
  //   capturer.grabFrame()
  //     .then(imageBitmap => {
  //       const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  //       console.log('Grabbed frame:', imageBitmap);
  //       canvas.width = imageBitmap.width;
  //       canvas.height = imageBitmap.height;
  //       canvas!.getContext('2d').drawImage(imageBitmap, 0, 0);
  //       canvas.classList.remove('hidden');
  //     })
  //     .then(barcodes => {
  //       var canvas = document.getElementById('canvas') as HTMLCanvasElement;
  //       var ctx = canvas.getContext("2d");
  //       ctx!.lineWidth = 2;
  //       ctx!.strokeStyle = "red";
  //
  //       for (var i = 0; i < barcodes.length; i++) {
  //         const barcode = barcodes[i].boundingBox;
  //         ctx!.rect(Math.floor(barcode.x * this.scale),
  //           Math.floor(barcode.y * this.scale),
  //           Math.floor(barcode.width * this.scale),
  //           Math.floor(barcode.height * this.scale));
  //         ctx!.stroke();
  //       }
  //     });
  // }
  //
  //   private initializeCameras(): void {
  //     navigator.mediaDevices.getUserMedia({video: true})
  //       .then(this.gotMedia)
  //       .catch(error => console.error('getUserMedia() error:', error));
  //
  //   }
  //
  //   private gotMedia(mediaStream: MediaStream): void {
  //     const mediaStreamTrack = mediaStream.getVideoTracks()[0];
  //     const imageCapture = new ImageCapture(mediaStreamTrack);
  //     console.log(imageCapture);
  //   }


  private decoder(image: ImageBitmap | Blob): void {
      if (!('BarcodeDetector' in window)) {
        var footer = document.getElementsByTagName('footer')[0];
        footer.innerHTML = "Barcode Detection not supported";
        console.error('Barcode Detection not supported');
        return;
      }

    // @ts-ignore
    const barcodeDetector = new BarcodeDetector();
    console.log('decoding');

    barcodeDetector
      .detect(image)
      .then((barcodes: DetectedBarcode) => {
        console.log(barcodes);
        let pre = document.createElement('pre');
        pre.innerHTML = JSON.stringify(barcodes, null, 2);
        var footer = document.getElementsByTagName('footer')[0];
        footer.after(pre);
      })
      .catch(console.error);
  }

    // private decodeImage(image: ImageBitmap): void {
    //   const hints = new Map();
    //   const formats = [BarcodeFormat.EAN_13, BarcodeFormat.CODE_128];
    //
    //   hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    //
    //   const luminanceSource = new RGBLuminanceSource(imgByteArray, image.width, image.height);
    //   const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    //
    //   console.log(this.reader.decode(binaryBitmap, hints));
    // }

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
