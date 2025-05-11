import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EventList from '../../components/EventList.vue';
import { useEventStore } from '../../stores/eventStore';
import { eventService } from '../../api/eventService';

// Mock the eventService
vi.mock('../../api/eventService', () => ({
  eventService: {
    getAllEvents: vi.fn(),
    addComment: vi.fn()
  }
}));

describe('EventList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('displays loading state', () => {
    const store = useEventStore();
    store.$patch({ loading: true });

    const wrapper = mount(EventList);
    expect(wrapper.find('.loading').exists()).toBe(true);
    expect(wrapper.find('.loading').text()).toContain('Loading events');
  });

  it('displays error state', () => {
    const store = useEventStore();
    store.$patch({ error: 'Failed to fetch events' });

    const wrapper = mount(EventList);
    expect(wrapper.find('.error').exists()).toBe(true);
    expect(wrapper.find('.error').text()).toContain('Failed to fetch events');
  });

  it('displays no events message', () => {
    const store = useEventStore();
    store.$patch({ events: [] });

    const wrapper = mount(EventList);
    expect(wrapper.find('.no-events').exists()).toBe(true);
    expect(wrapper.find('.no-events').text()).toContain('No events found');
  });

  it('displays events correctly', async () => {
    const mockEvents = [
      {
        id: 1,
        name: 'Test Event',
        description: 'Test Description',
        date: '2024-04-01',
        dressCode: 'Casual',
        city: {
          id: 1,
          name: 'Test City',
          country: {
            id: 1,
            name: 'Test Country'
          }
        },
        comments: []
      }
    ];

    const store = useEventStore();
    store.$patch({ events: mockEvents });

    const wrapper = mount(EventList);
    
    expect(wrapper.find('.event-card').exists()).toBe(true);
    expect(wrapper.find('.event-card h3').text()).toBe('Test Event');
    expect(wrapper.find('.date').text()).toContain('4/1/2024');
    expect(wrapper.find('.location').text()).toContain('Test City, Test Country');
    expect(wrapper.find('.dress-code').text()).toContain('Casual');
    expect(wrapper.find('.description').text()).toBe('Test Description');
  });

  it('handles comment submission', async () => {
    const mockEvents = [
      {
        id: 1,
        name: 'Test Event',
        description: 'Test Description',
        date: '2024-04-01',
        dressCode: 'Casual',
        city: {
          id: 1,
          name: 'Test City',
          country: {
            id: 1,
            name: 'Test Country'
          }
        },
        comments: []
      }
    ];

    const store = useEventStore();
    store.$patch({ events: mockEvents });
    store.fetchEvents = vi.fn();

    (eventService.addComment as any).mockResolvedValue({
      id: 1,
      content: 'New comment',
      eventId: 1,
      createdAt: '2024-04-01'
    });

    const wrapper = mount(EventList);
    
    // Find the textarea and button
    const textarea = wrapper.find('textarea');
    const button = wrapper.find('button');

    // Set the comment text
    await textarea.setValue('New comment');

    // Click the button
    await button.trigger('click');

    // Verify that addComment was called
    expect(eventService.addComment).toHaveBeenCalledWith(1, 'New comment');
    expect(store.fetchEvents).toHaveBeenCalled();
  });
}); 