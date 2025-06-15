import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const GV_TopNav: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>('home');
  const { auth_token, theme_settings, set_theme_settings } = useAppStore((state) => ({
    auth_token: state.auth_token,
    theme_settings: state.theme_settings,
    set_theme_settings: state.set_theme_settings,
  }));

  // Function to toggle the theme
  const toggleTheme = async () => {
    const newTheme = theme_settings.current_theme === 'light' ? 'dark' : 'light';
    try {
      await fetch('http://localhost:3000/api/theme', { // imaginary endpoint for saving theme
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth_token}`
        },
        body: JSON.stringify({ theme: newTheme })
      });
      set_theme_settings({ ...theme_settings, current_theme: newTheme });
    } catch (error) {
      console.error('Failed to update theme setting in backend', error);
    }
  };

  return (
    <nav className="fixed w-full bg-gray-700 text-white flex justify-between items-center p-4 shadow-md">
      <div className="flex items-center">
        <Link to="/" onClick={() => setActiveLink('home')}>
          <img
            src={theme_settings.logo_url || 'https://via.placeholder.com/150'}
            alt="Logo"
            className="h-10 w-10 mr-4"
            title="Home"
          />
        </Link>
        {['home', 'portfolio', 'about', 'contact'].map((link) => (
          <Link
            to={`/${link}`}
            key={link}
            className={`mr-4 ${activeLink === link ? 'font-bold text-gray-300' : 'text-gray-500 hover:text-gray-300'}`}
            onClick={() => setActiveLink(link)}
          >
            {link.charAt(0).toUpperCase() + link.slice(1)}
          </Link>
        ))}
      </div>
      <button
        className="ml-4 py-1 px-3 rounded bg-gray-600 hover:bg-gray-500"
        onClick={toggleTheme}
      >
        {theme_settings.current_theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>
    </nav>
  );
};

export default GV_TopNav;