
import * as Express from 'express';
import { IRRouterResponse } from './IRRouterResponse';

/**
 * The awaitable function.
 */
export type Awaitable<T> = T | Promise<T>

export interface IRRouterRouter<ResBody = any> {
    ( req : Express.Request, res : IRRouterResponse<ResBody>, next ?: Express.NextFunction ) : Awaitable<void>;
}