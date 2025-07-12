
import * as Express from 'express';
import { ParamsDictionary } from 'express-serve-static-core'

export interface IRRouterRouter<ResBody = any, ReqBody = any> {
    ( req : Express.Request<ParamsDictionary, any, ReqBody>, res : Express.Response<ResBody>, next ?: Express.NextFunction ) : void | Promise<void>;
    // ( req : Express.Request, res : Express.Response<ResBody>, next ?: Express.NextFunction ) : Promise<void>;
}