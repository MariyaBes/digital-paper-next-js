import { Form, Input, Select } from 'antd';
import { useState } from 'react';

import { ReactComponent as CloseIcon } from '../../../assets/icons/iconamoon_close-duotone.svg';
import { ReactComponent as UsersIcon } from '../../../assets/icons/tabler_users.svg';
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

            <div
                className="modal-info modal-form"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-org-title"
            >
                <button
                    type="button"
                    className="modal-form__close"
                    onClick={handleClose}
                    aria-label="Закрыть окно"
                >
                    <CloseIcon />
                </button>

                <header className="pf-card__head modal-form__head">
                    <span className="pf-card__icon">
                        <UsersIcon />
                    </span>
                    <div>
                        <h2 id="create-org-title" className="pf-card__title">
                            Создание организации
                        </h2>
                        <p className="pf-card__sub">
                            Заполните основные данные — реквизиты добавите позже в настройках
                        </p>
                    </div>
                </header>

                <Form
                    form={form}
                    name="create-organization"
                    onFinish={onSubmit}
                    layout="vertical"
                    className="modal-form__body"
                    scrollToFirstError
                >
                    <div className="pf-grid">
                        <Form.Item
                            className="pf-grid__full"
                            name="name"
                            label="Название организации"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, введите название организации.',
                                    whitespace: true,
                                },
                            ]}
                        >
                            <Input placeholder="ООО «Ромашка»" />
                        </Form.Item>

                        <Form.Item
                            className="pf-grid__full"
                            name="description"
                            label="Описание организации"
                        >
                            <Input.TextArea
                                showCount
                                maxLength={100}
                                placeholder="Чем занимается организация"
                            />
                        </Form.Item>

                        <Form.Item name="phone" label="Номер телефона">
                            <Input addonBefore="+7" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                {
                                    type: 'email',
                                    message: 'Введённый адрес электронной почты неверен!',
                                },
                            ]}
                        >
                            <Input placeholder="info@romashka.ru" />
                        </Form.Item>

                        <Form.Item
                            className="pf-grid__full"
                            name="industry"
                            label="Сфера деятельности"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, выберите сферу деятельности!',
                                },
                            ]}
                        >
                            <Select placeholder="Выберите сферу" options={industryOptions} />
                        </Form.Item>
                    </div>
                </Form>

                <div className="pf-actions modal-form__actions">
                    <button
                        type="button"
                        className="btn-primary btn-primary--outline"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        <span>Отмена</span>
                    </button>
                    <ButtonPrimary onClick={onSubmit} disabled={submitting}>
                        {submitting ? 'Создание…' : 'Создать организацию'}
                    </ButtonPrimary>
                </div>
            </div>
        </>
    );
}
