import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerComponent } from './scanner.component';

describe('ScannerComponent', () => {
  let component: ScannerComponent;
  let fixture: ComponentFixture<ScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should parse detected barcode', () => {
    const detectedBarcode = {
      "boundingBox": {
        "x": 49,
        "y": 290,
        "width": 269,
        "height": 71,
        "top": 290,
        "right": 318,
        "bottom": 361,
        "left": 49
      },
      "cornerPoints": [
        {
          "x": 49,
          "y": 293
        },
        {
          "x": 316,
          "y": 290
        },
        {
          "x": 318,
          "y": 360
        },
        {
          "x": 49,
          "y": 361
        }
      ],
      "format": "code_128",
      "rawValue": "]C1010803339013567217261031"
    } as DetectedBarcode;

    const parsedBarcode = component.parseBarcode(detectedBarcode);

    // (01) 08033390135672 (17) 261031
    expect(parsedBarcode).toEqual({
      'barcode': '010803339013567217261031',
      '01': '08033390135672',
      '17': ''
    });
  });
});
