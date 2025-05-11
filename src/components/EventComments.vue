<template>
  <div class="comments-section">
    <h3>Comments</h3>
    
    <!-- Comments list -->
    <div v-if="isLoading" class="comments-loading">
      <p>Loading comments...</p>
    </div>
    
    <div v-else-if="filteredComments.length === 0" class="no-comments">
      <p>No comments yet. Be the first to comment!</p>
    </div>
    
    <div v-else class="comments-list">
      <div v-for="comment in filteredComments" :key="comment.commentId" class="comment-item">
        <div class="comment-header">
          <span class="comment-author">{{ comment.userName }}</span>
          <span class="comment-date">{{ formatDate(comment.dateCreated) }}</span>
        </div>
        <div class="comment-content">
          {{ comment.text }}
        </div>
      </div>
    </div>
    
    <!-- Add comment form -->
    <div class="add-comment-form" v-if="isAuthenticated">
      <h4>Leave a comment</h4>
      <textarea 
        v-model="commentText" 
        placeholder="Write your comment here..."
        rows="4"
        class="comment-input"
      ></textarea>
      <div class="form-actions">
        <button 
          @click="submitComment" 
          class="btn btn-primary submit-comment" 
          :disabled="isLoading || !commentText.trim()"
        >
          {{ isLoading ? 'Submitting...' : 'Submit Comment' }}
        </button>
      </div>
      <div v-if="error" class="comment-error">
        {{ error }}
      </div>
    </div>
    
    <div v-else class="login-prompt">
      <p>Please <router-link to="/login">login</router-link> to leave a comment.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, watch, computed } from 'vue';
import { storeToRefs } from 'pinia'; // Important for reactivity
import { useCommentStore } from '../stores/commentStore';
import { useAuthStore } from '../stores/authStore';

const props = defineProps<{
  eventId: number;
  eventName?: string;
  eventDescription?: string;
}>();

// Initialize stores with proper reactivity using storeToRefs
const commentStore = useCommentStore();
const authStore = useAuthStore();

// Extract reactive properties from the stores
const { comments, isLoading, error } = storeToRefs(commentStore);
const { getIsAuthenticated: isAuthenticated } = storeToRefs(authStore);

// Filter comments to only show those for the current event
const filteredComments = computed(() => {
  return comments.value.filter(comment => comment.eventId === props.eventId);
});

// Local state
const commentText = ref('');

// Load comments when the component is mounted or when eventId changes
watch(() => props.eventId, loadComments, { immediate: true });

onMounted(() => {
  loadComments();
});

function loadComments() {
  if (props.eventId) {
    commentStore.getCommentsByEventId(props.eventId);
  }
}

async function submitComment() {
  if (!commentText.value.trim()) return;
  
  const success = await commentStore.addComment(
    props.eventId,
    commentText.value,
    props.eventName || '',
    props.eventDescription || ''
  );
  
  if (success) {
    commentText.value = ''; // Clear the input on success
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (e) {
    return dateString;
  }
}
</script>

<style scoped>
.comments-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #222;
  border-radius: 8px;
  color: #fff;
}

.comments-list {
  margin: 1rem 0;
}

.comment-item {
  padding: 1rem;
  border-bottom: 1px solid #333;
  margin-bottom: 1rem;
  background-color: #1a1a1a;
  border-radius: 4px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.comment-author {
  font-weight: bold;
}

.comment-date {
  color: #888;
}

.comment-content {
  white-space: pre-wrap;
}

.add-comment-form {
  margin-top: 2rem;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 1rem;
  background-color: #333;
  color: #fff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-comment {
  padding: 0.5rem 1rem;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-comment:not(:disabled):hover {
  background-color: #ff2222;
}

.submit-comment:disabled {
  background-color: #333;
  cursor: not-allowed;
}

.comment-error {
  color: #dc3545;
  margin-top: 0.5rem;
}

.login-prompt {
  text-align: center;
  margin: 2rem 0;
  padding: 1rem;
  background-color: #333;
  border-radius: 4px;
  color: #888;
}

.comments-loading {
  text-align: center;
  margin: 1rem 0;
  color: #888;
}

.no-comments {
  text-align: center;
  margin: 1rem 0;
  color: #888;
  font-style: italic;
}
</style>
