import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';

import { ReactComponent as UploadIcon } from '../../assets/icons/solar_upload-linear.svg';
import { ReactComponent as CreateIcon } from '../../assets/icons/tabler_edit.svg';
import Search from '../../components/elements/Search';
import * as templatesApi from '../../api/templates';
import { TemplateResponse } from '../../api/dto/template.dto';
import { useRole } from '../../context/RoleContext';
import { notify, notifyError } from '../../lib/notify';

// Пример разметки поля в шаблоне (вынесен в константу, чтобы линтер
// не принимал строку за незаконченный template literal).
// eslint-disable-next-line no-template-curly-in-string
const FIELD_MARK_EXAMPLE = '${ключ}';

function formatDate(value: string): string {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD.MM.YYYY') : '—';
}

export default function TemplatesPage() {
    const navigate = useNavigate();
    const { isDirector } = useRole();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [templates, setTemplates] = useState<TemplateResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const list = await templatesApi.listTemplates();
            setTemplates(Array.isArray(list) ? list : []);
        } catch (e) {
            notifyError(e, 'Не удалось загрузить список шаблонов');
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // Сбрасываем value, чтобы повторный выбор того же файла снова сработал.
        event.target.value = '';
        if (!file) {
            return;
        }

        const name = file.name.replace(/\.docx?$/i, '');
        setUploading(true);
        try {
            const created = await templatesApi.uploadTemplate(file, name);
            notify.success(
                'Шаблон загружен',
                `Найдено полей: ${created.fields?.length ?? 0}`,
            );
            await load();
        } catch (e) {
            notifyError(e, 'Не удалось загрузить шаблон');
        } finally {
            setUploading(false);
        }
    };

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return templates;
        }
        return templates.filter((t) => t.name.toLowerCase().includes(query));
    }, [templates, search]);

    const columns: TableColumnsType<TemplateResponse> = [
        {
            title: 'Название шаблона',
            dataIndex: 'name',
            render: (text: string, record) => (
                <button
                    type="button"
                    className="tpl-row-name"
                    onClick={() => navigate(`/template/${record.id}`)}
                >
                    {text}
                </button>
            ),
        },
        {
            title: 'Поля',
            dataIndex: 'fields',
            width: 120,
            render: (_value, record) => {
                const count = record.fields?.length ?? 0;
                return count > 0 ? (
                    <Tag color="blue">{count}</Tag>
                ) : (
                    <Tag>без полей</Tag>
                );
            },
        },
        {
            title: 'Создан',
            dataIndex: 'createdAt',
            width: 140,
            render: (value: string) => formatDate(value),
        },
        {
            title: 'Изменён',
            dataIndex: 'updatedAt',
            width: 140,
            render: (value: string) => formatDate(value),
        },
        {
            dataIndex: 'action',
            width: 190,
            render: (_value, record) => (
                <button
                    type="button"
                    className="tpl-row-action"
                    onClick={() => navigate(`/template/${record.id}`)}
                >
                    Создать документ →
                </button>
            ),
        },
    ];

    return (
        <div className="content-flex-column">
            <div className="content-header">
                <div className="tpl-head">
                    <h2 className="header-title">Создать договор по шаблону</h2>
                    <p className="tpl-head__sub">
                        Выберите шаблон — система разберёт его поля и поможет собрать
                        готовый документ.
                    </p>
                </div>
            </div>

            <div className="content-header__search tpl-search">
                <Search searchText={search} setSearchText={setSearch} />
            </div>

            <div className="data-table" style={{ marginTop: '24px' }}>
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={filtered}
                    pagination={{ pageSize: 10, hideOnSinglePage: true }}
                    locale={{
                        emptyText: loading
                            ? ' '
                            : 'Шаблонов пока нет. Загрузите DOCX-шаблон с метками полей.',
                    }}
                    onRow={(record) => ({
                        onClick: () => navigate(`/template/${record.id}`),
                        style: { cursor: 'pointer' },
                    })}
                />
            </div>
        </div>
    );
}
