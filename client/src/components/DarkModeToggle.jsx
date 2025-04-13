import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { DarkThemeToggle } from 'flowbite-react';

export default function DarkModeToggle() {
  const { toggleDarkMode } = useContext(ThemeContext);

  return (
    <DarkThemeToggle onClick={toggleDarkMode} />
  );
} 