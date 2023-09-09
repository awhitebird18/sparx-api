import { Params } from 'nestjs-pino';
import { PrettyOptions } from 'pino-pretty';

const isProduction = process.env.NODE_ENV === 'production';

const pinoPrettyOptions: PrettyOptions = {
  colorize: !isProduction, // Only colorize in development
  singleLine: true,
  translateTime: 'yyyy-mm-dd HH:MM:ss.l', // Make timestamp more readable
  ignore: 'pid,hostname', // If you don't want to display the process id and hostname (optional)
  levelLabel: 'level',
};

export const pinoConfig: Params = {
  pinoHttp: {
    customProps: (req, res) => ({
      context: 'HTTP',
    }),
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
            destination: '/var/logs/app.log',
          },
        },
      ],
    },
    autoLogging: true, // Enable auto logging globally
    redact: ['req.headers.authorization'], // Redact auth headers
    serializers: {
      req: (req) => ({ url: req.url }),
      res: () => ({}),
    },
  },
};
