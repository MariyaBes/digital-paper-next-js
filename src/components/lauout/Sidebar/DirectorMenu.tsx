import { ReactComponent as OrgIcon } from '../../assets/icons/carbon_location-company.svg';
import {MenuLink} from "../../../types/sidebar";

export const directorMenuLink: MenuLink[] = [
    {
        title: 'Организации',
        icon: <OrgIcon />,
        path: '/director',
    },
];
