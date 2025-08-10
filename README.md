# Dynamic Form Builder

**Dynamic Form Builder** is a modern React application that allows users to create, customize, and preview dynamic forms with drag-and-drop functionality, custom field types, validation rules, and derived field calculations.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Project Description

Dynamic Form Builder is a comprehensive React application designed to simplify the process of creating and managing dynamic forms. The application provides an intuitive drag-and-drop interface that allows users to build complex forms without any coding knowledge. Users can create various field types including text inputs, dropdowns, checkboxes, radio buttons, and more, each with customizable validation rules and properties. The real-time preview functionality ensures that form creators can see exactly how their forms will appear to end users. 

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── myForms/         # Form management components
│   └── preview/         # Form rendering and display
│       ├── formRenderer.tsx
│       ├── appLayout.tsx
│       ├── fieldTypeSelector.tsx
│       └── validationRulesEditor.tsx
├── pages/               # Main application pages
│   ├── createPage.tsx   # Form creation interface
│   ├── myFormsPage.tsx  # Saved forms management
│   └── previewPage.tsx  # Form preview and testing
├── store/               # Redux store configuration
│   ├── slices/          # Redux slices
│   │   ├── formBuilderSlice.ts
│   │   ├── previewSlice.ts
│   │   └── savedFormsSlice.ts
│   ├── hooks.ts         # Typed Redux hooks
│   └── index.tsx        # Store configuration
├── types/               # TypeScript definitions
│   ├── index.ts         # Core types
│   └── types.ts         # Additional type definitions
├── utils/               # Utility functions
│   ├── constants.ts     # Application constants
│   ├── derivedFields.ts # Field calculations
│   ├── formStorage.ts   # Local storage operations
│   └── validation.ts    # Validation logic
├── App.tsx             # Root component
├── main.tsx            # Application entry point
└── vite-env.d.ts       # Vite type definitions
```

## 🏗️ Store Architecture

Redux Toolkit implementation with modular slice architecture:

```typescript
store/
├── slices/
│   ├── formBuilderSlice.ts    # Active form creation/editing
│   ├── previewSlice.ts        # Form preview state  
│   └── savedFormsSlice.ts     # Form library management
├── hooks.ts                   # useAppSelector & useAppDispatch
└── index.tsx                  # Store configuration & middleware
```

### Slice Responsibilities
- **formBuilderSlice** - Current form state, field operations, validation
- **previewSlice** - Preview mode, form rendering, user interactions  
- **savedFormsSlice** - CRUD operations for saved forms collection

## 🔧 Code Quality

The project uses:
- **ESLint 9** - Code linting with latest rules
- **TypeScript 5.8** - Type-safe development
- **Strict mode** for better error catching
- **Modern React patterns** (hooks, functional components)
- **TypeScript ESLint** - TypeScript-specific linting
- **React Hooks Rules** - Ensures proper hook usage

## 🎨 Theming

The application uses Material-UI's theming system. Customize colors, typography, and component styles:

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#2196f3' },
    secondary: { main: '#ff9800' },
    background: { default: '#f8fafc' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
  }
});
```

## ✅ Validation Configuration

### Field Configuration
```typescript
{
  id: string;           // Unique identifier
  type: FieldType;      // Field type (text, number, etc.)
  label: string;        // Display label
  required: boolean;    // Whether field is mandatory
  defaultValue: any;    // Default field value
}
```

### Validation Rules
```typescript
{
  type: 'notEmpty' | 'minLength' | 'maxLength' | 'email' | 'password';
  value?: number;       // For length/value constraints
  message: string;      // Custom error message
}
```

### Derived Field Configuration
```typescript
{
  parentFieldIds: string[];  // Fields to calculate from
  formula: 'sum' | 'age_from_birthdate';  // Calculation type
}
```

- **Redux Toolkit** - Modern Redux for predictable state management
- **React Redux** - Official React bindings for Redux
- **Slices Architecture** - Organized state logic with createSlice
- **TypeScript Integration** - Fully typed store and actions
- **Local Storage Persistence** - Forms automatically saved to browser storage

### Store Structure
```typescript
store/
├── slices/
│   ├── formBuilderSlice.ts    # Current form editing state
│   └── savedFormsSlice.ts     # Saved forms management
└── hooks.ts                   # Typed useSelector/useDispatch hooks
```

## 🎨 Tech Stack

### Core Framework
- **React 19** - Latest React with modern features
- **TypeScript 5.8** - Type-safe development
- **Vite 7** - Lightning-fast build tool and dev server

### UI & Styling
- **Material-UI 7** - Modern React component library
- **Emotion** - CSS-in-JS styling solution
- **Material Icons** - Comprehensive icon library

### Routing & Utilities
- **React Router 7** - Client-side routing
- **Nanoid** - Unique ID generation for form fields

### Development Tools
- **ESLint 9** - Code linting with latest rules
- **TypeScript ESLint** - TypeScript-specific linting
- **Vite React Plugin** - React integration for Vite

## 🏗️ Build Process

### Development Build
```bash
npm run dev
```
Starts Vite development server with hot module replacement

### Production Build
```bash
npm run build
```

**Build Process:**
1. **TypeScript Compilation** - `tsc -b` compiles TypeScript files
2. **Vite Build** - Bundles and optimizes for production
3. **Output Directory** - `./dist/` contains production-ready files

### Build Output Structure
```
dist/
├── assets/
│   ├── index-[hash].js     # Main application bundle
│   ├── index-[hash].css    # Compiled styles
│   └── vendor-[hash].js    # Third-party dependencies
├── index.html              # Entry point
└── manifest.json          # App manifest
```

### Scripts
- `npm run lint` - Run ESLint code analysis
- `npm run preview` - Preview production build locally