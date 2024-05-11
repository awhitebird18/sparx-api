import { Params } from 'nestjs-pino';
import { PrettyOptions } from 'pino-pretty';

const isProduction = process.env.NODE_ENV === 'production';

const pinoPrettyOptions: PrettyOptions = {
  colorize: !isProduction,
  singleLine: true,
  translateTime: 'yyyy-mm-dd HH:MM:ss.l',
  ignore: 'pid,hostname',
};

export const pinoConfig: Params = {
  pinoHttp: {
    transport: {
      targets: [
        {
          level: 'info',
          target: 'pino-pretty',
          options: pinoPrettyOptions,
        },
        {
          level: 'info',
          target: 'pino/file',
          options: {
            destination: '/var/log/app.log',
          },
        },
      ],
    },
    autoLogging: true,
    redact: ['req.headers.authorization'],
    serializers: {
      req: (req) => ({ url: req.url }),
      res: () => ({}),
    },
  },
};
