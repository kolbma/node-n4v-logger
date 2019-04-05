import * as fs from 'fs';
import 'jasmine';
import { Config } from 'n4v-config';
import { Logger } from '../index';
import { ILoggerConfig } from '../index';
import { LoggerRegistry } from '../logger_registry';

const cfgfile = './test/config.json';
const cfgfile2 = './test/config2.json';

function fileExists(name: string, log: Logger): boolean {
  if (!fs.existsSync('./test-output/' + name + '.log')) {
    return false;
  }
  const s = fs.statSync('./test-output/' + name + '.log').size;
  // console.log('size: %d', s);
  return s > 0;
}

function looplog(logfn, n, cb, ...args) {
  for (let i = 0; i < n; i++) {
    const rnd = Math.floor(Math.random() * Math.floor(n));
    logfn(...args, rnd);
  }
  setTimeout(() => { cb(); }, 200);
}

describe('logger', () => {

  beforeAll(() => {
    for (const name of ['error', 'nofile', 'testnotrace', 'testdebug',
      'testinfodebug', 'testinfo', 'test_slash', 'test_backslash', 'teststdout',
      'sigint']) {
      try {
        fs.unlinkSync('./test-output/' + name + '.log');
      } catch (err) { }
    }
    try {
      fs.unlinkSync('./test-output');
    } catch (err) { }
  });

  it('is static', () => {
    const log = Logger.getLogger('test-logger', cfgfile);
    const log2 = Logger.getLogger('test-logger', cfgfile);
    const log3 = Logger.getLogger('test-logger3', cfgfile);
    expect(log).toEqual(log2);
    expect(log).not.toEqual(log3);
  });

  it('logs', () => {
    const log = Logger.getLogger('test-logger', cfgfile);
    log.log('log');
    log.trace('trace');
    log.debug('debug');
    log.info('info');
    log.warn('warn');
    log.error('error');
    const req = { getId: () => 999, connection: { remoteAddress: '127.0.0.1', remotePort: 12345 } };
    log.reqtrace(req as any, 'trace');
    log.reqdebug(req as any, 'debug');
    log.reqinfo(req as any, 'info');
    log.reqwarn(req as any, 'warn');
    log.reqerror(req as any, 'error');
  });

  it('logs content_length', () => {
    const log = Logger.getLogger('test-logger', cfgfile);
    const req = { getId: () => 999, connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, headers: { content_length: 100 } };
    log.reqtrace(req as any, 'trace');
    log.reqinfo(req as any, 'info');
  });

  it('logs url', () => {
    const log = Logger.getLogger('test-logger', cfgfile);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    log.reqtrace(req as any, 'trace');
    log.reqinfo(req as any, 'info');
  });

  it('logs multiple args', () => {
    const log = Logger.getLogger('test-logger', cfgfile);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    log.reqtrace(req as any, 'trace %s %d', 'more', 2);
    log.reqinfo(req as any, 'info %s %d', 'more', 2);
    log.trace('trace %s %d', 'more', 2);
    log.info('info %s %d', 'more', 2);
  });

  it('logs not to files', (done) => {
    const log = Logger.getLogger('nofile', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    log.reqtrace(req as any, 'trace %s %d', 'more', 2);
    log.reqdebug(req as any, 'debug %s %d', 'more', 2);
    log.reqinfo(req as any, 'info %s %d', 'more', 2);
    log.reqwarn(req as any, 'warn %s %d', 'more', 2);
    log.trace('trace %s %d', 'more', 2);
    log.info('info %s %d', 'more', 2);
    log.trace('debug %s %d', 'more', 2);
    log.warn('warn %s %d', 'more', 2);
    looplog(log.reqwarn,
      100,
      () => {
        expect(fileExists('nofile', log)).toBeFalsy();
        done();
      },
      req as any,
      'warn %s %d %d', 'more', 2);
  });

  it('logs to error file', (done) => {
    const log = Logger.getLogger('error', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    log.reqtrace(req as any, 'trace %s %d', 'more', 2);
    log.reqdebug(req as any, 'debug %s %d', 'more', 2);
    log.reqinfo(req as any, 'info %s %d', 'more', 2);
    log.reqwarn(req as any, 'warn %s %d', 'more', 2);
    log.trace('trace %s %d', 'more', 2);
    log.info('info %s %d', 'more', 2);
    log.trace('debug %s %d', 'more', 2);
    log.warn('warn %s %d', 'more', 2);
    log.reqerror(req as any, 'error %s %d', 'more', 2);
    log.error('error %s %d', 'more', 2);
    looplog(log.reqerror,
      100,
      () => {
        expect(fileExists('error', log)).toBeTruthy();
        done();
      },
      req as any,
      'error %s %d %d', 'more', 2);
  });

  it('logs trace not to debug file', (done) => {
    const log = Logger.getLogger('testnotrace', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    looplog(log.reqtrace,
      100,
      () => {
        expect(fileExists('testnotrace', log)).toBeFalsy();
        done();
      },
      req as any,
      'trace %s %d %d', 'more', 2);
  });

  it('logs debug to debug file', (done) => {
    const log = Logger.getLogger('testdebug', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    looplog(log.reqdebug,
      100,
      () => {
        expect(fileExists('testdebug', log)).toBeTruthy();
        done();
      },
      req as any,
      'debug %s %d %d', 'more', 2);
  });

  it('logs info to infodebug file', (done) => {
    const log = Logger.getLogger('testinfodebug', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    looplog(log.reqinfo,
      100,
      () => {
        expect(fileExists('testinfodebug', log)).toBeTruthy();
        done();
      },
      req as any,
      'info %s %d %d', 'more', 2);
  });

  it('logs error to info file', (done) => {
    const log = Logger.getLogger('testinfo', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    looplog(log.reqerror,
      100,
      () => {
        expect(fileExists('testinfo', log)).toBeTruthy();
        done();
      },
      req as any,
      'error %s %d %d', 'more', 2);
  });

  it('logs to replaced slash file', (done) => {
    const log = Logger.getLogger('test/slash', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    looplog(log.reqinfo,
      100,
      () => {
        expect(fileExists('test/slash', log)).toBeFalsy();
        expect(fileExists('test_slash', log)).toBeTruthy();
        done();
      },
      req as any,
      'info %s %d %d', 'more', 2);
  });

  it('logs to replaced backslash file', (done) => {
    const log = Logger.getLogger('test\\backslash', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    looplog(log.reqinfo,
      100,
      () => {
        expect(fileExists('test\\backslash', log)).toBeFalsy();
        expect(fileExists('test_backslash', log)).toBeTruthy();
        done();
      },
      req as any,
      'info %s %d %d', 'more', 2);
  });

  it('checks signalHandler 1', (done) => {
    const log = Logger.getLogger('testinfodebug', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    const cfg = Config.getCheckedInstance<ILoggerConfig>(LoggerRegistry.compareObject, cfgfile2, LoggerRegistry.configSubkey);
    looplog(log.reqinfo,
      2,
      () => {
        (LoggerRegistry as any)._signalHandler(cfg);
        done();
      },
      req as any,
      'info %s %d %d', 'more', 2);
  });

  it('checks signalHandler 2', (done) => {
    const cfg = Config.getCheckedInstance<ILoggerConfig>(LoggerRegistry.compareObject, cfgfile2, LoggerRegistry.configSubkey);
    (cfg as any).rereadconfigonsigint = false;
    const log = Logger.getLogger('testinfodebug', cfgfile2);
    const req = { connection: { remoteAddress: '127.0.0.1', remotePort: 12345 }, url: '/testurl' };
    looplog(log.reqinfo,
      2,
      () => {
        (LoggerRegistry as any)._signalHandler(cfg);
        done();
      },
      req as any,
      'info %s %d %d', 'more', 2);
  });

  xit('throws error on missing stdout', () => {
    const stdout = process.stdout;
    process.stdout = null;
    try {
      const log = Logger.getLogger('teststdout', cfgfile2);
      fail('should throw Error');
    } catch (err) {
      process.stdout = stdout;
      expect(err).toBeDefined();
      expect(err.message).toEqual('<stdout> is undefined');
    }
    process.stdout = stdout;
  });

  xit('handles SIGINT', () => {
    const log = Logger.getLogger('sigint', cfgfile2);
    process.kill(process.pid, 'SIGINT');
  });

});
