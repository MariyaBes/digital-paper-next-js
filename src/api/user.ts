import { apiFetch } from '../hooks/fetch';
import { UpdateUserProfileRequest, UserProfileResponse } from './dto/user.dto';

/** Профиль текущего пользователя. */
export function getUserProfile(): Promise<UserProfileResponse> {
    return apiFetch<UserProfileResponse>({
        url: '/api/v1/user/profile',
    });
}

/** Обновление профиля текущего пользователя. */
export function updateUserProfile(
    body: UpdateUserProfileRequest,
): Promise<UserProfileResponse> {
    return apiFetch<UserProfileResponse, UpdateUserProfileRequest>({
        url: '/api/v1/user/profile',
        method: 'PATCH',
        body,
    });
}

/** Загрузка аватара пользователя (multipart). */
export function uploadUserAvatar(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<unknown>({
        url: '/api/v1/user/avatar',
        method: 'POST',
        body: formData,
    });
}

/** Удаление аватара пользователя. */
export function deleteUserAvatar(): Promise<unknown> {
    return apiFetch<unknown>({
        url: '/api/v1/user/avatar',
        method: 'DELETE',
    });
}
