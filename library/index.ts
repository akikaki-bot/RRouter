import { RRouter } from "./core"

export {
    RRouter,
    HTTPMethods
} from "./core"

export {
    CantRegisterError,
    CantResolveError,
    IRRouterConfig,
    IRRouterPlugin,
    IRRouterPluginCore,
    onUseFunction,
    onUseErrorFunction,
    IRRouterRouter,
    HTTPMethod,
    IRRouterRouterConfig,
} from "./types"

// for Legacy support
module.exports = RRouter
module.exports.default = RRouter