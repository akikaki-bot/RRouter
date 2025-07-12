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

import {
    RRouterVaildatorExtends
} from "../../validator"
import { z } from 'zod';

export class RRouter {

    private __plugins: IRRouterPluginCore[] = [];
    private __expressExtends: Express.RequestHandler[] = [];
    private __isDev: boolean = false;
    private dirname: string = __dirname;
    private __vaildator: boolean = false;

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
        if (config.enableValidator) {
            this.__vaildator = true
        }
    }

    protected traseLog(message: string) {
        if (this.__isDev) {
            if (typeof message === "string") console.log(message);
            else console.dir(message, { depth: null });
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

    /**
     * Start the RRouter Server.
     * @param {number} port the port to use.
     */
    public start(
        port: number = 3000,
    ) {
        const app = Express();

        this.traseLog('[RRouter] Starting...');

        app.use((req, res, next) => {
            res.setHeader("X-Powered-By", "RRouter");
            next();
        });


        this.__expressExtends.forEach(ext => {
            this.traseLog(`[RRouter -> Extends] Registering extends...`);
            app.use(ext);
        });

        const directory = new RouterDirectory(this.dirname);
        const routes = directory.getRoutes();
        let routeCount = 0;

        routes.map(async route => {
            const router = (await import(route)).default as Router | IRRouterRouter | void;
            const vaildator = (await import(route)).vaildator as z.AnyZodObject | undefined;

            if (typeof router === "undefined" || !router || typeof router !== "function") {
                this.traseLog(`[RRouter -> Route] Invalid route: ${route}`);
                routes.splice(routes.indexOf(route), 1);
                return;
            }
            if (this.__vaildator && typeof vaildator !== "undefined") {
                if (typeof vaildator === "undefined") {
                    this.traseLog(`[RRouter -> Route] Vaildator not found: ${route}`);
                    return;
                }
                const routerConfig = (await import(route)).config as IRRouterRouterConfig || undefined;
                const path = this.getRouterPath(route);

                if (typeof routerConfig !== "undefined") {
                    if ("method" in routerConfig) {
                        app.use(async (req, res, next) => {
                            this.traseLog(`${req.method} : ${req.path} -> ${path}`);
                            if (req.path !== path) return next();
                            if (routerConfig.method.includes(req.method.toUpperCase() as HTTPMethod)) {
                                if (req.method === "GET") {
                                    next();
                                    return;
                                }

                                console.log(`[RRouter -> Route] Vaildator found: ${route} Parsing : ${req.body}`);
                                const result = RRouterVaildatorExtends<typeof vaildator>(req.body, vaildator);
                                if (result.success === "false") {
                                    if (typeof this.__plugins.find(p => p.name === "onVaildatorError") !== "undefined") {
                                        this.__plugins.find(p => p.name === "onVaildatorError")?.onUse(req, res, next, result);
                                    } else {
                                        res.status(400).json({
                                            message: 'Vaildation error.',
                                            error: result.error
                                        })
                                    }
                                }
                                else {
                                    req.body = result.data;
                                    await router(req, res as Express.Response<typeof vaildator>, next);
                                }
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

                            // If the method is GET, skip the vaildator.
                            // Because the GET method doesn't have a body.
                            if (req.method === "GET") {
                                next();
                                return;
                            }
                            const result = RRouterVaildatorExtends<typeof vaildator>(req.body, vaildator);
                            if (result.success === "false") {
                                if (typeof this.__plugins.find(p => p.name === "onVaildatorError") !== "undefined") {
                                    this.__plugins.find(p => p.name === "onVaildatorError")?.onUse(req, res, next, result);
                                } else {
                                    res.status(400).json({
                                        message: 'Vaildation error.',
                                        error: result.error
                                    })
                                }
                            }
                            else {
                                req.body = result.data;
                                await router(req, res as Express.Response<typeof vaildator>, next);
                            }
                        }
                    );
                }
            }
            if ("stack" in router) {
                app.use(router);
            }
            else {
                const routerConfig = (await import(route)).config as IRRouterRouterConfig || undefined;
                const path = this.getRouterPath(route);
                this.traseLog(`[Loader] GET : ${path}`);
                if (typeof routerConfig !== "undefined") {
                    if ("method" in routerConfig) {
                        app.use(async (req, res, next) => {
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
                            app.use(plugin.onUse);
                        }
                        else app.use(plugin.onUse);
                    }

                    if (typeof plugin.onServerError === "function") {
                        app.use(plugin.onServerError);
                    }

                    if (typeof plugin.onRegister === "function") plugin.onRegister();
                });
            }
        })

        this.traseLog('[RRouter -> start] Starting express...');
        app.listen(port, () => {
            this.traseLog(`[RRouter] Express started on port ${port}`);
            console.log(`[RRouter] server started at http://localhost:${port}`);
            this.__ready = true;
        });

        this.__app = app;
    }
}