import { Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';

import { ReactComponent as CloseIcon } from '../../../assets/icons/iconamoon_close-duotone.svg';
import ButtonPrimary from '../../ui/Buttons/ButtonPrimary';
import {
    DocumentCreateModalInterface,
    documentTypeOptions,
} from '../../../types/document.types';
import { DocumentType } from '../../../api/dto/document.dto';
import * as documentsApi from '../../../api/documents';
import { notify, notifyError } from '../../../lib/notify';

interface CreateDocumentForm {
    name: string;
    type: DocumentType;
}

export default function DocumentCreateModal({
    showModal,
    showOverflow,
    closeModal,
    file,
    documentOriginalName,
    onCreated,
}: DocumentCreateModalInterface) {
    const [form] = Form.useForm<CreateDocumentForm>();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (documentOriginalName) {
            form.setFieldsValue({ name: documentOriginalName });
        }
    }, [documentOriginalName, form]);

    const onSubmit = async () => {
        let values: CreateDocumentForm;

        try {
            values = await form.validateFields();
        } catch {
            return;
        }

        if (!file) {
            notify.error('Файл не выбран');
            return;
        }

        setSubmitting(true);

        try {
            await documentsApi.uploadDocument(file, values.name.trim(), values.type);

            notify.success('Документ успешно создан');
            form.resetFields();
            onCreated?.();
            closeModal();
        } catch (e) {
            notifyError(e, 'Не удалось создать документ');
        } finally {
            setSubmitting(false);
        }
    };

    if (!showOverflow || !showModal) {
        return null;
    }

    return (
        <>
            <div className="overflow" onClick={closeModal} id="overflow" />

            <div className="modal-info">
                <div className="modal-info__close" onClick={closeModal}>
                    <CloseIcon />
                </div>

                <div className="modal-info__content">
                    <h2 className="header-title">Создание документа</h2>

                    <Form
                        form={form}
                        name="create-document"
                        initialValues={{ name: documentOriginalName }}
                        onFinish={onSubmit}
                        layout="vertical"
                        scrollToFirstError
                    >
                        <Form.Item
                            name="name"
                            label="Введите название документа"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, введите название документа.',
                                    whitespace: true,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="type"
                            label="Выберите тип документа"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, выберите тип документа!',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Выберите тип"
                                options={documentTypeOptions}
                            />
                        </Form.Item>
                    </Form>

                    <div className="modal-info__actions">
                        <ButtonPrimary onClick={onSubmit} disabled={submitting}>
                            Создать
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        </>
    );
}
