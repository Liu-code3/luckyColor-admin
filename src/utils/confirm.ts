import { dialog } from '@/utils/message';

interface ConfirmActionOptions {
  title?: string;
  content: string;
  positiveText?: string;
  negativeText?: string;
}

export function confirmAction(options: ConfirmActionOptions) {
  return new Promise<boolean>((resolve) => {
    let settled = false;

    const finish = (result: boolean) => {
      if (settled)
        return;

      settled = true;
      resolve(result);
    };

    dialog.warning({
      title: options.title || '确认操作',
      content: options.content,
      positiveText: options.positiveText || '确认',
      negativeText: options.negativeText || '取消',
      closable: false,
      maskClosable: false,
      onPositiveClick: () => finish(true),
      onNegativeClick: () => finish(false),
      onClose: () => finish(false),
      onMaskClick: () => finish(false)
    });
  });
}
