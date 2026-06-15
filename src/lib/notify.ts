import { notification } from 'antd';

/** Единая точка для всплывающих уведомлений об успехе/ошибке (задача «попап»). */
export const notify = {
    success(title: string, description?: string) {
        notification.success({ title, description, placement: 'topRight' });
    },
    error(title: string, description?: string) {
        notification.error({ title, description, placement: 'topRight' });
    },
    info(title: string, description?: string) {
        notification.info({ title, description, placement: 'topRight' });
    },
};

/** Достаёт текст из пойманной ошибки и показывает попап. */
export function notifyError(error: unknown, fallback = 'Произошла ошибка') {
    const description = error instanceof Error ? error.message : undefined;
    notify.error(fallback, description);
}
