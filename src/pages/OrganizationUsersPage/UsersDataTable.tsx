import { useCallback, useEffect, useState } from 'react';
import { Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';

import * as organizationUsersApi from '../../api/organizationUsers';
import { useOrganization } from '../../context/OrganizationContext';
import { SortDirection } from '../../api/dto/common.dto';
import { notifyError } from '../../lib/notify';
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
    const organizationId = selectedOrganization?.id ?? null;

    const [data, setData] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');

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
            title: 'Дата рождения',
            dataIndex: 'birthday',
        },
        {
            title: 'Дата добавления',
            dataIndex: 'createdDate',
            sorter: true,
        },
    ];

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
