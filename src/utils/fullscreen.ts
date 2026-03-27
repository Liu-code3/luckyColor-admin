export function getFullscreenElement(doc: Document = document) {
  return doc.fullscreenElement;
}

export function isFullscreenElement(target: Element | null | undefined, doc: Document = document) {
  return Boolean(target) && getFullscreenElement(doc) === target;
}

export async function requestFullscreen(target: HTMLElement) {
  if (!target.requestFullscreen) {
    throw new Error('Fullscreen API unavailable');
  }

  await target.requestFullscreen();
}

export async function exitFullscreen(doc: Document = document) {
  if (!getFullscreenElement(doc)) {
    return;
  }

  if (!doc.exitFullscreen) {
    throw new Error('Fullscreen API unavailable');
  }

  await doc.exitFullscreen();
}

export async function toggleFullscreen(target?: HTMLElement | null, doc: Document = document) {
  const activeElement = getFullscreenElement(doc);

  if (target) {
    if (activeElement === target) {
      await exitFullscreen(doc);
      return false;
    }

    if (activeElement && activeElement !== target) {
      await exitFullscreen(doc);
    }

    await requestFullscreen(target);
    return true;
  }

  if (activeElement) {
    await exitFullscreen(doc);
    return false;
  }

  await requestFullscreen(doc.documentElement);
  return true;
}
