/**
 * Единый источник правды для выбранной организации в localStorage.
 * Используется и React-контекстом (OrganizationContext), и слоем запросов
 * (apiFetch), который кладёт id в обязательный заголовок X-Organization-Id.
 */

export interface StoredOrganization {
    id: string;
    name: string;
}

const STORAGE_KEY = 'selectedOrganization';

export function readSelectedOrganization(): StoredOrganization | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<StoredOrganization>;

        if (parsed && typeof parsed.id === 'string' && typeof parsed.name === 'string') {
            return { id: parsed.id, name: parsed.name };
        }

        return null;
    } catch {
        return null;
    }
}

export function writeSelectedOrganization(organization: StoredOrganization): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(organization));
}

export function clearSelectedOrganization(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/** id выбранной организации (или null) — для заголовка X-Organization-Id. */
export function getSelectedOrganizationId(): string | null {
    return readSelectedOrganization()?.id ?? null;
}
