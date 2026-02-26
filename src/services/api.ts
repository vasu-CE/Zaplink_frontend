import axios, { AxiosError } from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  console.error("VITE_BACKEND_URL environment variable is not defined");
}

// Types for API responses
export interface ZapUploadResponse {
  zapId: string;
  shortUrl: string;
  qrCode: string;
  type: string;
  name: string;
  deletionToken?: string;
  password?: string;
  viewLimit?: number;
  expiresAt?: string;
  originalUrl?: string;
  textContent?: string;
}

export interface ZapViewResponse {
  type: string;
  url?: string;
  content?: string;
  name?: string;
  data?: Record<string, string | number | boolean | null>;
}

export interface AnalyticsResponse {
  totalViews: number;
  uniqueVisitors: number;
  aggregatedAnalytics: {
    date: string;
    count: number;
    devices: Record<string, number>;
    browsers: Record<string, number>;
    operatingSystems: Record<string, number>;
    topReferers: Array<{ referer: string | null; count: number }>;
  };
  lastUpdated: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Upload Zap (file, URL, or text)
export const uploadZap = async (
  formData: FormData,
): Promise<ZapUploadResponse> => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/zaps/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw {
      message: err.response?.data?.message || err.message || "Upload failed",
      status: err.response?.status,
    } as ApiError;
  }
};

// View Zap by shortId (with optional password)
export const viewZap = async (
  shortId: string,
  password?: string,
): Promise<ZapViewResponse> => {
  try {
    const config = password
      ? {
          params: { password },
          headers: {
            Accept: "application/json",
          },
        }
      : {
          headers: {
            Accept: "application/json",
          },
        };

    const response = await axios.get(
      `${BACKEND_URL}/api/zaps/${shortId}`,
      config,
    );

    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw {
      message:
        err.response?.data?.message || err.message || "Failed to retrieve Zap",
      status: err.response?.status,
    } as ApiError;
  }
};

// Get Zap analytics with deletion token (requires authentication)
export const getZapAnalytics = async (
  shortId: string,
  deletionToken: string,
): Promise<AnalyticsResponse> => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/zaps/${shortId}/analytics`,
      {
        params: { token: deletionToken },
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw {
      message:
        err.response?.data?.message || err.message || "Failed to retrieve analytics",
      status: err.response?.status,
    } as ApiError;
  }
};

// URL Shortener endpoint (if needed)
export const shortenUrl = async (
  url: string,
): Promise<{ shortUrl: string; qrCode?: string }> => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/url-shortener`,
      { url },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    throw {
      message:
        err.response?.data?.message || err.message || "URL shortening failed",
      status: err.response?.status,
    } as ApiError;
  }
};

// Health check endpoint
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    return response.status === 200;
  } catch {
    return false;
  }
};

// Helper function to validate environment variable
export const isBackendConfigured = (): boolean => {
  return !!BACKEND_URL;
};

export const getBackendUrl = (): string => {
  if (!BACKEND_URL) {
    throw new Error("VITE_BACKEND_URL is not configured");
  }
  return BACKEND_URL;
};
