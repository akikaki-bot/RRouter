

export interface IRRouterRouterConfig {
    method : `${HTTPMethod}`[];
}

export type HTTPMethod = `GET` | `POST` | `PUT` | `DELETE` | `PATCH` | `OPTIONS` | `HEAD` | `CONNECT` | `TRACE`;