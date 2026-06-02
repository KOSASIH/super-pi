import { accountId } from "./erc7579/accountId.js";
import { installModule } from "./erc7579/installModule.js";
import { installModules } from "./erc7579/installModules.js";
import { isModuleInstalled } from "./erc7579/isModuleInstalled.js";
import { supportsExecutionMode } from "./erc7579/supportsExecutionMode.js";
import { supportsModule } from "./erc7579/supportsModule.js";
import { uninstallModule } from "./erc7579/uninstallModule.js";
import { uninstallModules } from "./erc7579/uninstallModules.js";
export { accountId, installModule, installModules, isModuleInstalled, supportsExecutionMode, supportsModule, uninstallModule, uninstallModules };
export function erc7579Actions() {
    return (client) => ({
        accountId: (args) => accountId(client, args),
        installModule: (args) => installModule(client, args),
        installModules: (args) => installModules(client, args),
        isModuleInstalled: (args) => isModuleInstalled(client, args),
        supportsExecutionMode: (args) => supportsExecutionMode(client, args),
        supportsModule: (args) => supportsModule(client, args),
        uninstallModule: (args) => uninstallModule(client, args),
        uninstallModules: (args) => uninstallModules(client, args)
    });
}
//# sourceMappingURL=erc7579.js.map