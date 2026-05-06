export interface AuthContextValue {
    ready: boolean;
    authenticated: boolean;
    keycloak: any;
    token: string | null;
    login: () => void;
    register: () => void;
    logout: () => void;
    getAccessToken: () => Promise<string | null>;
}
