import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import { getKeycloak, initKeycloak } from '../lib/keycloak';
import { AuthContextValue } from '../types/auth.types';

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [ready, setReady] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const keycloak = getKeycloak();

    useEffect(() => {
        let mounted = true;

        // @ts-ignore
        initKeycloak()
            .then((isAuthenticated: boolean) => {
                if (!mounted) return;

                setAuthenticated(isAuthenticated);
                setToken(keycloak.token ?? null);
                setReady(true);
            })
            .catch((error: unknown) => {
                console.error('Keycloak init error:', error);

                if (!mounted) return;

                setReady(true);
                setAuthenticated(false);
                setToken(null);
            });

        keycloak.onTokenExpired = async () => {
            try {
                await keycloak.updateToken(30);
                setToken(keycloak.token ?? null);
            } catch (error) {
                console.error('Keycloak token refresh error:', error);
                setAuthenticated(false);
                setToken(null);
            }
        };

        return () => {
            mounted = false;
        };
    }, [keycloak]);

    const getAccessToken = useCallback(async () => {
        if (!keycloak.authenticated) {
            return null;
        }

        try {
            await keycloak.updateToken(30);

            const freshToken = keycloak.token ?? null;
            setToken(freshToken);

            return freshToken;
        } catch (error) {
            console.error('Unable to refresh token:', error);
            setAuthenticated(false);
            setToken(null);

            return null;
        }
    }, [keycloak]);

    const login = useCallback(() => {
        keycloak.login({
            redirectUri: `${window.location.origin}/auth/callback`,
        });
    }, [keycloak]);

    const register = useCallback(() => {
        keycloak.register({
            redirectUri: `${window.location.origin}/auth/callback?registered=true`,
        });
    }, [keycloak]);

    const logout = useCallback(() => {
        keycloak.logout({
            redirectUri: `${window.location.origin}/login?registered=true`,
        });
    }, [keycloak]);

    return (
        <AuthContext.Provider
            value={{
                ready,
                authenticated,
                keycloak,
                token,
                login,
                register,
                logout,
                getAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }

    return context;
}
