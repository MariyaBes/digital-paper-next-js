import {useEffect, useState} from "react";
import {getKeycloak} from "../lib/keycloak";

export const useAuth = () => {
    const [ready, setReady] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const keycloak = getKeycloak();

    useEffect(() => {
        if (!keycloak) return;

        keycloak.init({
            onLoad: 'check-sso',
            pkceMethod: 'S256',
        }).then((auth: boolean | ((prevState: boolean) => boolean)) => {
            setAuthenticated(auth);
            setReady(true);
        });
    }, [])

    return {
        keycloak,
        ready,
        authenticated
    };
}
