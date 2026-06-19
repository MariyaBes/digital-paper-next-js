import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select } from 'antd';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

import EditorToolbar from '../../components/elements/Editor/EditorToolbar';
import ButtonPrimary from '../../components/ui/Buttons/ButtonPrimary';
import * as documentsApi from '../../api/documents';
import { DocumentType } from '../../api/dto/document.dto';
import { documentTypeOptions } from '../../types/document.types';
import { DOCX_MIME, tiptapJsonToDocxBlob } from '../../lib/tiptapToDocx';
import { notify, notifyError } from '../../lib/notify';

interface CreateDocumentForm {
    name: string;
    type: DocumentType;
}

export default function CreateDocumentPage() {
    const navigate = useNavigate();
    const [form] = Form.useForm<CreateDocumentForm>();
    const [submitting, setSubmitting] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: '',
    });

    const handleSave = async () => {
        if (!editor) {
            return;
        }

        let values: CreateDocumentForm;

        try {
            values = await form.validateFields();
        } catch {
            return;
        }

        if (editor.getText().trim() === '') {
            notify.error('Документ пустой', 'Введите текст документа перед сохранением.');
            return;
        }

        setSubmitting(true);

        try {
            const blob = await tiptapJsonToDocxBlob(editor.getJSON());
            const fileName = `${values.name.trim()}.docx`;
            const file = new File([blob], fileName, { type: DOCX_MIME });

            await documentsApi.uploadDocument(file, values.name.trim(), values.type);

            notify.success('Документ успешно создан');
            navigate('/documents');
        } catch (e) {
            notifyError(e, 'Не удалось сохранить документ');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="content-flex-column">
            <div className="content-header">
                <h2 className="header-title">Создание документа</h2>

                <div className="action-header">
                    <button
                        className="btn-primary btn-toggle"
                        type="button"
                        onClick={() => navigate('/documents')}
                        disabled={submitting}
                    >
                        Отмена
                    </button>

                    <ButtonPrimary onClick={handleSave} disabled={submitting}>
                        Сохранить
                    </ButtonPrimary>
                </div>
            </div>

            <Form form={form} layout="vertical" className="create-document-form">
                <Form.Item
                    name="name"
                    label="Название документа"
                    rules={[
                        {
                            required: true,
                            message: 'Пожалуйста, введите название документа.',
                            whitespace: true,
                        },
                    ]}
                >
                    <Input placeholder="Например: Приказ № 12" />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Тип документа"
                    rules={[
                        {
                            required: true,
                            message: 'Пожалуйста, выберите тип документа.',
                        },
                    ]}
                >
                    <Select placeholder="Выберите тип" options={documentTypeOptions} />
                </Form.Item>
            </Form>

            <div className="editors-wrapper">
                <EditorToolbar editor={editor} />
                <EditorContent editor={editor} className="editor-content" />
            </div>
        </div>
    );
}
