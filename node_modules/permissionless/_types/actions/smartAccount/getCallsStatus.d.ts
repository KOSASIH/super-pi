import type { Chain, Client, GetCallsStatusParameters, GetCallsStatusReturnType, Transport } from "viem";
import { type SmartAccount } from "viem/account-abstraction";
export declare function getCallsStatus<account extends SmartAccount | undefined, chain extends Chain | undefined>(client: Client<Transport, chain, account>, args: GetCallsStatusParameters): Promise<GetCallsStatusReturnType>;
//# sourceMappingURL=getCallsStatus.d.ts.map