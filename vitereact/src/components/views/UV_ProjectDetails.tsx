import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ProjectDetails {
  title: string;
  description: string;
  media: Array<{ type: 'image' | 'video'; url: string }>;
  createdAt: string;
  projectId: string;
}

// Fetch project details from API
const fetchProjectDetails = async (projectId: string): Promise<ProjectDetails> => {
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}`;
  const { data } = await axios.get(`${baseUrl}/api/projects/${projectId}`);
  return data;
};

const UV_ProjectDetails: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();
  if (!project_id) {
    return <div className='text-center text-red-500'>Project ID is required</div>
  }
  
  // Fetching the project details using React Query
  const { data: projectDetails, isLoading, isError, error } = useQuery<ProjectDetails, Error>(
    ['projectDetails', project_id],
    () => fetchProjectDetails(project_id),
    { retry: false }
  );

  return (
    <>
      {isLoading && <div className="text-center text-gray-500">Loading project details...</div>}

      {isError && (
        <div className="text-center text-red-500">
          Error fetching project details: {error?.message}
        </div>
      )}

      {projectDetails && (
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-6">{projectDetails.title}</h1>

          {projectDetails.media.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {projectDetails.media.map((mediaItem, index) => (
                <div key={index} className="aspect-w-16 aspect-h-9">
                  {mediaItem.type === 'image' ? (
                    <img
                      src={mediaItem.url}
                      alt={`Media ${index + 1} - ${projectDetails.title}`}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <video controls className="object-cover w-full h-full">
                      <source src={mediaItem.url} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mb-6">
              No media available for this project.
            </div>
          )}

          <div className="mb-8">
            <p className="text-lg">{projectDetails.description || 'No description available.'}</p>
          </div>

          <div className="text-center">
            <Link
              to="/portfolio"
              className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition duration-200"
            >
              Back to Portfolio
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_ProjectDetails;