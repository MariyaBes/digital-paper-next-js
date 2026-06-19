import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import {
    clearSelectedOrganization,
    readSelectedOrganization,
    StoredOrganization,
    writeSelectedOrganization,
} from '../lib/organizationStorage';

/** Минимальные данные выбранной организации, которых хватает для UI и запросов. */
export type SelectedOrganization = StoredOrganization;

interface OrganizationContextValue {
    /** Выбранная организация или null, если пользователь ещё не выбрал. */
    selectedOrganization: SelectedOrganization | null;
    /** Удобный флаг для guard'ов (сайдбар/роуты). */
    hasSelectedOrganization: boolean;
    /** Выбрать организацию (сохраняется в localStorage). */
    selectOrganization: (organization: SelectedOrganization) => void;
    /** Сбросить выбор (например, при выходе или возврате к списку компаний). */
    clearOrganization: () => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

interface OrganizationProviderProps {
    children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
    // Читаем из localStorage синхронно, чтобы не было мигания guard'ов при загрузке.
    const [selectedOrganization, setSelectedOrganization] =
        useState<SelectedOrganization | null>(readSelectedOrganization);

    const selectOrganization = useCallback((organization: SelectedOrganization) => {
        writeSelectedOrganization(organization);
        setSelectedOrganization(organization);
    }, []);

    const clearOrganization = useCallback(() => {
        clearSelectedOrganization();
        setSelectedOrganization(null);
    }, []);

    const value = useMemo<OrganizationContextValue>(
        () => ({
            selectedOrganization,
            hasSelectedOrganization: selectedOrganization !== null,
            selectOrganization,
            clearOrganization,
        }),
        [selectedOrganization, selectOrganization, clearOrganization],
    );

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);

    if (!context) {
        throw new Error('useOrganization должен использоваться внутри OrganizationProvider');
    }

    return context;
}
