import { format } from 'date-fns';
import { UserListItem } from '../../api/dto/user.dto';

/** Строка таблицы пользователей организации. */
export interface UserRow {
    key: string;
    id: string;
    /** ФИО одной строкой (Фамилия Имя Отчество). */
    fullName: string;
    email: string;
    /** Дата рождения в формате dd.MM.yyyy или «—». */
    birthday: string;
    /** Дата добавления в формате dd.MM.yyyy HH:mm. */
    createdDate: string;
}

/** dataIndex колонки antd -> имя поля сортировки на бэкенде. */
export const SORT_FIELD_MAP: Record<string, string> = {
    fullName: 'name',
    email: 'email',
    createdDate: 'createdAt',
};

function formatValue(value: string, pattern: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : format(date, pattern);
}

export function toRow(item: UserListItem): UserRow {
    const fullName = [item.lastName, item.firstName, item.middleName]
        .filter(Boolean)
        .join(' ')
        .trim();

    return {
        key: item.id,
        id: item.id,
        fullName: fullName || '—',
        email: item.email,
        birthday: item.birthday ? formatValue(item.birthday, 'dd.MM.yyyy') : '—',
        createdDate: formatValue(item.createdAt, 'dd.MM.yyyy HH:mm'),
    };
}
