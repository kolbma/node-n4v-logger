import { IConfig } from 'n4v-config';
export declare type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';
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
