import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DatePicker, Form, Input, InputNumber, Select, Spin, Switch } from 'antd';
import dayjs from 'dayjs';

import { ReactComponent as BackIcon } from '../../assets/icons/back.svg';
import ButtonPrimary from '../../components/ui/Buttons/ButtonPrimary';
import * as templatesApi from '../../api/templates';
import { deleteDocument, downloadDocument } from '../../api/documents';
import { renderDocumentToHtml } from '../../lib/docxPreview';
import {
    TemplateFieldResponse,
    TemplateResponse,
} from '../../api/dto/template.dto';
import {
    DocumentResponse,
    DocumentType,
    documentTypeOptions,
} from '../../api/dto/document.dto';
import { notify, notifyError } from '../../lib/notify';

/**
 * Уникальный токен-плейсхолдер для поля по его индексу. Подставляется в скелет
 * документа вместо значения; затем заменяется живьём в браузере. Подчёркивания —
 * делимитеры, чтобы токен №1 не оказался подстрокой токена №11.
 */
const sentinelFor = (index: number): string => `DPF_${index}_DPF`;

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Приводит значение поля формы к строке — единообразно для превью и отправки. */
function formatValue(field: TemplateFieldResponse, raw: unknown): string {
    switch (field.type) {
        case 'BOOLEAN':
            return raw === true ? 'Да' : raw === false ? 'Нет' : '';
        case 'DATE':
            if (dayjs.isDayjs(raw)) {
                return raw.format('DD.MM.YYYY');
            }
            return typeof raw === 'string' ? raw : '';
        case 'NUMBER':
            return raw == null || raw === '' ? '' : String(raw);
        default:
            return raw == null ? '' : String(raw);
    }
}

/**
 * Контрол под тип поля шаблона. ВАЖНО: возвращается напрямую как дочерний
 * элемент `Form.Item`, чтобы antd внедрял в него `value`/`onChange`. Нельзя
 * оборачивать в промежуточный компонент — иначе пропсы формы не дойдут до
 * инпута, и форма не будет видеть значения (был такой баг).
 */
function renderFieldControl(field: TemplateFieldResponse) {
    switch (field.type) {
        case 'DATE':
            return (
                <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="дд.мм.гггг"
                    style={{ width: '100%' }}
                />
            );
        case 'NUMBER':
            return <InputNumber style={{ width: '100%' }} placeholder="Введите число" />;
        case 'BOOLEAN':
            return <Switch />;
        default:
            return <Input placeholder={`Введите: ${field.label}`} />;
    }
}

