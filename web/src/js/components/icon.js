/**
 * Icon Component Utility
 * Provides SVG icon rendering with caching
 */

class IconRenderer {
  constructor() {
    this.iconCache = new Map();
    this.baseUrl = import.meta.env?.BASE_URL || '/';
    this.basePath = `${this.baseUrl}icons/ui/`;
  }

  /**
   * Create an icon element
   * @param {string} name - Icon name (without .svg extension)
   * @param {string} className - Additional CSS classes
   * @param {Object} options - Configuration options
   * @param {boolean} options.ariaHidden - Whether icon is decorative (default: true)
   * @param {string} options.ariaLabel - Accessible label for semantic icons
   * @param {string} options.size - Custom size (e.g., '2rem')
   * @returns {HTMLElement} - Icon wrapper element
   */
  create(name, className = '', options = {}) {
    const wrapper = document.createElement('span');
    wrapper.className = `icon ${className}`.trim();

    // Set aria attributes
    const ariaHidden = options.ariaHidden !== false;
    wrapper.setAttribute('aria-hidden', ariaHidden);

    if (options.ariaLabel) {
      wrapper.setAttribute('aria-label', options.ariaLabel);
      wrapper.setAttribute('role', 'img');
      wrapper.removeAttribute('aria-hidden');
    }

    // Set custom size if specified
    if (options.size) {
      wrapper.style.setProperty('--icon-size', options.size);
    }

    // Load SVG content asynchronously
    this.loadSvg(name).then(svgContent => {
      if (svgContent) {
        wrapper.innerHTML = svgContent;
      }
    }).catch(error => {
      console.warn(`Failed to load icon: ${name}`, error);
    });

    return wrapper;
  }

  /**
   * Load SVG with caching
   * @param {string} name - Icon name
   * @returns {Promise<string>} - SVG content
   */
  async loadSvg(name) {
    // Check cache first
    if (this.iconCache.has(name)) {
      return this.iconCache.get(name);
    }

    try {
      const response = await fetch(`${this.basePath}${name}.svg`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const svgText = await response.text();

      // Cache the result
      this.iconCache.set(name, svgText);

      return svgText;
    } catch (error) {
      console.error(`Failed to load icon: ${name}`, error);
      return ''; // Graceful degradation
    }
  }

  /**
   * Preload icons for better performance
   * @param {string[]} iconNames - Array of icon names to preload
   * @returns {Promise<void>}
   */
  async preload(iconNames) {
    const promises = iconNames.map(name => this.loadSvg(name));
    await Promise.all(promises);
  }

  /**
   * Clear the icon cache
   */
  clearCache() {
    this.iconCache.clear();
  }
}

// Singleton instance
export const iconRenderer = new IconRenderer();

/**
 * Convenience function to create an icon
 * @param {string} name - Icon name
 * @param {string} className - Additional CSS classes
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} - Icon element
 */
export function createIcon(name, className = '', options = {}) {
  return iconRenderer.create(name, className, options);
}

/**
 * Preload commonly used icons
 * Call this early in your app initialization for better performance
 * @param {string[]} iconNames - Array of icon names to preload
 * @returns {Promise<void>}
 */
export function preloadIcons(iconNames) {
  return iconRenderer.preload(iconNames);
}
