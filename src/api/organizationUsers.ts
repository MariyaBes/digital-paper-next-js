import { apiFetch } from '../hooks/fetch';
import { MessageResponse } from './dto/common.dto';
import {
    AddUserToOrganizationRequest,
    ChangeOrganizationUserRoleRequest,
    OrganizationRoleResponse,
    OrganizationUserListParams,
    UserRole,
    UsersPagedListResponse,
} from './dto/user.dto';

function buildListQuery(params: OrganizationUserListParams): string {
    const query = new URLSearchParams();

    if (params.page != null) query.set('page', String(params.page));
    if (params.size != null) query.set('size', String(params.size));
    if (params.sortField) query.set('sortField', params.sortField);
    if (params.sortDirection) query.set('sortDirection', params.sortDirection);
    if (params.search) query.set('search', params.search);

    const stringified = query.toString();
    return stringified ? `?${stringified}` : '';
}

/** Список пользователей организации с пагинацией/сортировкой/поиском. */
export function listOrganizationUsers(
    organizationId: string,
    params: OrganizationUserListParams = {},
): Promise<UsersPagedListResponse> {
    return apiFetch<UsersPagedListResponse>({
        url: `/api/v1/organizations/${organizationId}/users${buildListQuery(params)}`,
    });
}

/**
 * Пригласить/добавить пользователя в организацию по email.
 * Бэкенд: если пользователь уже зарегистрирован — добавляется сразу (роль EMPLOYEE),
 * иначе создаётся приглашение (PENDING) и отправляется письмо.
 */
export function inviteUserToOrganization(
    organizationId: string,
    body: AddUserToOrganizationRequest,
): Promise<MessageResponse> {
    return apiFetch<MessageResponse, AddUserToOrganizationRequest>({
        url: `/api/v1/organizations/${organizationId}/users/add`,
        method: 'POST',
        body,
    });
}

/** Роль текущего пользователя в выбранной организации (по X-Organization-Id). */
export function getOrganizationRole(): Promise<OrganizationRoleResponse> {
    return apiFetch<OrganizationRoleResponse>({
        url: '/api/v1/organizations/role',
    });
}

/** Сменить роль пользователя в организации (только для директора). */
export function changeOrganizationUserRole(
    organizationId: string,
    userId: string,
    role: UserRole,
): Promise<MessageResponse> {
    return apiFetch<MessageResponse, ChangeOrganizationUserRoleRequest>({
        url: `/api/v1/organizations/${organizationId}/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
    });
}

/**
 * Удалить пользователя из организации (только для директора — владельца/админа).
 * Бэкенд: DELETE /api/v1/organizations/{id}/users/{userId}.
 */
export function removeUserFromOrganization(
    organizationId: string,
    userId: string,
): Promise<MessageResponse> {
    return apiFetch<MessageResponse>({
        url: `/api/v1/organizations/${organizationId}/users/${userId}`,
        method: 'DELETE',
    });
}
