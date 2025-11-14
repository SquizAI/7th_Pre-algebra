# CSS Architecture - 7th-PreAlgebra Application

## Overview

This application uses **Atomic Design methodology** for CSS organization, providing a scalable, maintainable, and consistent styling system.

## Directory Structure

```
css/
├── foundation/          # Design tokens, reset, base styles
│   ├── tokens.css      # Design tokens (colors, spacing, typography)
│   ├── reset.css       # Modern CSS reset
│   └── base.css        # Base HTML element styles
│
├── atoms/              # Smallest reusable components
│   ├── buttons.css     # Button styles and variants
│   ├── typography.css  # Text utility classes
│   └── spacing.css     # Margin, padding, gap utilities
│
├── molecules/          # Simple component combinations
│   ├── cards.css       # Card components
│   └── forms.css       # Form input groups
│
├── organisms/          # Complex, feature-rich components
│   ├── header.css      # Application header
│   ├── navigation.css  # Navigation components
│   └── hero-lesson.css # Hero lesson sections
│
├── utilities/          # Helper classes
│   ├── layout.css      # Display, flexbox, grid, positioning
│   └── helpers.css     # Borders, shadows, colors, animations
│
├── main.css            # Main entry point (imports all files)
└── styles.css          # Legacy styles (for backwards compatibility)
```

## Design System

### 1. Design Tokens (foundation/tokens.css)

All design values are centralized in CSS custom properties:

#### Colors
- **Primary**: `--color-primary-50` through `--color-primary-900`
- **Accent**: `--color-accent-400` through `--color-accent-600`
- **Semantic**: Success, Danger, Warning, Info (50-700 shades)
- **Neutral**: `--color-neutral-50` through `--color-neutral-900`

#### Spacing (4px base grid)
- `--space-1` (4px) through `--space-32` (128px)

#### Typography
- **Sizes**: `--text-xs` (12px) through `--text-6xl` (60px)
- **Weights**: light (300) through extrabold (800)
- **Line Heights**: tight (1.25) through loose (2)

#### Other Tokens
- Border radius: `--radius-sm` through `--radius-full`
- Shadows: `--shadow-sm` through `--shadow-2xl`
- Z-index: `--z-dropdown` through `--z-notification`
- Transitions: `--transition-fast` through `--transition-slower`

### 2. Usage Guidelines

#### Using Design Tokens

Always reference design tokens instead of hard-coded values:

```css
/* Good */
.my-component {
  color: var(--color-primary-500);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

/* Bad */
.my-component {
  color: #5568d3;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
}
```

#### Atomic Classes

Prefer composing atomic classes instead of creating custom styles:

```html
<!-- Good: Compose atomic classes -->
<button class="btn btn-primary btn-lg">Click Me</button>
<div class="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md">
  Content here
</div>

<!-- Bad: Inline styles -->
<button style="padding: 20px 40px; background: #667eea; color: white;">
  Click Me
</button>
```

#### Component Classes

For complex components, create semantic classes:

```css
/* Component-specific styles */
.lesson-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base) var(--ease-out);
}

.lesson-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}
```

## Atomic Design Layers

### Foundation Layer

**Purpose**: Provide the foundation for all styles

**Files**:
- `tokens.css` - Design tokens (must load first)
- `reset.css` - Browser consistency
- `base.css` - Sensible defaults for HTML elements

### Atoms Layer

**Purpose**: Smallest, single-purpose components

**Examples**:
- Buttons: `.btn`, `.btn-primary`, `.btn-lg`
- Typography: `.text-xl`, `.font-bold`, `.text-center`
- Spacing: `.p-4`, `.mt-6`, `.gap-3`

### Molecules Layer

**Purpose**: Simple combinations of atoms

**Examples**:
- Cards with header, body, footer
- Form groups with label, input, help text
- Button groups

### Organisms Layer

**Purpose**: Complex, feature-rich components

**Examples**:
- Application header with logo, navigation, stats
- Navigation menus
- Hero sections with multiple elements

### Utilities Layer

**Purpose**: Helper classes for quick styling

**Examples**:
- Layout: `.flex`, `.grid`, `.absolute`
- Helpers: `.shadow-lg`, `.rounded-md`, `.opacity-50`

## Responsive Design

### Mobile-First Approach

All styles are mobile-first. Use media queries to enhance for larger screens:

```css
/* Mobile-first base styles */
.component {
  flex-direction: column;
  padding: var(--space-4);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    flex-direction: row;
    padding: var(--space-6);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-8);
  }
}
```

### Breakpoints

- **Mobile**: < 768px (default)
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px
- **Wide**: ≥ 1280px

### Responsive Utility Classes

```html
<!-- Hide on mobile, show on desktop -->
<div class="hide-mobile">Desktop only content</div>

<!-- Show only on mobile -->
<div class="show-mobile">Mobile only content</div>
```

## Accessibility

### Focus States

All interactive elements have visible focus states:

```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Reduced Motion

Respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Readers

Use `.sr-only` for screen reader-only content:

```html
<span class="sr-only">Additional context for screen readers</span>
```

## Performance Best Practices

1. **Use CSS Variables**: Design tokens are cached by the browser
2. **Minimize Specificity**: Use single classes when possible
3. **Avoid Deep Nesting**: Keep selectors shallow (max 3 levels)
4. **Reuse Classes**: Prefer atomic classes over custom styles
5. **Lazy Load**: Only import CSS files that are needed

## Common Patterns

### Card Component

```html
<div class="card card-interactive">
  <div class="card__header">
    <h3 class="card__title">Title</h3>
    <p class="card__subtitle">Subtitle</p>
  </div>
  <div class="card__body">
    <p>Content goes here...</p>
  </div>
  <div class="card__footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Form Group

```html
<div class="form-group">
  <label class="form-label form-label--required" for="email">
    Email Address
  </label>
  <input
    type="email"
    id="email"
    class="form-input"
    placeholder="you@example.com"
  />
  <span class="form-help">We'll never share your email.</span>
</div>
```

### Flexbox Layout

```html
<div class="flex items-center justify-between gap-4 p-6">
  <div class="flex-1">Left content</div>
  <div>Right content</div>
</div>
```

### Grid Layout

```html
<div class="grid grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Migration from Legacy Styles

The `styles.css` file is imported at the end of `main.css` for backwards compatibility. To migrate:

1. Identify component in `styles.css`
2. Extract design values to use tokens
3. Refactor to atomic classes or create new component
4. Test thoroughly
5. Remove from `styles.css`

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Note**: Uses modern CSS features (Grid, Flexbox, CSS Variables). No IE11 support.

## Contributing

When adding new styles:

1. **Check existing classes first** - Can you compose from atoms/utilities?
2. **Use design tokens** - Never hard-code colors, spacing, etc.
3. **Follow naming conventions** - Use BEM for components, atomic for utilities
4. **Add comments** - Document complex components
5. **Test responsiveness** - Verify on mobile, tablet, desktop
6. **Check accessibility** - Ensure keyboard navigation and focus states

## Questions?

- Check `foundation/tokens.css` for available design tokens
- Look in `atoms/` and `utilities/` for available utility classes
- Review `molecules/` and `organisms/` for component examples
- Refer to this README for architectural guidance
