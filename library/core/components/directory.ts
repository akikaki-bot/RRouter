import { readdirSync } from "fs"

export class RouterDirectory {
    
    protected baseDir : string;

    constructor( baseDir : string = __dirname ) {
        this.baseDir = baseDir;
    }

    public getRoutes() : string[] {
        const routers : string[] = [];
        const routes = readdirSync( `${this.baseDir}/router` , { withFileTypes : true } );
        
        routes.forEach( route => {
            if( route.isDirectory() ){
                this.getDirectoryFileLists(`${this.baseDir}/router/${route.name}`, (file : string) => {
                    routers.push(file);
                });
            } else {
                routers.push(`${this.baseDir}/router/${route.name}`);
            }
        });

        return routers;
    }

    private getDirectoryFileLists( path: string, callback : Function ): void { 
        const apiFiles = readdirSync(path, { withFileTypes: true });

        apiFiles.forEach( dirent => {
            const FileFullpath = `${path}/${dirent.name}`;
            if( dirent.isDirectory() ){
                this.getDirectoryFileLists( FileFullpath, callback );
            } else {
                return callback(FileFullpath)
            }
        });

    }
}