import { ReactComponent as DocIcon } from '../../assets/icons/document.svg';
import { ReactComponent as TemplateIcon } from '../../assets/icons/template.svg';
import { ReactComponent as InfoIcon } from '../../assets/icons/lucide_info.svg';
import { ReactComponent as EmployeeIcon } from '../../assets/icons/tabler_users.svg';
import { ReactComponent as BackIcon } from '../../assets/icons/back.svg';
import { ReactComponent as DepartamentIcon } from '../../assets/icons/departament.svg';
import {MenuLink} from "../../../types/sidebar";

export const organizationMenuLink: MenuLink[] = [
    {
        title: 'Документы',
        icon: <DocIcon />,
        path: '/director/organization/documents',
    },
    {
        title: 'Конструктор',
        icon: <TemplateIcon />,
        path: '/director/organization/constructor',
    },
    {
        title: 'Об организации',
        icon: <InfoIcon />,
        path: '/director/organization/about-organization',
        role: 'OWNER',
    },
    {
        title: 'Сотрудники',
        icon: <EmployeeIcon />,
        path: '/director/organization/all-employee',
        role: 'OWNER',
    },
    {
        title: 'Отделы организации',
        icon: <DepartamentIcon />,
        path: '/director/organization/department',
    },
    {
        title: 'К компаниям',
        icon: <BackIcon />,
        path: '/director',
        onClick: () => {
            localStorage.removeItem('role');
        },
    },
];
