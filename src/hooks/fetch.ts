import {getKeycloak} from "../lib/keycloak";
import {API_BASE_URL} from "../config/api.config";
import {getSelectedOrganizationId} from "../lib/organizationStorage";

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

    // Документы/шаблоны и прочие org-scoped эндпоинты требуют выбранную организацию.
    // Подставляем её автоматически, если выбор сделан и заголовок не задан явно.
    const organizationId = getSelectedOrganizationId();
    if (organizationId && !requestHeaders.has('X-Organization-Id')) {
        requestHeaders.set('X-Organization-Id', organizationId);
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

    // Не все эндпоинты отдают JSON: загрузка аватара/логотипа возвращает сырой
    // URL строкой (text/plain). Парсим JSON только когда сервер так и пометил ответ,
    // иначе отдаём текст — иначе response.json() падает на "Unexpected token 'h'".
    const contentType = response.headers.get('Content-Type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json() as Promise<TResponse>;
    }

    return (await response.text()) as unknown as TResponse;
}
