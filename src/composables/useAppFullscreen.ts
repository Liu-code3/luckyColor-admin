import { onBeforeUnmount, onMounted, ref } from 'vue';
import { addFullscreenChangeListener, getFullscreenElement, toggleFullscreen } from '@/utils/fullscreen';

export function useAppFullscreen() {
  const isFullscreen = ref(Boolean(getFullscreenElement()));
  let cleanupListener: null | (() => void) = null;

  function sync() {
    isFullscreen.value = Boolean(getFullscreenElement());
  }

  async function toggle() {
    isFullscreen.value = await toggleFullscreen();
  }

  onMounted(() => {
    cleanupListener = addFullscreenChangeListener(sync);
    sync();
  });

  onBeforeUnmount(() => {
    cleanupListener?.();
  });

  return {
    isFullscreen,
    sync,
    toggle
  };
}
