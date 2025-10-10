

export function checkModule( moduleName: string ): boolean {
    try {
        require.resolve( moduleName );
        return true;
    } catch ( e ) {
        return false;
    }
}