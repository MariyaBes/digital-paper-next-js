import { useState } from 'react';

import { ReactComponent as InviteIcon } from '../../assets/icons/tabler_edit.svg';
import Search from '../../components/elements/Search';
import InviteUserModal from '../../components/elements/Modals/InviteUserModal';
import UsersDataTable from './UsersDataTable';
import SummaryRail from '../../components/elements/SummaryRail/SummaryRail';
import { useModalLogic } from '../../hooks/useModalHook';
import { useOrganization } from '../../context/OrganizationContext';

export default function OrganizationUsersPage() {
    const { selectedOrganization } = useOrganization();
    const { showModal, showOverflow, openModal, closeModal } = useModalLogic();

    const [search, setSearch] = useState('');
    const [reloadToken, setReloadToken] = useState(0);

    return (
        <div className="page-rail">
            <div className="page-rail__main content-flex-column">
                <div className="content-header">
                    <div className="content-header__search">
                        <Search searchText={search} setSearchText={setSearch} />
                    </div>

                    <InviteUserModal
                        showModal={showModal}
                        showOverflow={showOverflow}
                        closeModal={closeModal}
                        organizationId={selectedOrganization?.id ?? null}
                        onInvited={() => setReloadToken((token) => token + 1)}
                    />

                    <div className="action-header">
                        <div className="content-header__toggle">
                            <button
                                className="btn-primary btn-toggle"
                                type="button"
                                onClick={() => openModal(null, null)}
                            >
                                <InviteIcon />
                                Пригласить пользователя
                            </button>
                        </div>
                    </div>
                </div>

                <div className="data-table">
                    <UsersDataTable search={search} reloadToken={reloadToken} />
                </div>
            </div>

            <SummaryRail />
        </div>
    );
}
