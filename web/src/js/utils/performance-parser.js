/**
 * Performance Parser Utilities
 * Parse and format athletic performance values
 */

import { eventConfigLoader } from '../data/event-config-loader.js';

/**
 * Parse a performance string and normalize it to match data format
 * For times: converts to seconds (to match minified JSON format)
 * @param {string} input - Raw input (e.g., "10.5", "10.50", "1:30.5", "7.50m")
 * @param {string} eventKey - Event key to determine measurement format
 * @returns {string|null} Normalized performance string or null if invalid
 */
export function parsePerformance(input, eventKey) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Remove whitespace and convert to lowercase
  const cleaned = input.trim().toLowerCase();

  // Remove common units (m, s, sec, meters, seconds)
  const withoutUnits = cleaned.replace(/[ms]$|sec$|meters?$|seconds?$/i, '').trim();

  // Get event info to determine measurement format
  const eventInfo = eventConfigLoader.getEventInfo(eventKey);
  const measurementFormat = eventInfo?.measurementFormat || 'time';

  if (measurementFormat === 'distance') {
    // Distance event - parse as decimal number
    return parseDistance(withoutUnits);
  } else if (measurementFormat === 'points') {
    // Points event - parse as integer
    return parsePoints(withoutUnits);
  } else {
    // Time event - parse as time and convert to seconds for lookup
    return parseTime(withoutUnits);
  }
}

/**
 * Parse a distance value
 * @param {string} value
 * @returns {string|null}
 */
function parseDistance(value) {
  const num = parseFloat(value);

  if (isNaN(num) || num <= 0) {
    return null;
  }

  // Format with 2 decimal places for consistency
  return num.toFixed(2);
}

/**
 * Parse a time value (handles HH:MM:SS.ss, MM:SS.ss, or SS.ss formats)
 * Converts to seconds to match the minified JSON data format
 * @param {string} value
 * @returns {string|null}
 */
function parseTime(value) {
  // Check if it contains a colon (time format)
  if (value.includes(':')) {
    const parts = value.split(':');

    // Handle HH:MM:SS or HH:MM:SS.ss format
    if (parts.length === 3) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseFloat(parts[2]);

      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
          hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
        return null;
      }

      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      // Return integer if no decimals in original seconds, else 2 decimals
      const hasDecimals = parts[2].includes('.');
      return hasDecimals ? totalSeconds.toFixed(2) : totalSeconds.toString();
    }

    // Handle MM:SS or MM:SS.ss format
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseFloat(parts[1]);

      if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
        return null;
      }

      const totalSeconds = minutes * 60 + seconds;

      // Return integer if no decimals in original seconds, else 2 decimals
      const hasDecimals = parts[1].includes('.');
      return hasDecimals ? totalSeconds.toFixed(2) : totalSeconds.toString();
    }

    return null;
  }

  // Simple seconds format (SS or SS.ss)
  const num = parseFloat(value);

  if (isNaN(num) || num <= 0) {
    return null;
  }

  // Return integer if no decimals, else 2 decimals
  const hasDecimals = value.includes('.');
  return hasDecimals ? num.toFixed(2) : num.toString();
}

/**
 * Parse a points value
 * @param {string} value
 * @returns {string|null}
 */
function parsePoints(value) {
  const num = parseInt(value, 10);

  if (isNaN(num) || num <= 0) {
    return null;
  }

  return num.toString();
}

/**
 * Check if an event is a distance (field) event
 * @param {string} event
 * @returns {boolean}
 */
function isDistanceEvent(event) {
  const distanceEvents = ['LJ', 'TJ', 'SP', 'DT', 'HT', 'JT', 'PV', 'HJ'];

  // Check if event name contains any of the distance event codes
  return distanceEvents.some(code => event.toUpperCase().includes(code));
}

/**
 * Format a performance value for display
 * Converts seconds back to human-readable time format
 * @param {string} performance - Performance value from data (in seconds for time events)
 * @param {string} eventKey - Event key
 * @returns {string} Formatted performance with units
 */
