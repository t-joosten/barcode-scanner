import { Component, ViewChild } from '@angular/core';
import { BarcodeFormat } from '@zxing/library'
import { ZXingScannerComponent } from "@zxing/ngx-scanner";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('scanner', { static: false }) scanner!: ZXingScannerComponent;
  @ViewChild('input', {static: false}) input!: HTMLParagraphElement;

  public allowedFormats = [ BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX ];
  public availableDevices: MediaDeviceInfo[] = [];
  public hasDevices: boolean = false;
  public isScannerEnabled = true;
  public barcodeResults: Array<string> = [];

  private destroy$ = new Subject();

  public ngAfterViewInit(): void {
    this.scanner.scanComplete.subscribe(res => this.input.innerHTML = this.input.innerHTML + res?.toString() + '\r\n');
  }

  public ngOnDestroy(): void {
    this.destroy$.next(null);
  }

  public selectDevice(device: MediaDeviceInfo): void {
    this.scanner.device = device;
  }

  public onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  public onCodeResult(resultString: string) {
    if (this.barcodeResults.findIndex(barcodeResult => barcodeResult === resultString) > -1) {
      this.barcodeResults.push(resultString)
    }
  }

  public toggleTryHarder(event: any): void {
    console.log(event.target.checked);
    this.scanner.tryHarder = event.target.checked;
  }
}
