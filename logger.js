"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var LoggerImpl = require("bunyan");
var logger_registry_1 = require("./logger_registry");
/**
 * Use extended getLogger(name: string, configfile?: string): IExtLogger
 */
var Logger = /** @class */ (function (_super) {
    __extends(Logger, _super);
    function Logger() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Creates or returns a cached logger with name
     * @param name
     * @param configfile
     */
    Logger.getLogger = function (name, configfile) {
        return logger_registry_1.LoggerRegistry.getOrCreateLogger(name, configfile);
    };
    return Logger;
}(LoggerImpl));
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map