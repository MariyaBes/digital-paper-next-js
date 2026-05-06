import React from "react";
import {ReactNode, useEffect} from "react";
import {AuthProvider} from "../context/AuthContext";

type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
    useEffect(() => {
        document.title = "DigitalPaper";
    }, []);

    return <AuthProvider>{children}</AuthProvider>;
}
