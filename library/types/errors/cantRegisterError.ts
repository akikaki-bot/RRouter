

/**
 * Error thrown when a route cannot be registered.
 * 
 * @class CantRegisterError
 * @extends Error
 */
export class CantRegisterError extends Error {
    constructor( message : string ){
        super( message );
        this.name = 'CantRegisterError';
    }
}