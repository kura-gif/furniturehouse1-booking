/**
 * 確認ダイアログ用composable
 * ブラウザのネイティブconfirmの代わりに使用
 */

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "danger";
}

interface ConfirmDialogState {
  isOpen: boolean;
  options: ConfirmDialogOptions;
  resolve: ((value: boolean) => void) | null;
}

const state = ref<ConfirmDialogState>({
  isOpen: false,
  options: { message: "" },
  resolve: null,
});

export const useConfirmDialog = () => {
  const confirm = (
    options: ConfirmDialogOptions | string,
  ): Promise<boolean> => {
    const opts: ConfirmDialogOptions =
      typeof options === "string" ? { message: options } : options;

    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        options: {
          title: opts.title ?? "確認",
          message: opts.message,
          confirmText: opts.confirmText ?? "はい",
          cancelText: opts.cancelText ?? "キャンセル",
          type: opts.type ?? "info",
        },
        resolve,
      };
    });
  };

  const handleConfirm = () => {
    if (state.value.resolve) {
      state.value.resolve(true);
    }
    close();
  };

  const handleCancel = () => {
    if (state.value.resolve) {
      state.value.resolve(false);
    }
    close();
  };

  const close = () => {
    state.value = {
      isOpen: false,
      options: { message: "" },
      resolve: null,
    };
  };

  return {
    state: readonly(state),
    confirm,
    handleConfirm,
    handleCancel,
  };
};
