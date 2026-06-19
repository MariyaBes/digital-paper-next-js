import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { ready, authenticated, logout } = useAuth();

    const registered = new URLSearchParams(location.search).get('registered');

    useEffect(() => {
        if (!ready) return;

        if (registered === 'true') {
            if (authenticated) {
                logout();
                return;
            }

            navigate('/login?registered=true', { replace: true });
            return;
        }

        if (authenticated) {
            // Ведём на /documents: guard в DashboardLayout сам отправит на выбор
            // организации (/all-company), если она ещё не выбрана.
            navigate('/documents', { replace: true });
            return;
        }

        navigate('/login', { replace: true });
    }, [ready, authenticated, registered, logout, navigate]);

    return null;
}
