import { IRRouterRouter } from "./IRRouterRouter";

/**
 * All of default exports are override this method.
 */
type IRRouterRouterConfigMethodRegisterType =  Partial<Record<HTTPMethod, IRRouterRouter>>

/**
 * Configure the routers.
 * 
 * if you configure `"METHOD": handler()` style action, 
 * the `default export` handler are overrided this method.
 * 
 * if you want to use `default export` handler, you must configure `"method" : HTTPMethod[]`.
 */
export interface IRRouterRouterConfig extends IRRouterRouterConfigMethodRegisterType {
    method ?: `${HTTPMethod}`[];
}

export type HTTPMethod = `GET` | `POST` | `PUT` | `DELETE` | `PATCH` | `OPTIONS` | `HEAD` | `CONNECT` | `TRACE`;