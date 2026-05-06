import {ReactNode} from "react";
import { Navigate } from "react-router-dom";
import {useAuth} from "../context/AuthContext";

type PrivateRouteProps = {
    children: ReactNode;
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const { ready, authenticated } = useAuth();

    if (!ready) {
        return null;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
