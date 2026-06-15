import { PagedResponse, SortDirection } from './common.dto';

export type DocumentType =
    | 'ADMINISTRATIVE'
    | 'FINANCIAL'
    | 'HR'
    | 'JURIDICAL'
    | 'MANUFACTURE'
    | 'MARKETING'
    | 'INFORMATION_ANALYTICAL'
    | 'OTHER'
    | 'NONE';

export type DocumentStatus =
    | 'CREATED'
    | 'IN_PROGRESS'
    | 'PENDING_REVIEW'
    | 'DONE'
    | 'REJECTED'
    | 'DELETED';

export const documentTypeLabels: Record<DocumentType, string> = {
    ADMINISTRATIVE: 'Административный',
    FINANCIAL: 'Финансовый',
    HR: 'Кадровый',
    JURIDICAL: 'Юридический',
    MANUFACTURE: 'Производственный',
    MARKETING: 'Маркетинговый',
    INFORMATION_ANALYTICAL: 'Информационно-аналитический',
    OTHER: 'Другое',
    NONE: 'Без типа',
};

/** Опции для select'ов (без служебного NONE). */
export const documentTypeOptions = (Object.keys(documentTypeLabels) as DocumentType[])
    .filter((type) => type !== 'NONE')
    .map((value) => ({ value, label: documentTypeLabels[value] }));

export const documentStatusLabels: Record<DocumentStatus, string> = {
    CREATED: 'Загружен',
    IN_PROGRESS: 'В процессе',
    PENDING_REVIEW: 'Ожидает проверки',
    DONE: 'Выполнено',
    REJECTED: 'Отклонён',
    DELETED: 'В корзине',
};

export interface DocumentListItem {
    id: string;
    name: string;
    responsible: string;
    status: DocumentStatus;
    contentType: string;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentResponse {
    id: string;
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    contentType: string;
    responsible: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentsPagedListResponse {
    page: PagedResponse;
    list: DocumentListItem[];
}

export interface DocumentListParams {
    page?: number;
    size?: number;
    sortField?: string;
    sortDirection?: SortDirection;
    type?: DocumentType;
    search?: string;
}
