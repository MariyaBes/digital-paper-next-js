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
    onClick?: () => void;
}

export interface CollapsedUser {
    collapse: boolean;
    login: string;
    email: string;
    imageUrl?: string;
}
