
import * as Express from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { IRRouterResponse } from './IRRouterResponse';

/**
 * The awaitable function.
 */
export type Awaitable<T> = T | Promise<T>

export interface IRRouterRouter<ResBody = any, ReqBody = any> {
    ( req : Express.Request<ParamsDictionary, ResBody, ReqBody>, res : IRRouterResponse<ResBody>, next ?: Express.NextFunction ) : Awaitable<void>;
}