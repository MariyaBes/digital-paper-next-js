import {MenuLink} from "../../../types/sidebar.types";
import {Link, useLocation} from "react-router-dom";
import {MouseEvent} from "react";
import {notification} from "antd";

import { ReactComponent as LogoutIcon } from '../../../assets/icons/mage_logout.svg';
import { ReactComponent as SuccessIcon } from '../../../assets/icons/simple-line-icons_check.svg';
import { ReactComponent as ErrorIcon } from '../../../assets/icons/lucide_info.svg';
import {getKeycloak} from "../../../lib/keycloak";
import {useOrganization} from "../../../context/OrganizationContext";
import {useRole} from "../../../context/RoleContext";
import {notify} from "../../../lib/notify";

// Путь к выбору организации — единственный доступный, пока организация не выбрана.
const ORGANIZATION_SELECT_PATH = '/all-company';

interface MenuListProps {
    items: MenuLink[];
    collapse: boolean;
}

export default function MenuList({ items, collapse }: MenuListProps) {
    const location = useLocation();
    const { hasSelectedOrganization, clearOrganization } = useOrganization();
    const { isDirector } = useRole();

    const pathName = location.pathname;

    // Пункт доступен только директору, если помечен directorOnly или role: 'OWNER'.
    const isDirectorOnly = (item: MenuLink) =>
        item.directorOnly === true || item.role === 'OWNER';

    const logout = async () => {
        try {
            // Сбрасываем выбор организации, чтобы он не «утёк» следующему пользователю.
            clearOrganization();

            const keycloak = getKeycloak();
            await keycloak.logout({
              redirectUri: `${window.location.origin}/login`,
            });

            notification.success({
                className: 'notification notification--success',
                icon: <SuccessIcon />,
                message: 'Успешно: выход из аккаунта!',
                duration: 2,
            });
        } catch (e) {
            console.error('Ошибка! Не удалось выйти.', e);

            notification.error({
                className: 'notification notification--error',
                icon: <ErrorIcon />,
                message: 'Ошибка! Не удалось выйти из аккаунта.',
                duration: 2,
            });
        }
    };

    const isActive = (itemPath: string) => {
        if (itemPath === '/documents') {
            return pathName === '/documents' || pathName.startsWith('/documents/');
        }

        return pathName === itemPath;
    };

    // Пункт заблокирован, пока пользователь не выбрал организацию
    // (доступен только переход к самому выбору организации).
    const isLocked = (itemPath: string) =>
        !hasSelectedOrganization && itemPath !== ORGANIZATION_SELECT_PATH;

    const handleItemClick = (item: MenuLink) => (event: MouseEvent) => {
        if (isLocked(item.path)) {
            event.preventDefault();
            notify.info('Сначала выберите организацию');
            return;
        }

        item.onClick?.();
    };

    return (
        <nav className="aside-container__menu">
            <ul className="link-list lines-bottom">
                {items
                    .filter((item) => !isDirectorOnly(item) || isDirector)
                    .map((item) => {
                        const locked = isLocked(item.path);

                        return (
                            <li key={item.title}>
                                <Link
                                    to={item.path}
                                    onClick={handleItemClick(item)}
                                    aria-disabled={locked}
                                    style={
                                        locked
                                            ? { opacity: 0.5, cursor: 'not-allowed' }
                                            : undefined
                                    }
                                    className={`link-list__item
                  ${isActive(item.path) ? 'link-list__item--active' : ''}
                  ${collapse ? 'link-list__item--collapse' : ''}`}
                                >
                                    <div className="background-image link-list__item-icon">
                                        {item.icon}
                                    </div>

                                    {!collapse && (
                                        <span className="link-list__item-title">
                    {item.title}
                  </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
            </ul>

            <button
                className={`link-list__item link-logout ${
                    collapse ? 'link-list__item--collapse' : ''
                }`}
                type="button"
                onClick={logout}
            >
                <div className="background-image link-list__item-icon">
                    <LogoutIcon />
                </div>

                {!collapse && (
                    <span className="link-list__item-title">Выйти</span>
                )}
            </button>
        </nav>
    );
}
