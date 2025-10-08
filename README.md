# Employee Management Component System

A framework-agnostic employee management component system that can be used with any framework or vanilla JavaScript.

## Architecture & Approach

### Framework-Agnostic Core

To meet the requirement of supporting multiple frameworks (React, Svelte, vanilla JavaScript) while maintaining a minimal library size, this solution implements a **framework-agnostic core** using vanilla JavaScript/TypeScript with the following key techniques:

#### 1. **Pure JavaScript Component Classes**

- All core components ([EmployeeManagement.ts](lib/core/src/components/EmployeeManagement.ts), [DataTable.ts](lib/core/src/components/DataTable.ts), [SearchBox.ts](lib/core/src/components/SearchBox.ts)) are implemented as plain JavaScript classes
- Components use native DOM APIs (`document.createElement`, `appendChild`, etc.) to build and manipulate the UI
- No framework dependencies in the core library, keeping the bundle size minimal

#### 2. **Custom Observable Pattern for State Management**

- Implemented a lightweight [Observable class](lib/core/src/states.ts) (~30 lines) to manage reactive state without external dependencies
- Uses the publish-subscribe pattern to notify components of state changes
- Includes a `DebouncedObservable` for search input handling with built-in debounce logic
- This replaces heavy state management libraries and provides framework-agnostic reactivity

#### 3. **Lifecycle Management with `mount()` and `destroy()`**

- Each component exposes `mount(container: HTMLElement)` and `destroy()` methods
- `mount()`: Attaches the component to a DOM container and sets up event listeners
- `destroy()`: Cleans up event listeners, subscriptions, and removes DOM elements
- This pattern allows framework-specific wrappers to integrate the core component into their lifecycle

#### 4. **Framework-Specific Thin Wrappers**

- **React Wrapper** ([EmployeeManagement.tsx](solution/lib/react/src/EmployeeManagement.tsx)): Uses `useEffect` to mount/destroy the core component
- **Vue Integration**: Directly uses the core component with Vue's `onMounted`/`onUnmounted` lifecycle hooks (no wrapper needed)
- **Vanilla JS**: Uses the core component directly
- Wrappers are typically < 20 lines of code, proving the effectiveness of the framework-agnostic approach

#### 5. **Benefits of This Approach**

- ✅ **Single Source of Truth**: Business logic and UI are maintained in one place (core library)
- ✅ **Consistent Behavior**: All frameworks use the same core, ensuring identical functionality
- ✅ **Minimal Bundle Size**: No framework dependencies in core (~5KB total)
- ✅ **Easy Maintenance**: Bug fixes and features are implemented once in the core
- ✅ **Framework Flexibility**: Teams can use their preferred framework without sacrificing consistency

### Additional Features & UX Enhancements

- **API Toggle Mode**: Mock API success/error responses for testing and demonstration purposes
- **Error Fallback Screen**: Displays user-friendly error message when API requests fail
- **Search Query Validation**: Warning message when search query is too short (< 2 characters)
- **No Results Fallback**: Empty state UI when search returns no matching employees
- **Debounced Search**: 500ms debounce on search input to reduce unnecessary API calls

## Packages

- **[@senramii/employee-management-core](https://github.com/senramii/framework-agnostic-component-system)** - Core component (framework-agnostic)
- **[@senramii/employee-management-react](https://github.com/senramii/framework-agnostic-component-system)** - React wrapper

> **Note:** A Vue wrapper package was intentionally not created to demonstrate that the framework-agnostic core package can be used directly in Vue applications without requiring a framework-specific wrapper. This showcases the true framework-agnostic nature of the core component.

## Testing the Applications

### Prerequisites

- Node.js 18+ installed
- Package manager (npm, yarn, pnpm)

### GitHub Package Registry Configuration

Since the packages are hosted on **Public** GitHub Package Registry, you need to configure npm to use the GitHub registry for the `@senramii` scope:

```bash
npm config set @senramii:registry https://npm.pkg.github.com
```

### React Application

1. Navigate to the React app directory:

   ```bash
   cd app/react
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown (typically `http://localhost:5173`)

### Vue Application

1. Navigate to the Vue app directory:

   ```bash
   cd app/vue
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown (typically `http://localhost:5173`)

### Vanilla JavaScript Application

1. Navigate to the Vanilla JS app directory:

   ```bash
   cd app/vanila
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown (typically `http://localhost:5173`)

