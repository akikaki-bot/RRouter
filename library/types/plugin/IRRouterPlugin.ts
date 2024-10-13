
import * as Express from 'express';

export interface IRRouterPlugin {
    name : string;
    description ?: string;
    version : string;
}

export interface IRRouterPluginCore extends IRRouterPlugin {
    onUse : onUseFunction;
    onServerError ?: onUseErrorFunction;
    onRegister ?: () => void;
}

export type onUseFunction =
    ( req : Express.Request, res : Express.Response, next : Express.NextFunction ) => Promise<void> | void;

export type onUseErrorFunction =
    ( err : Express.Errback, req : Express.Request, res : Express.Response, next : Express.NextFunction ) => Promise<void> | void;

