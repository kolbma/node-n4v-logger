/// <reference types="node" />
import * as http from 'http';
import { IExtLogger } from './i_ext_logger';
import { ILoggerConfig, ILogLevel } from './i_logger_config';
/**
 * Registers all created loggers and handles logfile reopen on SIGINT for backup
 */
export declare class LoggerRegistry {
    /**
     * the key in configuration to store the ILoggerConfig
     */
    static readonly configSubkey = "log";
    /**
     * Object for validation of config
     */
    static readonly compareObject: ILoggerConfig;
    /**
     * Does the real work of creating or returning a cached logger for name.
     * Extends bunyan logger with req* methods for logging http.IncomingMessage kind requests.
     * @param name
     * @param configfile
     */
    static getOrCreateLogger(name: string, configfile?: string): IExtLogger;
    /**
     * Lookup loglevel for logger in config
     * @param name
     * @param config
     */
    protected static findLogLevel(name: string, config: ILoggerConfig): ILogLevel;
    /**
     * Puts properties of request in the logfile object
     * @param req
     * @param complete
     */
    protected static parseRequest(req: http.IncomingMessage, complete?: boolean): object;
    protected static _signalHandler(cfg: ILoggerConfig): void;
    private static loggers;
    private static enabledSigInt;
    private constructor();
}