export default function TemplateConstructorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm<Record<string, unknown>>();

    const [template, setTemplate] = useState<TemplateResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const [docName, setDocName] = useState('');
    const [docType, setDocType] = useState<DocumentType>('OTHER');

    // Скелет документа с токенами вместо значений — источник живого предпросмотра.
    const [skeletonHtml, setSkeletonHtml] = useState<string | null>(null);
    const [previewBuilding, setPreviewBuilding] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    // Текущие значения полей формы (для перерисовки превью).
    const [values, setValues] = useState<Record<string, unknown>>({});

    // Масштаб «бумаги» предпросмотра (0.5–1.4).
    const [zoom, setZoom] = useState(0.85);

    const [generating, setGenerating] = useState(false);
    // Сформированный документ → экран успеха.
    const [createdDoc, setCreatedDoc] = useState<DocumentResponse | null>(null);

    const sortedFields = useMemo(
        () => (template?.fields ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
        [template],
    );

    const loadTemplate = useCallback(async () => {
        if (!id) {
            return;
        }
        setLoading(true);
        setLoadError(false);
        try {
            const data = await templatesApi.getTemplate(id);
            setTemplate(data);
            setDocName(data.name);
        } catch (e) {
            setLoadError(true);
            notifyError(e, 'Не удалось загрузить шаблон');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadTemplate();
    }, [loadTemplate]);

    // Построение скелета: один раз на загруженный шаблон.
    useEffect(() => {
        if (!template || !id) {
            return;
        }

        let cancelled = false;
        setPreviewBuilding(true);
        setPreviewError(false);

        (async () => {
            try {
                const fields: Record<string, string> = {};
                template.fields
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .forEach((field, index) => {
                        fields[field.key] = sentinelFor(index);
                    });

                const doc = await templatesApi.createDocumentFromTemplate(id, {
                    name: `${template.name} (предпросмотр)`,
                    type: 'OTHER',
                    fields,
                });

                const html = await renderDocumentToHtml(doc.id);
                // Черновик-предпросмотр больше не нужен — убираем в корзину.
                deleteDocument(doc.id).catch(() => undefined);

                if (!cancelled) {
                    setSkeletonHtml(html);
                }
            } catch {
                if (!cancelled) {
                    setPreviewError(true);
                }
            } finally {
                if (!cancelled) {
                    setPreviewBuilding(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [template, id]);

    // Живой HTML: подставляем текущие значения вместо токенов.
    const liveHtml = useMemo(() => {
        if (skeletonHtml == null) {
            return null;
        }
        let html = skeletonHtml;
        sortedFields.forEach((field, index) => {
            const display = formatValue(field, values[field.key]);
            const isEmpty = display === '';
            const inner = isEmpty ? escapeHtml(field.label) : escapeHtml(display);
            const cls = isEmpty ? 'cstr-fill cstr-fill--empty' : 'cstr-fill';
            html = html
                .split(sentinelFor(index))
                .join(`<mark class="${cls}">${inner}</mark>`);
        });
        return html;
    }, [skeletonHtml, values, sortedFields]);

    const previewHtml = liveHtml;

    const handleGenerate = async () => {
        if (!id || !template) {
            return;
        }
        if (!docName.trim()) {
            notify.error('Введите название документа');
            return;
        }

        let raw: Record<string, unknown>;
        try {
            raw = await form.validateFields();
        } catch {
            return;
        }

        const fields: Record<string, string> = {};
        sortedFields.forEach((field) => {
            fields[field.key] = formatValue(field, raw[field.key]);
        });

        setGenerating(true);
        try {
            const doc = await templatesApi.createDocumentFromTemplate(id, {
                name: docName.trim(),
                type: docType,
                fields,
            });

            setCreatedDoc(doc);
            notify.success('Документ сформирован');
        } catch (e) {
            notifyError(e, 'Не удалось сформировать документ');
        } finally {
            setGenerating(false);
        }
    };

    // Переход к сохранённому документу. ViewDocumentPage берёт метаданные из
    // router-state (детального эндпоинта документа на бэке нет).
    const handleOpenDocument = () => {
        if (!createdDoc) {
            return;
        }
        navigate(`/documents/${createdDoc.id}`, {
            state: {
                document: {
                    id: createdDoc.id,
                    name: createdDoc.name,
                    type: createdDoc.type,
                    status: createdDoc.status,
                    responsible: createdDoc.responsible,
                },
            },
        });
    };

    const handleDownload = async () => {
        if (!createdDoc) {
            return;
        }
        try {
            await downloadDocument(createdDoc.id, `${createdDoc.name}.docx`);
        } catch (e) {
            notifyError(e, 'Не удалось скачать документ');
        }
    };

    // «Создать ещё» — сбрасываем форму под новый документ из того же шаблона.
    // Скелет предпросмотра остаётся валидным (шаблон тот же).
    const handleCreateMore = () => {
        setCreatedDoc(null);
        form.resetFields();
        setValues({});
        setDocName(template?.name ?? '');
        setDocType('OTHER');
    };

    const clampZoom = (value: number) => Math.min(1.4, Math.max(0.5, value));
    const zoomIn = () => setZoom((z) => clampZoom(Number((z + 0.1).toFixed(2))));
    const zoomOut = () => setZoom((z) => clampZoom(Number((z - 0.1).toFixed(2))));

    if (loadError) {
        return (
            <div className="cstr-state">
                <p className="cstr-state__title">Шаблон не найден</p>
                <Link to="/template" className="cstr-back">
                    <BackIcon /> К списку шаблонов
                </Link>
            </div>
        );
    }

    return (
        <Spin spinning={loading && !template}>
            <div className="cstr">
                <div className="cstr__topbar">
                    <Link to="/template" className="cstr-back">
                        <BackIcon /> К шаблонам
                    </Link>
                    <span className="cstr__name">
                        Создание документа{template ? `: ${template.name}` : ''}
                    </span>
                </div>

                <div className="cstr__body cstr__body--wide">
                    {/* Левая колонка — предпросмотр документа */}
                    <section className="cstr-preview">
                        <div className="cstr-preview__head">
                            <span className="cstr-preview__title">
                                Предпросмотр документа
                            </span>

                            {skeletonHtml != null && (
                                <div className="cstr-zoom">
                                    <button
                                        type="button"
                                        className="cstr-zoom__btn"
                                        onClick={zoomOut}
                                        disabled={zoom <= 0.5}
                                        aria-label="Уменьшить"
                                    >
                                        −
                                    </button>
                                    <span className="cstr-zoom__val">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                    <button
                                        type="button"
                                        className="cstr-zoom__btn"
                                        onClick={zoomIn}
                                        disabled={zoom >= 1.4}
                                        aria-label="Увеличить"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="cstr-paper-wrap">
                            {previewBuilding && previewHtml == null ? (
                                <div className="cstr-paper__placeholder">
                                    <Spin />
                                    <span>Готовим предпросмотр…</span>
                                </div>
                            ) : previewHtml != null ? (
                                <div
                                    className="cstr-paper"
                                    style={{ zoom }}
                                    // mammoth отдаёт безопасный семантический HTML; значения экранируем.
                                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                                />
                            ) : (
                                <div className="cstr-paper__placeholder">
                                    <span className="cstr-paper__placeholder-icon">
                                        📄
                                    </span>
                                    <span>
                                        {previewError
                                            ? 'Предпросмотр недоступен. Заполните поля и нажмите «Сформировать документ».'
                                            : 'Заполните поля справа — документ обновится здесь автоматически.'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Правая колонка — форма полей или экран успеха */}
                    <aside className="cstr-panel">
                        {createdDoc ? (
                            <section className="pf-card cstr-card cstr-success">
                                <div className="cstr-success__icon" aria-hidden="true">
                                    ✓
                                </div>
                                <h3 className="cstr-success__title">
                                    Документ сформирован
                                </h3>
                                <p
                                    className="cstr-success__name"
                                    title={createdDoc.name}
                                >
                                    {createdDoc.name}
                                </p>
                                <p className="cstr-success__sub">
                                    Документ сохранён и доступен в разделе
                                    «Документы».
                                </p>

                                <div className="cstr-success__actions">
                                    <ButtonPrimary onClick={handleOpenDocument}>
                                        Перейти к документу
                                    </ButtonPrimary>
                                    <button
                                        type="button"
                                        className="btn-primary btn-primary--outline"
                                        onClick={handleCreateMore}
                                    >
                                        <span>Создать ещё</span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="cstr-linkbtn"
                                    onClick={handleDownload}
                                >
                                    Скачать .docx
                                </button>
                            </section>
                        ) : (
                            <section className="pf-card cstr-card">
                                <header className="pf-card__head">
                                    <span className="pf-card__icon pf-card__icon--emoji">
                                        🧩
                                    </span>
                                    <div>
                                        <h3 className="pf-card__title">
                                            Параметры документа
                                        </h3>
                                        <p className="pf-card__sub">
                                            {sortedFields.length > 0
                                                ? `Полей для заполнения: ${sortedFields.length}`
                                                : 'В шаблоне нет редактируемых полей'}
                                        </p>
                                    </div>
                                </header>

                                <div className="cstr-form">
                                    <div className="cstr-field">
                                        <label className="cstr-field__label">
                                            Название документа{' '}
                                            <span className="cstr-req">*</span>
                                        </label>
                                        <Input
                                            value={docName}
                                            onChange={(e) =>
                                                setDocName(e.target.value)
                                            }
                                            placeholder="Например: Договор №73"
                                        />
                                    </div>

                                    <div className="cstr-field">
                                        <label className="cstr-field__label">
                                            Тип документа
                                        </label>
                                        <Select
                                            value={docType}
                                            onChange={setDocType}
                                            options={documentTypeOptions}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    {sortedFields.length > 0 && (
                                        <div className="cstr-divider" />
                                    )}

                                    <Form
                                        form={form}
                                        layout="vertical"
                                        requiredMark
                                        onValuesChange={(_changed, all) =>
                                            setValues({ ...all })
                                        }
                                    >
                                        {sortedFields.map((field) => (
                                            <Form.Item
                                                key={field.id}
                                                name={field.key}
                                                label={field.label}
                                                valuePropName={
                                                    field.type === 'BOOLEAN'
                                                        ? 'checked'
                                                        : 'value'
                                                }
                                                rules={
                                                    field.required
                                                        ? [
                                                              {
                                                                  required: true,
                                                                  message: `Заполните «${field.label}»`,
                                                              },
                                                          ]
                                                        : undefined
                                                }
                                            >
                                                {renderFieldControl(field)}
                                            </Form.Item>
                                        ))}
                                    </Form>
                                </div>

                                <div className="cstr-actions">
                                    <ButtonPrimary
                                        onClick={handleGenerate}
                                        disabled={generating}
                                    >
                                        {generating
                                            ? 'Формирование…'
                                            : 'Сформировать документ'}
                                    </ButtonPrimary>
                                </div>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </Spin>
    );
}
