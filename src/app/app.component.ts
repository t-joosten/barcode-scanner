import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { ZXingScannerComponent } from "@zxing/ngx-scanner";
import { Subject } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
}
