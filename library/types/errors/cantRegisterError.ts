


export class CantRegisterError extends Error {

    constructor( message : string ){
        super( message );
        this.name = 'CantRegisterError';
    }
}