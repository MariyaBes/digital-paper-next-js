import {getKeycloak} from "../lib/keycloak";
import {API_BASE_URL} from "../config/api.config";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiFetchOptions<TBody = unknown> {
    url: string;
    method?: HttpMethod;
    body?: TBody;
    headers?: HeadersInit;
    auth?: boolean;
}

export async function apiFetch<TResponse, TBody = unknown>({
    url,
    method = 'GET',
    body,
    headers,
    auth = true,
}: ApiFetchOptions<TBody>): Promise<TResponse> {
    const requestHeaders = new Headers(headers);

    if (!(body instanceof FormData)) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    if (auth) {
        const keycloak = getKeycloak();

        if (keycloak.authenticated) {
            await keycloak.updateToken(30);

            if (keycloak.token) {
                requestHeaders.set('Authorization', `Bearer ${keycloak.token}`);
            }
        }
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: requestHeaders,
        body:
            body instanceof FormData
                ? body
                : body
                    ? JSON.stringify(body)
                    : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `HTTP ${response.status}: ${errorText || response.statusText}`,
        );
    }

    if (response.status === 204) {
        return null as TResponse;
    }

    return response.json() as Promise<TResponse>;
}
