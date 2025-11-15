/**
 * Combined Events Scorer
 *
 * Implements World Athletics combined events scoring formulas:
 * - Track events: P = a × (b - T)^c [T = time in seconds]
 * - Field events (jumps): P = a × (M - b)^c [M = measurement in centimeters]
 * - Field events (throws): P = a × (D - b)^c [D = distance in meters]
 *
 * Points (P) are always rounded down (floored) to the nearest whole number.
 */

/**
 * Calculate score for an event based on performance
 * @param {number} performance - The performance value (time in seconds, distance in meters, or height in cm)
 * @param {Object} parameters - Scoring parameters {a, b, c}
 * @param {string} measurementType - 'time', 'distance', or 'height'
 * @returns {number} Points scored (floored to whole number)
 */
export function calculateEventScore(performance, parameters, measurementType) {
    const { a, b, c } = parameters;

    let points = 0;

    if (measurementType === 'time') {
        // Track events: P = a × (b - T)^c
        // Performance should be in seconds
        const timeDiff = b - performance;
        if (timeDiff <= 0) {
            // Performance is worse than the base value
            return 0;
        }
        points = a * Math.pow(timeDiff, c);
    } else if (measurementType === 'height') {
        // Jumps: P = a × (M - b)^c
        // Performance should be in centimeters
        const heightDiff = performance - b;
        if (heightDiff <= 0) {
            // Performance is below the base value
            return 0;
        }
        points = a * Math.pow(heightDiff, c);
    } else if (measurementType === 'distance') {
        // Throws: P = a × (D - b)^c
        // Performance should be in meters for throws, but centimeters for long jump
        const distanceDiff = performance - b;
        if (distanceDiff <= 0) {
            // Performance is below the base value
            return 0;
        }
        points = a * Math.pow(distanceDiff, c);
    }

    // Floor to nearest whole number
    return Math.floor(points);
}

/**
 * Apply hand timing offset to a time performance
 * @param {number} time - Time in seconds
 * @param {number} offset - Offset to add in seconds
 * @returns {number} Adjusted time in seconds
 */
export function applyHandTimingOffset(time, offset) {
    return time + offset;
}

/**
 * Validate that a performance value is valid (positive number)
 * @param {number} value - The performance value to validate
 * @returns {boolean} True if valid
 */
export function validatePerformance(value) {
    return typeof value === 'number' && value > 0 && !isNaN(value) && isFinite(value);
}

/**
 * Convert performance string to appropriate numeric value based on measurement type
 * @param {string} performanceStr - Performance as entered by user
 * @param {string} measurementType - 'time', 'distance', or 'height'
 * @param {string} eventKey - Event identifier (for context)
 * @returns {number|null} Converted value or null if invalid
 */
export function convertPerformanceToValue(performanceStr, measurementType, eventKey) {
    if (!performanceStr || typeof performanceStr !== 'string') {
        return null;
    }

    const trimmed = performanceStr.trim();
    if (!trimmed) {
        return null;
    }

    if (measurementType === 'time') {
        // Parse time format: (hh):(mm):ss.(SS)
        // Could be: "10.5", "1:23.4", "1:23:45.6"
        return parseTimeToSeconds(trimmed);
    } else if (measurementType === 'distance') {
        // Distance in meters (for throws) or centimeters (for long jump)
        // User enters in meters, convert as needed
        const value = parseFloat(trimmed.replace(/[^\d.]/g, ''));
        if (isNaN(value)) {
            return null;
        }
        // Long jump uses centimeters in formula, others use meters
        if (eventKey === 'lj') {
            return value * 100; // Convert meters to centimeters
        }
        return value; // Meters for throws
    } else if (measurementType === 'height') {
        // Height in centimeters
        // User enters in meters, convert to centimeters
        const value = parseFloat(trimmed.replace(/[^\d.]/g, ''));
        if (isNaN(value)) {
            return null;
        }
        return value * 100; // Convert meters to centimeters
    }

    return null;
}

/**
 * Parse time string to seconds
 * Supports formats: "10.5", "1:23.4", "1:23:45.6"
 * @param {string} timeStr - Time string
 * @returns {number|null} Time in seconds or null if invalid
 */
function parseTimeToSeconds(timeStr) {
    // Remove any whitespace
    timeStr = timeStr.trim();

    // Check for colon-separated format
    if (timeStr.includes(':')) {
        const parts = timeStr.split(':');

        if (parts.length === 2) {
            // Format: mm:ss.SS
            const minutes = parseInt(parts[0], 10);
            const seconds = parseFloat(parts[1]);

            if (isNaN(minutes) || isNaN(seconds)) {
                return null;
            }

            return minutes * 60 + seconds;
        } else if (parts.length === 3) {
            // Format: hh:mm:ss.SS
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            const seconds = parseFloat(parts[2]);

            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                return null;
            }

            return hours * 3600 + minutes * 60 + seconds;
        }
    } else {
        // Simple format: just seconds
        const seconds = parseFloat(timeStr);
        if (isNaN(seconds)) {
            return null;
        }
        return seconds;
    }

    return null;
}

/**
 * Format a numeric value back to display format
 * @param {number} value - The numeric value
 * @param {string} measurementType - 'time', 'distance', or 'height'
 * @param {string} eventKey - Event identifier
 * @returns {string} Formatted display string
 */
export function formatPerformanceDisplay(value, measurementType, eventKey) {
    if (measurementType === 'time') {
        return formatSecondsToTime(value);
    } else if (measurementType === 'distance') {
        if (eventKey === 'lj') {
            // Convert cm back to meters for display
            return (value / 100).toFixed(2) + 'm';
        }
        return value.toFixed(2) + 'm';
    } else if (measurementType === 'height') {
        // Convert cm back to meters for display
        return (value / 100).toFixed(2) + 'm';
    }
    return value.toString();
}

/**
 * Format seconds to time string
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatSecondsToTime(seconds) {
    if (seconds < 60) {
        return seconds.toFixed(2) + 's';
    } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toFixed(2).padStart(5, '0')}`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
    }
}
