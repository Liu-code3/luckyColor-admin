type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
};

type FullscreenTarget = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

const FULLSCREEN_CHANGE_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange'
] as const;

export function getFullscreenElement(doc: Document = document) {
  const fullscreenDocument = doc as FullscreenDocument;

  return fullscreenDocument.fullscreenElement
    ?? fullscreenDocument.webkitFullscreenElement
    ?? fullscreenDocument.mozFullScreenElement
    ?? fullscreenDocument.msFullscreenElement
    ?? null;
}

export function isFullscreenElement(target: Element | null | undefined, doc: Document = document) {
  return Boolean(target) && getFullscreenElement(doc) === target;
}

export function addFullscreenChangeListener(listener: EventListener, doc: Document = document) {
  FULLSCREEN_CHANGE_EVENTS.forEach((eventName) => {
    doc.addEventListener(eventName, listener);
  });

  return () => {
    FULLSCREEN_CHANGE_EVENTS.forEach((eventName) => {
      doc.removeEventListener(eventName, listener);
    });
  };
}

export async function requestFullscreen(target: HTMLElement) {
  const fullscreenTarget = target as FullscreenTarget;
  const request = fullscreenTarget.requestFullscreen
    ?? fullscreenTarget.webkitRequestFullscreen
    ?? fullscreenTarget.mozRequestFullScreen
    ?? fullscreenTarget.msRequestFullscreen;

  if (!request) {
    throw new Error('Fullscreen API unavailable');
  }

  await Promise.resolve(request.call(fullscreenTarget));
}

export async function exitFullscreen(doc: Document = document) {
  if (!getFullscreenElement(doc)) {
    return;
  }

  const fullscreenDocument = doc as FullscreenDocument;
  const exit = fullscreenDocument.exitFullscreen
    ?? fullscreenDocument.webkitExitFullscreen
    ?? fullscreenDocument.mozCancelFullScreen
    ?? fullscreenDocument.msExitFullscreen;

  if (!exit) {
    throw new Error('Fullscreen API unavailable');
  }

  await Promise.resolve(exit.call(fullscreenDocument));
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
