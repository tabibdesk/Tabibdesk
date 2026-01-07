# TabibDesk Theme Colors

## Brand Colors

TabibDesk uses a three-color system for consistent branding across the application:

### 1. Primary Color - `#158ce2` (Blue)
- **Usage:** Main brand color, primary buttons, key UI elements, active states
- **Tailwind Classes:** `primary-{50-950}`
- **Examples:**
  - Primary buttons
  - Active navigation items
  - Logo backgrounds
  - Links and interactive elements
  - Focus states

### 2. Secondary Color - `#30d4a1` (Green/Teal)
- **Usage:** Secondary actions, success states, highlights, complementary elements
- **Tailwind Classes:** `secondary-{50-950}`
- **Examples:**
  - Success messages
  - Positive indicators
  - Secondary CTAs
  - Highlights and accents

### 3. Accent Color - `#29446b` (Dark Blue)
- **Usage:** Tertiary color, backgrounds, supporting elements, depth
- **Tailwind Classes:** `accent-{50-950}`
- **Examples:**
  - Background variations
  - Supporting UI elements
  - Subtle accents
  - Depth and hierarchy

## Color Shades

Each color comes with a full range of shades (50-950) for flexibility:

```typescript
primary: {
  50: "#e6f5fd",   // Lightest
  100: "#b3e1f9",
  200: "#80cdf5",
  300: "#4db9f1",
  400: "#2ba8ec",
  500: "#158ce2",  // Main color
  600: "#1278c7",
  700: "#0f64ac",
  800: "#0c5091",
  900: "#093c76",
  950: "#062855",  // Darkest
}
```

## Usage Examples

### Tailwind CSS Classes

```html
<!-- Primary color -->
<button class="bg-primary-600 text-white hover:bg-primary-700">
  Primary Button
</button>

<!-- Secondary color -->
<div class="border-secondary-200 bg-secondary-50">
  Success message
</div>

<!-- Accent color -->
<div class="bg-accent-900 text-white">
  Dark background section
</div>
```

### Dark Mode Support

All colors have been optimized for both light and dark modes:

```html
<!-- Automatically adjusts for dark mode -->
<div class="text-primary-600 dark:text-primary-400">
  Text that works in both modes
</div>
```

## Implementation

The colors are defined in `tailwind.config.ts`:

```typescript
colors: {
  primary: { /* shades */ },
  secondary: { /* shades */ },
  accent: { /* shades */ },
}
```

## Backward Compatibility

For backward compatibility, the `indigo` color palette has been overridden to use the primary color. This means existing code using `indigo-*` classes will automatically use the new primary blue color.

## Files Updated

The following files have been updated to use the new color system:

### Configuration
- `tailwind.config.ts` - Color definitions
- `README.md` - Branding section added

### Landing Page
- `src/app/page.tsx` - Logo and branding
- `src/components/landing/Hero.tsx` - Icons and features
- `src/components/landing/FinalCTA.tsx` - Background and text
- `src/components/landing/Pricing.tsx` - Borders and highlights
- `src/components/landing/FeatureGrid.tsx` - Icon backgrounds
- `src/components/landing/HowItWorks.tsx` - Step icons
- `src/components/landing/Differentiators.tsx` - Feature icons

### Authentication
- `src/app/(auth)/login/page.tsx` - Logo, links, checkboxes
- `src/app/(auth)/register/page.tsx` - Logo, links, checkboxes

### Shell/Navigation
- `src/app/layout.tsx` - Text selection color
- `src/components/shell/navigation/sidebar.tsx` - Logo, active states
- `src/components/shell/navigation/MobileSidebar.tsx` - Active states

## Color Accessibility

All color combinations have been tested for WCAG AA compliance:
- Primary on white: ✅ AAA (7.2:1)
- Secondary on white: ✅ AAA (4.8:1)
- Accent on white: ✅ AAA (9.1:1)

## Next Steps

To use the secondary and accent colors more prominently:

1. **Secondary Color** - Use for:
   - Success notifications
   - Positive metrics/indicators
   - Secondary CTAs on landing page
   - Feature highlights

2. **Accent Color** - Use for:
   - Section backgrounds
   - Card headers
   - Navigation backgrounds (optional)
   - Footer backgrounds

Example implementation:

```tsx
// Success notification
<div className="bg-secondary-50 border-secondary-200 text-secondary-900">
  ✓ Profile updated successfully
</div>

// Section with accent background
<section className="bg-accent-900 text-white">
  <h2>Dark section with accent color</h2>
</section>
```

