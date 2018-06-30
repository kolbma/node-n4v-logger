import * as LoggerImpl from 'bunyan';
import * as fs from 'fs';
import * as http from 'http';
import { Config } from 'n4v-config';
import { IExtLogger } from './i_ext_logger';
import { ILoggerConfig, ILogLevel } from './i_logger_config';

/**
 * Registers all created loggers and handles logfile reopen on SIGINT for backup
 */
export class LoggerRegistry {
  /**
   * the key in configuration to store the ILoggerConfig
   */
  static readonly configSubkey = 'log';

  /**
   * Object for validation of config
   */
  static readonly compareObject: ILoggerConfig = {
    logdir: '',
    loglevelfiles: 'debug',
    loglevels: [],
    loglevelstdout: 'debug',
    logtofiles: false,
    logtostdout: false,
    reopensigint: false,
    rereadconfigonsigint: false
  };

  /**
   * Does the real work of creating or returning a cached logger for name.
   * Extends bunyan logger with req* methods for logging http.IncomingMessage kind requests.
   * @param name
   * @param configfile
   */
  static getOrCreateLogger(name: string, configfile?: string): IExtLogger {
    for (const reglogger of LoggerRegistry.loggers) {
      if (reglogger[0] === name) {
        return reglogger[1];
      }
    }
    const cfg = Config.getCheckedInstance<ILoggerConfig>(LoggerRegistry.compareObject, configfile, LoggerRegistry.configSubkey);
    if ((cfg.reopensigint || cfg.rereadconfigonsigint) && !LoggerRegistry.enabledSigInt) {
      LoggerRegistry.enabledSigInt = true;
      process.on('SIGINT', () => {
        LoggerRegistry._signalHandler(cfg);
      });
    }
    const logstreams: any = [];
    const loglevel = LoggerRegistry.findLogLevel(name, cfg);
    if (cfg.logtostdout) {
      if (!process.stdout) {
        throw new Error('<stdout> is undefined');
      }
      logstreams.push({ name: 'stdout', stream: process.stdout, level: loglevel.stdoutlevel });
    }
    if (cfg.logtofiles) {
      const logdir = cfg.logdir || './logs';
      try {
        // const stlogdir = fs.statSync(logdir);
        fs.statSync(logdir);
      } catch (err) {
        if (err.code && err.code === 'ENOENT') {
          fs.mkdirSync(logdir);
        }
      }
      const fname = name.replace('/', '_').replace('\\', '_').replace('.', '_');
      logstreams.push({
        level: loglevel.level,
        name,
        stream: fs.createWriteStream(logdir + '/' + fname + '.log', { flags: 'a' }) as LoggerImpl.Stream,
      });
    }
    const logger: IExtLogger = (LoggerImpl.createLogger({ name, stream: undefined, streams: logstreams }) as IExtLogger);
    logger.log = (msg: string, ...subst) => {
      logger.debug(msg, subst);
    };
    logger.reqtrace = (req: http.IncomingMessage, msg: string, ...subst) => {
      logger.trace(LoggerRegistry.parseRequest(req, true), msg, ...subst);
    };
    logger.reqdebug = (req: http.IncomingMessage, msg: string, ...subst) => {
      logger.debug(LoggerRegistry.parseRequest(req, true), msg, ...subst);
    };
    logger.reqinfo = (req: http.IncomingMessage, msg: string, ...subst) => {
      logger.info(LoggerRegistry.parseRequest(req), msg, ...subst);
    };
    logger.reqwarn = (req: http.IncomingMessage, msg: string, ...subst) => {
      logger.warn(LoggerRegistry.parseRequest(req), msg, ...subst);
    };
    logger.reqerror = (req: http.IncomingMessage, msg: string | Error, ...subst) => {
      logger.error(LoggerRegistry.parseRequest(req), msg, ...subst);
    };
    LoggerRegistry.loggers.push([name, logger]);
    return logger;
  }

  /**
   * Lookup loglevel for logger in config
   * @param name
   * @param config
   */
  protected static findLogLevel(name: string, config: ILoggerConfig): ILogLevel {
    const levels = config.loglevels;
    const stdoutlevel = config.loglevelstdout || 'info';
    const fileslevel = config.loglevelfiles || 'info';
    if (!levels) {
      return { name, stdoutlevel, level: fileslevel };
    }
    for (const lvl of levels) {
      if (lvl.name === name) {
        return lvl;
      }
    }
    return { name, stdoutlevel, level: fileslevel };
  }

  /**
   * Puts properties of request in the logfile object
   * @param req
   * @param complete
   */
  protected static parseRequest(req: http.IncomingMessage, complete: boolean = false): object {
    const reqObj: any = {};
    if ((req as any).getId) {
      reqObj.req_id = (req as any).getId();
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
      for (const key of Object.keys(req)) {
        if (typeof req[key] !== 'function') {
          reqObj[key] = req[key];
        }
      }
    }
    return reqObj;
  }

  protected static _signalHandler(cfg: ILoggerConfig) {
    if (cfg.rereadconfigonsigint) {
      for (const reglogger of LoggerRegistry.loggers) {
        reglogger[1].debug('Shutdown logger %s', reglogger[0]);
        delete reglogger[0];
        delete reglogger[1];
      }
      LoggerRegistry.loggers = [];
    } else {
      for (const reglogger of LoggerRegistry.loggers) {
        reglogger[1].debug('Reopening log stream for %s', reglogger[0]);
        reglogger[1].reopenFileStreams();
        reglogger[1].info('Reopened log stream for %s', reglogger[0]);
      }
    }
  }

  private static loggers: Array<[string, IExtLogger]> = [];
  private static enabledSigInt = false;

  private constructor() { }
}
