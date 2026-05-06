
export interface Document {
    id: number;
    name: string;
    type?: string;
    createdBy: string;
    createdDate: string;
    updatedDate: string;
}

export interface DocumentInfoInterface {
    showModal: boolean;
    showOverflow: boolean;
    closeModal: () => void;
    document?: Document | null;
}

export const documentTypeLabels: Record<string, string> = {
    ADMINISTRATIVE: 'Административный',
    FINANCIAL: 'Финансовый',
    HR: 'HR',
    JURIDICAL: 'Юридический',
    MANUFACTUR: 'Производственный',
    MARKETING: 'Маркетинг',
    INFORMATION_ANALYTICAL: 'Информационно-аналитический',
    OTHER: 'Другое',
};

export type DocumentDTO = {
    id: number;
    name: string;
    type?: keyof typeof documentTypeLabels;
    createdBy?: string;
    description?: string;
};

export interface DocumentCreateModalInterface {
    showModal: boolean;
    showOverflow: boolean;
    documentPath: string;
    documentOriginalName: string;
    closeModal: () => void;
}

export interface DataType {
    key: React.Key;
    id: number;
    name: string;
    type?: string;
    createdBy: string;
    createdDate: string;
    updatedDate: string;
}
