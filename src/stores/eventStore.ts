import { defineStore } from 'pinia';
import { eventService } from '../api/eventService';
import type { Event, EventFilters, Country, City } from '../types';

// Constants for default timeout
const LOADING_TIMEOUT = 30000; // 30 seconds

export const useEventStore = defineStore('events', {
  state: () => ({
    // Data collections
    events: [] as Event[],
    countries: [] as Country[],
    cities: [] as City[],
    
    // Selection state
    selectedCountryId: null as number | null,
    selectedCityId: null as number | null,
    
    // UI state
    loading: false,
    error: null as string | null,
    initialized: false,
    loadingTimeout: null as number | null
  }),

  actions: {
    /**
     * Initialize the application data and set default selections
     */
    async initialize() {
      if (this.initialized) return;
      
      this.startLoading('Initializing app data...');
      
      try {
        // Load countries first
        const countries = await eventService.getCountries();
        this.countries = countries;
        
        if (countries.length === 0) {
          this.error = 'No countries available';
          return;
        }
        
        // Select first country by default
        this.selectedCountryId = countries[0].countryId;
        
        // Load cities for the selected country
        const cities = await eventService.getCities(this.selectedCountryId);
        this.cities = cities;
        
        if (cities.length === 0) {
          this.error = 'No cities available for the selected country';
          return;
        }
        
        // Select first city by default
        this.selectedCityId = cities[0].cityId;
        
        // Mark initialization as complete
        this.initialized = true;
        
        // Load events for the selected city
        await this.loadEvents();
      } catch (error) {
        this.error = 'Failed to initialize app data';
        console.error('Error initializing app:', error);
      } finally {
        this.stopLoading();
      }
    },
    
    /**
     * Load events based on the current filters
     */
    async loadEvents() {
      if (!this.selectedCityId) {
        this.events = [];
        this.error = 'Please select a city to view events';
        return;
      }
      
      this.startLoading('Loading events...');
      
      try {
        // Get ALL events without filtering at the API level
        const events = await eventService.getAllEvents({});
        this.events = events;
        
        // The filteredEvents getter will handle filtering by the selected city name
        if (events.length === 0) {
          this.error = 'No events found';
        } else {
          this.error = null;
        }
      } catch (error) {
        this.error = 'Failed to load events';
        console.error('Error loading events:', error);
        this.events = [];
      } finally {
        this.stopLoading();
      }
    },
    
    /**
     * Helper method to start loading state with timeout
     */
    startLoading(message: string) {
      this.loading = true;
      this.error = null;
      
      // Set a timeout to prevent UI from being stuck in loading state
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
      }
      
      this.loadingTimeout = setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          this.error = 'Request timed out. Please try again.';
        }
      }, LOADING_TIMEOUT) as unknown as number;
    },
    
    /**
     * Helper method to stop loading state and clear timeout
     */
    stopLoading() {
      this.loading = false;
      
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
        this.loadingTimeout = null;
      }
    },

    /**
     * Load countries from the API
     */
    async loadCountries() {
      this.startLoading('Loading countries...');
      
      try {
        const countries = await eventService.getCountries();
        this.countries = countries;
        
        if (countries.length === 0) {
          this.error = 'No countries available';
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
        this.countries = [];
        this.error = 'Failed to load countries';
      } finally {
        this.stopLoading();
      }
    },

    /**
     * Load cities for a specific country
     */
    async loadCities(countryId: number) {
      this.startLoading('Loading cities...');
      
      try {
        const cities = await eventService.getCities(countryId);
        this.cities = cities;
        
        if (cities.length === 0) {
          this.error = 'No cities available for the selected country';
        }
      } catch (error) {
        console.error(`Failed to load cities for country ${countryId}:`, error);
        this.cities = [];
        this.error = 'Failed to load cities';
      } finally {
        this.stopLoading();
      }
    },

    /**
     * Set the selected country and load its cities
     */
    async setCountryFilter(countryId: number | null) {
      if (!countryId) return;
      
      this.selectedCountryId = countryId;
      
      // Clear events while changing country to prevent showing wrong events
      this.events = []; 
      
      // First make sure we have the latest cities data for this country
      await this.loadCities(countryId);
      
      // IMPORTANT: Ensure a city is selected whenever a country is selected
      // This fixes the issue where the city dropdown could be empty
      if (this.cities.length > 0) {
        // Explicitly set the selectedCityId to the first city in the filtered list
        const firstCityForCountry = this.cities.find(city => city.countryId === countryId);
        if (firstCityForCountry) {
          this.selectedCityId = firstCityForCountry.cityId;
        } else {
          // Fallback to the first city in the list if no city matches the country
          // (This shouldn't happen if cities are correctly filtered by country)
          this.selectedCityId = this.cities[0].cityId;
        }
        
        // Now load events for the selected city
        await this.loadEvents();
      } else {
        // In the rare case there are no cities, clear selectedCityId
        this.selectedCityId = null;
      }
    },

    /**
     * Set the selected city and load its events
     */
    async setCityFilter(cityId: number | null) {
      // Don't allow unselected cities
      if (!cityId && this.cities.length > 0) {
        // If no city is provided but we have cities, select the first one
        this.selectedCityId = this.cities[0].cityId;
      } else if (cityId) {
        this.selectedCityId = cityId;
      }
      
      await this.loadEvents();
    },

    /**
     * Reset to default selections (first country and city)
     */
    async resetFilters() {
      if (this.countries.length > 0) {
        await this.setCountryFilter(this.countries[0].countryId);
      } else {
        // If no countries are available, try loading them first
        await this.loadCountries();
        
        if (this.countries.length > 0) {
          await this.setCountryFilter(this.countries[0].countryId);
        }
      }
    }
  },

  getters: {
    /**
     * Get events filtered by the selected city
     */
    filteredEvents: (state) => {
      // Safety check
      if (!state.events || !Array.isArray(state.events)) {
        return [];
      }
      
      // No events if no city is selected
      if (!state.selectedCityId) {
        return [];
      }
      
      // Get the selected city name from the selectedCityId
      const selectedCity = state.cities.find(city => city.cityId === state.selectedCityId);
      if (!selectedCity) {
        return [];
      }
      
      // Filter events to only show those matching the selected city name/id
      // This supports both filtering by cityId and city name depending on what the event has
      return state.events.filter(event => 
        (event.cityId && event.cityId === state.selectedCityId) || 
        (event.city && event.city === selectedCity.name) || 
        (event.cityName && event.cityName === selectedCity.name)
      );
    },
    
    /**
     * Check if filters are active (country and city selected)
     */
    hasActiveFilters: (state) => {
      return state.selectedCountryId !== null && state.selectedCityId !== null;
    },
    
    /**
     * Get the currently selected country
     */
    selectedCountry: (state) => {
      if (!state.selectedCountryId) return null;
      return state.countries.find(country => country.countryId === state.selectedCountryId) || null;
    },
    
    /**
     * Get the currently selected city
     */
    selectedCity: (state) => {
      if (!state.selectedCityId) return null;
      return state.cities.find(city => city.cityId === state.selectedCityId) || null;
    }
  }
}); 