/**
 * Pace Calculator Base Class
 * Provides shared functionality for pace calculator pages
 */

import { eventConfigLoader } from '../data/event-config-loader.js';

export class PaceCalculatorBase {
  constructor(selectors) {
    // Store selectors
    this.selectors = selectors;

    // State
    this.eventsConfig = null;
    this.paceDistances = [];
    this.currentMode = 'pace'; // 'pace' or 'totalTime'

    // UI Elements (to be set by subclass)
    this.elements = {};
  }

  /**
   * Initialize the calculator
   * Load data and set up UI
   */
  async initialize() {
    try {
      await this.loadData();
      this.initializeElements();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Failed to load calculator. Please refresh the page.');
    }
  }

  /**
   * Load events configuration data
   */
  async loadData() {
    try {
      this.showLoading();

      // Load events config
      this.eventsConfig = await eventConfigLoader.load();

      // Get pace calculator distances
      this.paceDistances = this.eventsConfig.paceCalculatorDistances || [];

      this.hideLoading();
    } catch (error) {
      this.hideLoading();
      throw new Error(`Failed to load data: ${error.message}`);
    }
  }

  /**
   * Initialize DOM elements
   * Override this in subclass
   */
  initializeElements() {
    throw new Error('initializeElements() must be implemented by subclass');
  }

  /**
   * Setup event listeners
   * Override this in subclass
   */
  setupEventListeners() {
    throw new Error('setupEventListeners() must be implemented by subclass');
  }

  /**
   * Get event configuration by key
   * @param {string} eventKey - Event key (e.g., "5km", "marathon")
   * @returns {Object|null} Event configuration
   */
  getEventConfig(eventKey) {
    if (!this.eventsConfig || !this.eventsConfig.events) {
      return null;
    }
    return this.eventsConfig.events[eventKey] || null;
  }

  /**
   * Get all pace calculator distances
   * @returns {Array} Array of event objects for pace calculator
   */
  getPaceDistances() {
    if (!this.paceDistances || !this.eventsConfig) {
      return [];
    }

    return this.paceDistances
      .map(key => {
        const config = this.getEventConfig(key);
        if (!config) return null;
        return {
          key,
          ...config
        };
      })
      .filter(event => event !== null);
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    const loading = document.querySelector(this.selectors.loading);
    if (loading) {
      loading.classList.remove('hidden');
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loading = document.querySelector(this.selectors.loading);
    if (loading) {
      loading.classList.add('hidden');
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    const errorElement = document.querySelector(this.selectors.error);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorElement = document.querySelector(this.selectors.error);
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }

  /**
   * Show results section
   */
  showResults() {
    const results = document.querySelector(this.selectors.results);
    if (results) {
      results.classList.remove('hidden');
    }
  }

  /**
   * Hide results section
   */
  hideResults() {
    const results = document.querySelector(this.selectors.results);
    if (results) {
      results.classList.add('hidden');
    }
  }

  /**
   * Clear results
   */
  clearResults() {
    this.hideResults();
    this.hideError();
  }

  /**
   * Validate time input
   * @param {number} timeSeconds - Time in seconds
   * @returns {boolean} True if valid
   */
  validateTime(timeSeconds) {
    return timeSeconds != null && timeSeconds > 0 && !isNaN(timeSeconds);
  }

  /**
   * Validate pace input
   * @param {number} paceSeconds - Pace in seconds
   * @returns {boolean} True if valid
   */
  validatePace(paceSeconds) {
    return paceSeconds != null && paceSeconds > 0 && !isNaN(paceSeconds);
  }

  /**
   * Validate distance selection
   * @param {string} eventKey - Event key
   * @returns {boolean} True if valid
   */
  validateDistance(eventKey) {
    return eventKey && this.getEventConfig(eventKey) !== null;
  }
}
