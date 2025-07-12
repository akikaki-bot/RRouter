import { z } from "zod";


export interface RRouterVaildatorSuccess<T = any> {
    success : "true";
    data : T
}

export interface RRouterVaildatorError {
    success : "false";
    error : z.ZodError;
}

export type RRouterVaildatorResult<T = any> = RRouterVaildatorSuccess<T> | RRouterVaildatorError;

export function RRouterVaildatorExtends<T = any>( input : any, zod : z.ZodType<any, z.ZodTypeDef, any> ) : RRouterVaildatorResult<T> {
    const result = zod.safeParse( input );
    if( result.success ) {
        return {
            success : "true",
            data : result.data
        }
    }

    return {
        success : "false",
        error : result.error
    }
}