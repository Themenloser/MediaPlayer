import { AppLog } from '../types';

class Logger {
  private logs: AppLog[] = [];
  private maxLogs: number = 1000;

  private createLog(level: AppLog['level'], message: string, context?: any): AppLog {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private addLog(log: AppLog): void {
    this.logs.push(log);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for development
    const consoleMessage = `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`;
    switch (log.level) {
      case 'error':
        console.error(consoleMessage, log.context);
        break;
      case 'warning':
        console.warn(consoleMessage, log.context);
        break;
      case 'info':
        console.info(consoleMessage, log.context);
        break;
      case 'debug':
        console.debug(consoleMessage, log.context);
        break;
    }
  }

  info(message: string, context?: any): void {
    const log = this.createLog('info', message, context);
    this.addLog(log);
  }

  warning(message: string, context?: any): void {
    const log = this.createLog('warning', message, context);
    this.addLog(log);
  }

  error(message: string, context?: any): void {
    const log = this.createLog('error', message, context);
    this.addLog(log);
  }

  debug(message: string, context?: any): void {
    const log = this.createLog('debug', message, context);
    this.addLog(log);
  }

  getLogs(): AppLog[] {
    return [...this.logs];
  }

  getLogsByLevel(level: AppLog['level']): AppLog[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared');
  }

  exportLogs(): string {
    const logData = {
      exportDate: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs,
    };
    return JSON.stringify(logData, null, 2);
  }

  getLogStats(): {
    total: number;
    info: number;
    warning: number;
    error: number;
    debug: number;
  } {
    const stats = {
      total: this.logs.length,
      info: 0,
      warning: 0,
      error: 0,
      debug: 0,
    };

    this.logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }
}

export const logger = new Logger();
export default Logger;
