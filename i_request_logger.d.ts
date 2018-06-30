/// <reference types="node" />
import * as http from 'http';
export interface IRequestLogger {
    reqdebug(req: http.IncomingMessage, msg: string, ...subst: any[]): any;
    reqerror(req: http.IncomingMessage, msg: string | Error, ...subst: any[]): any;
    reqinfo(req: http.IncomingMessage, msg: string, ...subst: any[]): any;
    reqtrace(req: http.IncomingMessage, msg: string, ...subst: any[]): any;
    reqwarn(req: http.IncomingMessage, msg: string, ...subst: any[]): any;
}
