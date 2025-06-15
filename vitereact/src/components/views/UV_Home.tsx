import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/common/Alert'; // Assume this component is previously created for error handling
import { useAppStore } from '@/store/main';

// Define the data structure for a featured project
interface FeaturedProject {
  projectId: string;
  title: string;
  thumbnailUrl: string;
}

const fetchFeaturedProjects = async (): Promise<FeaturedProject[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/projects?featured=true`
  );
  // Directly return data assuming it is an array of projects
  return data;
};

const UV_Home: React.FC = () => {
  const { current_theme, color_palette } = useAppStore((state) => state.theme_settings);

  const { data: featuredProjects, isLoading, isError, error } = useQuery<FeaturedProject[], Error>(
    ['featuredProjects'],
    fetchFeaturedProjects
  );

  return (
    <>
      <div
        style={{
          backgroundColor: color_palette.background_color,
          color: color_palette.text_color,
          padding: '32px'
        }}
      >
        <section className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Welcome to My Design Portfolio</h1>
          <p className="text-lg mt-4">Showcasing My Best Work</p>
        </section>

        {isLoading && <p>Loading...</p>}
        {isError && <Alert message={error.message} />}

        <section className="mb-8 px-4">
          <h2 className="text-3xl font-semibold mb-6">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProjects?.map((project) => (
              <Link to={`/portfolio/${project.projectId}`} key={project.projectId} className="block">
                <div className="border border-gray-300 p-4 rounded-md hover:shadow-lg transition duration-300">
                  {/* Image fetched from the URL provided in the project data */}
                  <img src={project.thumbnailUrl} alt={project.title} className="w-full h-48 object-cover rounded" />
                  <h3 className="text-xl font-bold mt-4">{project.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="text-center mb-8">
          <Link to="/portfolio" className="bg-blue-500 text-white py-2 px-4 rounded-md mx-2">View Portfolio</Link>
          <Link to="/contact" className="bg-green-500 text-white py-2 px-4 rounded-md mx-2">Contact Me</Link>
        </section>
      </div>
    </>
  );
};

export default UV_Home;