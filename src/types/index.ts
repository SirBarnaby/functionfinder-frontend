// Base interfaces for API responses
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Domain models matching C# backend
export interface City {
  cityId: number;
  name: string;
  flags: number;
  countryId: number;
  country: Country;
  events: Event[];
}

export interface Comment {
  commentId: number;
  text: string;
  dateCreated: string; // ISO date string
  eventId: number;
  event: Event;
  userId: string;
  user: User;
}

export interface Country {
  countryId: number;
  name: string;
  cities: City[];
}

export interface Dresscode {
  dresscodeId: number;
  name: string;
  description: string;
  iconUrl: string;
  dateCreated: string; // ISO date string
  events: Event[];
}

export interface EventType {
  eventTypeId: number;
  name: string;
  description: string;
  events: Event[];
}

export interface User {
  id: string;
  userName: string;
  email: string;
  comments: Comment[];
}

export interface Event {
  eventId: number;
  name: string;
  description: string;
  dateOfEvent: string; // ISO date string
  dateCreated: string; // ISO date string
  eventTypeId: number;
  eventType: EventType;
  cityId: number;
  city: City;
  dresscodeId: number;
  dresscode: Dresscode;
  comments: Comment[];
}

// DTOs for creating/updating
export interface CreateEventDto {
  name: string;
  description: string;
  dateOfEvent: string;
  eventTypeId: number;
  cityId: number;
  dresscodeId: number;
}

export interface CreateCommentDto {
  text: string;
  eventId: number;
}

export interface CommentDto {
  commentId: number;
  text: string;
  dateCreated: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: number;
  eventName: string;
  eventDescription: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  userName: string;
}

// Filter types
export interface EventFilters {
  countryId?: number;
  cityId?: number;
  eventTypeId?: number;
  dresscodeId?: number;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

// State interfaces
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;
  filters: EventFilters;
  selectedEvent: Event | null;
} 