import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { ZXingScannerComponent } from "@zxing/ngx-scanner";
import { Subject } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('scanner', { static: false }) scanner!: ZXingScannerComponent;
  @ViewChild('input', {static: false}) input!: HTMLParagraphElement;

  public possibleFormats = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_13,
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

  private hints: Map<DecodeHintType, any> = new Map<DecodeHintType, any>()

  private destroy$ = new Subject();

  public ngOnDestroy(): void {
    this.destroy$.next(null);
  }

  public ngOnInit(): void {
    this.hints.set(DecodeHintType.ASSUME_GS1, true)
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, this.possibleFormats)
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

    if (this.deviceCurrent) {
      this.scanner.hints.set(DecodeHintType.ASSUME_GS1, true);
    }
  }
}
