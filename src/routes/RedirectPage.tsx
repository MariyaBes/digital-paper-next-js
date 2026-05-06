import { useNavigate } from "react-router-dom";
import {useEffect} from "react";
import {useAuth} from "../hooks/useAuth";

export default function RedirectPage() {
    const navigate = useNavigate();
    const { ready, authenticated } = useAuth();

    useEffect(() => {
        if (!ready) {
            return;
        }

        if (!authenticated) {
            navigate('/login', { replace: true });
        } else {
            navigate('/documents', { replace: true });
        }
    }, [ready, authenticated, navigate]);

    return null;
}
