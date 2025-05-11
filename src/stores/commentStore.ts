import { defineStore } from 'pinia';
import { storeToRefs } from 'pinia';
import { commentService } from '../api/commentService';
import type { CommentDto } from '../types';
import { useAuthStore } from './authStore';

export const useCommentStore = defineStore('comments', {
  state: () => ({
    comments: [] as CommentDto[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    /**
     * Helper function to get the real user ID from auth store
     * No fallbacks - only returns the actual userId from the auth store
     */
    getUserId(): string {
      console.log('=== RETRIEVING USER ID FOR COMMENT ===');
      
      const authStore = useAuthStore();
      const userId = authStore.user?.userId;
      
      if (!userId) {
        console.error('❌ No userId available in auth store');
        throw new Error('User ID not available. Please log in again.');
      }
      
      console.log('✅ Using userId from auth store:', userId);
      return userId;
    },

    /**
     * Add a comment to an event
     */
    async addComment(eventId: number, text: string, eventName: string = '', eventDescription: string = ''): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        // Get the user ID using our helper function
        const userId = this.getUserId();
        
        if (!userId) {
          this.error = 'You must be logged in to leave a comment';
          return false;
        }

        // Create comment data object according to API requirements
        const comment: CommentDto = {
          commentId: 0, // API will assign the real ID
          text,
          dateCreated: new Date().toISOString(),
          userId,           // This should now be the UUID from getUserId()
          userName: authStore.user?.username || userId, // Use actual username for userName
          userEmail: '',    // Can be empty as per requirements
          eventId,
          eventName,       // Can be empty as per requirements
          eventDescription // Can be empty as per requirements
        };
        
        console.log('Creating comment with userId:', userId);

        const success = await commentService.createComment(comment);
        
        if (success) {
          // If successful, refresh the comments for this event
          await this.getCommentsByEventId(eventId);
        }
        
        return success;
      } catch (error: any) {
        this.error = error.message || 'Failed to add comment';
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Get all comments for a specific event
     */
    async getCommentsByEventId(eventId: number): Promise<CommentDto[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const comments = await commentService.getCommentsByEventId(eventId);
        this.comments = comments;
        return comments;
      } catch (error: any) {
        this.error = error.message || 'Failed to load comments';
        return [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clear any loaded comments
     */
    clearComments() {
      this.comments = [];
      this.error = null;
    }
  },

  getters: {
    /**
     * Get all comments
     */
    getComments(): CommentDto[] {
      return this.comments;
    },

    /**
     * Get the comment loading state
     */
    isLoading(): boolean {
      return this.loading;
    },
    
    /**
     * Get any error message
     */
    getError(): string | null {
      return this.error;
    }
  }
});
