import type { RouteLocationNormalizedLoaded } from 'vue-router';

type MenuNavigationLike = {
  name?: string;
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

export function isIframeMenu(item: MenuNavigationLike | null | undefined) {
  if (!item) {
    return false;
  }

  return item.routeType === 'iframe' || item.meta?.type === 'iframe';
}

export function buildIframeRoutePath(name: string | null | undefined) {
  if (!name) {
    return '';
  }

  return `/i/${name}`;
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

export function resolveMenuRoutePath(item: MenuNavigationLike | null | undefined) {
  if (!item) {
    return '';
  }

  if (isIframeMenu(item)) {
    if (typeof item.path === 'string' && item.path.startsWith('/i/')) {
      return item.path;
    }

    if (typeof item.key === 'string' && item.key.startsWith('/i/')) {
      return item.key;
    }

    return buildIframeRoutePath(item.name);
  }

  if (typeof item.path === 'string') {
    return item.path;
  }

  return typeof item.key === 'string' ? item.key : '';
}

export function resolveMatchedMenuRootPath(
  route: Pick<RouteLocationNormalizedLoaded, 'matched' | 'fullPath'>
) {
  const matchedRoot = route.matched.find(item =>
    item.path
    && item.path !== '/'
    && !item.path.startsWith('/:pathMatch')
  );

  if (matchedRoot?.path) {
    return matchedRoot.path;
  }

  const secondSlashIndex = route.fullPath.indexOf('/', 1);
  return secondSlashIndex !== -1 ? route.fullPath.slice(0, secondSlashIndex) : route.fullPath;
}
