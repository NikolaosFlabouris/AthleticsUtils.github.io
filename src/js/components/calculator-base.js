/**
 * Base Calculator Component
 * Shared functionality for all calculator pages
 */

import { scoringDataLoader } from '../data/scoring-data-loader.js';

export class BaseCalculator {
  constructor(selectors) {
    this.selectors = selectors;
    this.currentGender = '';
    this.currentEvent = '';
    this.setupDOMElements();
  }

  setupDOMElements() {
    this.genderSelect = document.querySelector(this.selectors.genderSelect);
    this.eventSelect = document.querySelector(this.selectors.eventSelect);
    this.performanceInput = document.querySelector(this.selectors.performanceInput);
    this.calculateBtn = document.querySelector(this.selectors.calculateBtn);
    this.resultsContainer = document.querySelector(this.selectors.resultsContainer);
    this.resultsContent = document.querySelector(this.selectors.resultsContent);
    this.loadingIndicator = document.querySelector(this.selectors.loadingIndicator);
    this.errorMessage = document.querySelector(this.selectors.errorMessage);
  }

  async initialize() {
    this.setupEventListeners();
    await this.loadScoringData();
  }

  setupEventListeners() {
    this.genderSelect?.addEventListener('change', (e) => this.handleGenderChange(e));
    this.eventSelect?.addEventListener('change', (e) => this.handleEventChange(e));
    this.performanceInput?.addEventListener('input', (e) => this.handlePerformanceInput(e));
    this.performanceInput?.addEventListener('keypress', (e) => this.handleKeyPress(e));
    this.calculateBtn?.addEventListener('click', () => this.handleCalculate());
  }

  async loadScoringData() {
    try {
      this.showLoading(true);
      this.hideError();
      await scoringDataLoader.load();
      this.populateGenderDropdown();
      this.showLoading(false);
    } catch (error) {
      console.error('Error loading scoring data:', error);
      this.showError('Failed to load scoring tables. Please refresh the page.');
      this.showLoading(false);
    }
  }

  populateGenderDropdown() {
    const genders = scoringDataLoader.getGenders();
    this.genderSelect.innerHTML = '<option value="">Select gender...</option>';

    for (const gender of genders) {
      const option = document.createElement('option');
      option.value = gender;
      option.textContent = this.capitalizeFirst(gender);
      this.genderSelect.appendChild(option);
    }
  }

  handleGenderChange(e) {
    this.currentGender = e.target.value;

    if (!this.currentGender) {
      this.eventSelect.disabled = true;
      this.eventSelect.innerHTML = '<option value="">Select event...</option>';
      this.performanceInput.disabled = true;
      this.calculateBtn.disabled = true;
      this.hideResults();
      return;
    }

    this.populateEventDropdown(this.currentGender);
    this.eventSelect.disabled = false;
    this.performanceInput.disabled = true;
    this.calculateBtn.disabled = true;
    this.hideResults();
  }

  populateEventDropdown(gender) {
    const allEvents = scoringDataLoader.getAllEvents(gender);
    this.eventSelect.innerHTML = '<option value="">Select event...</option>';

    const eventsByCategory = {};
    for (const { event, category } of allEvents) {
      if (!eventsByCategory[category]) {
        eventsByCategory[category] = [];
      }
      eventsByCategory[category].push(event);
    }

    for (const [category, events] of Object.entries(eventsByCategory).sort()) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = this.formatCategoryName(category);

      for (const event of events.sort()) {
        const option = document.createElement('option');
        option.value = event;
        option.textContent = event;
        optgroup.appendChild(option);
      }

      this.eventSelect.appendChild(optgroup);
    }
  }

  handleEventChange(e) {
    this.currentEvent = e.target.value;

    if (!this.currentEvent) {
      this.performanceInput.disabled = true;
      this.calculateBtn.disabled = true;
      this.hideResults();
      return;
    }

    this.performanceInput.disabled = false;
    this.performanceInput.value = '';
    this.performanceInput.focus();
    this.calculateBtn.disabled = true;
    this.hideResults();
  }

  handlePerformanceInput(e) {
    const value = e.target.value.trim();
    this.calculateBtn.disabled = !value;
    this.hideError();
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !this.calculateBtn.disabled) {
      this.handleCalculate();
    }
  }

  handleCalculate() {
    // Override in subclass
    throw new Error('handleCalculate() must be implemented by subclass');
  }

  showLoading(show) {
    if (show) {
      this.loadingIndicator?.classList.remove('hidden');
    } else {
      this.loadingIndicator?.classList.add('hidden');
    }
  }

  showError(message) {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.classList.remove('hidden');
    }
  }

  hideError() {
    this.errorMessage?.classList.add('hidden');
  }

  hideResults() {
    this.resultsContainer?.classList.add('hidden');
  }

  showResults() {
    this.resultsContainer?.classList.remove('hidden');
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  formatCategoryName(category) {
    return category
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => this.capitalizeFirst(word))
      .join(' ');
  }
}
