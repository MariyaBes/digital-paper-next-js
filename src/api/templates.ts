import { apiFetch } from '../hooks/fetch';
import { DocumentResponse } from './dto/document.dto';
import {
    CreateDocumentFromTemplateRequest,
    TemplateResponse,
} from './dto/template.dto';

/**
 * Список всех шаблонов организации с уже распарсенными полями.
 * Бэкенд отдаёт плоский массив `TemplateResponse[]` (без пагинации).
 */
export function listTemplates(): Promise<TemplateResponse[]> {
    return apiFetch<TemplateResponse[]>({
        url: '/api/v1/templates',
    });
}

/** Один шаблон организации с распарсенными полями. */
export function getTemplate(id: string): Promise<TemplateResponse> {
    return apiFetch<TemplateResponse>({
        url: `/api/v1/templates/${id}`,
    });
}

/** Создать документ из шаблона: подставить значения и сгенерировать .docx. */
export function createDocumentFromTemplate(
    id: string,
    body: CreateDocumentFromTemplateRequest,
): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, CreateDocumentFromTemplateRequest>({
        url: `/api/v1/templates/${id}/documents`,
        method: 'POST',
        body,
    });
}

/**
 * Загрузить новый DOCX-шаблон (admin). Парсер бэкенда найдёт в нём поля.
 * Имя передаётся query-параметром (бэкенд читает его через `@RequestParam name`).
 */
export function uploadTemplate(file: File, name: string): Promise<TemplateResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<TemplateResponse>({
        url: `/api/v1/templates/upload?name=${encodeURIComponent(name)}`,
        method: 'POST',
        body: formData,
    });
}
