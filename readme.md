

# RRouter

This framework is work in progress.

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






