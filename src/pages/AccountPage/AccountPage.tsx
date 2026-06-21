import { useEffect, useState } from 'react';
import { Form, Input, Spin } from 'antd';

import { ReactComponent as UploadIcon } from '../../assets/icons/solar_upload-linear.svg';
import { ReactComponent as UserIcon } from '../../assets/icons/tabler_user.svg';
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
            <div className="pf content-flex-column">
                <section className="pf-hero">
                    <div className="pf-hero__cover" />

                    <div className="pf-hero__body">
                        <div className={`pf-avatar${uploading ? ' pf-avatar--uploading' : ''}`}>
                            <img
                                className="pf-avatar__img"
                                src={profile?.avatarUrl || placeholderAvatar}
                                alt="Аватар пользователя"
                                onError={(e) => {
                                    if (e.currentTarget.src !== placeholderAvatar) {
                                        e.currentTarget.src = placeholderAvatar;
                                    }
                                }}
                            />

                            <InputUpload name="avatar" role="button" onSubmit={handleAvatarUpload}>
                                <UploadIcon />
                            </InputUpload>
                        </div>

                        <div className="pf-hero__meta">
                            <h1 className="pf-hero__name">{fullName || profile?.email}</h1>
                            {fullName && profile?.email && (
                                <span className="pf-hero__email">{profile.email}</span>
                            )}
                        </div>
                    </div>
                </section>

                <section className="pf-card">
                    <header className="pf-card__head">
                        <span className="pf-card__icon">
                            <UserIcon />
                        </span>
                        <div>
                            <h2 className="pf-card__title">Личные данные</h2>
                            <p className="pf-card__sub">
                                Эти данные отображаются в ваших документах и профиле
                            </p>
                        </div>
                    </header>

                    <Form
                        form={form}
                        name="account"
                        layout="vertical"
                        style={{ width: '100%' }}
                        scrollToFirstError
                    >
                        <div className="pf-grid">
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
                                <Input placeholder="Иванов" />
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
                                <Input placeholder="Иван" />
                            </Form.Item>

                            <Form.Item name="middleName" label="Отчество">
                                <Input placeholder="Иванович" />
                            </Form.Item>

                            <Form.Item name="birthday" label="Дата рождения">
                                <Input type="date" />
                            </Form.Item>
                        </div>

                        <div className="pf-actions pf-actions--top">
                            <ButtonPrimary onClick={onSubmit} disabled={submitting}>
                                {submitting ? 'Сохранение…' : 'Сохранить изменения'}
                            </ButtonPrimary>
                        </div>
                    </Form>
                </section>
            </div>
        </Spin>
    );
}
