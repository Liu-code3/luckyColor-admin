type TSetCssVar = (prop: string, val: string, dom?: HTMLElement) => void;
export const setCssVar: TSetCssVar = (prop: string, val: string, dom = document.documentElement) => {
  dom && dom.style.setProperty(prop, val);
};
