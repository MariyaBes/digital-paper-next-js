import React from "react";
import {ReactNode, useEffect} from "react";
import {AuthProvider} from "../context/AuthContext";
import {OrganizationProvider} from "../context/OrganizationContext";
import {UserProvider} from "../context/UserContext";
import {RoleProvider} from "../context/RoleContext";

type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
    useEffect(() => {
        document.title = "ДокОборот";
    }, []);

    return (
        <AuthProvider>
            <UserProvider>
                <OrganizationProvider>
                    <RoleProvider>{children}</RoleProvider>
                </OrganizationProvider>
            </UserProvider>
        </AuthProvider>
    );
}
