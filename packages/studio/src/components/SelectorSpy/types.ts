export interface PickedElement {
  tag: string;
  id: string | null;
  classes: string[];
  text: string | null;
  xpath: string;
  cssPath: string;
  reliableSelector?: {
    type: string;
    value: string;
    reliability: number;
  };
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
