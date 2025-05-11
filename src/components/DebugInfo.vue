<template>
  <div class="debug-panel">
    <h3>Debug Information</h3>
    
    <div class="debug-section">
      <h4>Selected Filters</h4>
      <div class="debug-item">
        <strong>Selected Country ID:</strong> {{ selectedCountryId }}
      </div>
      <div class="debug-item">
        <strong>Selected City ID:</strong> {{ selectedCityId }}
      </div>
    </div>
    
    <div class="debug-section">
      <h4>Cities ({{ cities.length }})</h4>
      <div class="cities-list">
        <div 
          v-for="city in cities" 
          :key="city.cityId"
          class="city-item"
          :class="{ 'selected': city.cityId === selectedCityId }"
        >
          ID: {{ city.cityId }} - {{ city.name }} (Country: {{ city.countryId }})
        </div>
      </div>
    </div>
    
    <div class="debug-section">
      <h4>Events Data</h4>
      <div class="debug-item">
        <strong>Total Events:</strong> {{ allEvents.length }}
      </div>
      <div class="debug-item">
        <strong>Filtered Events:</strong> {{ filteredEvents.length }}
      </div>
      <button @click="toggleEventDetails" class="debug-button">
        {{ showEventDetails ? 'Hide' : 'Show' }} Event Details
      </button>
      <div v-if="showEventDetails" class="events-list">
        <div 
          v-for="event in allEvents" 
          :key="event.eventId"
          class="event-item"
          :class="{ 'matched': event.cityId === selectedCityId }"
        >
          ID: {{ event.eventId }} - {{ event.name }} (City ID: {{ event.cityId }})
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEventStore } from '../stores/eventStore';
import { storeToRefs } from 'pinia';

const store = useEventStore();
const { 
  events: allEvents,
  cities, 
  selectedCountryId, 
  selectedCityId 
} = storeToRefs(store);

// Access the filtered events getter
const filteredEvents = computed(() => store.filteredEvents);

// Toggle for showing detailed event list
const showEventDetails = ref(false);

const toggleEventDetails = () => {
  showEventDetails.value = !showEventDetails.value;
};
</script>

<style scoped>
.debug-panel {
  margin-top: 2rem;
  padding: 1rem;
  border: 2px dashed #ff0000;
  border-radius: 8px;
  background-color: #fff8f8;
  color: #333;
  font-family: monospace;
}

.debug-section {
  margin-bottom: 1.5rem;
}

.debug-item {
  margin-bottom: 0.5rem;
}

.cities-list, .events-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.city-item, .event-item {
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid #eee;
}

.city-item.selected {
  background-color: #e6f7ff;
  font-weight: bold;
}

.event-item.matched {
  background-color: #f6ffed;
  font-weight: bold;
}

.debug-button {
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.debug-button:hover {
  background-color: #e0e0e0;
}
</style>
