import { Component, ViewChild } from '@angular/core';
import { BarcodeFormat } from '@zxing/library'
import { ZXingScannerComponent } from "@zxing/ngx-scanner";
import { Subject } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('scanner', { static: false }) scanner!: ZXingScannerComponent;
  @ViewChild('input', {static: false}) input!: HTMLParagraphElement;

  public allowedFormats = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.QR_CODE
  ];
  public deviceCurrent!: MediaDeviceInfo | undefined;
  public deviceSelected!: string;
  public availableDevices: MediaDeviceInfo[] = [];
  public hasDevices: boolean = false;
  public isScannerEnabled = true;
  public barcodeResults: Array<string> = [];
  public qrResultString: string = '';
  public tryHarder: boolean = false;
  public hasPermission: boolean = false;
  public torchEnabled: boolean = false;

  private destroy$ = new Subject();

  public ngOnDestroy(): void {
    this.destroy$.next(null);
  }

  public onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  public onCodeResult(resultString: string) {
    this.qrResultString = resultString;

    if (this.barcodeResults.findIndex(barcodeResult => barcodeResult === resultString) > -1) {
      this.barcodeResults.push(resultString)
    }
  }

  public toggleTryHarder(): void {
    this.tryHarder = !this.tryHarder;
  }

  public clearResult(): void {
    this.qrResultString = '';
  }

  public onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  public toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  public onDeviceSelectChange(selected: string) {
    console.log(selected);

    const selectedStr = selected|| '';
    if (this.deviceSelected === selectedStr) { return; }
    this.deviceSelected = selectedStr;
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.deviceCurrent = device || undefined;
  }

  public onDeviceChange(device: MediaDeviceInfo) {
    const selectedStr = device?.deviceId || '';
    if (this.deviceSelected === selectedStr) { return; }
    this.deviceSelected = selectedStr;
    this.deviceCurrent = device || undefined;
  }
}
