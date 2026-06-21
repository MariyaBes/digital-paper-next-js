import { useCallback, useEffect, useState } from 'react';
import { Select } from 'antd';

import * as documentsApi from '../../api/documents';
import * as organizationUsersApi from '../../api/organizationUsers';
import { useOrganization } from '../../context/OrganizationContext';
import { useRole } from '../../context/RoleContext';
import { useUser } from '../../context/UserContext';
import { notify, notifyError } from '../../lib/notify';

interface UserOption {
    value: string;
    label: string;
}

interface DocumentResponsibleControlProps {
    documentId: string;
    /** Id автора документа — автор тоже может менять ответственного. */
    createdById?: string;
    /** ФИО текущего ответственного (для подписи). */
    currentResponsible?: string;
}

export default function DocumentResponsibleControl({
    documentId,
    createdById,
    currentResponsible,
}: DocumentResponsibleControlProps) {
    const { selectedOrganization } = useOrganization();
    const { isDirector } = useRole();
    const { profile } = useUser();

    const organizationId = selectedOrganization?.id ?? null;
    // Назначать может директор или автор документа (текущего ответственного по id
    // на этой странице не знаем — бэкенд всё равно проверит права).
    const canAssign =
        isDirector || (profile?.id != null && createdById === profile.id);

    const [users, setUsers] = useState<UserOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // Подпись выбранного ответственного после смены (пока не перезагрузили страницу).
    const [assignedLabel, setAssignedLabel] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        if (!organizationId || users.length > 0) {
            return;
        }

        setLoading(true);

        try {
            const response = await organizationUsersApi.listOrganizationUsers(
                organizationId,
                { size: 100 },
            );
            setUsers(
                response.list.map((user) => ({
                    value: user.id,
                    label:
                        [user.lastName, user.firstName, user.middleName]
                            .filter(Boolean)
                            .join(' ')
                            .trim() || user.email,
                })),
            );
        } catch (e) {
            notifyError(e, 'Не удалось загрузить список сотрудников');
        } finally {
            setLoading(false);
        }
    }, [organizationId, users.length]);

    useEffect(() => {
        if (canAssign) {
            loadUsers();
        }
    }, [canAssign, loadUsers]);

    if (!canAssign) {
        // Не можем назначать — показываем только текущего ответственного (если есть).
        return currentResponsible ? (
            <h4 className="container-info__type">
                <strong>Ответственный:</strong> {currentResponsible}
            </h4>
        ) : null;
    }

    const handleChange = async (
        userId: string,
        option?: UserOption | UserOption[],
    ) => {
        setSaving(true);

        try {
            await documentsApi.assignResponsible(documentId, userId);
            const picked = Array.isArray(option) ? option[0] : option;
            setAssignedLabel(picked?.label ?? null);
            notify.success('Ответственный назначен');
        } catch (e) {
            notifyError(e, 'Не удалось назначить ответственного');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-info__type">
            <strong>Ответственный:</strong>{' '}
            <Select<string, UserOption>
                size="small"
                style={{ minWidth: 240 }}
                placeholder={assignedLabel ?? currentResponsible ?? 'Назначить ответственного'}
                options={users}
                loading={loading || saving}
                disabled={saving}
                showSearch
                optionFilterProp="label"
                onChange={handleChange}
            />
        </div>
    );
}
