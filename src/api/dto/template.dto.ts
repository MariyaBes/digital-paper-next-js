import { DocumentType } from './document.dto';

/** Тип поля шаблона (бэкенд enum TemplateFieldType). */
export type TemplateFieldType =
    | 'TEXT'
    | 'NUMBER'
    | 'DATE'
    | 'BOOLEAN'
    | 'SELECT'
    | 'USER'
    | 'ORGANIZATION';

/** Найденное в шаблоне редактируемое поле (бэкенд TemplateFieldResponse). */
export interface TemplateFieldResponse {
    id: string;
    /** Машинный ключ (нормализованный snake_case). */
    key: string;
    /** Человекочитаемая подпись. */
    label: string;
    type: TemplateFieldType;
    required: boolean;
    sortOrder: number;
}

/**
 * Шаблон с распарсенными полями (бэкенд TemplateResponse).
 * `GET /api/v1/templates` отдаёт массив таких объектов (с полями внутри),
 * `GET /api/v1/templates/{id}` — один такой объект.
 */
export interface TemplateResponse {
    id: string;
    name: string;
    organizationId: string;
    createdBy: string;
    fields: TemplateFieldResponse[];
    createdAt: string;
    updatedAt: string;
}

/** Тело создания документа из шаблона (бэкенд CreateDocumentFromTemplateRequest). */
export interface CreateDocumentFromTemplateRequest {
    name: string;
    type: DocumentType;
    /** Значения полей: ключ поля → значение (строкой). */
    fields: Record<string, string>;
}

export const templateFieldTypeLabels: Record<TemplateFieldType, string> = {
    TEXT: 'Текст',
    NUMBER: 'Число',
    DATE: 'Дата',
    BOOLEAN: 'Да/Нет',
    SELECT: 'Выбор',
    USER: 'Пользователь',
    ORGANIZATION: 'Организация',
};
