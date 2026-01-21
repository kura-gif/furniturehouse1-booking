/**
 * トースト通知用composable
 * ブラウザのネイティブalertの代わりに使用
 */

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

const toasts = ref<Toast[]>([]);

export const useToast = () => {
  const show = (
    message: string,
    type: Toast["type"] = "info",
    duration = 4000,
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = { id, type, message, duration };

    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  };

  const remove = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message: string, duration?: number) =>
    show(message, "success", duration);
  const error = (message: string, duration?: number) =>
    show(message, "error", duration ?? 6000);
  const warning = (message: string, duration?: number) =>
    show(message, "warning", duration);
  const info = (message: string, duration?: number) =>
    show(message, "info", duration);

  return {
    toasts: readonly(toasts),
    show,
    remove,
    success,
    error,
    warning,
    info,
  };
};
