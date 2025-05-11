<template>
  <div class="location-filter">
    <div class="filter-group">
      <div class="select-wrapper">
        <select
          v-model="selectedCountryId"
          @change="onCountryChange"
          :disabled="loading"
        >
          <!-- Require country selection, no 'All Countries' option -->
          <option
            v-for="country in countries"
            :key="country.countryId"
            :value="country.countryId"
          >
            {{ country.name }}
          </option>
        </select>
        <div class="loading-indicator" v-if="loading">
          <div class="spinner"></div>
        </div>
      </div>

      <div class="select-wrapper">
        <select
          v-model="selectedCityId"
          @change="onCityChange"
          :disabled="!selectedCountryId || loading || cities.length === 0"
        >
          <!-- Require city selection, show placeholder when needed -->
          <option v-if="!cities.length || !selectedCountryId" value="" disabled>{{ cityPlaceholder }}</option>
          <option
            v-for="city in filteredCities"
            :key="city.cityId"
            :value="city.cityId"
          >
            {{ city.name }}
          </option>
        </select>
        <div class="loading-indicator" v-if="loading">
          <div class="spinner"></div>
        </div>
      </div>

      <button 
        v-if="store.hasActiveFilters"
        class="clear-filters"
        @click="resetFilters"
        :disabled="loading.value"
      >
        Reset Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useEventStore } from '../stores/eventStore';
import { storeToRefs } from 'pinia';
import type { Country, City } from '../types';

const store = useEventStore();
const { countries, cities, loading, selectedCountryId, selectedCityId } = storeToRefs(store);
const localLoading = ref(false);

const cityPlaceholder = computed(() => {
  if (!selectedCountryId.value) return 'Select a country first';
  if (loading.value || localLoading.value) return 'Loading cities...';
  if (cities.value.length === 0) return 'No cities available';
  return 'All Cities';
});

// Filter cities to only show ones from the selected country
const filteredCities = computed(() => {
  if (!selectedCountryId.value) return [];
  return cities.value.filter(city => city.countryId === selectedCountryId.value);
});

// Watch for country changes to ensure a city is always selected
watch(() => selectedCountryId.value, async () => {
  // The store will handle auto-selecting the first city of the new country
  // This is just to ensure the UI is updated correctly
  if (filteredCities.value.length > 0 && !filteredCities.value.some(city => city.cityId === selectedCityId.value)) {
    // If the current selected city isn't from this country, select the first city
    selectedCityId.value = filteredCities.value[0].cityId;
  }
});

// Initialize filters when mounted
const initFilters = async () => {
  localLoading.value = true;
  try {
    // Initialize the store with required location selection
    await store.initialize();
  } catch (error) {
    console.error('Failed to initialize filters:', error);
  } finally {
    localLoading.value = false;
  }
};



const onCountryChange = async () => {
  // Let the store handle selecting country, loading cities, and auto-selecting first city
  await store.setCountryFilter(selectedCountryId.value);
};

const onCityChange = async () => {
  // Let the store handle selecting city and loading events for that city
  await store.setCityFilter(selectedCityId.value);
};

const resetFilters = async () => {
  // Reset to default country and city selections
  await store.resetFilters();
};

onMounted(initFilters);

// Watch for changes in loading state to reflect in UI
watch(() => store.loading, (newValue) => {
  localLoading.value = newValue;
});
</script>

<style scoped>
.location-filter {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.select-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

select {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

select:hover:not(:disabled) {
  border-color: var(--accent-color);
}

select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-indicator {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--text-tertiary);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.clear-filters {
  padding: 0.75rem 1.25rem;
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.clear-filters:hover:not(:disabled) {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.clear-filters:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 