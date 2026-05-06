import React from "react";
import {ReactNode, useEffect} from "react";

type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
    useEffect(() => {
        document.title = "DigitalPaper";
    }, []);

    return (
        // <UserProvider>
        //   <CompanyProvider>
        <React.Fragment>
            {children}
        </React.Fragment>
        //   </CompanyProvider>
        // </UserProvider>
    );
}
