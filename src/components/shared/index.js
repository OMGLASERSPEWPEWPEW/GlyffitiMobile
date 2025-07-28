// src/components/shared/index.js
// Path: src/components/shared/index.js

// Re-export all shared components from organized subfolders
// This maintains backward compatibility while organizing our code better

// Feedback components (loading states, errors)
export {
  LoadingSpinner,
  LoadingProgress, 
  LoadingOverlay
} from './feedback';

// Layout components (cards, containers)
export {
  Card,
  StatusCard,
  ContentCard
} from './layout';

// UI components (form controls, buttons)
export {
  Button,
  TextInput,
  PasswordInput,
  FormField
} from './ui';

// Character count: 479

// Form Controls - Phase 3 (Coming Soon)
// export { default as TextInput } from './TextInput';
// export { default as PasswordInput } from './PasswordInput';
// export { default as Button } from './Button';
// export { default as FormField } from './FormField';

// Error Boundaries - Phase 4 (Coming Soon)
// export { default as ErrorBoundary } from './ErrorBoundary';
// export { default as ErrorDisplay } from './ErrorDisplay';
// export { default as RetryButton } from './RetryButton';

// Character count: 751