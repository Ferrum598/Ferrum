declare module 'jsbarcode' {
    const JsBarcode: (
        element: SVGElement | string,
        text: string,
        options?: Record<string, unknown>,
    ) => void;
    export default JsBarcode;
}
