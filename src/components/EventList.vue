<template>
  <div class="event-list">
    <div v-if="store.loading" class="loading">
      <div class="spinner"></div>
      <p>Loading events...</p>
    </div>
    <div v-else-if="store.error" class="error">
      <i class="error-icon">⚠️</i>
      <p>{{ store.error }}</p>
    </div>
    <div v-else-if="!hasEvents" class="no-events">
      <i class="no-events-icon">🔍</i>
      <p>No events found matching your criteria</p>
    </div>
    <div v-else class="events">
      <div v-for="event in safeEvents" :key="getEventId(event)" class="event-card">
        <div class="event-date-header">
          {{ formatDateHeader(event.dateOfEvent) }}
        </div>
        
        <div class="event-content">
          <div class="event-main">
            <div class="event-badge" v-if="event?.eventType?.name === 'Party'">FF Pick</div>
            <h3>{{ event?.name || 'Unnamed Event' }}</h3>
            <div class="event-artists">{{ event?.description || 'No description available' }}</div>
            <div class="event-location">
              <span class="location-icon">📍</span>
              <span>{{ event?.cityName || 'Location unavailable' }}</span>
            </div>
          </div>
          
          <div class="event-meta">
          </div>
        </div>

        <div class="event-details" v-if="expandedEvent === getEventId(event)">
          <div class="detail-section">
            <div class="detail-item">
              <span class="detail-icon">🌍</span>
              <span>{{ event?.cityName || 'Country unavailable' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">👔</span>
              <span>{{ event?.dressCodeName || 'Dress code unavailable' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">🎵</span>
              <span>{{ event?.eventTypeName || 'Event type unavailable' }}</span>
            </div>
          </div>

          <!-- Using our new EventComments component -->
          <EventComments 
            :eventId="getEventId(event)" 
            :eventName="event?.name || ''" 
            :eventDescription="event?.description || ''"
          />

        </div>

        <button class="expand-button" @click="toggleExpand(getEventId(event))">
          {{ expandedEvent === getEventId(event) ? 'Show less' : 'Show more' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useEventStore } from '../stores/eventStore';
import { useAuthStore } from '../stores/authStore';
import { storeToRefs } from 'pinia';
import type { Event } from '../types';
import EventComments from './EventComments.vue';

const store = useEventStore();
const authStore = useAuthStore();
const expandedEvent = ref<number | null>(null);

// Safe getters to handle possible data mismatches
const safeEvents = computed(() => {
  // First check if the store is properly initialized
  if (!store || !store.$state) {
    return [];
  }
  
  // Use the filteredEvents getter instead of directly accessing store.events
  // This ensures we only get events for the selected city
  return store.filteredEvents;
});

const hasEvents = computed(() => {
  return safeEvents.value.length > 0;
});

// Safely get event ID, falling back to index if not available
const getEventId = (event: any, index?: number): number => {
  if (!event) return index ?? -1;
  return typeof event.eventId === 'number' ? event.eventId : (index ?? -1);
};

// Safe accessor for formatted dates
const getSafeDate = (dateString: any): string => {
  try {
    if (!dateString) return 'Date unavailable';
    
    // Try to parse the date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toISOString();
  } catch (e) {
    return 'Date unavailable';
  }
};

const formatDateHeader = (dateString: any) => {
  if (!dateString) return 'Date unavailable';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  } catch (e) {
    return 'Date error';
  }
};

const formatDate = (dateString: any) => {
  if (!dateString) return 'Date unavailable';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.warn('Error formatting date:', e);
    return 'Date error';
  }
};

const toggleExpand = (eventId: number) => {
  expandedEvent.value = expandedEvent.value === eventId ? null : eventId;
};

// Function to open auth modal from event list
const openAuthModal = (mode: 'login' | 'register') => {
  // Emit custom event that will be caught by the parent
  const event = new CustomEvent('open-auth-modal', { detail: { mode } });
  window.dispatchEvent(event);
};

onMounted(() => {
  // Initialize store with required country/city selection
  store.initialize()
    .catch(err => {
      console.error('Error initializing app:', err);
    });
});
</script>

<style scoped>
.event-list {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
  background: #121212;
  min-height: 100vh;
  color: #fff;
}

.loading, .error, .no-events {
  text-align: center;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #222;
  border-top: 4px solid #ff4444;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.event-card {
  background: #1a1a1a;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.event-date-header {
  padding: 12px 16px;
  background: #222;
  color: #ff4444;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.event-content {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.event-main {
  flex: 1;
}

.event-badge {
  display: inline-block;
  background: #ff4444;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.event-main h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #fff;
}

.event-artists {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
}

.attendees-count {
  background: #222;
  padding: 4px 8px;
  border-radius: 4px;
  color: #888;
  font-size: 0.8rem;
}

.event-details {
  padding: 16px;
  border-top: 1px solid #222;
}

.detail-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #888;
  font-size: 0.9rem;
}

.comments-section {
  margin-top: 16px;
}

.comments-section h4 {
  color: #fff;
  margin: 0 0 16px 0;
}

.comment {
  background: #222;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.comment-content {
  margin: 0 0 4px 0;
  color: #fff;
}

.comment-date {
  color: #666;
  font-size: 0.8rem;
}

.add-comment {
  margin-top: 16px;
}

.add-comment textarea {
  width: 100%;
  padding: 12px;
  background: #222;
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  margin-bottom: 8px;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.add-comment textarea::placeholder {
  color: #666;
}

.add-comment button {
  background: #ff4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.add-comment button:disabled {
  background: #333;
  cursor: not-allowed;
}

.add-comment button:not(:disabled):hover {
  background: #ff2222;
}

.login-prompt {
  background: #222;
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  margin-top: 16px;
}

.login-prompt p {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

.login-prompt a {
  color: var(--accent-color);
  text-decoration: none;
}

.login-prompt a:hover {
  text-decoration: underline;
}

.expand-button {
  width: 100%;
  padding: 12px;
  background: #222;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.expand-button:hover {
  background: #2a2a2a;
}
</style> 