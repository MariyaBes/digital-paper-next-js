import { apiFetch } from '../hooks/fetch';
import { getKeycloak } from '../lib/keycloak';
import { getSelectedOrganizationId } from '../lib/organizationStorage';
import { API_BASE_URL } from '../config/api.config';
import { MessageResponse } from './dto/common.dto';
import {
    DocumentListParams,
    DocumentResponse,
    DocumentStatus,
    DocumentStatusTransitionsResponse,
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

/** Доступные переходы статуса документа (текущий + разрешённые следующие). */
export function getStatusTransitions(
    id: string,
): Promise<DocumentStatusTransitionsResponse> {
    return apiFetch<DocumentStatusTransitionsResponse>({
        url: `/api/v1/documents/${id}/status/transitions`,
    });
}

/** Произвольная смена статуса (PATCH /status) — если переход разрешён бизнес-процессом. */
export function changeDocumentStatus(
    id: string,
    status: DocumentStatus,
    reason?: string,
): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { status: DocumentStatus; reason?: string }>({
        url: `/api/v1/documents/${id}/status`,
        method: 'PATCH',
        body: { status, reason },
    });
}

/** Взять документ в работу: статус → IN_PROGRESS. */
export function startDocument(id: string, reason?: string): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { reason?: string }>({
        url: `/api/v1/documents/${id}/start`,
        method: 'POST',
        body: reason ? { reason } : undefined,
    });
}

/** Отправить документ на проверку: статус → PENDING_REVIEW. */
export function submitDocumentForReview(
    id: string,
    reason?: string,
): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { reason?: string }>({
        url: `/api/v1/documents/${id}/submit-review`,
        method: 'POST',
        body: reason ? { reason } : undefined,
    });
}

/** Запросить правки (только для директора): статус → CHANGES_REQUESTED. Причина обязательна. */
export function requestDocumentChanges(
    id: string,
    reason: string,
): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { reason: string }>({
        url: `/api/v1/documents/${id}/request-changes`,
        method: 'POST',
        body: { reason },
    });
}

/** Подписать документ: статус → SIGNED. */
export function signDocument(id: string, reason?: string): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { reason?: string }>({
        url: `/api/v1/documents/${id}/sign`,
        method: 'POST',
        body: reason ? { reason } : undefined,
    });
}

/** Завершить документ: статус → DONE. */
export function completeDocument(
    id: string,
    reason?: string,
): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { reason?: string }>({
        url: `/api/v1/documents/${id}/complete`,
        method: 'POST',
        body: reason ? { reason } : undefined,
    });
}

/** Отменить документ: статус → CANCELLED. Причина обязательна. */
export function cancelDocument(id: string, reason: string): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { reason: string }>({
        url: `/api/v1/documents/${id}/cancel`,
        method: 'POST',
        body: { reason },
    });
}

/** Пометить документ просроченным (только для директора): статус → EXPIRED. */
export function expireDocument(id: string, reason?: string): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { reason?: string }>({
        url: `/api/v1/documents/${id}/expire`,
        method: 'POST',
        body: reason ? { reason } : undefined,
    });
}

/** Назначить ответственного за документ (владелец/автор/текущий ответственный). */
export function assignResponsible(
    id: string,
    userId: string,
): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { userId: string }>({
        url: `/api/v1/documents/${id}/responsible`,
        method: 'PATCH',
        body: { userId },
    });
}

/** Утвердить документ (только для директора): статус → APPROVED. */
export function approveDocument(
    id: string,
    reason?: string,
): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { reason?: string }>({
        url: `/api/v1/documents/${id}/approve`,
        method: 'POST',
        body: reason ? { reason } : undefined,
    });
}

/** Отклонить документ (только для директора): статус → REJECTED. Причина обязательна. */
export function rejectDocument(
    id: string,
    reason: string,
): Promise<DocumentResponse> {
    return apiFetch<DocumentResponse, { reason: string }>({
        url: `/api/v1/documents/${id}/reject`,
        method: 'POST',
        body: { reason },
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
 * PDF-предпросмотр документа (бэкенд конвертирует .docx → PDF через LibreOffice).
 * Возвращает object URL PDF-блоба — для встраивания в <iframe>.
 * Не забыть revokeObjectURL после использования.
 */
export async function fetchDocumentPdfPreview(id: string): Promise<string> {
    const headers = await buildBinaryRequestHeaders();

    const response = await fetch(
        `${API_BASE_URL}/api/v1/documents/${id}/preview/pdf`,
        { headers },
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
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
