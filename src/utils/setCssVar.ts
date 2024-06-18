interface IPropertyObj {
  prop: string;
  val: string;
  dom: HTMLElement;
}

type TSetCssVar = (propertyList: IPropertyObj[]) => void;

export const setCssVar: TSetCssVar = (propertyList: IPropertyObj[]) => {
  if (!propertyList.length) return;
  propertyList.forEach(({ prop, val, dom}) => {
    dom && dom.style.setProperty(prop, val);
  });
};
