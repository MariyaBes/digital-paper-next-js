import { useCallback, useEffect, useState } from 'react';
import { Button, Popconfirm, Table, Tag } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';

import { ReactComponent as RestoreIcon } from '../../assets/icons/ic_baseline-restore.svg';
import * as documentsApi from '../../api/documents';
import { DataType, documentStatusLabels } from '../../types/document.types';
import { SortDirection } from '../../api/dto/common.dto';
import { notify, notifyError } from '../../lib/notify';
import { SORT_FIELD_MAP, STATUS_COLORS, toRow } from '../DocumentsPage/documentRow';

const PAGE_SIZE = 10;

interface RecycleTableProps {
    search?: string;
}

export default function RecycleTable({ search = '' }: RecycleTableProps) {
    const [data, setData] = useState<DataType[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const response = await documentsApi.listDeletedDocuments({
                page,
                size: PAGE_SIZE,
                sortField,
                sortDirection,
                search: search || undefined,
            });

            setData(response.list.map(toRow));
            setTotal(response.page.totalItems);
        } catch (e) {
            notifyError(e, 'Не удалось загрузить корзину');
        } finally {
            setLoading(false);
        }
    }, [page, sortField, sortDirection, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleRestore = async (record: DataType) => {
        try {
            await documentsApi.restoreDocument(record.id);
            notify.success('Документ восстановлен');
            fetchData();
        } catch (e) {
            notifyError(e, 'Не удалось восстановить документ');
        }
    };

    const handleTableChange: TableProps<DataType>['onChange'] = (
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

    const columns: TableColumnsType<DataType> = [
        {
            title: 'Название',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Ответственный',
            dataIndex: 'responsible',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            render: (status: DataType['status']) => (
                <Tag color={STATUS_COLORS[status] ?? 'default'}>
                    {documentStatusLabels[status] ?? status}
                </Tag>
            ),
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdDate',
            sorter: true,
        },
        {
            title: 'Изменено',
            dataIndex: 'updatedDate',
            sorter: true,
        },
        {
            dataIndex: 'restore',
            width: 160,
            render: (_text, record) => (
                <Popconfirm
                    title="Восстановить документ?"
                    okText="Восстановить"
                    cancelText="Отмена"
                    onConfirm={() => handleRestore(record)}
                >
                    <Button type="text" icon={<RestoreIcon />}>
                        Восстановить
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
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
    );
}
