import { ReactComponent as DocIcon } from '../../../assets/icons/document.svg';
import { ReactComponent as TemplateIcon } from '../../../assets/icons/template.svg';
import { ReactComponent as RecycleIcon } from '../../../assets/icons/recycle.svg';
import { ReactComponent as SettingIcon } from '../../../assets/icons/setting.svg';
import React from "react";
import { ReactComponent as AllCompanyIcon } from '../../../assets/icons/carbon_location-company.svg'
import { ReactComponent as UsersIcon } from '../../../assets/icons/tabler_users.svg'
import {MenuLink} from "../../../types/sidebar.types";


export const employeeMenuLink: MenuLink[] = [
    {
        title: 'Документы',
        icon: <DocIcon />,
        path: '/documents'
    },
    {
        title: 'Шаблоны',
        icon: <TemplateIcon />,
        path: '/template'
    },
    {
        title: 'Корзина',
        icon: <RecycleIcon />,
        path: '/recycle'
    },
    {
        title: 'Пользователи',
        icon: <UsersIcon />,
        path: '/users'
    },
    {
        title: 'Настройки',
        icon: <SettingIcon />,
        path: '/setting'
    },
    {
        title: 'Все компании',
        icon: <AllCompanyIcon />,
        path: '/all-company'
    },
];

