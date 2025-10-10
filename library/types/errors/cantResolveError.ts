


/**
 * Error thrown when a route cannot be resolved.
 * 
 * @class CantResolveError
 * @extends Error
 */
export class CantResolveError extends Error {
    constructor( message : string ){
        super( message );
        this.name = 'CantResolveError';
    }
}