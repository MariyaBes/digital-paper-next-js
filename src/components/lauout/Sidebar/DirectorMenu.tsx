import { ReactComponent as OrgIcon } from '../../assets/icons/carbon_location-company.svg';
import {MenuLink} from "../../../dto/sidebar.types";

export const directorMenuLink: MenuLink[] = [
    {
        title: 'Организации',
        icon: <OrgIcon />,
        path: '/director',
    },
];
