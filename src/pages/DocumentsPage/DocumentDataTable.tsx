import {useEffect, useState} from "react";
import {DataType, documentTypeLabels} from "../../types/document.types";
import {Dropdown, Table, TableColumnsType} from "antd";
import {Link} from "react-router-dom";

import { ReactComponent as DownloadIcon } from '../../assets/icons/tabler_download.svg';
import { ReactComponent as ShareIcon } from '../../assets/icons/fluent_open-32-filled.svg';
import { ReactComponent as EllipsisIcon } from '../../assets/icons/ri_more-2-fill.svg';
import DocumentInfo from "../../components/elements/Modals/DocumentInfo";
import {useModalLogic} from "../../hooks/useModalHook";


export default function DocumentsDataTable() {
    const [selectionType] = useState<'checkbox' | 'radio'>('checkbox');
    const [data, setData] = useState<DataType[]>([]);

    const { showModal, showOverflow, selectedDoc, openModal, closeModal } =
        useModalLogic<DataType>();

    const columns: TableColumnsType<DataType> = [
        {
            title: 'Название',
            dataIndex: 'name',
            render: (text: string, record: DataType) => (
                <Link to={`/documents/${record.id}`}>{text}</Link>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdDate',
            sorter: (a, b) => a.createdDate.localeCompare(b.createdDate),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Изменено',
            dataIndex: 'updatedDate',
            sorter: (a, b) => a.updatedDate.localeCompare(b.updatedDate),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Тип документа',
            dataIndex: 'type',
            render: (type: string | undefined) =>
                type ? documentTypeLabels[type] ?? type : '',
            filters: [
                { text: 'Административный', value: 'ADMINISTRATIVE' },
                { text: 'Финансовый', value: 'FINANCIAL' },
                { text: 'HR', value: 'HR' },
                { text: 'Юридический', value: 'JURIDICAL' },
                { text: 'Производственный', value: 'MANUFACTUR' },
                { text: 'Маркетинг', value: 'MARKETING' },
                {
                    text: 'Информационно-аналитический',
                    value: 'INFORMATION_ANALYTICAL',
                },
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            dataIndex: 'download',
            render: () => (
                <div className="document-icon">
                    <DownloadIcon className="download" />
                </div>
            ),
        },
        {
            dataIndex: 'share',
            render: () => (
                <div className="document-icon">
                    <ShareIcon className="share" />
                </div>
            ),
        },
        {
            dataIndex: 'more',
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
                                key: 'rename',
                                label: 'Переименовать',
                            },
                            {
                                key: 'trash',
                                label: 'В корзину',
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

    useEffect(() => {
        const dataList = async () => {
            try {
                // const response = await Api.document.list();
                // setData(Array.isArray(response) ? response.map((item, index) => ({ ...item, key: index })) : []);

                setData([]);
            } catch (e) {
                console.error('Ошибка при получении документа!', e);
            }
        };

        dataList();
    }, []);

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
            console.log('selectedRowKeys:', selectedRowKeys, 'selectedRows:', selectedRows);
        },
        getCheckboxProps: (record: DataType) => ({
            disabled: record.name === 'Disabled User',
            name: record.name,
        }),
    };

    return (
        <div>
            <Table
                rowSelection={{
                    type: selectionType,
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={data}
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
