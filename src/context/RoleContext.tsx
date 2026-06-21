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
import { useOrganization } from './OrganizationContext';
import * as organizationUsersApi from '../api/organizationUsers';
import { isDirectorRole, UserRole } from '../api/dto/user.dto';

interface RoleContextValue {
    /** Роль текущего пользователя в выбранной организации (или null). */
    role: UserRole | null;
    /** Есть ли права «директора» (OWNER/ADMIN): утверждение, удаление любых документов, смена ролей. */
    isDirector: boolean;
    loading: boolean;
    /** Перезагрузить роль (например, после смены организации/прав). */
    refresh: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

interface RoleProviderProps {
    children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
    const { ready, authenticated } = useAuth();
    const { selectedOrganization } = useOrganization();
    const organizationId = selectedOrganization?.id ?? null;

    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(false);
    const [reloadToken, setReloadToken] = useState(0);

    const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

    useEffect(() => {
        // Роль имеет смысл только когда пользователь авторизован и выбрал организацию.
        if (!ready || !authenticated || !organizationId) {
            setRole(null);
            return;
        }

        let active = true;
        setLoading(true);

        organizationUsersApi
            .getOrganizationRole()
            .then((data) => {
                if (active) setRole(data.role);
            })
            .catch((error) => {
                console.error('Не удалось определить роль в организации:', error);
                if (active) setRole(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [ready, authenticated, organizationId, reloadToken]);

    const value = useMemo<RoleContextValue>(
        () => ({
            role,
            isDirector: isDirectorRole(role),
            loading,
            refresh,
        }),
        [role, loading, refresh],
    );

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
    const context = useContext(RoleContext);

    if (!context) {
        throw new Error('useRole должен использоваться внутри RoleProvider');
    }

    return context;
}
