import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Spin } from 'antd';

import { documentTypeLabels, documentStatusLabels, DataType, DocumentStatus } from '../../types/document.types';
import * as documentsApi from '../../api/documents';
import { DocumentContent } from '../../api/documents';
import ButtonPrimary from '../../components/ui/Buttons/ButtonPrimary';
import DocumentStatusActions from './DocumentStatusActions';
import DocumentResponsibleControl from './DocumentResponsibleControl';
import { notifyError } from '../../lib/notify';

const DOCX_MIME =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const DOC_MIME = 'application/msword';

/** Word-документ (.docx/.doc) — рендерим через серверный PDF-предпросмотр. */
function isWord(contentType: string, name?: string): boolean {
    const lower = (name ?? '').toLowerCase();
    return (
        contentType === DOCX_MIME ||
        contentType === DOC_MIME ||
        lower.endsWith('.docx') ||
        lower.endsWith('.doc')
    );
}

export default function ViewDocumentPage() {
    const { id } = useParams();
    const location = useLocation();

    // Метаданные документа прокидываются из таблицы через router state
    // (отдельного эндпоинта деталей документа на бэкенде пока нет).
    const stateDoc = (location.state as { document?: DataType } | null)?.document;

    // Локальный статус: стартует из router state, далее синхронизируется
    // компонентом действий (он же подтягивает актуальный статус с бэкенда).
    const [status, setStatus] = useState<DocumentStatus | undefined>(stateDoc?.status);

    const [content, setContent] = useState<DocumentContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // PDF-предпросмотр Word-документа (бэкенд конвертирует .docx/.doc → PDF
    // через LibreOffice — оформление текста сохраняется, в отличие от mammoth).
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }

        let active = true;
        let objectUrl: string | null = null;

        setLoading(true);
        setError(false);

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

    // Word-документ → тянем серверный PDF-предпросмотр, когда содержимое
    // загружено (по contentType/имени поняли, что это .docx/.doc).
    useEffect(() => {
        if (!id || !content || !isWord(content.contentType, stateDoc?.name)) {
            return;
        }

        let active = true;
        let objectUrl: string | null = null;
        setPdfLoading(true);
        setPdfError(false);
        setPdfUrl(null);

        documentsApi
            .fetchDocumentPdfPreview(id)
            .then((url) => {
                objectUrl = url;
                if (!active) {
                    URL.revokeObjectURL(url);
                    return;
                }
                setPdfUrl(url);
            })
            .catch(() => {
                if (active) setPdfError(true);
            })
            .finally(() => {
                if (active) setPdfLoading(false);
            });

        return () => {
            active = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [id, content, stateDoc?.name]);

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

        if (isWord(contentType, stateDoc?.name)) {
            if (pdfLoading) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                        <Spin size="large" />
                    </div>
                );
            }

            if (pdfUrl) {
                return (
                    <iframe
                        title={stateDoc?.name ?? 'Документ'}
                        src={`${pdfUrl}#view=FitH`}
                        style={{
                            width: '100%',
                            height: '80vh',
                            border: '1px solid #D1D5DB',
                            borderRadius: 15,
                            background: '#fff',
                        }}
                    />
                );
            }

            // PDF не построился — даём скачать исходник.
            if (pdfError) {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
                        <p>Не удалось построить предпросмотр документа.</p>
                        <ButtonPrimary onClick={handleDownload}>Скачать документ</ButtonPrimary>
                    </div>
                );
            }

            return null;
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

                {id && (
                    <DocumentResponsibleControl
                        documentId={id}
                        createdById={stateDoc?.createdById}
                        currentResponsible={stateDoc?.responsible}
                    />
                )}

                {status && (
                    <h4 className="container-info__type">
                        <strong>Статус:</strong> {documentStatusLabels[status] ?? status}
                    </h4>
                )}

                {id && (
                    <div style={{ marginTop: 16 }}>
                        <DocumentStatusActions documentId={id} onStatusChange={setStatus} />
                    </div>
                )}
            </div>

            {renderContent()}
        </div>
    );
}
