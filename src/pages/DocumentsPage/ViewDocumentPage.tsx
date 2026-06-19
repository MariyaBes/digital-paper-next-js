import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Spin } from 'antd';
import mammoth from 'mammoth/mammoth.browser';

import { documentTypeLabels, DataType } from '../../types/document.types';
import * as documentsApi from '../../api/documents';
import { DocumentContent } from '../../api/documents';
import ButtonPrimary from '../../components/ui/Buttons/ButtonPrimary';
import { notifyError } from '../../lib/notify';

const DOCX_MIME =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function isDocx(contentType: string, name?: string): boolean {
    return contentType === DOCX_MIME || (name ?? '').toLowerCase().endsWith('.docx');
}

export default function ViewDocumentPage() {
    const { id } = useParams();
    const location = useLocation();

    // Метаданные документа прокидываются из таблицы через router state
    // (отдельного эндпоинта деталей документа на бэкенде пока нет).
    const stateDoc = (location.state as { document?: DataType } | null)?.document;

    const [content, setContent] = useState<DocumentContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Отрендеренный HTML для .docx (через mammoth).
    const [docxHtml, setDocxHtml] = useState<string | null>(null);
    const [docxLoading, setDocxLoading] = useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }

        let active = true;
        let objectUrl: string | null = null;

        setLoading(true);
        setError(false);
        setDocxHtml(null);

        documentsApi
            .fetchDocumentContent(id)
            .then((data) => {
                if (!active) {
                    URL.revokeObjectURL(data.url);
                    return;
                }
                objectUrl = data.url;
                setContent(data);
            })
            .catch((e) => {
                if (active) {
                    setError(true);
                    notifyError(e, 'Не удалось загрузить документ');
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [id]);

    // Конвертация .docx → HTML, когда содержимое загружено.
    useEffect(() => {
        if (!content || !isDocx(content.contentType, stateDoc?.name)) {
            return;
        }

        let active = true;
        setDocxLoading(true);

        fetch(content.url)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => mammoth.convertToHtml({ arrayBuffer }))
            .then((result) => {
                if (active) setDocxHtml(result.value);
            })
            .catch((e) => {
                if (active) notifyError(e, 'Не удалось отобразить содержимое документа');
            })
            .finally(() => {
                if (active) setDocxLoading(false);
            });

        return () => {
            active = false;
        };
    }, [content, stateDoc?.name]);

    const handleDownload = async () => {
        if (!id) {
            return;
        }

        try {
            await documentsApi.downloadDocument(id, stateDoc?.name ?? 'document');
        } catch (e) {
            notifyError(e, 'Не удалось скачать документ');
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                    <Spin size="large" />
                </div>
            );
        }

        if (error || !content) {
            return <p>Не удалось загрузить содержимое документа.</p>;
        }

        const { contentType, url } = content;

        if (isDocx(contentType, stateDoc?.name)) {
            if (docxLoading) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                        <Spin size="large" />
                    </div>
                );
            }

            if (docxHtml !== null) {
                return (
                    <div
                        className="docx-content"
                        style={{
                            background: '#fff',
                            border: '1px solid #D1D5DB',
                            borderRadius: 15,
                            padding: 32,
                            maxWidth: 900,
                            overflowX: 'auto',
                            lineHeight: 1.6,
                        }}
                        // mammoth отдаёт безопасный семантический HTML из .docx.
                        dangerouslySetInnerHTML={{ __html: docxHtml }}
                    />
                );
            }
        }

        if (contentType.startsWith('image/')) {
            return (
                <img
                    src={url}
                    alt={stateDoc?.name ?? 'Документ'}
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
            );
        }

        if (contentType === 'application/pdf' || contentType.startsWith('text/')) {
            return (
                <iframe
                    title={stateDoc?.name ?? 'Документ'}
                    src={url}
                    style={{ width: '100%', height: '75vh', border: 'none' }}
                />
            );
        }

        // .doc и прочие форматы браузер/mammoth не отрисуют — предлагаем скачать.
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
                <p>Предпросмотр для этого типа файла недоступен.</p>
                <ButtonPrimary onClick={handleDownload}>Скачать документ</ButtonPrimary>
            </div>
        );
    };

    return (
        <div className="container">
            <div className="container-info">
                <h3 className="container-info__title">
                    <strong>Документ:</strong> "{stateDoc?.name ?? ''}"
                </h3>

                {stateDoc?.type && (
                    <h4 className="container-info__type">
                        <strong>Тип документа:</strong> {documentTypeLabels[stateDoc.type]}
                    </h4>
                )}

                {stateDoc?.responsible && (
                    <h4 className="container-info__type">
                        <strong>Ответственный:</strong> {stateDoc.responsible}
                    </h4>
                )}
            </div>

            {renderContent()}
        </div>
    );
}
