# World Athletics Scoring Tables Extractor

This tool extracts World Athletics scoring tables from PDF documents and converts them to JSON format for use in the Athletics Utils website.

## Features

- Extracts scoring data from official World Athletics PDF tables
- Outputs both pretty-printed and minified JSON formats
- Automatically publishes minified data to the website's `public/data/` directory
- Supports merging with existing data
- Validates extracted data structure

## Installation

```bash
cd tools/scoring-table-extractor
npm install
```

## Usage

### Extract and Publish to Website

The recommended way to update the website's scoring data:

```bash
npm run publish
```

This will:
1. Extract data from `World_Athletics_Scoring_Tables_of_Athletics_2025.pdf`
2. Generate `athletics_scoring_tables.json` (pretty-printed, 2.4MB)
3. Generate `athletics_scoring_tables.min.json` (minified, 1.4MB)
4. **Automatically copy the minified version to `../../public/data/athletics_scoring_tables.min.json`**

### Custom PDF Extraction

Extract from a specific PDF file:

```bash
npm start [input-pdf] [output-json]
```

Examples:
```bash
npm start scoring_tables.pdf output.json
node index.js field_events.pdf field_events.json
```

### Merge with Existing Data

Merge new data with existing JSON file:

```bash
node index.js new_events.pdf output.json --merge
```

### Validate Extracted Data

```bash
npm run validate [json-file]
```

### View Usage Examples

```bash
npm run examples [json-file]
```

## Output

The tool generates two files in the `tools/scoring-table-extractor/` directory:

1. **`athletics_scoring_tables.json`** (2.4MB)
   - Pretty-printed format for human readability
   - Stays in the tool directory for development/debugging
   - Not used by the website

2. **`athletics_scoring_tables.min.json`** (1.4MB)
   - Minified format (no whitespace)
   - Automatically published to `../../public/data/` for website use
   - This is the file loaded by the website

## Data Structure

The extracted data is organized as:

```json
{
  "gender": {
    "category": {
      "event": [
        [points, "performance"],
        [1400, "9.46"],
        [1396, "9.47"]
      ]
    }
  }
}
```

Example:
```json
{
  "men": {
    "sprints": {
      "100m": [
        [1400, "9.46"],
        [1396, "9.47"],
        [1393, "9.48"]
      ]
    }
  }
}
```

## Supported Events

The tool extracts data for all World Athletics events including:

### Track Events
- Sprints: 100m, 200m, 400m
- Middle Distance: 800m, 1500m, Mile
- Long Distance: 3000m, 5000m, 10000m
- Hurdles: 100mH, 110mH, 400mH
- Steeplechase: 2000mSC, 3000mSC
- Race Walks: 3000mW, 5000mW, 10000mW, 20000mW

### Field Events
- Jumps: High Jump, Pole Vault, Long Jump, Triple Jump
- Throws: Shot Put, Discus, Hammer, Javelin

### Combined Events
- Decathlon, Heptathlon, Pentathlon

### Relays
- 4x100m, 4x200m, 4x400m (including mixed variants)

## File Locations

```
tools/scoring-table-extractor/
├── index.js                              # Main extraction tool
├── events-config.js                      # Event definitions
├── package.json                          # Tool dependencies
├── athletics_scoring_tables.json         # Full data (dev only)
└── athletics_scoring_tables.min.json     # Minified (dev only)

public/data/
└── athletics_scoring_tables.min.json     # Published to website
```

## Workflow

1. **Update PDF** (when new scoring tables are released)
   - Download latest PDF from World Athletics
   - Place in `tools/scoring-table-extractor/` directory
   - Name it `World_Athletics_Scoring_Tables_of_Athletics_2025.pdf` or update the filename in package.json

2. **Extract and Publish**
   ```bash
   npm run publish
   ```

3. **Verify**
   ```bash
   npm run validate athletics_scoring_tables.json
   ```

4. **Test Website**
   - Run `npm run dev` from project root
   - Navigate to Performance Calculator
   - Verify data loads correctly

5. **Commit Changes**
   ```bash
   git add public/data/athletics_scoring_tables.min.json
   git commit -m "Update scoring tables to 2025 version"
   ```

## Development

### Event Configuration

Event definitions are in [events-config.js](events-config.js). To add new events:

1. Add event to appropriate category in `eventsConfig`
2. Define parsing rules if needed
3. Run extraction
4. Validate output

### Debugging

The tool outputs extraction progress:
- Section detection (gender, category)
- Table header detection
- Data row parsing
- Summary statistics

Check console output for warnings about:
- Unknown events
- Invalid data formats
- Parsing errors

## Dependencies

- `pdf-parse` (^1.1.1) - PDF text extraction
- Node.js >= 14.0.0

## License

ISC

## Notes

- The tool automatically handles the complex cross-referenced table format used in World Athletics PDFs
- Duplicate entries are removed (keeping highest points for same performance)
- Data is sorted by points in descending order
- The minified version is ~40% smaller than pretty-printed (1.4MB vs 2.4MB)
