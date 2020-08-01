"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerRegistry = void 0;
var LoggerImpl = require("bunyan");
var fs = require("fs");
var n4v_config_1 = require("n4v-config");
/**
 * Registers all created loggers and handles logfile reopen on SIGINT for backup
 */
var LoggerRegistry = /** @class */ (function () {
    function LoggerRegistry() {
    }
    /**
     * Does the real work of creating or returning a cached logger for name.
     * Extends bunyan logger with req* methods for logging http.IncomingMessage kind requests.
     * @param name
     * @param configfile
     */
    LoggerRegistry.getOrCreateLogger = function (name, configfile) {
        for (var _i = 0, _a = LoggerRegistry.loggers; _i < _a.length; _i++) {
            var reglogger = _a[_i];
            if (reglogger[0] === name) {
                return reglogger[1];
            }
        }
        var cfg = n4v_config_1.Config.getCheckedInstance(LoggerRegistry.compareObject, configfile, LoggerRegistry.configSubkey);
        if ((cfg.reopensigint || cfg.rereadconfigonsigint) && !LoggerRegistry.enabledSigInt) {
            LoggerRegistry.enabledSigInt = true;
            process.on('SIGINT', function () {
                LoggerRegistry._signalHandler(cfg);
            });
        }
        var logstreams = [];
        var loglevel = LoggerRegistry.findLogLevel(name, cfg);
        if (cfg.logtostdout) {
            if (!process.stdout) {
                throw new Error('<stdout> is undefined');
            }
            logstreams.push({ name: 'stdout', stream: process.stdout, level: loglevel.stdoutlevel });
        }
        if (cfg.logtofiles) {
            var logdir = cfg.logdir || './logs';
            try {
                // const stlogdir = fs.statSync(logdir);
                fs.statSync(logdir);
            }
            catch (err) {
                if (err.code && err.code === 'ENOENT') {
                    fs.mkdirSync(logdir);
                }
            }
            var fname = name.replace('/', '_').replace('\\', '_').replace('.', '_');
            logstreams.push({
                level: loglevel.level,
                name: name,
                stream: fs.createWriteStream(logdir + '/' + fname + '.log', { flags: 'a' }),
            });
        }
        var logger = LoggerImpl.createLogger({ name: name, stream: undefined, streams: logstreams });
        logger.log = function (msg) {
            var subst = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                subst[_i - 1] = arguments[_i];
            }
            logger.debug(msg, subst);
        };
        logger.reqtrace = function (req, msg) {
            var subst = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                subst[_i - 2] = arguments[_i];
            }
            logger.trace.apply(logger, __spreadArrays([LoggerRegistry.parseRequest(req, true), msg], subst));
        };
        logger.reqdebug = function (req, msg) {
            var subst = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                subst[_i - 2] = arguments[_i];
            }
            logger.debug.apply(logger, __spreadArrays([LoggerRegistry.parseRequest(req, true), msg], subst));
        };
        logger.reqinfo = function (req, msg) {
            var subst = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                subst[_i - 2] = arguments[_i];
            }
            logger.info.apply(logger, __spreadArrays([LoggerRegistry.parseRequest(req), msg], subst));
        };
        logger.reqwarn = function (req, msg) {
            var subst = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                subst[_i - 2] = arguments[_i];
            }
            logger.warn.apply(logger, __spreadArrays([LoggerRegistry.parseRequest(req), msg], subst));
        };
        logger.reqerror = function (req, msg) {
            var subst = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                subst[_i - 2] = arguments[_i];
            }
            logger.error.apply(logger, __spreadArrays([LoggerRegistry.parseRequest(req), msg], subst));
        };
        LoggerRegistry.loggers.push([name, logger]);
        return logger;
    };
    /**
     * Lookup loglevel for logger in config
     * @param name
     * @param config
     */
    LoggerRegistry.findLogLevel = function (name, config) {
        var levels = config.loglevels;
        var stdoutlevel = config.loglevelstdout || 'info';
        var fileslevel = config.loglevelfiles || 'info';
        if (!levels) {
            return { name: name, stdoutlevel: stdoutlevel, level: fileslevel };
        }
        for (var _i = 0, levels_1 = levels; _i < levels_1.length; _i++) {
            var lvl = levels_1[_i];
            if (lvl.name === name) {
                return lvl;
            }
        }
        return { name: name, stdoutlevel: stdoutlevel, level: fileslevel };
    };
    /**
     * Puts properties of request in the logfile object
     * @param req
     * @param complete
     */
    LoggerRegistry.parseRequest = function (req, complete) {
        if (complete === void 0) { complete = false; }
        var reqObj = {};
        if (req.getId) {
            reqObj.req_id = req.getId();
        }
        reqObj.remoteAddress = req.connection.remoteAddress;
        reqObj.remotePort = req.connection.remotePort;
        if (req.headers && req.headers.content_length) {
            reqObj.content_length = req.headers.content_length;
        }
        if (req.url) {
            reqObj.url = req.url;
        }
        if (complete) {
            for (var _i = 0, _a = Object.keys(req); _i < _a.length; _i++) {
                var key = _a[_i];
                if (typeof req[key] !== 'function') {
                    reqObj[key] = req[key];
                }
            }
        }
        return reqObj;
    };
    LoggerRegistry._signalHandler = function (cfg) {
        if (cfg.rereadconfigonsigint) {
            for (var _i = 0, _a = LoggerRegistry.loggers; _i < _a.length; _i++) {
                var reglogger = _a[_i];
                reglogger[1].debug('Shutdown logger %s', reglogger[0]);
                delete reglogger[0];
                delete reglogger[1];
            }
            LoggerRegistry.loggers = [];
        }
        else {
            for (var _b = 0, _c = LoggerRegistry.loggers; _b < _c.length; _b++) {
                var reglogger = _c[_b];
                reglogger[1].debug('Reopening log stream for %s', reglogger[0]);
                reglogger[1].reopenFileStreams();
                reglogger[1].info('Reopened log stream for %s', reglogger[0]);
            }
        }
    };
    /**
     * the key in configuration to store the ILoggerConfig
     */
    LoggerRegistry.configSubkey = 'log';
    /**
     * Object for validation of config
     */
    LoggerRegistry.compareObject = {
        logdir: '',
        loglevelfiles: 'debug',
        loglevels: [],
        loglevelstdout: 'debug',
        logtofiles: false,
        logtostdout: false,
        reopensigint: false,
        rereadconfigonsigint: false
    };
    LoggerRegistry.loggers = [];
    LoggerRegistry.enabledSigInt = false;
    return LoggerRegistry;
}());
exports.LoggerRegistry = LoggerRegistry;
//# sourceMappingURL=logger_registry.js.map