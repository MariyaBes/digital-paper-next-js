import { apiFetch } from '../hooks/fetch';
import { getKeycloak } from '../lib/keycloak';
import { getSelectedOrganizationId } from '../lib/organizationStorage';
import { API_BASE_URL } from '../config/api.config';
import { MessageResponse } from './dto/common.dto';
import {
    DocumentListParams,
    DocumentResponse,
    DocumentType,
    DocumentsPagedListResponse,
} from './dto/document.dto';

function buildListQuery(params: DocumentListParams): string {
    const query = new URLSearchParams();

    if (params.page != null) query.set('page', String(params.page));
    if (params.size != null) query.set('size', String(params.size));
    if (params.sortField) query.set('sortField', params.sortField);
    if (params.sortDirection) query.set('sortDirection', params.sortDirection);
    if (params.type) query.set('type', params.type);
    if (params.search) query.set('search', params.search);

    const stringified = query.toString();
    return stringified ? `?${stringified}` : '';
}

/** Список документов с пагинацией/сортировкой/поиском. */
export function listDocuments(
    params: DocumentListParams = {},
): Promise<DocumentsPagedListResponse> {
    return apiFetch<DocumentsPagedListResponse>({
        url: `/api/v1/documents/list${buildListQuery(params)}`,
    });
}

/** Корзина: мягко удалённые документы. */
export function listDeletedDocuments(
    params: DocumentListParams = {},
): Promise<DocumentsPagedListResponse> {
    return apiFetch<DocumentsPagedListResponse>({
        url: `/api/v1/documents/deleted${buildListQuery(params)}`,
    });
}

/** Загрузка документа файлом (multipart). */
export function uploadDocument(
    file: File,
    name: string,
    type: DocumentType,
): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type);

    return apiFetch<DocumentResponse>({
        url: '/api/v1/documents/upload',
        method: 'POST',
        body: formData,
    });
}

/** Мягкое удаление (в корзину). */
export function deleteDocument(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>({
        url: `/api/v1/documents/${id}/delete`,
        method: 'POST',
    });
}

/** Восстановление из корзины. */
export function restoreDocument(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>({
        url: `/api/v1/documents/${id}/restore`,
        method: 'POST',
    });
}

/**
 * Заголовки для бинарных запросов (скачивание/просмотр), которые идут мимо
 * apiFetch: Bearer-токен + обязательный X-Organization-Id.
 */
async function buildBinaryRequestHeaders(): Promise<Record<string, string>> {
    const keycloak = getKeycloak();

    if (keycloak.authenticated) {
        await keycloak.updateToken(30);
    }

    const headers: Record<string, string> = {};

    if (keycloak.token) {
        headers.Authorization = `Bearer ${keycloak.token}`;
    }

    const organizationId = getSelectedOrganizationId();
    if (organizationId) {
        headers['X-Organization-Id'] = organizationId;
    }

    return headers;
}

export interface DocumentContent {
    /** Object URL содержимого (для <iframe>/<img>). Не забыть revokeObjectURL. */
    url: string;
    /** MIME-тип содержимого. */
    contentType: string;
    /** Размер в байтах (если отдан сервером). */
    size: number;
}

/**
 * Содержимое документа как object URL — для предпросмотра на странице документа.
 * Тянет тот же /download, но возвращает blob-URL вместо инициирования скачивания.
 */
export async function fetchDocumentContent(id: string): Promise<DocumentContent> {
    const headers = await buildBinaryRequestHeaders();

    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${id}/download`, {
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const contentType =
        response.headers.get('Content-Type') || blob.type || 'application/octet-stream';

    return {
        url: URL.createObjectURL(blob),
        contentType,
        size: blob.size,
    };
}

/**
 * Скачивание файла. Идёт отдельным fetch'ем (не через apiFetch),
 * т.к. ответ — бинарный blob, а не JSON.
 */
export async function downloadDocument(id: string, filename: string): Promise<void> {
    const headers = await buildBinaryRequestHeaders();

    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${id}/download`, {
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}
