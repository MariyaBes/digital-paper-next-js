import { apiFetch } from '../hooks/fetch';
import {
    AddOrganizationRequest,
    OrganizationListParams,
    OrganizationResponse,
    OrganizationsPagedListResponse,
    UpdateOrganizationRequest,
} from './dto/organization.dto';

function buildListQuery(params: OrganizationListParams): string {
    const query = new URLSearchParams();

    if (params.page != null) query.set('page', String(params.page));
    if (params.size != null) query.set('size', String(params.size));
    if (params.sortField) query.set('sortField', params.sortField);
    if (params.sortDirection) query.set('sortDirection', params.sortDirection);

    const stringified = query.toString();
    return stringified ? `?${stringified}` : '';
}

/** Организации, в которых состоит/которые создал текущий пользователь. */
export function getMyOrganizations(
    params: OrganizationListParams = {},
): Promise<OrganizationsPagedListResponse> {
    return apiFetch<OrganizationsPagedListResponse>({
        url: `/api/v1/organizations/my${buildListQuery(params)}`,
    });
}

/** Все организации в системе (для подключения к чужой). */
export function getAllOrganizations(
    params: OrganizationListParams = {},
): Promise<OrganizationsPagedListResponse> {
    return apiFetch<OrganizationsPagedListResponse>({
        url: `/api/v1/organizations${buildListQuery(params)}`,
    });
}

/** Создание собственной организации (текущий пользователь становится OWNER). */
export function createOrganization(
    body: AddOrganizationRequest,
): Promise<OrganizationResponse> {
    return apiFetch<OrganizationResponse, AddOrganizationRequest>({
        url: '/api/v1/organizations',
        method: 'POST',
        body,
    });
}

/** Детали организации по id. */
export function getOrganizationDetails(id: string): Promise<OrganizationResponse> {
    return apiFetch<OrganizationResponse>({
        url: `/api/v1/organizations/${id}`,
    });
}

/** Обновление организации. */
export function updateOrganization(
    id: string,
    body: UpdateOrganizationRequest,
): Promise<OrganizationResponse> {
    return apiFetch<OrganizationResponse, UpdateOrganizationRequest>({
        url: `/api/v1/organizations/${id}`,
        method: 'PUT',
        body,
    });
}

/** Загрузка логотипа организации (multipart). Возвращает URL логотипа (text/plain). */
export function uploadOrganizationAvatar(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<string>({
        url: `/api/v1/organizations/${id}/avatar`,
        method: 'POST',
        body: formData,
    });
}
