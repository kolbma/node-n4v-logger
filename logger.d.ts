import * as LoggerImpl from 'bunyan';
import { IExtLogger } from './i_ext_logger';
/**
 * Use extended getLogger(name: string, configfile?: string): IExtLogger
 */
export declare class Logger extends LoggerImpl {
    /**
     * Creates or returns a cached logger with name
     * @param name
     * @param configfile
     */
    static getLogger(name: string, configfile?: string): IExtLogger;
}
