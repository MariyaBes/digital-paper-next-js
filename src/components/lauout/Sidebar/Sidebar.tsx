import { Link, useLocation } from 'react-router-dom';

import MenuList from './MenuList';
import User from './User';

import { ReactComponent as LogoThumb } from '../../../assets/images/Logo-thumb.svg';

import { employeeMenuLink } from './EmployeeMenu';
import { directorMenuLink } from './DirectorMenu';
import { organizationMenuLink } from './OrganizationMenu';
import {SidebarUser} from "../../../types/sidebar.types";
import Logo from "../../ui/Logo";


interface SidebarProps {
    collapse: boolean;
    windowWidth: number;
    closeSidebar: () => void;
    showSidebar: boolean;
    role: 'employee' | 'director';
    user: SidebarUser | null;
}

export default function Sidebar({
                                    collapse,
                                    windowWidth,
                                    closeSidebar,
                                    showSidebar,
                                    role,
                                    user,
                                }: SidebarProps) {
    const location = useLocation();
    const pathName = location.pathname;

    const menuLinks =
        role === 'employee'
            ? employeeMenuLink
            : pathName === '/director'
                ? directorMenuLink
                : organizationMenuLink;

    const logoPath =
        role === 'employee'
            ? '/documents'
            : '/director/organization/documents';

    const settingPath =
        role === 'employee'
            ? '/account'
            : pathName === '/director'
                ? '/director/setting'
                : '/director/organization/setting';

    return (
        <>
            {showSidebar && windowWidth < 768 && (
                <div className="overflow" onClick={closeSidebar} id="overflow" />
            )}

            <aside
                className={
                    windowWidth < 768 || !collapse
                        ? showSidebar
                            ? 'sidebar'
                            : 'sidebar closed'
                        : collapse
                            ? 'sidebar collapsed'
                            : 'sidebar'
                }
            >
                <header>
                    <Link to={logoPath} title="DigitalPaper логотип">
                        {collapse ? (
                            <div className="logo background-image">
                                <LogoThumb />
                            </div>
                        ) : (
                            <Logo />
                        )}
                    </Link>
                </header>

                <div className="aside-container">
                    <MenuList items={menuLinks} collapse={collapse} />

                    <Link
                        to={settingPath}
                        className={`aside-container__user user ${
                            collapse ? 'user-collapse' : ''
                        }`}
                    >
                        {user && (
                            <User
                                imageUrl={user.imageUrl || ''}
                                login={user.login}
                                email={user.email}
                                collapse={collapse}
                            />
                        )}
                    </Link>
                </div>
            </aside>
        </>
    );
}
