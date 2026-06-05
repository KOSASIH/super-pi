export declare function create(hashType: 'SHA1' | 'SHA256' | 'SHA512', secret: Uint8Array): Promise<{
    digest(data: Uint8Array): Promise<Uint8Array>;
    length: number;
}>;
//# sourceMappingURL=index-browser.d.ts.map