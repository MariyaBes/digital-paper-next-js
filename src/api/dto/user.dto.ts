import { PagedResponse, SortDirection } from './common.dto';

/** Роль пользователя в организации (бэкенд UserRole). */
export type UserRole = 'EMPLOYEE' | 'OWNER' | 'ADMIN' | 'LAWYER';

/** Человекочитаемые названия ролей. */
export const userRoleLabels: Record<UserRole, string> = {
    OWNER: 'Директор',
    ADMIN: 'Администратор',
    LAWYER: 'Юрист',
    EMPLOYEE: 'Сотрудник',
};

/** Роли, дающие права «директора» (утверждение, удаление любых документов, смена ролей). */
export const DIRECTOR_ROLES: UserRole[] = ['OWNER', 'ADMIN'];

export function isDirectorRole(role: UserRole | null | undefined): boolean {
    return role != null && DIRECTOR_ROLES.includes(role);
}

/** Опции для select'а смены роли. */
export const userRoleOptions = (Object.keys(userRoleLabels) as UserRole[]).map(
    (value) => ({ value, label: userRoleLabels[value] }),
);

/**
 * Роли, которые можно назначить сотруднику через смену роли.
 * Роль «Директор» (OWNER) назначать другим нельзя — её исключаем из списка.
 */
export const assignableUserRoleOptions = userRoleOptions.filter(
    (option) => option.value !== 'OWNER',
);

/** Ответ эндпоинта роли текущего пользователя в организации (бэкенд OrganizationRoleResponse). */
export interface OrganizationRoleResponse {
    organizationId: string;
    userId: string;
    role: UserRole;
}

/** Тело запроса смены роли пользователя (бэкенд ChangeOrganizationUserRoleRequest). */
export interface ChangeOrganizationUserRoleRequest {
    role: UserRole;
}

/** Профиль текущего пользователя (бэкенд UserProfileResponse). */
export interface UserProfileResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string;
    birthday: string | null;
    /** Абсолютная ссылка на аватар через backend (или null). */
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Тело запроса обновления профиля (бэкенд UpdateUserProfileRequest). */
export interface UpdateUserProfileRequest {
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    /** Дата рождения в формате YYYY-MM-DD. */
    birthday?: string | null;
}

/** Элемент списка пользователей организации (бэкенд UserListItem). */
export interface UserListItem {
    id: string;
    /** Роль пользователя в организации (или null, если бэкенд не отдал). */
    role: UserRole | null;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string;
    /** Дата рождения в формате YYYY-MM-DD или null. */
    birthday: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Ответ списка пользователей организации (бэкенд UsersPagedListResponse). */
export interface UsersPagedListResponse {
    page: PagedResponse;
    list: UserListItem[];
}

/**
 * Параметры запроса списка пользователей организации.
 * Бэкенд поддерживает sortField: id | email | name | createdAt | updatedAt,
 * search ищет по firstName/lastName/middleName (многословно, через И).
 */
export interface OrganizationUserListParams {
    page?: number;
    size?: number;
    sortField?: string;
    sortDirection?: SortDirection;
    search?: string;
}

/** Тело запроса приглашения/добавления пользователя (бэкенд AddUserToOrganizationRequest). */
export interface AddUserToOrganizationRequest {
    email: string;
}
