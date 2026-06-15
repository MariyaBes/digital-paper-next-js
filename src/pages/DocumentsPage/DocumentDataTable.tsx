import { useCallback, useEffect, useState } from 'react';
import { Dropdown, Table, Tag } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { Link } from 'react-router-dom';

import { ReactComponent as DownloadIcon } from '../../assets/icons/tabler_download.svg';
import { ReactComponent as EllipsisIcon } from '../../assets/icons/ri_more-2-fill.svg';
import DocumentInfo from '../../components/elements/Modals/DocumentInfo';
import { useModalLogic } from '../../hooks/useModalHook';
import * as documentsApi from '../../api/documents';
import { DataType, documentStatusLabels } from '../../types/document.types';
import { SortDirection } from '../../api/dto/common.dto';
import { notify, notifyError } from '../../lib/notify';
import { SORT_FIELD_MAP, STATUS_COLORS, toRow } from './documentRow';

const PAGE_SIZE = 10;

interface DocumentsDataTableProps {
    search?: string;
    reloadToken?: number;
}

export default function DocumentsDataTable({
    search = '',
    reloadToken = 0,
}: DocumentsDataTableProps) {
    const [data, setData] = useState<DataType[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');

    const { showModal, showOverflow, selectedDoc, openModal, closeModal } =
        useModalLogic<DataType>();

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const response = await documentsApi.listDocuments({
                page,
                size: PAGE_SIZE,
                sortField,
                sortDirection,
                search: search || undefined,
            });

            setData(response.list.map(toRow));
            setTotal(response.page.totalItems);
        } catch (e) {
            notifyError(e, 'Не удалось загрузить документы');
        } finally {
            setLoading(false);
        }
    }, [page, sortField, sortDirection, search, reloadToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Сброс на первую страницу при изменении поискового запроса.
    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleDownload = async (record: DataType) => {
        try {
            await documentsApi.downloadDocument(record.id, record.name);
        } catch (e) {
            notifyError(e, 'Не удалось скачать документ');
        }
    };

    const handleDelete = async (record: DataType) => {
        try {
            await documentsApi.deleteDocument(record.id);
            notify.success('Документ перемещён в корзину');
            fetchData();
        } catch (e) {
            notifyError(e, 'Не удалось удалить документ');
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
            render: (text: string, record) => (
                <Link to={`/documents/${record.id}`}>{text}</Link>
            ),
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
            dataIndex: 'download',
            width: 48,
            render: (_text, record) => (
                <button
                    className="document-icon"
                    type="button"
                    onClick={() => handleDownload(record)}
                    title="Скачать"
                >
                    <DownloadIcon className="download" />
                </button>
            ),
        },
        {
            dataIndex: 'more',
            width: 48,
            render: (_text, record) => (
                <Dropdown
                    trigger={['click']}
                    menu={{
                        items: [
                            {
                                key: 'info',
                                label: 'Информация о файле',
                                onClick: () => openModal(record, null),
                            },
                            {
                                key: 'download',
                                label: 'Скачать',
                                onClick: () => handleDownload(record),
                            },
                            {
                                key: 'trash',
                                label: 'В корзину',
                                danger: true,
                                onClick: () => handleDelete(record),
                            },
                        ],
                    }}
                >
                    <button className="document-icon" type="button">
                        <EllipsisIcon className="more" />
                    </button>
                </Dropdown>
            ),
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

            <DocumentInfo
                showModal={showModal}
                showOverflow={showOverflow}
                closeModal={closeModal}
                document={selectedDoc}
            />
        </div>
    );
}
