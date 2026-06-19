import { useCallback, useEffect, useState } from 'react';
import { Form, Input, Select, Spin } from 'antd';

import { ReactComponent as UploadIcon } from '../../assets/icons/solar_upload-linear.svg';
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
            // GET деталей возвращает только часть полей — остальные (юридические)
            // пользователь заполняет вручную: бэкенд их в ответе пока не отдаёт.
            form.setFieldsValue({
                name: data.name,
                description: data.description ?? undefined,
                phone: data.phone ?? undefined,
            });
        } catch (e) {
            notifyError(e, 'Не удалось загрузить данные организации');
        } finally {
            setLoading(false);
        }
    }, [orgId, form]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

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
            await organizationsApi.uploadOrganizationAvatar(orgId, file);
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
            <div className="profile content-flex-column">
                <span className="profile-name">{details?.name}</span>

                <div className="profile-block">
                    <div className="profile-block-item left">
                        <img
                            src={logoPlaceholder}
                            alt="Логотип организации"
                            width={120}
                            height={120}
                            style={{ objectFit: 'contain', borderRadius: 8 }}
                        />

                        <InputUpload name="logo" role="button" onSubmit={handleLogoUpload}>
                            <UploadIcon />
                            {uploading ? 'Загрузка…' : 'Загрузить файл'}
                        </InputUpload>

                        {details && (
                            <div className="user-info__position">
                                {industryLabels[details.industry]}
                            </div>
                        )}
                    </div>

                    <div className="profile-block-item right">
                        <Form
                            form={form}
                            name="organization-settings"
                            layout="vertical"
                            style={{ width: '100%' }}
                            scrollToFirstError
                        >
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
                                <Input />
                            </Form.Item>

                            <Form.Item
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
                                <Input />
                            </Form.Item>

                            <Form.Item name="description" label="Описание">
                                <Input.TextArea showCount maxLength={1024} />
                            </Form.Item>

                            <Form.Item name="phone" label="Телефон">
                                <Input addonBefore="+7" style={{ width: '100%' }} />
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
                                <Input />
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
                                <Input />
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
                                <Input />
                            </Form.Item>

                            <Form.Item
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
                                <Input />
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
