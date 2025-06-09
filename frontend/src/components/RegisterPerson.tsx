'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Loader2, CameraIcon, UserSearchIcon } from 'lucide-react';


export function RegisterPerson() {
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image) return setError('Please provide both name and image');

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiClient.registerPerson({ name, image });
      setMessage(response.message);
      setName('');
      setImage(null);
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow space-y-6">
      <h1 className="text-3xl font-bold text-center flex items-center gap-2 justify-center text-gray-900">
        <CameraIcon className="w-7 h-7 text-blue-600" /> Register Person
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold mb-1 text-gray-600">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none file:text-sm text-gray-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-semibold mb-1 text-gray-600">Upload Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-md p-2 file:mr-3 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm text-gray-400 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="animate-spin h-5 w-5" />} Register Person
        </button>
      </form>

      {message && <div className="bg-green-100 text-green-700 p-3 rounded border border-green-300">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded border border-red-300">{error}</div>}
    </div>
  );
}
