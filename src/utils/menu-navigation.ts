type MenuNavigationLike = {
  key?: string;
  path?: string;
  url?: string;
  routeType?: LayoutT.MenuRouteMeta['type'];
  meta?: LayoutT.MenuRouteMeta;
};

export function isExternalLinkMenu(item: MenuNavigationLike | null | undefined) {
  if (!item) {
    return false;
  }

  return item.routeType === 'link' || item.meta?.type === 'link';
}

export function resolveExternalLinkUrl(item: MenuNavigationLike | null | undefined) {
  if (!item) {
    return '';
  }

  const externalUrl = item.url || item.meta?.url || item.path || item.key;
  return typeof externalUrl === 'string' ? externalUrl : '';
}

export function openExternalLink(url: string) {
  if (!url) {
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
