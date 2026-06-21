import { useCallback, useEffect, useState } from 'react';
import { Button, Input, Modal, Space, Spin } from 'antd';

import * as documentsApi from '../../api/documents';
import {
    DocumentResponse,
    DocumentStatus,
    documentStatusLabels,
} from '../../api/dto/document.dto';
import { useRole } from '../../context/RoleContext';
import { notify, notifyError } from '../../lib/notify';

interface StatusAction {
    /** Целевой статус, в который переводит действие. */
    target: DocumentStatus;
    /** Подпись кнопки. */
    label: string;
    /** Вызов соответствующего эндпоинта. */
    call: (id: string, reason?: string) => Promise<DocumentResponse>;
    /** Требуется ли комментарий/причина (открываем модалку). */
    reasonRequired?: boolean;
    /** Доступно только директору (OWNER/ADMIN) — бэкенд требует владельца. */
    ownerOnly?: boolean;
    /** Опасное действие (красная кнопка). */
    danger?: boolean;
    /** Основное действие (акцентная кнопка). */
    primary?: boolean;
}

// Порядок важен — в нём кнопки и отрисуются.
const STATUS_ACTIONS: StatusAction[] = [
    {
        target: 'IN_PROGRESS',
        label: 'Взять в работу',
        call: (id, reason) => documentsApi.startDocument(id, reason),
    },
    {
        target: 'PENDING_REVIEW',
        label: 'Отправить на проверку',
        call: (id, reason) => documentsApi.submitDocumentForReview(id, reason),
    },
    {
        target: 'APPROVED',
        label: 'Утвердить',
        call: (id, reason) => documentsApi.approveDocument(id, reason),
        ownerOnly: true,
        primary: true,
    },
    {
        target: 'SIGNED',
        label: 'Подписать',
        call: (id, reason) => documentsApi.signDocument(id, reason),
        primary: true,
    },
    {
        target: 'DONE',
        label: 'Завершить',
        call: (id, reason) => documentsApi.completeDocument(id, reason),
    },
    {
        target: 'CHANGES_REQUESTED',
        label: 'Запросить правки',
        call: (id, reason) => documentsApi.requestDocumentChanges(id, reason ?? ''),
        ownerOnly: true,
        reasonRequired: true,
    },
    {
        target: 'REJECTED',
        label: 'Отклонить',
        call: (id, reason) => documentsApi.rejectDocument(id, reason ?? ''),
        ownerOnly: true,
        reasonRequired: true,
        danger: true,
    },
    {
        target: 'CANCELLED',
        label: 'Отменить',
        call: (id, reason) => documentsApi.cancelDocument(id, reason ?? ''),
        reasonRequired: true,
        danger: true,
    },
    {
        target: 'EXPIRED',
        label: 'Пометить просроченным',
        call: (id, reason) => documentsApi.expireDocument(id, reason),
        ownerOnly: true,
    },
];

interface DocumentStatusActionsProps {
    documentId: string;
    /** Сообщает родителю текущий/обновлённый статус (для отображения). */
    onStatusChange?: (status: DocumentStatus) => void;
}

export default function DocumentStatusActions({
    documentId,
    onStatusChange,
}: DocumentStatusActionsProps) {
    const { isDirector } = useRole();

    const [available, setAvailable] = useState<DocumentStatus[]>([]);
    const [loading, setLoading] = useState(true);
    // target статуса, по которому сейчас выполняется запрос (для спиннера кнопки).
    const [busy, setBusy] = useState<DocumentStatus | null>(null);

    // Модалка причины: какое действие подтверждаем и введённый текст.
    const [reasonAction, setReasonAction] = useState<StatusAction | null>(null);
    const [reasonText, setReasonText] = useState('');

    const loadTransitions = useCallback(async () => {
        setLoading(true);

        try {
            const data = await documentsApi.getStatusTransitions(documentId);
            setAvailable(data.availableStatuses);
            onStatusChange?.(data.currentStatus);
        } catch (e) {
            notifyError(e, 'Не удалось загрузить доступные статусы');
        } finally {
            setLoading(false);
        }
    }, [documentId, onStatusChange]);

    useEffect(() => {
        loadTransitions();
    }, [loadTransitions]);

    const run = async (action: StatusAction, reason?: string) => {
        setBusy(action.target);

        try {
            const updated = await action.call(documentId, reason);
            onStatusChange?.(updated.status);
            notify.success(`Статус изменён: «${documentStatusLabels[updated.status] ?? updated.status}»`);
            await loadTransitions();
        } catch (e) {
            notifyError(e, 'Не удалось изменить статус документа');
        } finally {
            setBusy(null);
        }
    };

    const handleClick = (action: StatusAction) => {
        if (action.reasonRequired) {
            setReasonText('');
            setReasonAction(action);
            return;
        }

        run(action);
    };

    const confirmReason = async () => {
        if (!reasonAction) {
            return;
        }

        const trimmed = reasonText.trim();
        if (!trimmed) {
            notify.error('Укажите причину');
            return;
        }

        const action = reasonAction;
        setReasonAction(null);
        await run(action, trimmed);
    };

    // Показываем только разрешённые бизнес-процессом переходы, доступные по роли.
    const actions = STATUS_ACTIONS.filter(
        (action) =>
            available.includes(action.target) && (!action.ownerOnly || isDirector),
    );

    if (loading) {
        return <Spin size="small" />;
    }

    if (actions.length === 0) {
        return null;
    }

    return (
        <>
            <Space wrap>
                {actions.map((action) => (
                    <Button
                        key={action.target}
                        type={action.primary ? 'primary' : 'default'}
                        danger={action.danger}
                        loading={busy === action.target}
                        disabled={busy !== null && busy !== action.target}
                        onClick={() => handleClick(action)}
                    >
                        {action.label}
                    </Button>
                ))}
            </Space>

            <Modal
                title={reasonAction?.label}
                open={reasonAction !== null}
                onOk={confirmReason}
                onCancel={() => setReasonAction(null)}
                okText="Подтвердить"
                cancelText="Отмена"
                okButtonProps={{ danger: reasonAction?.danger }}
            >
                <Input.TextArea
                    rows={4}
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    placeholder="Укажите причину или комментарий"
                    maxLength={1024}
                    showCount
                />
            </Modal>
        </>
    );
}
