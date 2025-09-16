# SkillLift Design System Guide

## Color Palette

### Primary Colors (Indigo)
- **Primary-50**: `#EEF2FF` - Lightest background
- **Primary-100**: `#E0E7FF` - Light background
- **Primary-200**: `#C7D2FE` - Light border
- **Primary-300**: `#A5B4FC` - Medium light
- **Primary-400**: `#818CF8` - Medium
- **Primary-500**: `#6366F1` - Base
- **Primary-600**: `#4F46E5` - **Main Primary** (buttons, links)
- **Primary-700**: `#4338CA` - Dark
- **Primary-800**: `#3730A3` - Darker
- **Primary-900**: `#312E81` - Darkest

### Secondary Colors (Emerald)
- **Secondary-50**: `#ECFDF5` - Lightest background
- **Secondary-100**: `#D1FAE5` - Light background
- **Secondary-200**: `#A7F3D0` - Light border
- **Secondary-300**: `#6EE7B7` - Medium light
- **Secondary-400**: `#34D399` - Medium
- **Secondary-500**: `#10B981` - **Main Secondary** (success states)
- **Secondary-600**: `#059669` - Dark
- **Secondary-700**: `#047857` - Darker
- **Secondary-800**: `#065F46` - Darker
- **Secondary-900**: `#064E3B` - Darkest

### Accent Colors (Amber)
- **Accent-50**: `#FFFBEB` - Lightest background
- **Accent-100**: `#FEF3C7` - Light background
- **Accent-200**: `#FDE68A` - Light border
- **Accent-300**: `#FCD34D` - Medium light
- **Accent-400**: `#FBBF24` - Medium
- **Accent-500**: `#F59E0B` - **Main Accent** (warnings, highlights)
- **Accent-600**: `#D97706` - Dark
- **Accent-700**: `#B45309` - Darker
- **Accent-800**: `#92400E` - Darker
- **Accent-900**: `#78350F` - Darkest

### Error Colors (Rose)
- **Error-50**: `#FFF1F2` - Lightest background
- **Error-100**: `#FFE4E6` - Light background
- **Error-200**: `#FECDD3` - Light border
- **Error-300**: `#FDA4AF` - Medium light
- **Error-400**: `#FB7185` - Medium
- **Error-500**: `#F43F5E` - **Main Error** (error states)
- **Error-600**: `#E11D48` - Dark
- **Error-700**: `#BE123C` - Darker
- **Error-800**: `#9F1239` - Darker
- **Error-900**: `#881337` - Darkest

### Background Colors
- **Background Light**: `#F8FAFC` (slate-50) - Main background
- **Background Surface**: `#FFFFFF` (white) - Cards, modals

### Text Colors
- **Text Primary**: `#0F172A` (slate-900) - Headings, important text
- **Text Secondary**: `#64748B` (slate-500) - Body text, descriptions
- **Text Muted**: `#94A3B8` (slate-400) - Placeholder text, captions

## Component Usage

### Buttons
```jsx
// Primary Button
<Button variant="primary" size="md">Primary Action</Button>

// Secondary Button
<Button variant="secondary" size="md">Secondary Action</Button>

// Accent Button
<Button variant="accent" size="md">Warning Action</Button>

// Outline Button
<Button variant="outline" size="md">Outline Action</Button>

// Ghost Button
<Button variant="ghost" size="md">Ghost Action</Button>

// Error Button
<Button variant="error" size="md">Delete Action</Button>
```

### Cards
```jsx
// Default Card
<Card variant="default" padding="default">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Elevated Card
<Card variant="elevated" padding="lg">
  <h3>Elevated Card</h3>
  <p>This card has more shadow</p>
</Card>

// Outlined Card
<Card variant="outlined" padding="sm">
  <h3>Outlined Card</h3>
  <p>This card has a colored border</p>
</Card>
```

### Inputs
```jsx
// Default Input
<Input 
  label="Email Address" 
  type="email" 
  placeholder="Enter your email"
  variant="default"
  size="md"
/>

// Filled Input
<Input 
  label="Password" 
  type="password" 
  variant="filled"
  size="lg"
/>

// Input with Error
<Input 
  label="Username" 
  error="Username is required"
  variant="default"
/>
```

### Badges
```jsx
// Status Badges
<Badge variant="success" size="md">Completed</Badge>
<Badge variant="warning" size="md">Pending</Badge>
<Badge variant="error" size="md">Failed</Badge>
<Badge variant="primary" size="md">New</Badge>

// Size Variants
<Badge variant="primary" size="sm">Small</Badge>
<Badge variant="primary" size="md">Medium</Badge>
<Badge variant="primary" size="lg">Large</Badge>
```

## Layout Guidelines

### Spacing
- Use consistent spacing scale: `space-y-4`, `space-y-6`, `space-y-8`
- Padding: `p-4`, `p-6`, `p-8` for cards and containers
- Margins: `mb-4`, `mb-6`, `mb-8` for sections

### Typography
- **Headings**: `text-slate-900` (text-primary)
- **Body Text**: `text-slate-500` (text-secondary)
- **Muted Text**: `text-slate-400` (text-muted)
- **Font Sizes**: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`

### Shadows
- **Small**: `shadow-sm` - Subtle elevation
- **Medium**: `shadow-md` - Cards, buttons
- **Large**: `shadow-lg` - Modals, dropdowns
- **Extra Large**: `shadow-xl` - Important overlays

### Border Radius
- **Small**: `rounded-md` - Inputs, small elements
- **Medium**: `rounded-lg` - Buttons, cards
- **Large**: `rounded-xl` - Large cards, containers
- **Extra Large**: `rounded-2xl` - Hero sections

## Responsive Design

### Breakpoints
- **Mobile**: `< 640px` - Single column, stacked layout
- **Tablet**: `640px - 1024px` - Two columns, adjusted spacing
- **Desktop**: `> 1024px` - Multi-column, full layout

### Mobile-First Approach
```jsx
// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>

// Responsive Text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

// Responsive Spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

## Accessibility

### Focus States
- All interactive elements have visible focus states
- Use `focus:ring-2 focus:ring-primary-500` for focus rings
- Ensure sufficient color contrast (4.5:1 minimum)

### Color Usage
- Never rely solely on color to convey information
- Use icons, text, or patterns alongside color
- Ensure error states are clear and distinguishable

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order throughout the interface
- Skip links for main content areas

## Best Practices

### Consistency
- Use the same color variants across similar components
- Maintain consistent spacing and typography scales
- Apply the same interaction patterns throughout

### Performance
- Use CSS custom properties for theme switching
- Minimize custom CSS in favor of Tailwind utilities
- Optimize images and use appropriate formats

### Maintenance
- Document all custom components and their variants
- Use semantic HTML elements
- Keep component APIs simple and predictable