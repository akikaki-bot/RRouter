import Express, { Router } from 'express';
import { RouterDirectory } from "./directory";

import {
    CantRegisterError,
    IRRouterConfig,
    IRRouterPluginCore,
    IRRouterRouter,
    HTTPMethod,
    IRRouterRouterConfig
} from "../../types";
import { IRRouterRouterData, IRRouterRouterDatas } from '../../types/router/IRRouterData';
import { HTTPMethods } from '../constants/httpMethods';

export class RRouter {

    private __plugins: IRRouterPluginCore[] = [];
    private __expressExtends: Express.RequestHandler[] = [];
    private __isDev: boolean = false;
    private dirname: string = __dirname;
    private __OVERRIDE_METHODS = false;

    /**
     * Check if the RRouter is ready.
     * 
     * @type {boolean}
     * @protected
     * @memberof RRouter
     */
    protected __ready: boolean = false;
    /**
     * The express application.
     * 
     * @type {Express.Application}
     */
    public __app: Express.Application | null = null;
    /**
     * Registered routes
     */
    protected registeredRoutes: IRRouterRouterDatas = [];

    protected Request: Express.Request;
    protected Response: Express.Response;
    protected NextFunction: Express.NextFunction;

    constructor() {
        this.__plugins = [];
        this.__ready = false;
        this.__app = null;
        this.dirname = __dirname;
    }

    /**
     * Register a plugin to the RRouter.
     * 
     * 
     * ### Error Throws : 
     * CantRegisterError
     * - If the plugin is already registered.
     * - If the plugin is registered after the start() method.
     * 
     * @param { IRRouterPluginCore } plugin the plugin to use
     */
    public use(plugin: IRRouterPluginCore) {
        if (this.__ready) throw new CantRegisterError('Cannot register plugin after start() method.');
        if (this.__plugins.find(p => p.name === plugin.name)) throw new CantRegisterError(`Plugin with name ${plugin.name} already exists.`);
        this.__plugins.push(plugin);
    }

    /**
     * Register an express extends to the RRouter.
     * 
     * ### Error Throws :
     * CantRegisterError
     * - If the extends is registered after the start() method.
     * 
     * @param {Express.RequestHandler} app the extends of express to use.
     */
    public expressExtends(app: Express.RequestHandler) {
        if (this.__ready) throw new CantRegisterError('Cannot register extends after start() method.');
        this.__expressExtends.push(app);
    }

    /**
     * Configure the RRouter Client.
     * 
     * ### Error Throws :
     * CantRegisterError
     * - If the configuration is registered after the start() method.
     * - If the cors is enabled but cors module is not installed.
     * 
     * @param {IRRouterConfig} config the configuration of the RRouter.
     * 
     * @example
     * ```js
     * const rrouter = new RRouter();
     * rrouter.configure({
     *    useJsonMode: true,
     *    dirname: __dirname,
     *    useCors: true,
     * });
     * ```
     * 
     * You have to configure the RRouter dirname to use the router directory.
     * 
     * it because the RRouter will use the `node_modules/rrouter/router` directory as the default directory.
     */
    public configure(config: IRRouterConfig) {
        if (this.__ready) throw new CantRegisterError('Cannot configure rrouter after start() method.');
        if (config.useJsonMode) {
            this.expressExtends(Express.json());
        }
        if (config.useCors) {
            //if( import('cors').then( v => typeof v.default !== "function" ) ) throw new CantRegisterError('Cannot use cors because cors module is not installed.');
            this.expressExtends(require('cors')());
        }
        if (config.useUrlEncoded) {
            this.expressExtends(Express.urlencoded({ extended: true }));
        }
        if (config.dirname) {
            this.dirname = config.dirname;
        }
        if (config.isDev) {
            this.__isDev = true;
        }
        if( config.OVERRIDE_HTTP_METHOD ){
            this.__OVERRIDE_METHODS = true
        }
    }

    protected traseLog(...message: Array<string | object | symbol | number | boolean>) {
        if (this.__isDev) {
            console.log(message);
        }
    }

    
    private getRouterPath(route: string) {
        const path = route.split('/');
        const newPath = path.indexOf('router') > -1 && path.splice(path.indexOf('router') + 1);
        if (newPath.length == 1 && newPath[0].includes('index')) {
            return '/';
        }
        else return "/" + newPath.join('/').replace(/\/index(\.ts|\.js)/g, '').replace(/\.ts/g, '').replace(/\.js/g, '');
    }

    private parseHTTPMethods( method : HTTPMethod | HTTPMethod[] ) : HTTPMethod[] {
        if( Array.isArray( method )){
            return method
        }
        else return [ method ]
    }

    /**
     * Check the added route
     * @param routeConfig 
     * @returns {boolean}
     */
    private isAlreadyAddedRoute( routeConfig : IRRouterRouterData ){
        this.traseLog( routeConfig, this.parseHTTPMethods( routeConfig.method ) )
        return this.parseHTTPMethods( routeConfig.method ).map( method => {
            if( this.registeredRoutes.length == 0 ) return false
            return this.registeredRoutes.filter( v => 
                this.parseHTTPMethods( v.method ).includes( method )
                && v.path == routeConfig.path
            ).length > 0 ? true : false
        }).includes( true ) ? true : false
    }

