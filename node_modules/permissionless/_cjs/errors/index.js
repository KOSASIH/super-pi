"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountNotFoundError = void 0;
const viem_1 = require("viem");
class AccountNotFoundError extends viem_1.BaseError {
    constructor({ docsPath } = {}) {
        super([
            "Could not find an Account to execute with this Action.",
            "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client."
        ].join("\n"), {
            docsPath,
            docsSlug: "account",
            name: "AccountNotFoundError"
        });
    }
}
exports.AccountNotFoundError = AccountNotFoundError;
//# sourceMappingURL=index.js.map