export function formatPerformance(performance, eventKey) {
  if (!performance) {
    return '';
  }

  const eventInfo = eventConfigLoader.getEventInfo(eventKey);
  const measurementFormat = eventInfo?.measurementFormat || 'time';

  if (measurementFormat === 'distance') {
    // Distance - add 'm' suffix
    return `${performance}m`;
  } else if (measurementFormat === 'points') {
    // Points - just the number
    return performance;
  } else {
    // Time - convert seconds to readable format
    return formatTimeFromSeconds(performance);
  }
}

/**
 * Format seconds to human-readable time format
 * - Less than 60s: "10.50s" or "10s"
 * - Less than 1 hour: "12:10.50" or "12:10"
 * - 1 hour or more: "1:23:45.50" or "1:23:45"
 * @param {string|number} seconds
 * @returns {string}
 */
function formatTimeFromSeconds(seconds) {
  const num = parseFloat(seconds);

  if (isNaN(num)) {
    return seconds;
  }

  // Determine if we have decimals (check if it's an integer)
  const hasDecimals = !Number.isInteger(num) && num.toFixed(2) !== num.toFixed(0);

  // Less than 60 seconds - show as SS.ss or SS
  if (num < 60) {
    if (hasDecimals) {
      return `${num.toFixed(2)}s`;
    }
    return `${Math.floor(num)}s`;
  }

  // Less than 1 hour - show as MM:SS.ss or MM:SS
  if (num < 3600) {
    const minutes = Math.floor(num / 60);
    const secs = num % 60;

    if (hasDecimals) {
      const secStr = secs.toFixed(2).padStart(5, '0');
      return `${minutes}:${secStr}`;
    }
    const secStr = Math.floor(secs).toString().padStart(2, '0');
    return `${minutes}:${secStr}`;
  }

  // 1 hour or more - show as HH:MM:SS.ss or HH:MM:SS
  const hours = Math.floor(num / 3600);
  const minutes = Math.floor((num % 3600) / 60);
  const secs = num % 60;

  if (hasDecimals) {
    const secStr = secs.toFixed(2).padStart(5, '0');
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secStr}`;
  }
  const secStr = Math.floor(secs).toString().padStart(2, '0');
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secStr}`;
}

/**
 * Get the unit for an event
 * @param {string} eventKey
 * @returns {string}
 */
export function getEventUnit(eventKey) {
  const eventInfo = eventConfigLoader.getEventInfo(eventKey);
  const measurementFormat = eventInfo?.measurementFormat || 'time';

  if (measurementFormat === 'distance') {
    return 'm';
  } else if (measurementFormat === 'points') {
    return 'points';
  } else {
    return 's';
  }
}

/**
 * Get example placeholder text for an event
 * @param {string} eventKey
 * @returns {string}
 */
export function getPerformancePlaceholder(eventKey) {
  const eventInfo = eventConfigLoader.getEventInfo(eventKey);
  const measurementFormat = eventInfo?.measurementFormat || 'time';

  if (measurementFormat === 'distance') {
    return 'e.g., 7.50 or 7.50m';
  } else if (measurementFormat === 'points') {
    return 'e.g., 8500';
  } else {
    // Time event - show appropriate example based on event distance
    const distance = eventInfo?.distance;
    if (distance && distance <= 400) {
      return 'e.g., 10.5 or 10.50';
    } else if (distance && distance <= 2000) {
      return 'e.g., 1:30 or 1:30.5';
    } else {
      return 'e.g., 12:10 or 1:23:45';
    }
  }
}

/**
 * Validate if a performance is in valid range for an event
 * @param {string} performance
 * @param {string} event
 * @returns {boolean}
 */
export function isValidPerformance(performance, event) {
  const num = parseFloat(performance);

  if (isNaN(num) || num <= 0) {
    return false;
  }

  const isFieldEvent = isDistanceEvent(event);

  if (isFieldEvent) {
    // Distance events: reasonable range 0.01m to 100m
    return num >= 0.01 && num <= 100;
  } else {
    // Time events: reasonable range 0.01s to 7200s (2 hours)
    return num >= 0.01 && num <= 7200;
  }
}
