import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

// Interface for designer profile data
interface DesignerProfile {
  bio: string;
  resume_link: string;
  profile_picture: string;
}

const fetchDesignerProfile = async (): Promise<DesignerProfile> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/designer-profile`);
  return data.profile;
};

const UV_About: React.FC = () => {
  // Zustand store for managing global state
  const { theme_settings } = useAppStore(state => state);

  // React Query for fetching data
  const { data, isLoading, isError, error } = useQuery<DesignerProfile, Error>(
    ['designerProfile'],
    fetchDesignerProfile
  );

  return (
    <>
      <div
        className={`p-8 min-h-screen ${theme_settings.current_theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
      >
        <h1 className="text-4xl font-bold mb-4">About the Designer</h1>

        {isLoading && <p>Loading...</p>}
        {isError && <p>{error?.message}</p>}

        {data && (
          <div>
            <div className="rounded-lg overflow-hidden mb-6">
              <img
                src={data.profile_picture || 'https://picsum.photos/400'}
                alt="Designer Profile"
                className="w-48 h-48 object-cover"
              />
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Bio</h2>
              <p className="text-lg">{data.bio}</p>
            </div>

            <div className="mb-6">
              <a
                href={data.resume_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View Resume
              </a>
            </div>

            <div>
              <Link
                to="/contact"
                className="text-lg text-blue-600 hover:underline"
              >
                Contact the Designer
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_About;