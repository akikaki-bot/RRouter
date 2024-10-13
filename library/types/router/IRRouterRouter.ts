
import * as Express from 'express';

export interface IRRouterRouter<ResBody = any> {
    ( req : Express.Request, res : Express.Response<ResBody>, next ?: Express.NextFunction ) : void | Promise<void>;
    // ( req : Express.Request, res : Express.Response<ResBody>, next ?: Express.NextFunction ) : Promise<void>;
}