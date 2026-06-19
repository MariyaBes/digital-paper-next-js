import { PagedResponse, SortDirection } from './common.dto';

/** Сфера деятельности организации (бэкенд enum Industry). */
export type Industry =
    | 'FINANCE'
    | 'MEDICINE'
    | 'MANUFACTURER'
    | 'SALES'
    | 'EDUCATIONAL'
    | 'JURIDICAL'
    | 'SPECIFIC'
    | 'NONE';

/** Организационно-правовая форма (бэкенд enum OrganizationType). */
export type OrganizationType =
    | 'LIMITED_LIABILITY_COMPANY'
    | 'OPEN_JOINT_STOCK_COMPANY'
    | 'PUBLIC_JOINT_STOCK_COMPANY'
    | 'CLOSED_JOINT_STOCK_COMPANY'
    | 'INDIVIDUAL_ENTREPRENEUR'
    | 'NONE'
    | 'OTHER';

/** Статус модерации организации (бэкенд enum ModerationStatus). */
export type ModerationStatus =
    | 'NEW'
    | 'PENDING_REVIEW'
    | 'REVISION_NEEDED'
    | 'APPROVED'
    | 'REJECTED'
    | 'DELETED';

export const organizationTypeLabels: Record<OrganizationType, string> = {
    LIMITED_LIABILITY_COMPANY: 'ООО (общество с ограниченной ответственностью)',
    OPEN_JOINT_STOCK_COMPANY: 'ОАО (открытое акционерное общество)',
    PUBLIC_JOINT_STOCK_COMPANY: 'ПАО (публичное акционерное общество)',
    CLOSED_JOINT_STOCK_COMPANY: 'ЗАО (закрытое акционерное общество)',
    INDIVIDUAL_ENTREPRENEUR: 'ИП (индивидуальный предприниматель)',
    NONE: 'Не указана',
    OTHER: 'Другое',
};

/** Опции для select'а формы (без служебного NONE). */
export const organizationTypeOptions = (
    Object.keys(organizationTypeLabels) as OrganizationType[]
)
    .filter((type) => type !== 'NONE')
    .map((value) => ({ value, label: organizationTypeLabels[value] }));

export const industryLabels: Record<Industry, string> = {
    FINANCE: 'Финансы',
    MEDICINE: 'Медицина',
    MANUFACTURER: 'Производство',
    SALES: 'Продажи',
    EDUCATIONAL: 'Образование',
    JURIDICAL: 'Юридическая',
    SPECIFIC: 'Специальная',
    NONE: 'Без категории',
};

/** Опции для select'ов (без служебного NONE). */
export const industryOptions = (Object.keys(industryLabels) as Industry[])
    .filter((industry) => industry !== 'NONE')
    .map((value) => ({ value, label: industryLabels[value] }));

/** Элемент списка организаций (ответ /my и /). */
export interface OrganizationListItem {
    id: string;
    name: string;
    /** Абсолютная ссылка на логотип организации через backend (или null). */
    avatarUrl: string | null;
    type: OrganizationType;
    createdAt: string;
}

/** Детали организации (ответ создания/деталей). */
export interface OrganizationResponse {
    id: string;
    name: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    industry: Industry;
    status: ModerationStatus;
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationsPagedListResponse {
    page: PagedResponse;
    list: OrganizationListItem[];
}

export interface OrganizationListParams {
    page?: number;
    size?: number;
    sortField?: string;
    sortDirection?: SortDirection;
}

/** Тело запроса создания организации (бэкенд AddOrganizationRequest). */
export interface AddOrganizationRequest {
    name: string;
    description?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    industry: Industry;
}

/** Тело запроса обновления организации (бэкенд UpdateOrganizationRequest). */
export interface UpdateOrganizationRequest {
    name: string;
    fullName: string;
    description?: string | null;
    phone?: string | null;
    type: OrganizationType;
    regNumber: string;
    identificationNumber: string;
    regReasonCode: string;
    address: string;
}
