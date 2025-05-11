import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LocationFilter from '../../components/LocationFilter.vue';
import { useEventStore } from '../../stores/eventStore';
import { eventService } from '../../api/eventService';

// Mock the eventService
vi.mock('../../api/eventService', () => ({
  eventService: {
    getCountries: vi.fn(),
    getCities: vi.fn(),
    getAllEvents: vi.fn(),
    addComment: vi.fn()
  }
}));

describe('LocationFilter', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('loads countries on mount', async () => {
    const mockCountries = [
      { id: 1, name: 'Country 1' },
      { id: 2, name: 'Country 2' }
    ];

    (eventService.getCountries as any).mockResolvedValue(mockCountries);

    const wrapper = mount(LocationFilter);
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => {
      expect(eventService.getCountries).toHaveBeenCalled();
    });
    expect(wrapper.findAll('option')).toHaveLength(3); // 2 countries + "All Countries" option
  });

  it('loads cities when country is selected', async () => {
    const mockCities = [
      { id: 1, name: 'City 1' },
      { id: 2, name: 'City 2' }
    ];

    (eventService.getCities as any).mockResolvedValue(mockCities);
    (eventService.getAllEvents as any).mockResolvedValue([]);

    const wrapper = mount(LocationFilter);
    const countrySelect = wrapper.find('#country');

    await countrySelect.setValue('1');
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => {
      expect(eventService.getCities).toHaveBeenCalledWith(1);
    });
    expect(wrapper.findAll('#city option')).toHaveLength(3); // 2 cities + "All Cities" option
  });

  it('disables city select when no country is selected', () => {
    const wrapper = mount(LocationFilter);
    const citySelect = wrapper.find('#city');

    expect((citySelect.element as HTMLSelectElement).disabled).toBe(true);
  });

  it('enables city select when country is selected', async () => {
    (eventService.getAllEvents as any).mockResolvedValue([]);
    (eventService.getCities as any).mockResolvedValue([]);

    const wrapper = mount(LocationFilter);
    const countrySelect = wrapper.find('#country');
    const citySelect = wrapper.find('#city');

    await countrySelect.setValue('1');
    await wrapper.vm.$nextTick();

    expect((citySelect.element as HTMLSelectElement).disabled).toBe(false);
  });

  it('updates store when country is selected', async () => {
    const store = useEventStore();
    store.setCountryFilter = vi.fn();
    (eventService.getAllEvents as any).mockResolvedValue([]);

    const wrapper = mount(LocationFilter);
    const countrySelect = wrapper.find('#country');

    await countrySelect.setValue('1');
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => {
      expect(store.setCountryFilter).toHaveBeenCalledWith(1);
    });
  });

  it('updates store when city is selected', async () => {
    const store = useEventStore();
    store.setCityFilter = vi.fn();
    (eventService.getAllEvents as any).mockResolvedValue([]);
    (eventService.getCities as any).mockResolvedValue([]);

    const wrapper = mount(LocationFilter);
    const countrySelect = wrapper.find('#country');
    const citySelect = wrapper.find('#city');

    await countrySelect.setValue('1');
    await wrapper.vm.$nextTick();
    await citySelect.setValue('1');
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => {
      expect(store.setCityFilter).toHaveBeenCalledWith(1);
    });
  });
}); 