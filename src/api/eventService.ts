import { ApiClient } from './apiClient';

import type {
  Event,
  EventFilters,
  Country,
  City,
  EventType,
  Dresscode,
  CreateCommentDto
} from '../types';

class EventService {
  private apiClient: ApiClient;
  private static instance: EventService;

  // API endpoints
  private static readonly API_ENDPOINTS = {
    EVENTS: 'EventApi',
    COUNTRIES: 'CountryApi',
    CITIES: 'CityApi',
    EVENT_TYPES: 'EventTypeApi',
    DRESSCODES: 'DresscodeApi'
  };

  private constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  private logRequest(method: string, endpoint: string, params?: any) {
    console.log(`API ${method}: ${endpoint}`, params || '');
  }

  async getAllEvents(filters?: EventFilters): Promise<Event[]> {
    this.logRequest('GET', EventService.API_ENDPOINTS.EVENTS, filters);
    try {
      const response = await this.apiClient.get<Event[]>(EventService.API_ENDPOINTS.EVENTS, filters);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  }

  async getEventById(id: number): Promise<Event | null> {
    this.logRequest('GET', `${EventService.API_ENDPOINTS.EVENTS}/${id}`);
    try {
      return await this.apiClient.get<Event>(`${EventService.API_ENDPOINTS.EVENTS}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      return null;
    }
  }

  async addComment(eventId: number, content: string, token?: string): Promise<boolean> {
    this.logRequest('POST', `${EventService.API_ENDPOINTS.EVENTS}/${eventId}/comments`);
    try {
      // Create a comment DTO with the content
      const commentDto = { content };
      
      // Token is handled automatically by the ApiClient's interceptor
      // but we could use it directly if needed
      await this.apiClient.post(`${EventService.API_ENDPOINTS.EVENTS}/${eventId}/comments`, commentDto);
      return true;
    } catch (error) {
      console.error(`Failed to add comment to event ${eventId}:`, error);
      return false;
    }
  }

  async getCountries(): Promise<Country[]> {
    this.logRequest('GET', EventService.API_ENDPOINTS.COUNTRIES);
    try {
      const response = await this.apiClient.get<Country[]>(EventService.API_ENDPOINTS.COUNTRIES);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      return [];
    }
  }

  async getCities(countryId: number): Promise<City[]> {
    this.logRequest('GET', `${EventService.API_ENDPOINTS.CITIES}?countryId=${countryId}`);
    try {
      // Use the dedicated City API endpoint with countryId as a query parameter
      const response = await this.apiClient.get<City[]>(EventService.API_ENDPOINTS.CITIES, { countryId });
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Failed to fetch cities for country ${countryId}:`, error);
      return [];
    }
  }

  async getEventTypes(): Promise<EventType[]> {
    this.logRequest('GET', EventService.API_ENDPOINTS.EVENT_TYPES);
    try {
      const response = await this.apiClient.get<EventType[]>(EventService.API_ENDPOINTS.EVENT_TYPES);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch event types:', error);
      return [];
    }
  }

  async getDresscodes(): Promise<Dresscode[]> {
    this.logRequest('GET', EventService.API_ENDPOINTS.DRESSCODES);
    try {
      const response = await this.apiClient.get<Dresscode[]>(EventService.API_ENDPOINTS.DRESSCODES);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch dresscodes:', error);
      return [];
    }
  }
}

export const eventService = EventService.getInstance();