import { Component, OnInit } from '@angular/core';
import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HybridBinarizer,
  MultiFormatReader,
  RGBLuminanceSource
} from "@zxing/library";

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit {
    public stream: MediaStream | null = null;
    private reader = new MultiFormatReader();
    private formats = [ 'code_128', 'ean_13' ];


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

    private constraints =
    {
      audio:false,
      video:
        {
          frameRate: { ideal: 60, min: 30 },
          facingMode: { ideal: "environment" },
          width:  { exact: 626 },
          height: { exact: 720 },
        }
    }

  public ngOnInit(): void {
    }

  public start(): void {
    // We want to select the environment-facing camera, but currently
    // that's not straightforward, instead, get the last enumerated one.
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        var videoSource = null;
        devices.forEach((device) => {
          if (device.kind == 'videoinput') {
            videoSource = device.deviceId;
          }
        });
        const constraints = { "video": { deviceId: {exact : videoSource}, width: { max: 320 } } };
        return navigator.mediaDevices.getUserMedia(this.constraints);
      })
      .then(stream => {
        const scannerVideo = document.getElementById('scanner-video') as HTMLVideoElement;
        scannerVideo.srcObject = stream;
        // document.getElementById('start').disabled = true;
        // document.getElementById('detect').disabled = false;
        this.stream = stream;
      })
      .catch(e => { console.error('getUserMedia() failed: ', e); });
  }

  public detect(): void {
    if (!('BarcodeDetector' in window)) {
      var footer = document.getElementsByTagName('footer')[0];
      footer.innerHTML = "Barcode Detection not supported";
      console.error('Barcode Detection not supported');
      return;
    }

    // var capturer = new ImageCapture(theStream.getVideoTracks()[0]);
    // capturer.grabFrame()
    //   .then(bitmap => {
    //     var canvas = document.getElementById('canvas');
    //     canvas.width = canvas.height *
    //       document.getElementById('video').videoWidth /
    //       document.getElementById('video').videoHeight;
    //     scale = canvas.width / bitmap.width;
    //     var ctx = canvas.getContext("2d");
    //     ctx.drawImage(bitmap,
    //       0, 0, bitmap.width, bitmap.height,
    //       0, 0, canvas.width, canvas.height);
    //
    //     var barcodeDetector = new BarcodeDetector();
    //     return barcodeDetector.detect(bitmap);
    //   })
    //   .then(barcodes => {
    //     var canvas = document.getElementById('canvas');
    //     var ctx = canvas.getContext("2d");
    //     ctx.lineWidth = 2;
    //     ctx.strokeStyle = "red";
    //
    //     for (var i = 0; i < barcodes.length; i++) {
    //       const barcode = barcodes[i].boundingBox;
    //       ctx.rect(Math.floor(barcode.x * scale),
    //         Math.floor(barcode.y * scale),
    //         Math.floor(barcode.width * scale),
    //         Math.floor(barcode.height * scale));
    //       ctx.stroke();
    //     }
    //   }
  }

    private initializeCameras(): void {
      navigator.mediaDevices.getUserMedia({video: true})
        .then(this.gotMedia)
        .catch(error => console.error('getUserMedia() error:', error));

    }

    private gotMedia(mediaStream: MediaStream): void {
      const mediaStreamTrack = mediaStream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(mediaStreamTrack);
      console.log(imageCapture);
    }



    // private decodeImage(): void {
    //   const hints = new Map();
    //   const formats = [BarcodeFormat.EAN_13, BarcodeFormat.CODE_128];
    //
    //   hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    //
    //   const luminanceSource = new RGBLuminanceSource(imgByteArray, imgWidth, imgHeight);
    //   const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    //
    //   this.reader.decode(binaryBitmap, hints);
    // }

}
