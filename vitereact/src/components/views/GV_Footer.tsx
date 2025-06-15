import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const GV_Footer: React.FC = () => {
  // Access global theme settings from Zustand store
  const { theme_settings } = useAppStore((state) => ({ theme_settings: state.theme_settings }));
  
  // Local state to manage contact info visibility
  const [contactInfoVisible, setContactInfoVisible] = useState(false);

  // Toggle visibility of contact information
  const toggleContactInfo = () => {
    setContactInfoVisible(!contactInfoVisible);
  };

  return (
    <>
      <footer
        style={{ backgroundColor: theme_settings.color_palette.background_color, color: theme_settings.color_palette.text_color }}
        className="py-4"
      >
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          {/* Navigation Links */}
          <div className="flex flex-col md:flex-row items-center">
            <Link to="/" className="mx-2 md:mx-4 my-1 md:my-0">Home</Link>
            <Link to="/portfolio" className="mx-2 md:mx-4 my-1 md:my-0">Portfolio</Link>
            <Link to="/about" className="mx-2 md:mx-4 my-1 md:my-0">About</Link>
            <Link to="/contact" className="mx-2 md:mx-4 my-1 md:my-0">Contact</Link>
          </div>
          
          {/* Social Media Icons */}
          <div className="my-2 md:my-0 flex items-center">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="mx-2" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="mx-2" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="mx-2" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
          </div>

          {/* Contact Information Toggle */}
          <div className="mt-4 md:mt-0">
            <button onClick={toggleContactInfo} className="text-sm underline">Contacts</button>
            {contactInfoVisible && (
              <div className="mt-2 text-xs">
                <p>Email: info@portfolio.com</p>
                <p>Phone: +1 234-567-8900</p>
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
};

export default GV_Footer;