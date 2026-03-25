import { YouTubeSearchResult, VideoInfo, DownloadRequest, ApiResponse, BackendStatus } from '../types';

const API_BASE_URL = 'https://yt-is06.onrender.com';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getBackendStatus(): Promise<ApiResponse<BackendStatus>> {
    return this.request<BackendStatus>('/');
  }

  async searchYouTube(query: string): Promise<ApiResponse<YouTubeSearchResult[]>> {
    if (!query.trim()) {
      return {
        success: false,
        error: 'Search query cannot be empty',
      };
    }

    return this.request<YouTubeSearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
  }

  async getVideoInfo(url: string): Promise<ApiResponse<VideoInfo>> {
    if (!url.trim()) {
      return {
        success: false,
        error: 'Video URL cannot be empty',
      };
    }

    return this.request<VideoInfo>('/info', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async downloadVideo(request: DownloadRequest): Promise<ApiResponse<{ downloadId: string }>> {
    return this.request<{ downloadId: string }>('/download/video', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async downloadAudio(request: DownloadRequest): Promise<ApiResponse<{ downloadId: string }>> {
    return this.request<{ downloadId: string }>('/download/audio', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getFileUrl(filename: string): Promise<string> {
    return `${this.baseUrl}/file/${encodeURIComponent(filename)}`;
  }

  async checkFileExists(filename: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/file/${encodeURIComponent(filename)}`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default ApiService;
