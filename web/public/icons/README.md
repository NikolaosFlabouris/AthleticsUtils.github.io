# Athletics Utilities Icons

This directory contains icon assets for the Athletics Utilities PWA.

## PWA Icons

These icons are used for the Progressive Web App installation:

- `icon-192.png` - 192x192 pixel PNG icon
- `icon-512.png` - 512x512 pixel PNG icon
- `favicon.svg` - SVG favicon (already included)

### Generating PWA Icons

You can generate the PNG icons from the SVG using an online tool or image editor:

1. Open `favicon.svg` in a browser or image editor
2. Export/save as PNG at 192x192 pixels (save as `icon-192.png`)
3. Export/save as PNG at 512x512 pixels (save as `icon-512.png`)

Or use an online converter:
- https://cloudconvert.com/svg-to-png
- https://www.aconvert.com/image/svg-to-png/

## UI Icons (`ui/`)

SVG icons used throughout the application interface.

### Icon Source

Icons from [Lucide Icons](https://lucide.dev)
Licensed under ISC License
Copyright (c) 2024 Lucide Contributors

### Icon List

| Icon Name | Usage | Size |
|-----------|-------|------|
| home | Navigation - Home page | 20px |
| timer | Navigation - Pace Calculator | 20px |
| trophy | Navigation - Score Calculator | 20px |
| layers | Navigation - Combined Events | 20px |
| chevron-down | Event dropdown indicator | 16-20px |
| search | Event search input | 16px |
| x | Delete/close actions | 16-20px |
| calculator | Calculate button | 18px |
| refresh-cw | Clear/Reset button | 18px |
| alert-circle | Error messages | 20-24px |
| check-circle | Success messages | 20-24px |
| info | Info sections | 20px |
| loader | Loading spinner | 20-24px |
| external-link | External links | 16px |
| github | GitHub link | 20px |
| arrow-right | CTAs and navigation | 16-20px |
| help-circle | Help/tooltips | 20px |
| heart | Donation link | 18px |

### Adding a New Icon

1. Visit [Lucide Icons](https://lucide.dev)
2. Search for the desired icon
3. Click the icon and select "Copy SVG"
4. Save to `ui/[icon-name].svg`

### SVG Requirements

Ensure icons meet these requirements:
- `viewBox="0 0 24 24"`
- `stroke="currentColor"` (not hard-coded colors)
- `fill="none"` (for line icons)
- `stroke-width="2"`
- `stroke-linecap="round"` and `stroke-linejoin="round"`

### Usage in JavaScript

```javascript
import { createIcon } from '../src/js/components/icon.js';

// Basic usage
const icon = createIcon('home');
element.appendChild(icon);

// With classes
const icon = createIcon('home', 'icon--lg icon--primary');

// With accessibility
const icon = createIcon('home', '', {
  ariaLabel: 'Home page',
  size: '2rem'
});
```

### Dark Mode Support

Icons automatically adapt to dark mode using `currentColor` to inherit from parent elements.
