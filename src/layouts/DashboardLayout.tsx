import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from "../components/lauout/Header";
import Sidebar from "../components/lauout/Sidebar/Sidebar";


export default function DashboardLayout() {
    const location = useLocation();

    const [collapse, setCollapse] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showOverflow, setShowOverflow] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    // const { user } = useUser();
    const user = null;

    const pageTitle = useMemo(() => {
        const pathName = location.pathname;

        if (pathName === '/documents') {
            return 'Мои документы';
        }

        if (pathName.startsWith('/documents/')) {
            return 'Просмотр документа';
        }

        if (pathName === '/template') {
            return 'Шаблоны';
        }

        if (pathName === '/recycle') {
            return 'Корзина';
        }

        if (pathName === '/setting') {
            return 'Личный профиль';
        }

        return 'DigitalPaper';
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

    return (
        <main>
            {showOverflow && <div className="overflow" onClick={closeSidebar} />}

            <Sidebar
                collapse={collapse}
                windowWidth={windowWidth}
                closeSidebar={closeSidebar}
                showSidebar={showSidebar}
                role="employee"
                user={user}
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
