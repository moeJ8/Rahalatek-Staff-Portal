import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';

// No need to apply dark mode class here as it's now handled in darkModeInitializer.js
// and in the theme slice itself

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

export default store; 