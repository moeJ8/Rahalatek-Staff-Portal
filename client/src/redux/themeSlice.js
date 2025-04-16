import { createSlice } from '@reduxjs/toolkit';

// Helper function to apply dark mode class to document
const applyDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
    console.log('DEBUG: Applied dark mode class');
  } else {
    document.documentElement.classList.remove('dark');
    console.log('DEBUG: Removed dark mode class');
  }
};

// Get initial state from localStorage or system preference
const getInitialState = () => {
  try {
    const savedMode = localStorage.getItem('darkMode');
    console.log('DEBUG: Initial dark mode from localStorage:', savedMode);
    
    if (savedMode !== null) {
      // Apply class immediately on state initialization
      applyDarkMode(savedMode === 'true');
      return { darkMode: savedMode === 'true' };
    }
    
    // Use system preference as fallback
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('DEBUG: System prefers dark:', systemPrefersDark);
    
    // Store the system preference
    localStorage.setItem('darkMode', systemPrefersDark.toString());
    // Apply class immediately
    applyDarkMode(systemPrefersDark);
    
    return { darkMode: systemPrefersDark };
  } catch (error) {
    console.error('Error initializing dark mode:', error);
    return { darkMode: false };
  }
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: getInitialState(),
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      try {
        // Persist to localStorage
        localStorage.setItem('darkMode', state.darkMode.toString());
        console.log('DEBUG: Toggled dark mode to:', state.darkMode);
        // Update DOM directly
        applyDarkMode(state.darkMode);
      } catch (error) {
        console.error('Error toggling dark mode:', error);
      }
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      try {
        // Persist to localStorage
        localStorage.setItem('darkMode', state.darkMode.toString());
        console.log('DEBUG: Set dark mode to:', state.darkMode);
        // Update DOM directly
        applyDarkMode(state.darkMode);
      } catch (error) {
        console.error('Error setting dark mode:', error);
      }
    }
  }
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer; 