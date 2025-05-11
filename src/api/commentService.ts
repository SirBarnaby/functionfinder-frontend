import { ApiClient } from './apiClient';
import type { CommentDto } from '../types';

/**
 * Service for handling comment-related API calls
 */
class CommentService {
  private apiClient: ApiClient;
  private static instance: CommentService;
  
  // API endpoints
  private static readonly API_ENDPOINTS = {
    COMMENTS: 'CommentApi'
  };

  private constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  public static getInstance(): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  private logRequest(method: string, endpoint: string, params?: any) {
    console.log(`API ${method}: ${endpoint}`, params || '');
  }

  /**
   * Create a new comment for an event
   */
  async createComment(comment: CommentDto): Promise<boolean> {
    this.logRequest('POST', CommentService.API_ENDPOINTS.COMMENTS, { eventId: comment.eventId });
    try {
      await this.apiClient.post<any>(CommentService.API_ENDPOINTS.COMMENTS, comment);
      return true;
    } catch (error) {
      console.error(`Failed to create comment for event ${comment.eventId}:`, error);
      return false;
    }
  }

  /**
   * Get all comments for an event
   */
  async getCommentsByEventId(eventId: number): Promise<CommentDto[]> {
    this.logRequest('GET', `${CommentService.API_ENDPOINTS.COMMENTS}?eventId=${eventId}`);
    try {
      const response = await this.apiClient.get<CommentDto[]>(
        `${CommentService.API_ENDPOINTS.COMMENTS}`, 
        { eventId }
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Failed to fetch comments for event ${eventId}:`, error);
      return [];
    }
  }
}

export const commentService = CommentService.getInstance();
