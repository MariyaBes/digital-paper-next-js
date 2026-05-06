import { useState } from 'react';

export type ModalActionType = 'Удалить' | 'Восстановить' | null;

export function useModalLogic<T = unknown>() {
    const [showModal, setShowModal] = useState(false);
    const [showOverflow, setShowOverflow] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<T | null>(null);
    const [actionType, setActionType] = useState<ModalActionType>(null);

    const openModal = (record: T | null, action: ModalActionType = null) => {
        setSelectedDoc(record);
        setActionType(action);
        setShowModal(true);
        setShowOverflow(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setShowOverflow(false);
        setSelectedDoc(null);
        setActionType(null);
    };

    return {
        showModal,
        showOverflow,
        selectedDoc,
        openModal,
        closeModal,
        actionType,
    };
}
