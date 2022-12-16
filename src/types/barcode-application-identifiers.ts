import { IBarcodeApplicationIdentifier } from "./barcode-application-identifier.interface";

export class BarcodeApplicationIdentifiers {
  public applicationIdentifiers = [
    {
      id: '00',
      type: 'Serial Shipping Container Code',
      minLength: 18,
      maxLength: 18
    },
    {
      id: '01',
      type: 'Global Trade Item Number',
      minLength: 14,
      maxLength: 14
    },
    {
      id: '01',
      type: 'Global Trade Item Number',
      minLength: 14,
      maxLength: 14
    }
  ] as IBarcodeApplicationIdentifier[];

  public parseBarcode(barcode: string): void {
    console.log('parsing', barcode);


  }
}
