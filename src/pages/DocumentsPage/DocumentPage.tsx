import { useState } from 'react';
import { Link } from 'react-router-dom';

import {ReactComponent as UploadIcon} from "../../assets/icons/solar_upload-linear.svg";
import {ReactComponent as CreateIcon} from "../../assets/icons/tabler_edit.svg";
import Search from "../../components/elements/Search";
import DocumentCreateModal from "../../components/elements/Modals/DocumentCreateModal";
import InputUpload from "../../components/ui/Inputs/InputUpload";
import DocumentsDataTable from "./DocumentDataTable";
import {useModalLogic} from "../../hooks/useModalHook";


export default function DocumentPage() {
    const { showModal, showOverflow, openModal, closeModal } = useModalLogic();

    const [documentPath, setDocumentPath] = useState('');
    const [documentOriginalName, setDocumentOriginalName] = useState('');

    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        console.log(formData);

        setDocumentPath(file.name);
        setDocumentOriginalName(file.name);
        openModal(null, null);
    }

    return (
        <div className="content-flex-column">
            <div className="content-header">
                <div className="content-header__search">
                    <Search />
                </div>

                <DocumentCreateModal
                    showModal={showModal}
                    showOverflow={showOverflow}
                    closeModal={closeModal}
                    documentPath={documentPath}
                    documentOriginalName={documentOriginalName}
                />

                <div className="action-header">
                    <div className="content-header__toggle">
                        <Link to="/create/document">
                            <button className="btn-primary btn-toggle">
                                <CreateIcon />
                                Создать документ
                            </button>
                        </Link>
                    </div>

                    <InputUpload name="file" role="button" onSubmit={handleFileUpload}>
                        <UploadIcon />
                        Загрузить файл
                    </InputUpload>
                </div>
            </div>

            <div className="data-table">
                <DocumentsDataTable />
            </div>
        </div>
    );
}
