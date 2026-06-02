import { type Multiaddr } from '@multiformats/multiaddr';
export declare const Errors: {
    ERR_INVALID_IP_PARAMETER: string;
    ERR_INVALID_PORT_PARAMETER: string;
    ERR_INVALID_IP: string;
};
/**
 * Transform an IP, Port pair into a multiaddr
 */
export declare function ipPortToMultiaddr(ip: string, port: number | string): Multiaddr;
//# sourceMappingURL=ip-port-to-multiaddr.d.ts.map