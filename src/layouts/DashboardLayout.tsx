import { useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from "../components/lauout/Header";
import Sidebar from "../components/lauout/Sidebar/Sidebar";
import { useOrganization } from "../context/OrganizationContext";
import { useUser } from "../context/UserContext";
import { SidebarUser } from "../types/sidebar.types";

const ORGANIZATION_SELECT_PATH = '/all-company';

export default function DashboardLayout() {
    const location = useLocation();
    const { hasSelectedOrganization } = useOrganization();
    const { profile } = useUser();

    const [collapse, setCollapse] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showOverflow, setShowOverflow] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    // Данные для блока пользователя внизу сайдбара.
    const sidebarUser: SidebarUser | null = useMemo(() => {
        if (!profile) {
            return null;
        }

        const fullName = [profile.lastName, profile.firstName, profile.middleName]
            .filter(Boolean)
            .join(' ')
            .trim();

        return {
            id: profile.id,
            login: fullName || profile.email,
            email: profile.email,
            imageUrl: profile.avatarUrl ?? undefined,
        };
    }, [profile]);

    const pageTitle = useMemo(() => {
        const pathName = location.pathname;

        if (pathName === '/documents') {
            return 'Мои документы';
        }

        if (pathName === '/create/document') {
            return 'Создание документа';
        }

        if (pathName.startsWith('/documents/')) {
            return 'Просмотр документа';
        }

        if (pathName.startsWith('/template/')) {
            return 'Конструктор документа';
        }

        if (pathName === '/template') {
            return 'Шаблоны';
        }

        if (pathName === '/recycle') {
            return 'Корзина';
        }

        if (pathName === '/users') {
            return 'Пользователи организации';
        }

        if (pathName === '/account') {
            return 'Личный профиль';
        }

        if (pathName === '/setting') {
            return 'Настройки организации';
        }

        if (pathName === ORGANIZATION_SELECT_PATH) {
            return 'Выбор организации';
        }

        return 'ДокОборот';
    }, [location.pathname]);

    useEffect(() => {
        const resizeWidth = () => {
            const width = window.innerWidth;

            setWindowWidth(width);

            if (width <= 990) {
                setCollapse(true);
            } else {
                setCollapse(false);
            }

            if (width < 768) {
                setCollapse(false);
                setShowSidebar(false);
            } else {
                setShowSidebar(true);
            }
        };

        resizeWidth();

        window.addEventListener('resize', resizeWidth);

        return () => {
            window.removeEventListener('resize', resizeWidth);
        };
    }, []);

    const toggleStateCollapse = () => {
        setCollapse((prev) => !prev);
    };

    const toggleSidebar = () => {
        setShowOverflow(true);
        setShowSidebar((prev) => !prev);
    };

    const closeSidebar = () => {
        setShowOverflow(false);
        setShowSidebar(false);
    };

    // Пока организация не выбрана — пускаем только на страницу выбора организации.
    if (!hasSelectedOrganization && location.pathname !== ORGANIZATION_SELECT_PATH) {
        return <Navigate to={ORGANIZATION_SELECT_PATH} replace />;
    }

    return (
        <main>
            {showOverflow && <div className="overflow" onClick={closeSidebar} />}

            <Sidebar
                collapse={collapse}
                windowWidth={windowWidth}
                closeSidebar={closeSidebar}
                showSidebar={showSidebar}
                role="employee"
                user={sidebarUser}
            />

            <div className="main-conteiner">
                <Header
                    pageTitle={pageTitle}
                    toggleStateCollapse={toggleStateCollapse}
                    toggleSidebar={toggleSidebar}
                    windowWidth={windowWidth}
                />

                <Outlet />
            </div>
        </main>
    );
}
