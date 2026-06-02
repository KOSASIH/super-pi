import { type Chain, type Client, type Transport } from "viem";
import type { GetSmartAccountParameter, SmartAccount } from "viem/account-abstraction";
export declare function accountId<TSmartAccount extends SmartAccount | undefined>(client: Client<Transport, Chain | undefined, TSmartAccount>, args?: GetSmartAccountParameter<TSmartAccount>): Promise<string>;
//# sourceMappingURL=accountId.d.ts.map