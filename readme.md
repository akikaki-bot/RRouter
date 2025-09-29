# RRouter

An extension framework for Express.js that provides type-safe request and response handling.

# Usage

```ts
import { RRouter } from "rrouter"

const rrouter = new RRouter()

rrouter.configure({
    dirname : __dirname,
    useJson : true
})

rrouter.use({
    name : "404/500 handler",
    version : "0.0.1",
    onUse( req, res, next ){
        res.status(404).json({
            message: 'Not found.'
        })
    },
    onServerError( err, req, res, next ){
        res.status(500).json({
            message: 'Internal server error.'
        })
    }
})

rrouter.listen( 3000 );
```

on router/index.ts :

```ts
import { IRRouterRouter, IRRouterRouterConfig } from "rrouter/types";

const app : IRRouterRouter<{ message : string }> = async ( req , res ) => {
    res.json({
        message : "hello world!"
    });
}

export const config : IRRouterRouterConfig = {
    method : ["GET", "POST"]
}
```

You can also use a express router:

```ts
import { Router } from "express"

const router = Router();

router.get('/', async ( req, res ) => {
    res.status(200).json({
        message : "hello world!"
    })
})

export default router
```

# Validation request

You can add validator in router, also can configurate custom validator error.

```ts
import z from "zod"
import { IRRouterRouter, IRRouterRouterConfig } from "rrouter/types";

export const vaildator = z.object({
    name : z.string().min(3).max(255)
})

export const config : IRRouterRouterConfig = {
    method : [ "POST" ]
}
type VaildatorType = z.infer<typeof vaildator>;
interface ResponseBody {
    message : string;
}

// type-safe Router generics
const router : IRRouterRouter<ResponseBody, VaildatorType> = async ( req, res ) => {
    res.send({
         message : req.body.name
    });
}

export default router;
```

configurate in main file:
```ts
rrouter.use({
    name : "onVaildatorError",
    version : "0.0.1",
    onUse( req, res, next, err ){
        res.status(400).json({
            message: 'Vaildator error.',
            errBody: err
        })
    }
})
```








