


export class CantResolveError extends Error {

    constructor( message : string ){
        super( message );
        this.name = 'CantResolveError';
    }
}