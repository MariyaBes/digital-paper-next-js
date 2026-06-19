import { useEffect, useState } from 'react';
import { Form, Input, Spin } from 'antd';

import { ReactComponent as UploadIcon } from '../../assets/icons/solar_upload-linear.svg';
import placeholderAvatar from '../../assets/icons/Avatar.svg';
import InputUpload from '../../components/ui/Inputs/InputUpload';
import ButtonPrimary from '../../components/ui/Buttons/ButtonPrimary';
import { useUser } from '../../context/UserContext';
import * as userApi from '../../api/user';
import { notify, notifyError } from '../../lib/notify';

interface AccountForm {
    firstName: string;
    lastName: string;
    middleName: string;
    birthday?: string;
}

export default function AccountPage() {
    const { profile, loading, refresh } = useUser();
    const [form] = Form.useForm<AccountForm>();
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (profile) {
            form.setFieldsValue({
                firstName: profile.firstName,
                lastName: profile.lastName,
                middleName: profile.middleName,
                birthday: profile.birthday ?? undefined,
            });
        }
    }, [profile, form]);

    const fullName = profile
        ? [profile.lastName, profile.firstName, profile.middleName]
              .filter(Boolean)
              .join(' ')
              .trim()
        : '';

    const onSubmit = async () => {
        let values: AccountForm;

        try {
            values = await form.validateFields();
        } catch {
            return;
        }

        setSubmitting(true);

        try {
            await userApi.updateUserProfile({
                firstName: values.firstName?.trim(),
                lastName: values.lastName?.trim(),
                middleName: values.middleName?.trim(),
                birthday: values.birthday || null,
            });

            notify.success('Профиль обновлён');
            refresh();
        } catch (e) {
            notifyError(e, 'Не удалось обновить профиль');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAvatarUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setUploading(true);

        try {
            await userApi.uploadUserAvatar(file);
            notify.success('Аватар обновлён');
            refresh();
        } catch (e) {
            notifyError(e, 'Не удалось загрузить аватар');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    return (
        <Spin spinning={loading && !profile}>
            <div className="profile content-flex-column">
                <span className="profile-name">{fullName || profile?.email}</span>

                <div className="profile-block">
                    <div className="profile-block-item left">
                        <img
                            src={profile?.avatarUrl || placeholderAvatar}
                            alt="Аватар пользователя"
                            width={120}
                            height={120}
                            style={{ borderRadius: 100, objectFit: 'cover' }}
                            onError={(e) => {
                                if (e.currentTarget.src !== placeholderAvatar) {
                                    e.currentTarget.src = placeholderAvatar;
                                }
                            }}
                        />

                        <InputUpload name="avatar" role="button" onSubmit={handleAvatarUpload}>
                            <UploadIcon />
                            {uploading ? 'Загрузка…' : 'Загрузить файл'}
                        </InputUpload>

                        <div className="user-info__email form-emeil">{profile?.email}</div>
                    </div>

                    <div className="profile-block-item right">
                        <Form
                            form={form}
                            name="account"
                            layout="vertical"
                            style={{ width: '100%' }}
                            scrollToFirstError
                        >
                            <Form.Item
                                name="lastName"
                                label="Фамилия"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Пожалуйста, введите фамилию.',
                                        whitespace: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="firstName"
                                label="Имя"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Пожалуйста, введите имя.',
                                        whitespace: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item name="middleName" label="Отчество">
                                <Input />
                            </Form.Item>

                            <Form.Item name="birthday" label="Дата рождения">
                                <Input type="date" />
                            </Form.Item>

                            <ButtonPrimary onClick={onSubmit} disabled={submitting}>
                                Сохранить изменения
                            </ButtonPrimary>
                        </Form>
                    </div>
                </div>
            </div>
        </Spin>
    );
}