    /**
     * add to internal routes
     * @param routeConfig
     */
    private addRoutes( routeConfig : IRRouterRouterData ){
        if( !this.__OVERRIDE_METHODS && this.isAlreadyAddedRoute( routeConfig )){
            throw new CantRegisterError(`The route [${routeConfig.method}] ${routeConfig.path} is already added.\nIf you want to override http methods, you can change the config.`);
        }
        this.registeredRoutes.push({
            path: routeConfig.path,
            method : routeConfig.method,
            router: routeConfig.router
        })
    }

    /**
     * parse `export const config` in the router file
     * @param path 
     * @param routerConfig 
     */
    private parseConfig( path: string,  routerConfig : IRRouterRouterConfig ) {
        const methods = Object.keys(routerConfig).filter(
            v => HTTPMethods.includes( v as HTTPMethod )
        ) as HTTPMethod[]
        methods.map( method => {
            const handler = routerConfig[method] as IRRouterRouter
            if( typeof handler != "function") return;
            this.addRoutes({
                path,
                method,
                router: handler
            })
        })
    }

    private async loadByConfig( app : Express.Application, route: string ) {
        const routerConfig = ( await import(route)).config as IRRouterRouterConfig || undefined
        this.traseLog( routerConfig )
        if( typeof routerConfig !== "undefined" ){
            if( 
                Object.keys(routerConfig).some(
                    v => HTTPMethods.includes( v.toUpperCase() as HTTPMethod )
                )
            ) {
                const path = this.getRouterPath(route);
                this.traseLog(`[Loader] loading ${path}`)
                this.parseConfig( path, routerConfig );
                app.use( async ( req , res, next ) => {
                    this.traseLog(`${req.method}: ${req.path} -> ${path}`)
                    if( req.path !== path ) return next();
                    if( routerConfig[req.method.toUpperCase() as HTTPMethod] ){
                        await routerConfig[req.method.toUpperCase() as HTTPMethod](
                            req, res, next
                        )
                    } else {
                        next()
                    }
                })
            }
        }
    }

    /**
     * Start the RRouter Server.
     * @param {number} port the port to use.
     */
    public start(
        port: number = 3000,
    ) {
        const app = Express();

        this.traseLog('[RRouter] Starting...');

        const directory = new RouterDirectory(this.dirname);
        const routes = directory.getRoutes();
        let routeCount = 0;

        Promise.all(
            routes.map(async route => {
                const router = (await import(route)).default as Router | IRRouterRouter | void;
                if (typeof router === "undefined" || !router || typeof router !== "function") {
                    await this.loadByConfig( app, route)
                    this.traseLog(`[RRouter -> Route] Invalid route: ${route}`);
                    return;
                }
                if ( "stack" in router ) {
                    app.use(router);
                }
                else {
                    const routerConfig = (await import(route)).config as IRRouterRouterConfig || undefined;
                    const path = this.getRouterPath(route);
                    this.traseLog(`[Loader] GET : ${path}`);
                    if( typeof routerConfig !== "undefined" ){
                        await this.loadByConfig( app, route)
                        if ("method" in routerConfig) {
                            this.addRoutes({ path, method: routerConfig.method, router })
                            //this.parseConfig( path, routerConfig )
                            app.use(async (req, res, next) => {
                                this.traseLog(`${req.method} : ${req.path} -> ${path}`);
                                if (req.path !== path) return next();
                                if (routerConfig.method.includes(req.method.toUpperCase() as HTTPMethod)) {
                                    await router(req, res, next);
                                } else {
                                    next();
                                }
                            });
                        } 
                    } else {
                        app.use(
                            path,
                            async (req, res, next) => {
                                if (req.path !== path) return next();
                                await router(req, res, next);
                            }
                        );
                        this.addRoutes({
                            path,
                            method: HTTPMethods ,
                            router
                        })
                    }
                }
                routeCount++;
                console.log(`[Loader] Loaded : ${"stack" in router ? router.stack[0].route?.path : this.getRouterPath(route)}`);
                if (routeCount === routes.length) {
                    this.traseLog('[RRouter -> Route] All routes loaded.');
                    this.traseLog('[RRouter] Registering plugins...');
                    this.__plugins.forEach(plugin => {
                        this.traseLog(`[RRouter -> Plugin] Registering plugin: ${plugin.name}`);
                        //
                        // Beta : Promise based onUse
                        //
                        if (typeof plugin.onUse == "function") {
                            if (plugin.onUse instanceof Promise) {
                                // promisified onUse
                                app.use( async(...args) => {
                                    await plugin.onUse(...args);
                                });
                            }
                            else app.use(plugin.onUse);
                        }

                        if (typeof plugin.onServerError === "function") {
                            app.use(plugin.onServerError);
                        }

                        if (typeof plugin.onRegister === "function") plugin.onRegister();
                    });
                    this.__expressExtends.forEach(ext => {
                        this.traseLog(`[RRouter -> Extends] Registering extends...`);
                        app.use(ext);
                    });
                }
            })
        );

        this.traseLog('[RRouter -> start] Starting express...');
        app.listen(port, () => {
            this.traseLog(`[RRouter] Express started on port ${port}`);
            console.log(`[RRouter] server started at http://localhost:${port}`);
            this.__ready = true;
        });

        this.__app = app;
    }
}