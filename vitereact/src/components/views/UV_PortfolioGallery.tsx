import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

interface Project {
  project_id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
}

const fetchProjects = async (category: string, sortOrder: string, token: string): Promise<Project[]> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (sortOrder) params.append('sort_order', sortOrder);

  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/projects`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data.projects;
};

const UV_PortfolioGallery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const sortOrder = searchParams.get('sort_order') || '';

  const { auth_token } = useAppStore();

  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>('grid');

  const { data: projects, isLoading, isError } = useQuery<Project[], Error>(
    ['projects', category, sortOrder],
    () => fetchProjects(category, sortOrder, auth_token)
  );

  const toggleViewMode = () => {
    setCurrentViewMode(prevMode => (prevMode === 'grid' ? 'list' : 'grid'));
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Portfolio Gallery</h1>
          <button
            onClick={toggleViewMode}
            className="px-4 py-2 bg-blue-500 text-white rounded shadow"
          >
            Toggle to {currentViewMode === 'grid' ? 'List' : 'Grid'} View
          </button>
        </div>

        <div className="flex justify-end mb-4">
          {/* Category and Sort Order Filters */}
          <select
            value={category}
            onChange={(e) => setSearchParams({'category': e.target.value, 'sort_order': sortOrder})}
            className="mr-2 p-2 border border-gray-300 rounded"
          >
            <option value="">All Categories</option>
            {/* Add more category options here */}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSearchParams({'category': category, 'sort_order': e.target.value})}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            {/* Add more sort options here */}
          </select>
        </div>

        {isLoading && <div>Loading...</div>}
        {isError && <div>Error loading projects</div>}

        <div className={`grid ${currentViewMode === 'grid' ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {projects && projects.map(project => (
            <div key={project.project_id} className="border p-2 rounded">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="object-cover h-48 w-full mb-2 rounded"
              />
              <h2 className="text-lg font-semibold mb-1">{project.title}</h2>
              <Link to={`/portfolio/${project.project_id}`} className="text-blue-500">View Details</Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UV_PortfolioGallery;