declare module "react-barcode" {
  import { ComponentType } from "react";

  export interface BarcodeProps {
    value: string;
    renderer?: "svg" | "canvas" | "img";
    format?:
      | "CODE39"
      | "CODE128"
      | "CODE128A"
      | "CODE128B"
      | "CODE128C"
      | "EAN13"
      | "EAN8"
      | "EAN5"
      | "EAN2"
      | "UPC"
      | "ITF14"
      | "ITF"
      | "MSI"
      | "MSI10"
      | "MSI11"
      | "MSI1010"
      | "MSI1110"
      | "pharmacode"
      | "codabar";
    width?: number;
    height?: number;
    displayValue?: boolean;
    font?: string;
    textAlign?: string;
    textPosition?: string;
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    flat?: boolean;
    valid?: (valid: boolean) => void;
  }

  const Barcode: ComponentType<BarcodeProps>;
  export default Barcode;
}
