import Keycloak from 'keycloak-js';

let keycloak: ReturnType<typeof Keycloak> | null = null;

export function getKeycloak() {
    if (!keycloak) {
        keycloak = new Keycloak({
            url: 'http://192.168.10.248:8080',
            realm: 'digitalpaper',
            clientId: 'digital-paper-client',
        });
    }

    return keycloak;
}
