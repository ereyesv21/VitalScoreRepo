export const API_BASE_URL = 'http://localhost:4000/api';

// Add timeout for API calls (in milliseconds)
export const API_TIMEOUT = 10000;

// HTTP Status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const; 