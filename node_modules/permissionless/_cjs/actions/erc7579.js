"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uninstallModules = exports.uninstallModule = exports.supportsModule = exports.supportsExecutionMode = exports.isModuleInstalled = exports.installModules = exports.installModule = exports.accountId = void 0;
exports.erc7579Actions = erc7579Actions;
const accountId_js_1 = require("./erc7579/accountId.js");
Object.defineProperty(exports, "accountId", { enumerable: true, get: function () { return accountId_js_1.accountId; } });
const installModule_js_1 = require("./erc7579/installModule.js");
Object.defineProperty(exports, "installModule", { enumerable: true, get: function () { return installModule_js_1.installModule; } });
const installModules_js_1 = require("./erc7579/installModules.js");
Object.defineProperty(exports, "installModules", { enumerable: true, get: function () { return installModules_js_1.installModules; } });
const isModuleInstalled_js_1 = require("./erc7579/isModuleInstalled.js");
Object.defineProperty(exports, "isModuleInstalled", { enumerable: true, get: function () { return isModuleInstalled_js_1.isModuleInstalled; } });
const supportsExecutionMode_js_1 = require("./erc7579/supportsExecutionMode.js");
Object.defineProperty(exports, "supportsExecutionMode", { enumerable: true, get: function () { return supportsExecutionMode_js_1.supportsExecutionMode; } });
const supportsModule_js_1 = require("./erc7579/supportsModule.js");
Object.defineProperty(exports, "supportsModule", { enumerable: true, get: function () { return supportsModule_js_1.supportsModule; } });
const uninstallModule_js_1 = require("./erc7579/uninstallModule.js");
Object.defineProperty(exports, "uninstallModule", { enumerable: true, get: function () { return uninstallModule_js_1.uninstallModule; } });
const uninstallModules_js_1 = require("./erc7579/uninstallModules.js");
Object.defineProperty(exports, "uninstallModules", { enumerable: true, get: function () { return uninstallModules_js_1.uninstallModules; } });
function erc7579Actions() {
    return (client) => ({
        accountId: (args) => (0, accountId_js_1.accountId)(client, args),
        installModule: (args) => (0, installModule_js_1.installModule)(client, args),
        installModules: (args) => (0, installModules_js_1.installModules)(client, args),
        isModuleInstalled: (args) => (0, isModuleInstalled_js_1.isModuleInstalled)(client, args),
        supportsExecutionMode: (args) => (0, supportsExecutionMode_js_1.supportsExecutionMode)(client, args),
        supportsModule: (args) => (0, supportsModule_js_1.supportsModule)(client, args),
        uninstallModule: (args) => (0, uninstallModule_js_1.uninstallModule)(client, args),
        uninstallModules: (args) => (0, uninstallModules_js_1.uninstallModules)(client, args)
    });
}
//# sourceMappingURL=erc7579.js.map