import { Form, Input } from 'antd';
import { useState } from 'react';

import { ReactComponent as CloseIcon } from '../../../assets/icons/iconamoon_close-duotone.svg';
import ButtonPrimary from '../../ui/Buttons/ButtonPrimary';
import * as organizationUsersApi from '../../../api/organizationUsers';
import { notify, notifyError } from '../../../lib/notify';

interface InviteUserForm {
    email: string;
}

interface InviteUserModalProps {
    showModal: boolean;
    showOverflow: boolean;
    closeModal: () => void;
    /** Идентификатор организации, в которую приглашаем. */
    organizationId: string | null;
    /** Вызывается после успешного приглашения (для перезапроса списка). */
    onInvited?: () => void;
}

export default function InviteUserModal({
    showModal,
    showOverflow,
    closeModal,
    organizationId,
    onInvited,
}: InviteUserModalProps) {
    const [form] = Form.useForm<InviteUserForm>();
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async () => {
        if (!organizationId) {
            notify.error('Организация не выбрана');
            return;
        }

        let values: InviteUserForm;

        try {
            values = await form.validateFields();
        } catch {
            return;
        }

        setSubmitting(true);

        try {
            await organizationUsersApi.inviteUserToOrganization(organizationId, {
                email: values.email.trim(),
            });

            notify.success('Приглашение отправлено');
            form.resetFields();
            onInvited?.();
            closeModal();
        } catch (e) {
            notifyError(e, 'Не удалось пригласить пользователя');
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
                    <h2 className="header-title">Пригласить пользователя</h2>

                    <Form
                        form={form}
                        name="invite-user"
                        onFinish={onSubmit}
                        layout="vertical"
                        scrollToFirstError
                    >
                        <Form.Item
                            name="email"
                            label="Email пользователя"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, введите email.',
                                    whitespace: true,
                                },
                                {
                                    type: 'email',
                                    message: 'Неверный формат email.',
                                },
                            ]}
                        >
                            <Input placeholder="user@example.com" />
                        </Form.Item>
                    </Form>

                    <div className="modal-info__actions">
                        <ButtonPrimary onClick={onSubmit} disabled={submitting}>
                            Пригласить
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        </>
    );
}
