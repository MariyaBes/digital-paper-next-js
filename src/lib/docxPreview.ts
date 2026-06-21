// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — у mammoth/browser нет типов, как и в ViewDocumentPage.
import mammoth from 'mammoth/mammoth.browser';

import { fetchDocumentContent } from '../api/documents';

/**
 * Скачивает сгенерированный документ и рендерит .docx в безопасный HTML
 * через mammoth — для предпросмотра прямо на странице конструктора.
 */
export async function renderDocumentToHtml(documentId: string): Promise<string> {
    const content = await fetchDocumentContent(documentId);

    try {
        const response = await fetch(content.url);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        return result.value as string;
    } finally {
        URL.revokeObjectURL(content.url);
    }
}
