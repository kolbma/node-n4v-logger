# net4VISIONS node-n4v-logger class

This is an easy configurable (based on n4v-config) class extending the bunyan logger.
Supports logging of http.IncomingMessage kind requests.

## Features

- LogLevel configurable per Logger name
- Logging to files per Logger name (optional)
- Reopen logfiles per signal SIGINT to Node process
- Reload logger config per SIGINT
- HTTP request logging


## Configuration

Per default the logger configuration is found in a sub-object named 'log'.

``` TypeScript
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface ILogLevel {
  readonly level: LogLevel;
  readonly name: string;
  readonly stdoutlevel: LogLevel;
}

export interface ILoggerConfig extends IConfig {
  readonly logdir: string;
  readonly loglevelfiles?: LogLevel;
  readonly loglevels?: ILogLevel[];
  readonly loglevelstdout?: LogLevel;
  readonly logtofiles: boolean;
  readonly logtostdout?: boolean;
  readonly reopensigint?: boolean;
  readonly rereadconfigonsigint?: boolean;
}
```

Sample config:

```
{
  "log": {
    "logdir": "./test-output/",
    "loglevelfiles": "error",
    "loglevels": [{
        "level": "debug",
        "name": "testnotrace",
        "stdoutlevel": "error"
      },
      {
        "level": "debug",
        "name": "testdebug",
        "stdoutlevel": "error"
      },
      {
        "level": "debug",
        "name": "testinfodebug",
        "stdoutlevel": "error"
      },
      {
        "level": "info",
        "name": "testinfo",
        "stdoutlevel": "error"
      },
      {
        "level": "info",
        "name": "test/slash",
        "stdoutlevel": "error"
      },
      {
        "level": "info",
        "name": "test\\backslash",
        "stdoutlevel": "error"
      }
    ],
    "loglevelstdout": "error",
    "logtofiles": true,
    "logtostdout": true,
    "reopensigint": true,
    "rereadconfigonsigint": true
  }
}
```

## Usage

### TypeScript

``` TypeScript
import * as Logger from 'n4v-logger';

const cfgfile = './path/config.json';
const log = Logger.getLogger('test-logger', cfgfile);
const req: http.IncomingMessage;

log.reqinfo(req, 'Some message: %s', more);
```

### JavaScript

``` JavaScript
var Logger = require('n4v-logger');

var cfgfile = './path/config.json';
var log = Logger.getLogger('test-logger', cfgfile);
var req; // http.IncomingMessage;

log.reqinfo(req, 'Some message: %s', more);
```

### API

#### Logger

`Logger.getLogger(name: string, configfile?: string)`

#### Logger instance

Arguments ... can be starting with an error or an object or the format string with following params.

- .debug(...)
- .error(...)
- .info(...)
- .trace(...)
- .warn(...)
- .reqdebug(req, ...)
- .reqerror(req, ...)
- .reqinfo(req, ...)
- .reqtrace(req, ...)
- .reqwarn(req, ...)

And the other stuff from base bunyan logger.
