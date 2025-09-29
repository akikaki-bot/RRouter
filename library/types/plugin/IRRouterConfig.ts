
export type IRRouterConfig = Partial<__IRRouterConfig>;
export interface __IRRouterConfig {
    /**
     * @description
     * Enable the development mode.
     */
    isDev : boolean;
    useJsonMode : boolean;
    useCors : boolean;
    useUrlEncoded : boolean;
    dirname : string;
    OVERRIDE_HTTP_METHOD: boolean
    // useCookieParser : boolean;
    // useBodyParser : boolean;
    // useSession : boolean;
    // useStatic : boolean;
    // useHelmet : boolean;
    // useCompression : boolean;
    // useMorgan : boolean;
    // useMulter : boolean;
    // usePassport : boolean;
    // useExpressValidator : boolean;
    // useExpressSession : boolean;
    // useExpressFlash : boolean;
    // useExpressValidatorCustom : boolean;
    // useExpressValidatorSanitizer : boolean;
    // useExpressValidatorSchema : boolean;
    // useExpressValidatorSchemaCustom : boolean;
    // useExpressValidatorSchemaSanitizer : boolean;
    // useExpressValidatorSchemaCustomSanitizer : boolean;
}