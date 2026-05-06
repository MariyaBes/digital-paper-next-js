import {useEffect} from "react";
import {getKeycloak} from "../../lib/keycloak";

export default function RegisterPage() {
    useEffect(() => {
        const keycloak = getKeycloak();

        keycloak.register({
            redirectUri: window.location.origin,
        });
    }, []);

    return null;
}
