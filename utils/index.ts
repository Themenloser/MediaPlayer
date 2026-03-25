import { LocalMedia, VideoFormat } from '../types';

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `Vor ${diffMins} Minute${diffMins > 1 ? 'n' : ''}`;
  if (diffHours < 24) return `Vor ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
  if (diffDays < 7) return `Vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  
  return formatDate(dateString);
};

export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
};

export const getBestFormat = (formats: VideoFormat[], preferredQuality: 'low' | 'medium' | 'high'): VideoFormat | null => {
  if (!formats || formats.length === 0) return null;

  const qualityMap = {
    low: { maxHeight: 360, maxBitrate: 500 },
    medium: { maxHeight: 720, maxBitrate: 1500 },
    high: { maxHeight: 1080, maxBitrate: 3000 },
  };

  const targetQuality = qualityMap[preferredQuality];
  
  // Filter for video formats with mp4 container
  const videoFormats = formats.filter(f => 
    f.mimeType.includes('video') && 
    f.mimeType.includes('mp4')
  );

  if (videoFormats.length === 0) return formats[0];

  // Sort by quality (height) and find the best match
  videoFormats.sort((a, b) => {
    const aHeight = parseInt(a.quality.match(/\d+/)?.[0] || '0');
    const bHeight = parseInt(b.quality.match(/\d+/)?.[0] || '0');
    return bHeight - aHeight;
  });

  // Find the best format that doesn't exceed target quality
  for (const format of videoFormats) {
    const height = parseInt(format.quality.match(/\d+/)?.[0] || '0');
    if (height <= targetQuality.maxHeight) {
      return format;
    }
  }

  // If nothing matches, return the lowest quality
  return videoFormats[videoFormats.length - 1];
};

export const generateThumbnailPath = (mediaId: string): string => {
  return `thumbnails/${mediaId}.jpg`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const getMediaExtension = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'audio/mp3': '.mp3',
    'audio/mpeg': '.mp3',
    'audio/mp4': '.m4a',
    'audio/wav': '.wav',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
  };

  return mimeToExt[mimeType] || '.mp4';
};

export const groupMediaByDate = (media: LocalMedia[]): Record<string, LocalMedia[]> => {
  return media.reduce((groups, item) => {
    const date = new Date(item.downloadDate).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, LocalMedia[]>);
};
