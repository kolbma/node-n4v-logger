import * as http from 'http';

export interface IRequestLogger {
  reqdebug(req: http.IncomingMessage, msg: string, ...subst);
  reqerror(req: http.IncomingMessage, msg: string | Error, ...subst);
  reqinfo(req: http.IncomingMessage, msg: string, ...subst);
  reqtrace(req: http.IncomingMessage, msg: string, ...subst);
  reqwarn(req: http.IncomingMessage, msg: string, ...subst);
}
