import Keycloak from 'keycloak-js';

let keycloak: any = null;
let initPromise: Promise<boolean> | null = null;

export function getKeycloak(): any {
    if (!keycloak) {
        keycloak = new Keycloak({
            url: 'http://192.168.10.248:8080',
            realm: 'digitalpaper',
            clientId: 'digital-paper-client',
        });
    }

    return keycloak;
}

export function initKeycloak(): Promise<boolean> | null {
    const kc = getKeycloak();

    if (!initPromise) {
        initPromise = kc.init({
            onLoad: 'check-sso',
            checkLoginIframe: false,
            pkceMethod: 'S256',
            responseMode: 'query',
        });
    }

    return initPromise;
}
