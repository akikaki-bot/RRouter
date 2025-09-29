import * as Express from 'express';
import z from 'zod';

/**
 * Router with vaildator.
 * 
 * @param vaildator Vaildator
 * 
 * @returns void | Promise<void>
 * 
 * represents a router with vaildator.
 * 
 * if the vaildator is not passed, call the PLUGIN EVENT "onVaildatorError".
 * 
 * @since 1.0.0
 */
export interface IRRouterVaildator {
    
}