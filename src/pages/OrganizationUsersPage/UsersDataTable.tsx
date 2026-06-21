import { useCallback, useEffect, useState } from 'react';
import { Button, Popconfirm, Select, Table, Tag } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';

import { ReactComponent as DeleteIcon } from '../../assets/icons/recycle.svg';
import * as organizationUsersApi from '../../api/organizationUsers';
import { useOrganization } from '../../context/OrganizationContext';
import { useRole } from '../../context/RoleContext';
import { useUser } from '../../context/UserContext';
import { SortDirection } from '../../api/dto/common.dto';
import { assignableUserRoleOptions, UserRole, userRoleLabels } from '../../api/dto/user.dto';
import { notify, notifyError } from '../../lib/notify';
import { SORT_FIELD_MAP, toRow, UserRow } from './userRow';

const PAGE_SIZE = 10;

interface UsersDataTableProps {
    search?: string;
    reloadToken?: number;
}

export default function UsersDataTable({
    search = '',
    reloadToken = 0,
}: UsersDataTableProps) {
    const { selectedOrganization } = useOrganization();
    const { isDirector } = useRole();
    const { profile } = useUser();
    const organizationId = selectedOrganization?.id ?? null;
    const currentUserId = profile?.id ?? null;

    const [data, setData] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');
    // id пользователя, у которого сейчас меняется роль (для блокировки select'а).
    const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
    // id пользователя, которого сейчас удаляют (для блокировки кнопки).
    const [removingId, setRemovingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!organizationId) {
            return;
        }

        setLoading(true);

        try {
            const response = await organizationUsersApi.listOrganizationUsers(
                organizationId,
                {
                    page,
                    size: PAGE_SIZE,
                    sortField,
                    sortDirection,
                    search: search || undefined,
                },
            );

            setData(response.list.map(toRow));
            setTotal(response.page.totalItems);
        } catch (e) {
            notifyError(e, 'Не удалось загрузить список пользователей');
        } finally {
            setLoading(false);
        }
        // reloadToken в зависимостях намеренно — для принудительного перезапроса списка.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationId, page, sortField, sortDirection, search, reloadToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Сброс на первую страницу при изменении поискового запроса.
    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleRoleChange = async (record: UserRow, role: UserRole) => {
        if (!organizationId || role === record.role) {
            return;
        }

        setSavingRoleId(record.id);

        try {
            await organizationUsersApi.changeOrganizationUserRole(
                organizationId,
                record.id,
                role,
            );
            notify.success('Роль пользователя изменена');
            // Локально обновляем строку, чтобы не дёргать весь список.
            setData((rows) =>
                rows.map((row) => (row.id === record.id ? { ...row, role } : row)),
            );
        } catch (e) {
            notifyError(e, 'Не удалось изменить роль пользователя');
        } finally {
            setSavingRoleId(null);
        }
    };

    const handleRemove = async (record: UserRow) => {
        if (!organizationId) {
            return;
        }

        setRemovingId(record.id);

        try {
            await organizationUsersApi.removeUserFromOrganization(
                organizationId,
                record.id,
            );
            notify.success('Сотрудник удалён из организации');
            // Локально убираем строку и поправляем счётчик, чтобы не дёргать весь список.
            setData((rows) => rows.filter((row) => row.id !== record.id));
            setTotal((value) => Math.max(0, value - 1));
        } catch (e) {
            notifyError(e, 'Не удалось удалить сотрудника');
        } finally {
            setRemovingId(null);
        }
    };

    const handleTableChange: TableProps<UserRow>['onChange'] = (
        pagination,
        _filters,
        sorter,
    ) => {
        const current = Array.isArray(sorter) ? sorter[0] : sorter;
        const field = current?.field ? String(current.field) : undefined;

        if (field && current?.order) {
            setSortField(SORT_FIELD_MAP[field] ?? 'createdAt');
            setSortDirection(current.order === 'ascend' ? 'ASC' : 'DESC');
        }

        if (pagination.current) {
            setPage(pagination.current);
        }
    };

    const columns: TableColumnsType<UserRow> = [
        {
            title: 'ФИО',
            dataIndex: 'fullName',
            sorter: true,
        },
        {
            title: 'Почта',
            dataIndex: 'email',
            sorter: true,
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            // Директор может менять роль сотрудникам, но не может назначить роль
            // «Директор» (OWNER) — её нет в списке. Текущий директор показывается тегом.
            render: (role: UserRow['role'], record) =>
                isDirector && role !== 'OWNER' ? (
                    <Select<UserRole>
                        size="small"
                        style={{ minWidth: 150 }}
                        placeholder="Выберите роль"
                        value={role ?? undefined}
                        options={assignableUserRoleOptions}
                        loading={savingRoleId === record.id}
                        disabled={savingRoleId === record.id}
                        onChange={(value) => handleRoleChange(record, value)}
                    />
                ) : (
                    <Tag>{role ? userRoleLabels[role] : '—'}</Tag>
                ),
        },
        {
            title: 'Дата рождения',
            dataIndex: 'birthday',
        },
        {
            title: 'Дата добавления',
            dataIndex: 'createdDate',
            sorter: true,
        },
    ];

    // Колонка удаления — только для директора. Нельзя удалить директора (OWNER)
    // и самого себя.
    if (isDirector) {
        columns.push({
            dataIndex: 'remove',
            width: 130,
            render: (_text, record) => {
                if (record.role === 'OWNER' || record.id === currentUserId) {
                    return null;
                }

                return (
                    <Popconfirm
                        title="Удалить сотрудника?"
                        description="Сотрудник потеряет доступ к организации."
                        okText="Удалить"
                        okButtonProps={{ danger: true }}
                        cancelText="Отмена"
                        onConfirm={() => handleRemove(record)}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteIcon />}
                            loading={removingId === record.id}
                        >
                            Удалить
                        </Button>
                    </Popconfirm>
                );
            },
        });
    }

    return (
        <div>
            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                onChange={handleTableChange}
                pagination={{
                    current: page,
                    pageSize: PAGE_SIZE,
                    total,
                    showSizeChanger: false,
                }}
            />
        </div>
    );
}
