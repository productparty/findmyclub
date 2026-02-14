/**
 * Standardized error handling utilities
 */

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Extracts user-friendly error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Check for common API error patterns
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again.';
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'The requested resource was not found.';
    }
    
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'A server error occurred. Please try again later.';
    }
    
    // Return the error message if it's user-friendly
    if (error.message.length < 100) {
      return error.message;
    }
    
    // For long technical messages, return generic error
    return 'An unexpected error occurred. Please try again.';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Formats API error response into standardized format
 */
export const formatApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    // Try to extract status code from error message
    const statusMatch = error.message.match(/\b(\d{3})\b/);
    const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : undefined;
    
    return {
      message: getErrorMessage(error),
      code: error.name,
      statusCode,
    };
  }
  
  return {
    message: getErrorMessage(error),
  };
};

/**
 * Logs error with context for debugging
 */
export const logError = (error: unknown, context?: string): void => {
  const errorInfo = formatApiError(error);
  const logMessage = context
    ? `[${context}] ${errorInfo.message}`
    : errorInfo.message;
  
  console.error(logMessage, {
    error,
    code: errorInfo.code,
    statusCode: errorInfo.statusCode,
  });
};
