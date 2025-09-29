import { Response, Send } from "express";


export interface IRRouterResponse<T = any> extends Response<T> {
}