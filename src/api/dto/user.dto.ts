import { PagedResponse, SortDirection } from './common.dto';

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
