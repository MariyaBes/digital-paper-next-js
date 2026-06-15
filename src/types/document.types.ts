import React from 'react';
import { DocumentStatus, DocumentType } from '../api/dto/document.dto';

export {
    documentTypeLabels,
    documentTypeOptions,
    documentStatusLabels,
} from '../api/dto/document.dto';
export type { DocumentType, DocumentStatus } from '../api/dto/document.dto';

export interface Document {
    id: string;
    name: string;
    type?: DocumentType;
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

export interface DocumentCreateModalInterface {
    showModal: boolean;
    showOverflow: boolean;
    file: File | null;
    documentOriginalName: string;
    onCreated?: () => void;
    closeModal: () => void;
}

export interface DataType {
    key: React.Key;
    id: string;
    name: string;
    type?: DocumentType;
    status: DocumentStatus;
    responsible: string;
    createdBy: string;
    createdDate: string;
    updatedDate: string;
}
