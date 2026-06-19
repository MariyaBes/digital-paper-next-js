import {useEffect} from "react";
import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";

export default function RegisterPage() {
    const navigate = useNavigate();

    const { ready, authenticated, register } = useAuth();

    useEffect(() => {
        if (!ready) {
            return;
        }

        if (authenticated) {
            navigate('/all-company', { replace: true });
            return;
        }

        register();
    }, [ready, authenticated, register, navigate]);

    return null;
}
