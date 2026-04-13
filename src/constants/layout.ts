export enum LayoutMode {
  NORMAL = 'normal',
  TOP = 'top',
  MODULAR = 'modular',
  EMPTY = 'empty'
}

export const DEFAULT_LAYOUT_MODE = LayoutMode.NORMAL;

export const LAYOUT_MOBILE_BREAKPOINT = 1024;

const layoutModeSet = new Set<string>(Object.values(LayoutMode));

export function isLayoutMode(value: string | undefined): value is LayoutMode {
  return !!value && layoutModeSet.has(value);
}

export function normalizeLayoutMode(value: string | undefined, fallback = DEFAULT_LAYOUT_MODE): LayoutMode {
  return isLayoutMode(value) ? value : fallback;
}
