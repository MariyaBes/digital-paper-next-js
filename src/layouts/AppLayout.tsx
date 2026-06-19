import React from "react";
import {ReactNode, useEffect} from "react";
import {AuthProvider} from "../context/AuthContext";
import {OrganizationProvider} from "../context/OrganizationContext";
import {UserProvider} from "../context/UserContext";

type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
    useEffect(() => {
        document.title = "DigitalPaper";
    }, []);

    return (
        <AuthProvider>
            <UserProvider>
                <OrganizationProvider>{children}</OrganizationProvider>
            </UserProvider>
        </AuthProvider>
    );
}
