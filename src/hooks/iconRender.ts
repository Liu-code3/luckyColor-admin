import { Icon } from '@iconify/vue';

export function useIconRender() {
  const iconRender = (icon: string) => {
    // if(!icon) window.console.warn('需要传入图标名称~')
    return () => h(Icon, { icon });
  };

  return iconRender;
}
