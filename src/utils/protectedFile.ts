import sysConfig from '@/config';
import {
  getAccessToken,
  resolveTenantRequestHeaders
} from '@/utils/auth';

const FILE_URL_PREFIXES = [
  '/api/file/',
  '/file/'
];

function normalizePathValue(path: string) {
  return path.replace(/^\/+/, '').replaceAll('\\', '/').trim();
}

function readPathFromQuery(url: URL) {
  const path = url.searchParams.get('path');
  return path ? normalizePathValue(path) : null;
}

export function extractProtectedRelativePath(fileUrl: string) {
  const trimmedUrl = fileUrl.trim();

  try {
    const resolvedUrl = new URL(trimmedUrl, window.location.origin);
    const queryPath = readPathFromQuery(resolvedUrl);
    if (queryPath) {
      return queryPath;
    }

    for (const prefix of FILE_URL_PREFIXES) {
      if (resolvedUrl.pathname.startsWith(prefix)) {
        return normalizePathValue(decodeURIComponent(resolvedUrl.pathname.slice(prefix.length)));
      }
    }

    if (!trimmedUrl.includes('://') && !trimmedUrl.startsWith('blob:')) {
      return normalizePathValue(trimmedUrl);
    }
  }
  catch {
    if (!trimmedUrl.includes('://') && !trimmedUrl.startsWith('blob:')) {
      return normalizePathValue(trimmedUrl);
    }
  }

  return null;
}

export function buildProtectedFileUrl(relativePath: string) {
  const normalizedPath = normalizePathValue(relativePath);
  return `${sysConfig.API_URL}/admin/files/download?path=${encodeURIComponent(normalizedPath)}`;
}

export function normalizeProtectedFileUrl(fileUrl: string) {
  const relativePath = extractProtectedRelativePath(fileUrl);
  return relativePath ? buildProtectedFileUrl(relativePath) : null;
}

export function collectProtectedFileUrls(html: string) {
  const urls = new Set<string>();
  const imageSourcePattern = /src=(['"])(.*?)\1/g;

  for (const match of html.matchAll(imageSourcePattern)) {
    const url = match[2]?.trim();
    if (!url) {
      continue;
    }
    if (normalizeProtectedFileUrl(url)) {
      urls.add(url);
    }
  }

  return Array.from(urls);
}

export async function createProtectedFileObjectUrl(fileUrl: string) {
  const persistedUrl = normalizeProtectedFileUrl(fileUrl);
  if (!persistedUrl) {
    return null;
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  const response = await fetch(new URL(persistedUrl, window.location.origin), {
    method: 'GET',
    credentials: 'include',
    headers: {
      ...resolveTenantRequestHeaders(),
      [sysConfig.TOKEN_NAME]: `${sysConfig.TOKEN_PREFIX}${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load protected file: ${response.status}`);
  }

  const blob = await response.blob();
  return {
    objectUrl: URL.createObjectURL(blob),
    persistedUrl
  };
}

export function revokeProtectedFileObjectUrls(objectUrls: Iterable<string>) {
  for (const objectUrl of objectUrls) {
    URL.revokeObjectURL(objectUrl);
  }
}
