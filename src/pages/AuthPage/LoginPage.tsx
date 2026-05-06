import {useEffect} from "react";
import {getKeycloak} from "../../lib/keycloak";

export default function LoginPage() {
    useEffect(() => {
        const keycloak = getKeycloak();

        keycloak.login({
            redirectUri: window.location.origin,
        });
    }, []);

    return null;
}
