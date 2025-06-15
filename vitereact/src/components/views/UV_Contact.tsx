import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AppContext } from './AppContext'; // Assuming context provides designer_id

// Interfaces for form input and API response
interface FormInputs {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

const UV_Contact: React.FC = () => {
  // Local state for form inputs and status
  const [formInputs, setFormInputs] = useState<FormInputs>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [formStatus, setFormStatus] = useState<string>('idle');
  const { designer_id } = useContext(AppContext); // Using context to dynamically get designer_id

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormInputs((prev) => ({ ...prev, [name]: value }));
  };

  // Axios and React Query mutation for form submission
  const submitContactForm = async (inputs: FormInputs): Promise<ApiResponse> => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/contact`, {
      sender_name: inputs.name,
      sender_email: inputs.email,
      subject: inputs.subject,
      message_body: inputs.message,
      designer_id: designer_id, // Using context
    });
    return data;
  };

  const mutation = useMutation<ApiResponse, Error, FormInputs>({
    mutationFn: submitContactForm,
    onMutate: () => {
      setFormStatus('submitting');
    },
    onSuccess: () => {
      setFormStatus('success');
      // Reset form inputs
      setFormInputs({ name: '', email: '', subject: '', message: '' });
    },
    onError: () => {
      setFormStatus('error');
    },
  });

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/;
    if (!formInputs.name || !formInputs.email || !formInputs.subject || !formInputs.message || !emailRegex.test(formInputs.email)) {
      alert('Please fill out all fields correctly.');
      return;
    }

    mutation.mutate(formInputs);
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formInputs.name}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formInputs.email}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={formInputs.subject}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              name="message"
              id="message"
              value={formInputs.message}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              rows={5}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {mutation.isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {formStatus === 'success' && <p className="text-green-600">Message sent successfully!</p>}
          {formStatus === 'error' && <p className="text-red-600">Failed to send message. Please try again.</p>}
        </form>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Contact via Email</h3>
          <p className="mb-4">
            <a href="mailto:designer@example.com" className="text-blue-600 hover:underline">designer@example.com</a>
          </p>
          <h3 className="text-xl font-semibold mb-2">Follow us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-blue-600 hover:underline">Twitter</a>
            <a href="#" className="text-blue-600 hover:underline">LinkedIn</a>
            <a href="#" className="text-blue-600 hover:underline">Instagram</a>
          </div>
        </div>

        {/* Optional map integration placeholder */}
        <div className="mt-8">
          {/* Optionally integrate a map */}
        </div>
      </div>
    </>
  );
};

export default UV_Contact;