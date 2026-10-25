import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>;
}
