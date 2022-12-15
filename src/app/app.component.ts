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
  public devices: MediaDeviceInfo[] = [];
  public isScannerEnabled = true;

  private destroy$ = new Subject();

  public ngAfterViewInit(): void {
    this.watchAvailableCameras();

    this.scanner.scanComplete.subscribe(res => this.input.innerHTML = this.input.innerHTML + res?.toString() + '\r\n');
  }

  public ngOnDestroy(): void {
    this.destroy$.next(null);
  }

  public selectDevice(device: MediaDeviceInfo): void {
    this.scanner.device = device;
  }

  private watchAvailableCameras(): void {
    this.scanner
      .camerasFound
      .pipe(takeUntil(this.destroy$))
      .subscribe(devices =>  this.devices = devices);
  }
}
