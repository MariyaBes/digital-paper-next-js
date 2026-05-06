import {MenuLink} from "../../../types/sidebar.types";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {notification} from "antd";

import { ReactComponent as LogoutIcon } from '../../../assets/icons/mage_logout.svg';
import { ReactComponent as SuccessIcon } from '../../../assets/icons/simple-line-icons_check.svg';
import { ReactComponent as ErrorIcon } from '../../../assets/icons/lucide_info.svg';
import {getKeycloak} from "../../../lib/keycloak";


interface MenuListProps {
    items: MenuLink[];
    collapse: boolean;
}

export default function MenuList({ items, collapse }: MenuListProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const pathName = location.pathname;

    // Потом заменим на роль из useAuth/useUser
    const role = localStorage.getItem('role') || 'EMPLOYEE';

    const logout = async () => {
        try {
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

    return (
        <nav className="aside-container__menu">
            <ul className="link-list lines-bottom">
                {items
                    .filter((item) => !item.role || item.role === role)
                    .map((item) => (
                        <li key={item.title}>
                            <Link
                                to={item.path}
                                onClick={item.onClick}
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
                    ))}
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
