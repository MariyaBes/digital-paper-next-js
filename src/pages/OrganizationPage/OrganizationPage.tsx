import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

import Block from '../../components/ui/Block';
import ButtonAdd from '../../components/ui/Buttons/ButtonAdd';
import CreateOrganizationModal from '../../components/elements/Modals/CreateOrganizationModal';
import * as organizationsApi from '../../api/organizations';
import {
    OrganizationListItem,
    organizationTypeLabels,
} from '../../api/dto/organization.dto';
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
        <div className="org-page content-flex-column">
            <CreateOrganizationModal
                showModal={showModal}
                showOverflow={showOverflow}
                closeModal={closeModal}
                onCreated={loadOrganizations}
            />

            <Spin spinning={loading}>
                <section className="org-section">
                    <div className="org-section__head">
                        <h2 className="header-title">Мои организации</h2>
                        {myOrganizations.length > 0 && (
                            <span className="org-count">{myOrganizations.length}</span>
                        )}
                    </div>

                    <div className="org-grid">
                        <ButtonAdd onClick={() => openModal(null, null)} />

                        {myOrganizations.map((organization) => (
                            <Block
                                key={organization.id}
                                name={organization.name}
                                logoUrl={organization.avatarUrl}
                                meta={organizationTypeLabels[organization.type]}
                                onClick={() => handleEnterOrganization(organization)}
                            >
                                Перейти в организацию
                            </Block>
                        ))}
                    </div>
                </section>

                <section className="org-section">
                    <div className="org-section__head">
                        <h2 className="header-title">Все организации</h2>
                        {allOrganizations.length > 0 && (
                            <span className="org-count">{allOrganizations.length}</span>
                        )}
                    </div>

                    <div className="org-grid">
                        {allOrganizations.length === 0 && !loading ? (
                            <div className="org-empty">
                                <span className="org-empty__title">
                                    Доступных организаций пока нет
                                </span>
                                <span className="org-empty__sub">
                                    Создайте свою организацию, чтобы начать работу
                                </span>
                            </div>
                        ) : (
                            allOrganizations.map((organization) => (
                                <Block
                                    key={organization.id}
                                    name={organization.name}
                                    logoUrl={organization.avatarUrl}
                                    meta={organizationTypeLabels[organization.type]}
                                />
                            ))
                        )}
                    </div>
                </section>
            </Spin>
        </div>
    );
}
