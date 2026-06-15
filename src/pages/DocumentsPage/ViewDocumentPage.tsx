import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { documentTypeLabels } from '../../types/document.types';
import { DocumentResponse } from '../../api/dto/document.dto';

export default function ViewDocumentPage() {
    const { id } = useParams();

    const [document, setDocument] = useState<DocumentResponse | null>(null);

    useEffect(() => {
        const getDocument = async () => {
            if (!id) {
                return;
            }

            // TODO: подключить эндпоинт детали документа, когда появится на бэкенде.
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
                    <strong>Ответственный:</strong> {document?.responsible}
                </h4>
            </div>
        </div>
    );
}
