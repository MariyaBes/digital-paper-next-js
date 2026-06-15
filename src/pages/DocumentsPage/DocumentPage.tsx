import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ReactComponent as UploadIcon } from '../../assets/icons/solar_upload-linear.svg';
import { ReactComponent as CreateIcon } from '../../assets/icons/tabler_edit.svg';
import Search from '../../components/elements/Search';
import DocumentCreateModal from '../../components/elements/Modals/DocumentCreateModal';
import InputUpload from '../../components/ui/Inputs/InputUpload';
import DocumentsDataTable from './DocumentDataTable';
import { useModalLogic } from '../../hooks/useModalHook';

export default function DocumentPage() {
    const { showModal, showOverflow, openModal, closeModal } = useModalLogic();

    const [file, setFile] = useState<File | null>(null);
    const [documentOriginalName, setDocumentOriginalName] = useState('');
    const [search, setSearch] = useState('');
    const [reloadToken, setReloadToken] = useState(0);

    function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0];

        if (!selected) {
            return;
        }

        setFile(selected);
        setDocumentOriginalName(selected.name);
        openModal(null, null);
    }

    return (
        <div className="content-flex-column">
            <div className="content-header">
                <div className="content-header__search">
                    <Search searchText={search} setSearchText={setSearch} />
                </div>

                <DocumentCreateModal
                    showModal={showModal}
                    showOverflow={showOverflow}
                    closeModal={closeModal}
                    file={file}
                    documentOriginalName={documentOriginalName}
                    onCreated={() => setReloadToken((token) => token + 1)}
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
                <DocumentsDataTable search={search} reloadToken={reloadToken} />
            </div>
        </div>
    );
}
