import { useNavigate } from "react-router-dom";
import {useEffect} from "react";
import {useAuth} from "../context/AuthContext";

export default function RedirectPage() {
    const navigate = useNavigate();
    const { ready, authenticated } = useAuth();

    useEffect(() => {
        if (!ready) {
            return;
        }

        if (authenticated) {
            navigate('/documents', { replace: true });
            return;
        }

        navigate('/login', { replace: true });
    }, [ready, authenticated, navigate]);

    return null;
}
