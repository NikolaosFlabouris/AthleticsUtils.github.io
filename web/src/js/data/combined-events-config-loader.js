/**
 * Combined Events Config Loader
 *
 * Loads and provides access to combined events configuration data including:
 * - Combined event definitions (pentathlon, heptathlon, decathlon)
 * - Individual event parameters for scoring formulas
 * - Hand timing offsets for track events
 */

class CombinedEventsConfigLoader {
    constructor() {
        this.config = null;
        this.loading = null;
    }

    /**
     * Load the combined events configuration
     * @returns {Promise<Object>} The loaded configuration
     */
    async loadConfig() {
        if (this.config) {
            return this.config;
        }

        if (this.loading) {
            return this.loading;
        }

        this.loading = fetch('/data/combined-event-config.min.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load combined events config: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.config = data;
                this.loading = null;
                return data;
            })
            .catch(error => {
                this.loading = null;
                throw error;
            });

        return this.loading;
    }

    /**
     * Get all combined events for a specific gender
     * @param {string} gender - 'men' or 'women'
     * @returns {Promise<Object>} Combined events for the gender
     */
    async getCombinedEvents(gender) {
        const config = await this.loadConfig();
        return config[gender]?.combined || {};
    }

    /**
     * Get a specific combined event configuration
     * @param {string} gender - 'men' or 'women'
     * @param {string} eventKey - Combined event key (e.g., 'decathlon')
     * @returns {Promise<Object|null>} Combined event configuration
     */
    async getCombinedEvent(gender, eventKey) {
        const config = await this.loadConfig();
        return config[gender]?.combined?.[eventKey] || null;
    }

    /**
     * Get scoring parameters for a specific event
     * @param {string} gender - 'men' or 'women'
     * @param {string} eventKey - Event key (e.g., '100m', 'lj')
     * @returns {Promise<Object|null>} Event parameters {a, b, c, measurement, displayName}
     */
    async getEventParameters(gender, eventKey) {
        const config = await this.loadConfig();
        return config[gender]?.events?.[eventKey] || null;
    }

    /**
     * Get hand timing offset for an event
     * @param {string} eventKey - Event key (e.g., '100m')
     * @returns {Promise<number>} Offset in seconds (0 if not applicable)
     */
    async getHandTimingOffset(eventKey) {
        const config = await this.loadConfig();
        const offsets = config.handTimingOffsets || [];

        for (const offsetGroup of offsets) {
            if (offsetGroup.events.includes(eventKey)) {
                return offsetGroup.offset;
            }
        }

        return 0;
    }

    /**
     * Check if an event supports hand timing
     * @param {string} eventKey - Event key (e.g., '100m')
     * @returns {Promise<boolean>} True if hand timing is applicable
     */
    async isHandTimeable(eventKey) {
        const offset = await this.getHandTimingOffset(eventKey);
        return offset > 0;
    }

    /**
     * Get all events for a combined event with their parameters
     * @param {string} gender - 'men' or 'women'
     * @param {string} combinedEventKey - Combined event key
     * @returns {Promise<Array>} Array of event objects with parameters
     */
    async getCombinedEventDetails(gender, combinedEventKey) {
        const combinedEvent = await this.getCombinedEvent(gender, combinedEventKey);
        if (!combinedEvent) {
            return [];
        }

        const events = combinedEvent.events.flat(); // Flatten all days
        const eventDetails = [];

        for (const eventKey of events) {
            const params = await this.getEventParameters(gender, eventKey);
            const isHandTimeable = await this.isHandTimeable(eventKey);

            if (params) {
                eventDetails.push({
                    key: eventKey,
                    ...params,
                    isHandTimeable
                });
            }
        }

        return eventDetails;
    }
}

// Export singleton instance
export const combinedEventsConfigLoader = new CombinedEventsConfigLoader();
