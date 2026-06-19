import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { ready, authenticated, login } = useAuth();

    const registered = new URLSearchParams(location.search).get('registered');

    useEffect(() => {
        if (!ready) {
            return;
        }

        if (registered === 'true') {
            return;
        }

        if (authenticated) {
            navigate('/all-company', { replace: true });
            return;
        }

        login();
    }, [ready, authenticated, registered, login, navigate]);

    if (registered === 'true') {
        return (
            <div>
                <h1>Регистрация завершена</h1>
                <button type="button" onClick={login}>
                    Войти
                </button>
            </div>
        );
    }

    return null;
}
