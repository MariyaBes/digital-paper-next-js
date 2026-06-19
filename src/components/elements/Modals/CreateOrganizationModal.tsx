import { Form, Input, Select } from 'antd';
import { useState } from 'react';

import { ReactComponent as CloseIcon } from '../../../assets/icons/iconamoon_close-duotone.svg';
import ButtonPrimary from '../../ui/Buttons/ButtonPrimary';
import * as organizationsApi from '../../../api/organizations';
import {
    Industry,
    industryOptions,
    OrganizationResponse,
} from '../../../api/dto/organization.dto';
import { notify, notifyError } from '../../../lib/notify';

interface CreateOrganizationForm {
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    industry: Industry;
}

interface CreateOrganizationModalProps {
    showModal: boolean;
    showOverflow: boolean;
    closeModal: () => void;
    /** Вызывается после успешного создания (например, чтобы обновить список). */
    onCreated?: (organization: OrganizationResponse) => void;
}

export default function CreateOrganizationModal({
    showModal,
    showOverflow,
    closeModal,
    onCreated,
}: CreateOrganizationModalProps) {
    const [form] = Form.useForm<CreateOrganizationForm>();
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        form.resetFields();
        closeModal();
    };

    const onSubmit = async () => {
        let values: CreateOrganizationForm;

        try {
            values = await form.validateFields();
        } catch {
            return;
        }

        setSubmitting(true);

        try {
            const organization = await organizationsApi.createOrganization({
                name: values.name.trim(),
                description: values.description?.trim() || null,
                phoneNumber: values.phone?.trim() || null,
                email: values.email?.trim() || null,
                industry: values.industry,
            });

            notify.success('Организация успешно создана');
            form.resetFields();
            onCreated?.(organization);
            closeModal();
        } catch (e) {
            notifyError(e, 'Не удалось создать организацию');
        } finally {
            setSubmitting(false);
        }
    };

    if (!showOverflow || !showModal) {
        return null;
    }

    return (
        <>
            <div className="overflow" onClick={handleClose} id="overflow" />

            <div className="modal-info">
                <div className="modal-info__close" onClick={handleClose}>
                    <CloseIcon />
                </div>

                <div className="modal-info__content">
                    <h2 className="header-title">Создание организации</h2>

                    <Form
                        form={form}
                        name="create-organization"
                        onFinish={onSubmit}
                        layout="vertical"
                        scrollToFirstError
                    >
                        <Form.Item
                            name="name"
                            label="Введите название организации"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, введите название организации.',
                                    whitespace: true,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item name="description" label="Описание организации">
                            <Input.TextArea showCount maxLength={100} />
                        </Form.Item>

                        <Form.Item name="phone" label="Введите номер телефона">
                            <Input addonBefore="+7" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Введите email"
                            rules={[
                                {
                                    type: 'email',
                                    message: 'Введённый адрес электронной почты неверен!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="industry"
                            label="Выберите сферу деятельности"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, выберите сферу деятельности!',
                                },
                            ]}
                        >
                            <Select placeholder="Выберите сферу" options={industryOptions} />
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
