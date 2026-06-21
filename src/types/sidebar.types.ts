import React from "react";

export interface SidebarUser {
    id: string;
    login: string;
    email: string;
    imageUrl?: string;
}

export interface MenuLink {
    title: string;
    icon: React.ReactNode;
    path: string;
    role?: 'EMPLOYEE' | 'OWNER';
    /** Пункт виден только пользователям с правами директора (OWNER/ADMIN). */
    directorOnly?: boolean;
    onClick?: () => void;
}

export interface CollapsedUser {
    collapse: boolean;
    login: string;
    email: string;
    imageUrl?: string;
}
