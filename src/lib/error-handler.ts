import { toast } from '@/hooks/use-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export class ErrorHandler {
  static handle(error: unknown, context?: string): AppError {
    const appError: AppError = {
      message: 'An unexpected error occurred',
      details: error
    };

    if (error instanceof Error) {
      appError.message = error.message;
    } else if (typeof error === 'string') {
      appError.message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      appError.message = String(error.message);
    }

    // Log error for debugging
    console.error(`Error in ${context || 'unknown context'}:`, error);

    return appError;
  }

  static showToast(error: unknown, context?: string): void {
    const appError = this.handle(error, context);
    
    toast({
      title: "Error",
      description: appError.message,
      variant: "destructive"
    });
  }

  static isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('network') || 
             error.message.includes('fetch') ||
             error.message.includes('timeout');
    }
    return false;
  }

  static isAuthError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('auth') ||
             error.message.includes('unauthorized') ||
             error.message.includes('forbidden');
    }
    return false;
  }
}