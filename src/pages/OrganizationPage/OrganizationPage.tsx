import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

import Block from '../../components/ui/Block';
import ButtonAdd from '../../components/ui/Buttons/ButtonAdd';
import CreateOrganizationModal from '../../components/elements/Modals/CreateOrganizationModal';
import * as organizationsApi from '../../api/organizations';
import { OrganizationListItem } from '../../api/dto/organization.dto';
import { useModalLogic } from '../../hooks/useModalHook';
import { useOrganization } from '../../context/OrganizationContext';
import { notify, notifyError } from '../../lib/notify';

// На странице выбора показываем сразу все организации, без листалки.
const PAGE_SIZE = 100;

export function OrganizationPage() {
    const navigate = useNavigate();
    const { selectOrganization } = useOrganization();
    const { showModal, showOverflow, openModal, closeModal } = useModalLogic();

    const [myOrganizations, setMyOrganizations] = useState<OrganizationListItem[]>([]);
    const [allOrganizations, setAllOrganizations] = useState<OrganizationListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrganizations = useCallback(async () => {
        setLoading(true);

        try {
            const [mine, all] = await Promise.all([
                organizationsApi.getMyOrganizations({ size: PAGE_SIZE }),
                organizationsApi.getAllOrganizations({ size: PAGE_SIZE }),
            ]);

            setMyOrganizations(mine.list);
            setAllOrganizations(all.list);
        } catch (e) {
            notifyError(e, 'Не удалось загрузить список организаций');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrganizations();
    }, [loadOrganizations]);

    const handleEnterOrganization = (organization: OrganizationListItem) => {
        selectOrganization({ id: organization.id, name: organization.name });
        notify.success(`Вы вошли в организацию «${organization.name}»`);
        navigate('/documents', { replace: true });
    };

    return (
        <div className="content-flex-column">
            <CreateOrganizationModal
                showModal={showModal}
                showOverflow={showOverflow}
                closeModal={closeModal}
                onCreated={loadOrganizations}
            />

            <Spin spinning={loading}>
                <div style={{ marginBottom: 24 }}>
                    <div className="content-header">
                        <h2 className="header-title">Мои организации</h2>
                    </div>

                    <div className="content-flex-column block-flex">
                        <ButtonAdd onClick={() => openModal(null, null)} />

                        {myOrganizations.map((organization) => (
                            <Block
                                key={organization.id}
                                name={organization.name}
                                logoUrl={organization.avatarUrl}
                                onClick={() => handleEnterOrganization(organization)}
                            >
                                Перейти в организацию
                            </Block>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="content-header">
                        <h2 className="header-title">Все организации</h2>
                    </div>

                    <div className="content-flex-column block-flex">
                        {allOrganizations.length === 0 && !loading && (
                            <p>Доступных организаций пока нет.</p>
                        )}

                        {allOrganizations.map((organization) => (
                            <Block
                                key={organization.id}
                                name={organization.name}
                                logoUrl={organization.avatarUrl}
                            />
                        ))}
                    </div>
                </div>
            </Spin>
        </div>
    );
}
