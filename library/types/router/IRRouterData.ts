import { IRRouterRouter } from "./IRRouterRouter";
import { HTTPMethod } from "./IRRouterRouterConfig";

export interface IRRouterRouterData {
    path : string,
    method : HTTPMethod | HTTPMethod[],
    router : IRRouterRouter
}

export type IRRouterRouterDatas = IRRouterRouterData[]