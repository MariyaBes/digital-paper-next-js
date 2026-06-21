import { format } from 'date-fns';
import { DataType } from '../../types/document.types';
import { DocumentListItem } from '../../api/dto/document.dto';

/** dataIndex колонки antd -> имя поля сортировки на бэкенде. */
export const SORT_FIELD_MAP: Record<string, string> = {
    name: 'name',
    createdDate: 'createdAt',
    updatedDate: 'updatedAt',
};

export const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'default',
    CREATED: 'blue',
    IN_PROGRESS: 'gold',
    PENDING_REVIEW: 'orange',
    CHANGES_REQUESTED: 'volcano',
    APPROVED: 'green',
    SIGNED: 'cyan',
    DONE: 'green',
    REJECTED: 'red',
    CANCELLED: 'default',
    EXPIRED: 'default',
    DELETED: 'default',
};

export function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : format(date, 'dd.MM.yyyy HH:mm');
}

export function toRow(item: DocumentListItem): DataType {
    return {
        key: item.id,
        id: item.id,
        name: item.name,
        status: item.status,
        responsible: item.responsible,
        createdBy: item.responsible,
        createdById: item.createdById,
        createdDate: formatDate(item.createdAt),
        updatedDate: formatDate(item.updatedAt),
    };
}
