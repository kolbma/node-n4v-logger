import { IConsoleLog } from './i_console_log';
import { IRequestLogger } from './i_request_logger';
import { Logger } from './logger';

export interface IExtLogger extends IConsoleLog, IRequestLogger, Logger {
}
