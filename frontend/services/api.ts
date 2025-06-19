import { API_BASE_URL, API_TIMEOUT } from '../constants/Config';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

const handleResponse = async (response: Response) => {
    const data = await response.json();
    
    if (!response.ok) {
        // Try to get the specific error message from the backend
        const errorMessage = data.error || data.message || data.details || 'Something went wrong';
        throw new ApiError(response.status, errorMessage);
    }
    
    return data;
};

const timeoutPromise = (ms: number) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Request timed out after ${ms}ms`));
        }, ms);
    });
};

export const api = {
    get: async (endpoint: string) => {
        try {
            console.log('🌐 GET Request:', `${API_BASE_URL}${endpoint}`);
            const response = await Promise.race([
                fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add auth token if available
                        ...(global.token && { Authorization: `Bearer ${global.token}` }),
                    },
                }),
                timeoutPromise(API_TIMEOUT),
            ]);
            
            console.log('✅ GET Response status:', (response as Response).status);
            return await handleResponse(response as Response);
        } catch (error) {
            console.error('❌ GET Error:', error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    },

    post: async (endpoint: string, data: any) => {
        try {
            console.log('🌐 POST Request:', `${API_BASE_URL}${endpoint}`, data);
            const response = await Promise.race([
                fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(global.token && { Authorization: `Bearer ${global.token}` }),
                    },
                    body: JSON.stringify(data),
                }),
                timeoutPromise(API_TIMEOUT),
            ]);
            
            console.log('✅ POST Response status:', (response as Response).status);
            return await handleResponse(response as Response);
        } catch (error) {
            console.error('❌ POST Error:', error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    },

    put: async (endpoint: string, data: any) => {
        try {
            const response = await Promise.race([
                fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(global.token && { Authorization: `Bearer ${global.token}` }),
                    },
                    body: JSON.stringify(data),
                }),
                timeoutPromise(API_TIMEOUT),
            ]);
            
            return await handleResponse(response as Response);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    },

    delete: async (endpoint: string) => {
        try {
            const response = await Promise.race([
                fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(global.token && { Authorization: `Bearer ${global.token}` }),
                    },
                }),
                timeoutPromise(API_TIMEOUT),
            ]);
            
            return await handleResponse(response as Response);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    },
}; 