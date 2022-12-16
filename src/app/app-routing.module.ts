import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxScannerComponent } from "./ngx-scanner/ngx-scanner.component";
import { ScannerComponent } from "./scanner/scanner.component";

const routes: Routes = [
  { path: 'ngx-scanner', component: NgxScannerComponent },
  { path: '', component: ScannerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
