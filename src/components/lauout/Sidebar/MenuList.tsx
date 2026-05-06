import {JSX} from "react";

interface MenuItem {
    title: string;
    icon: JSX.Element;
    path: string;
    role?: 'EMPLOYEE' | 'OWNER';
    onClick?: () => void;
}

interface MenuListProps {
    items: MenuItem[];
    collapse: boolean;
}

export default function MenuList({items, collapse}: MenuListProps ) {
    const pathName = usePathname();
    const role = useRoleUser();

    const logout = async () => {
        try {
            await Api.auth.logout();

            destroyCookie(null, "role");
            destroyCookie(null, "currentCompanyId");

            notification.success({
                className: 'notification notification--success',
                icon: <SuccessIcon/>,
                message: "Успешно: выход из аккаунта!",
                duration: 2
            });

            location.href = '/login';

        } catch (e) {
            console.error("Ошибка! Не удалось выйти. ", e);

            notification.error({
                className: 'notification notification--error',
                icon: <ErrorIcon/>,
                message: "Ошибка! Не удалось выйти из аккаунта.",
                duration: 2
            });
        }
    }

    return (
        <nav className="aside-container__menu">
            {/* СПИСОК МЕНЮ */}
            <ul className="link-list lines-bottom">

                {/* ОСНОВНОЙ СПИСОК */}
                {items
                    .filter(item => !item.role || item.role === role)
                    .map(item => {
                        return (
                            <li key={item.title}>
                                <Link href={item.path} className={`link-list__item 
                                    ${pathName === item.path ? 'link-list__item--active' : ''}
                                    ${collapse ? 'link-list__item--collapse' : ''}`}>

                                    <div className={"background-image link-list__item-icon"}>
                                        {item.icon}
                                    </div>

                                    {collapse ? (
                                        ''
                                    ) : (
                                        <span className="link-list__item-title">
                                            {item.title}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
            </ul>

            {/* КНОПКА "ВЫХОД" */}
            <button className={`link-list__item link-logout ${collapse ? 'link-list__item--collapse' : ''}`} type={'submit'} onClick={() => logout()}>
                <div className="background-image link-list__item-icon">
                    <LogoutIcon/>
                </div>

                {collapse ? (
                    ''
                ) : (
                    <span className="link-list__item-title">Выйти</span>
                )}
            </button>
        </nav>
    )
}
