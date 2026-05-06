import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type DocumentDTO = {
    id: number;
    name: string;
    type?: keyof typeof documentTypeLabels;
    createdBy?: string;
    description?: string;
};

const documentTypeLabels = {
    ADMINISTRATIVE: 'Административный',
    FINANCIAL: 'Финансовый',
    HR: 'HR',
    JURIDICAL: 'Юридический',
    MANUFACTUR: 'Производственный',
    MARKETING: 'Маркетинг',
    INFORMATION_ANALYTICAL: 'Информационно-аналитический',
    OTHER: 'Другое',
};

export default function ViewDocumentPage() {
    const { id } = useParams();

    const [document, setDocument] = useState<DocumentDTO | null>(null);

    useEffect(() => {
        const getDocument = async () => {
            if (!id) {
                return;
            }

            // const response = await Api.document.getView(Number(id));
            // setDocument(response);

            console.log('document id:', id);
        };

        getDocument();
    }, [id]);

    return (
        <div className="container">
            <div className="container-info">
                <h3 className="container-info__title">
                    <strong>Документ:</strong> "{document?.name}"
                </h3>

                <h4 className="container-info__type">
                    <strong>Тип документа:</strong>{' '}
                    {document?.type ? documentTypeLabels[document.type] : ''}
                </h4>

                <h4 className="container-info__type">
                    <strong>Автор:</strong> {document?.createdBy}
                </h4>
            </div>

            <div className="container-content">
                <div
                    dangerouslySetInnerHTML={{
                        __html: document?.description ?? '',
                    }}
                />
            </div>
        </div>
    );
}
