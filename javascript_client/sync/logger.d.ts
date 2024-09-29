declare class Logger {
    isQuiet: boolean;
    constructor(isQuiet: boolean);
    log(...args: string[]): void;
    error(...args: string[]): void;
    colorize(color: string, text: string): string;
    red(text: string): string;
    green(text: string): string;
    bright(text: string): string;
}
export default Logger;
