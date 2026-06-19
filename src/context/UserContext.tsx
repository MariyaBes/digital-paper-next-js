import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { useAuth } from './AuthContext';
import * as userApi from '../api/user';
import { UserProfileResponse } from '../api/dto/user.dto';

interface UserContextValue {
    /** Профиль текущего пользователя или null, пока не загружен/не авторизован. */
    profile: UserProfileResponse | null;
    loading: boolean;
    /** Перезагрузить профиль (после редактирования/смены аватара). */
    refresh: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const { ready, authenticated } = useAuth();

    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(false);
    // Счётчик для принудительной перезагрузки профиля.
    const [reloadToken, setReloadToken] = useState(0);

    const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

    useEffect(() => {
        if (!ready || !authenticated) {
            setProfile(null);
            return;
        }

        let active = true;
        setLoading(true);

        userApi
            .getUserProfile()
            .then((data) => {
                if (active) setProfile(data);
            })
            .catch((error) => {
                console.error('Не удалось загрузить профиль пользователя:', error);
                if (active) setProfile(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [ready, authenticated, reloadToken]);

    const value = useMemo<UserContextValue>(
        () => ({ profile, loading, refresh }),
        [profile, loading, refresh],
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error('useUser должен использоваться внутри UserProvider');
    }

    return context;
}
