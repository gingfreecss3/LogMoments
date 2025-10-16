/**
 * Production-ready logger that only logs in development
 * and can be extended to send logs to monitoring services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  isDevelopment: boolean;
  enableRemoteLogging?: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      isDevelopment: import.meta.env.DEV,
      enableRemoteLogging: false,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log errors
    if (level === 'error') return true;
    // Only log other levels in development
    return this.config.isDevelopment;
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'error':
        console.error(prefix, ...args);
        // In production, send to monitoring service
        if (!this.config.isDevelopment && this.config.enableRemoteLogging) {
          this.sendToRemoteService('error', args);
        }
        break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private sendToRemoteService(_level: LogLevel, _args: unknown[]): void {
    // TODO: Implement remote logging service integration
    // Example: Sentry, LogRocket, or custom analytics
  }

  debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  error(...args: unknown[]): void {
    this.log('error', ...args);
  }
}

export const logger = new Logger();
