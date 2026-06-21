import { useCallback, useEffect, useState } from 'react';
import { Form, Input, Select, Spin } from 'antd';

import { ReactComponent as UploadIcon } from '../../assets/icons/solar_upload-linear.svg';
import { ReactComponent as InfoIcon } from '../../assets/icons/lucide_info.svg';
import { ReactComponent as DocumentIcon } from '../../assets/icons/document.svg';
import logoPlaceholder from '../../assets/images/SLUG-horizontal.png';
import InputUpload from '../../components/ui/Inputs/InputUpload';
import ButtonPrimary from '../../components/ui/Buttons/ButtonPrimary';
import { useOrganization } from '../../context/OrganizationContext';
import * as organizationsApi from '../../api/organizations';
import {
    industryLabels,
    OrganizationResponse,
    OrganizationType,
    organizationTypeOptions,
} from '../../api/dto/organization.dto';
import { notify, notifyError } from '../../lib/notify';

interface SettingForm {
    name: string;
    fullName: string;
    description?: string;
    phone?: string;
    type: OrganizationType;
    regNumber: string;
    identificationNumber: string;
    regReasonCode: string;
    address: string;
}

export default function SettingPage() {
    const { selectedOrganization } = useOrganization();
    const orgId = selectedOrganization?.id;

    const [form] = Form.useForm<SettingForm>();
    const [details, setDetails] = useState<OrganizationResponse | null>(null);
    // Ссылка на логотип: эндпоинт деталей её не отдаёт, поэтому берём из списка
    // /my (OrganizationListItem.avatarUrl), а после загрузки — из ответа upload'а.
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const loadDetails = useCallback(async () => {
        if (!orgId) {
            return;
        }

        setLoading(true);

        try {
            const data = await organizationsApi.getOrganizationDetails(orgId);
            setDetails(data);
            form.setFieldsValue({
                name: data.name,
                fullName: data.fullName ?? undefined,
                description: data.description ?? undefined,
                phone: data.phone ?? undefined,
                type: data.type ?? undefined,
                regNumber: data.regNumber ?? undefined,
                identificationNumber: data.identificationNumber ?? undefined,
                regReasonCode: data.regReasonCode ?? undefined,
                address: data.address ?? undefined,
            });
        } catch (e) {
            notifyError(e, 'Не удалось загрузить данные организации');
        } finally {
            setLoading(false);
        }
    }, [orgId, form]);

    const loadLogo = useCallback(async () => {
        if (!orgId) {
            return;
        }

        try {
            // Текущий логотип доступен только в списке организаций пользователя.
            const response = await organizationsApi.getMyOrganizations({ size: 100 });
            const current = response.list.find((org) => org.id === orgId);
            setLogoUrl(current?.avatarUrl ?? null);
        } catch (e) {
            console.error('Не удалось загрузить логотип организации:', e);
        }
    }, [orgId]);

    useEffect(() => {
        loadDetails();
        loadLogo();
    }, [loadDetails, loadLogo]);

    const onSubmit = async () => {
        if (!orgId) {
            return;
        }

        let values: SettingForm;

        try {
            values = await form.validateFields();
        } catch {
            return;
        }

        setSubmitting(true);

        try {
            await organizationsApi.updateOrganization(orgId, {
                name: values.name.trim(),
                fullName: values.fullName.trim(),
                description: values.description?.trim() || null,
                phone: values.phone?.trim() || null,
                type: values.type,
                regNumber: values.regNumber.trim(),
                identificationNumber: values.identificationNumber.trim(),
                regReasonCode: values.regReasonCode.trim(),
                address: values.address.trim(),
            });

            notify.success('Данные организации обновлены');
            loadDetails();
        } catch (e) {
            notifyError(e, 'Не удалось обновить организацию');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogoUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file || !orgId) {
            return;
        }

        setUploading(true);

        try {
            const url = await organizationsApi.uploadOrganizationAvatar(orgId, file);
            // Антикэш-параметр: путь логотипа может не меняться, заставляем браузер
            // перезагрузить картинку.
            const trimmed = url?.trim();
            setLogoUrl(
                trimmed ? `${trimmed}${trimmed.includes('?') ? '&' : '?'}t=${Date.now()}` : null,
            );
            notify.success('Логотип обновлён');
        } catch (e) {
            notifyError(e, 'Не удалось загрузить логотип');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    if (!orgId) {
        return <p>Сначала выберите организацию.</p>;
    }

    return (
        <Spin spinning={loading && !details}>
            <div className="pf content-flex-column">
                <section className="pf-hero">
                    <div className="pf-hero__cover" />

                    <div className="pf-hero__body">
                        <div
                            className={`pf-avatar pf-avatar--logo${
                                uploading ? ' pf-avatar--uploading' : ''
                            }`}
                        >
                            <img
                                className="pf-avatar__img"
                                src={logoUrl || logoPlaceholder}
                                alt="Логотип организации"
                                onError={(e) => {
                                    e.currentTarget.src = logoPlaceholder;
                                }}
                            />

                            <InputUpload name="logo" role="button" onSubmit={handleLogoUpload}>
                                <UploadIcon />
                            </InputUpload>
                        </div>

                        <div className="pf-hero__meta">
                            <h1 className="pf-hero__name">{details?.name}</h1>
                            {details && (
                                <span className="pf-chip">
                                    {industryLabels[details.industry]}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                <Form
                    form={form}
                    name="organization-settings"
                    layout="vertical"
                    className="pf-form"
                    scrollToFirstError
                >
                    <section className="pf-card">
                        <header className="pf-card__head">
                            <span className="pf-card__icon">
                                <InfoIcon />
                            </span>
                            <div>
                                <h2 className="pf-card__title">Основная информация</h2>
                                <p className="pf-card__sub">
                                    Название, контакты и форма организации
                                </p>
                            </div>
                        </header>

                        <div className="pf-grid">
                            <Form.Item
                                name="name"
                                label="Наименование"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Пожалуйста, введите наименование.',
                                        whitespace: true,
                                    },
                                ]}
                            >
                                <Input placeholder="ООО «Ромашка»" />
                            </Form.Item>

                            <Form.Item
                                name="type"
                                label="Организационно-правовая форма"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Пожалуйста, выберите форму.',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Выберите форму"
                                    options={organizationTypeOptions}
                                />
                            </Form.Item>

                            <Form.Item
                                className="pf-grid__full"
                                name="fullName"
                                label="Полное наименование"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Пожалуйста, введите полное наименование.',
                                        whitespace: true,
                                    },
                                ]}
                            >
                                <Input placeholder="Общество с ограниченной ответственностью «Ромашка»" />
                            </Form.Item>

                            <Form.Item
                                className="pf-grid__full"
                                name="description"
                                label="Описание"
                            >
                                <Input.TextArea
                                    showCount
                                    maxLength={1024}
                                    placeholder="Чем занимается организация"
                                />
                            </Form.Item>

                            <Form.Item name="phone" label="Телефон">
                                <Input addonBefore="+7" style={{ width: '100%' }} />
                            </Form.Item>
                        </div>
                    </section>

                    <section className="pf-card">
                        <header className="pf-card__head">
                            <span className="pf-card__icon">
                                <DocumentIcon />
                            </span>
                            <div>
                                <h2 className="pf-card__title">Юридические данные</h2>
                                <p className="pf-card__sub">
                                    Реквизиты для документов и отчётности
                                </p>
                            </div>
                        </header>

                        <div className="pf-grid">
                            <Form.Item
                                name="regNumber"
                                label="ОГРН"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Пожалуйста, введите ОГРН.',
                                        whitespace: true,
                                    },
                                ]}
                            >
                                <Input placeholder="1027700132195" />
                            </Form.Item>

                            <Form.Item
                                name="identificationNumber"
                                label="ИНН"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Пожалуйста, введите ИНН.',
                                        whitespace: true,
                                    },
                                ]}
                            >
                                <Input placeholder="7707083893" />
                            </Form.Item>

                            <Form.Item
                                name="regReasonCode"
                                label="КПП"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Пожалуйста, введите КПП.',
                                        whitespace: true,
                                    },
                                ]}
                            >
                                <Input placeholder="770701001" />
                            </Form.Item>

                            <Form.Item
                                className="pf-grid__full"
                                name="address"
                                label="Адрес"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Пожалуйста, введите адрес.',
                                        whitespace: true,
                                    },
                                ]}
                            >
                                <Input placeholder="г. Москва, ул. Тверская, д. 1" />
                            </Form.Item>
                        </div>
                    </section>

                    <div className="pf-actions pf-actions--bar">
                        <span className="pf-actions__hint">
                            Проверьте данные перед сохранением
                        </span>
                        <ButtonPrimary onClick={onSubmit} disabled={submitting}>
                            {submitting ? 'Сохранение…' : 'Сохранить изменения'}
                        </ButtonPrimary>
                    </div>
                </Form>
            </div>
        </Spin>
    );
}
