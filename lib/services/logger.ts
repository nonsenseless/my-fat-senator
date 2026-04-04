import { promises as fs } from 'node:fs';
import { join } from 'node:path';

export interface IErrorLogOptions {
  identifier?: string;
  directory?: string;
}

export class ErrorLoggerService {
  private readonly defaultDirectory: string;

  constructor(baseDirectory?: string) {
    this.defaultDirectory = baseDirectory || join(process.cwd(), 'errors');
  }

  /**
   * Logs an error to the console and saves error data to disk
   * @param rawData The data that caused the error
   * @param error The error that occurred
   * @param options Optional configuration for the error log
   */
  public async logError<T = unknown>(
    rawData: T,
    error: unknown,
    options: IErrorLogOptions = {}
  ): Promise<void> {
    const { identifier = 'unknown', directory = this.defaultDirectory } = options;

    console.error(`Error processing ${identifier}:`, error);

    try {
      // Ensure errors directory exists
      await fs.mkdir(directory, { recursive: true });

      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `error_${identifier}_${timestamp}.json`;
      const filepath = join(directory, filename);

      const errorData = {
        rawData,
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        }
      };

      await fs.writeFile(filepath, JSON.stringify(errorData, null, 2), 'utf-8');
      console.log(`Error data saved to: ${filepath}`);

    } catch (writeError) {
      console.error('Failed to write error file:', writeError);
    }
  }
}