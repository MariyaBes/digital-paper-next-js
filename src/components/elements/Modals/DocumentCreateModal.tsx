import {DocumentCreateModalInterface} from "../../../types/document.types";
import {Form, Input, Select} from "antd";
import {useEffect, useState} from "react";

import { ReactComponent as CloseIcon } from '../../../assets/icons/iconamoon_close-duotone.svg';
import ButtonPrimary from "../../ui/Buttons/ButtonPrimary";


export default function DocumentCreateModal({
    showModal,
    showOverflow,
    closeModal,
    documentPath,
    documentOriginalName,
}: DocumentCreateModalInterface) {
    const [form] = Form.useForm();

    const [desc, setDesc] = useState('');
    const [type, setType] = useState('');

    const onSubmit = async () => {
        const values = form.getFieldsValue();

        const payload = {
            name: values.name,
            description: values.description,
            path: documentPath,
            type: values.category,
        };

        console.log('create document payload:', payload);

        closeModal();
    };

    useEffect(() => {
        if (documentOriginalName) {
            form.setFieldsValue({ name: documentOriginalName });
        }
    }, [documentOriginalName, form]);

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
                        name="form"
                        initialValues={{ name: documentOriginalName }}
                        onFinish={onSubmit}
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

                        <Form.Item name="description" label="Описание документа">
                            <Input.TextArea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                showCount
                                maxLength={100}
                            />
                        </Form.Item>

                        <Form.Item
                            name="category"
                            label="Выберите категорию"
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, выберите категорию!',
                                },
                            ]}
                        >
                            <Select
                                value={type}
                                onChange={(value: string) => setType(value)}
                                placeholder="Выберите категорию"
                                options={[
                                    { value: 'ADMINISTRATIVE', label: 'Административный' },
                                    { value: 'FINANCIAL', label: 'Финансовый' },
                                    { value: 'HR', label: 'Кадровый' },
                                    { value: 'JURIDICAL', label: 'Юридический' },
                                    { value: 'MANUFACTUR', label: 'Производственный' },
                                    { value: 'MARKETING', label: 'Маркетинговый' },
                                    {
                                        value: 'INFORMATION_ANALYTICAL',
                                        label: 'Информационно-аналитический',
                                    },
                                    { value: 'OTHER', label: 'Другой' },
                                ]}
                            />
                        </Form.Item>
                    </Form>

                    <div className="modal-info__actions">
                        <ButtonPrimary onClick={onSubmit}>Создать</ButtonPrimary>
                    </div>
                </div>
            </div>
        </>
    );
}
