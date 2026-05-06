import { useLocation } from "react-router-dom";

interface User {
    id: number;
    login: string;
    email: string;
    imageUrl?: string;
}

interface SidebarProps {
    collapse: boolean;
    windowWidth: number;
    closeSidebar: () => void;
    showSidebar: boolean;
    role: "employee" | "director";
    user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             collapse,
                                             windowWidth,
                                             closeSidebar,
                                             showSidebar,
                                             role,
                                             user,
                                         }) => {
    const location = useLocation();

    const menuLinks = role === "employee" ? employeeMenuLink : pathName === '/director' ? directorMenuLink : organizationMenuLink;

    return (
        <>
            {showSidebar && windowWidth < 768 && (
                <div className="overflow" onClick={closeSidebar} id="overflow"></div>
            )}
            <aside
                className={
                    windowWidth < 768 || !collapse
                        ? showSidebar
                            ? "sidebar"
                            : "sidebar closed"
                        : collapse
                            ? "sidebar collapsed"
                            : "sidebar"
                }
            >
                <header>
                    <Link shallow href={ role === 'employee' ? '/documents' : '/director/organization/documents'} title="DigitalPaper логотип">
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

                    <Link href={`${role === 'employee' ? "/setting" : pathName === '/director' ? "/director/setting" : "/director/organization/setting"}`} className={`aside-container__user user ${collapse ? 'user-collapse' : ''}`}>
                        {user ? (
                            <User imageUrl={user.imageUrl || ""} login={user.login} email={user.email} collapse={collapse} />
                        ) : null}
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
