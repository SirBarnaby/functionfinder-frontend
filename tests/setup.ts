import { config } from '@vue/test-utils';
import { createPinia } from 'pinia';

// Create a new Pinia instance for testing
const pinia = createPinia();

// Configure Vue Test Utils
config.global.plugins = [pinia]; 