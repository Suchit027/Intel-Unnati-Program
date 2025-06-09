// 'use client';

// import { useState } from 'react';
// import { apiClient } from '@/lib/api';

// interface IdentificationResult {
//   match: string | null;
//   person_id: number | null;
//   score: number;
//   confidence: string;
// }

// export default function IdentifyPerson() {
//   const [image, setImage] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [result, setResult] = useState<IdentificationResult | null>(null);
//   const [error, setError] = useState('');

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setImage(file);
      
//       // Create preview URL
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
      
//       // Clear previous results
//       setResult(null);
//       setError('');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!image) {
//       setError('Please select an image');
//       return;
//     }

//     setIsLoading(true);
//     setError('');
//     setResult(null);

//     try {
//       const response = await apiClient.identifyPerson({ image });
//       setResult(response);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Identification failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearImage = () => {
//     setImage(null);
//     setPreviewUrl(null);
//     setResult(null);
//     setError('');
    
//     // Reset file input
//     const fileInput = document.getElementById('identify-image') as HTMLInputElement;
//     if (fileInput) fileInput.value = '';
//   };

//   const getConfidenceColor = (confidence: string) => {
//     switch (confidence) {
//       case 'high': return 'text-green-600 bg-green-100';
//       case 'medium': return 'text-yellow-600 bg-yellow-100';
//       case 'low': return 'text-red-600 bg-red-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6 text-center">Identify Person</h2>
      
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="identify-image" className="block text-sm font-medium text-gray-700 mb-2">
//             Upload Image
//           </label>
//           <input
//             type="file"
//             id="identify-image"
//             accept="image/*"
//             onChange={handleImageChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//             required
//           />
//         </div>

//         {previewUrl && (
//           <div className="mt-4">
//             <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
//             <div className="relative">
//               <img
//                 src={previewUrl}
//                 alt="Preview"
//                 className="w-full h-48 object-cover rounded-md border"
//               />
//               <button
//                 type="button"
//                 onClick={clearImage}
//                 className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
//               >
//                 ×
//               </button>
//             </div>
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={isLoading || !image}
//           className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
//         >
//           {isLoading ? 'Identifying...' : 'Identify Person'}
//         </button>
//       </form>

//       {result && (
//         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//           <h3 className="text-lg font-semibold mb-3">Identification Result</h3>
          
//           {result.match ? (
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <span className="font-medium">Match Found:</span>
//                 <span className="text-green-600 font-bold">{result.match}</span>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="font-medium">Confidence:</span>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
//                   {result.confidence.toUpperCase()}
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="font-medium">Score:</span>
//                 <span className="text-gray-600">{(result.score * 100).toFixed(1)}%</span>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-4">
//               <div className="text-red-500 font-medium mb-2">No Match Found</div>
//               <p className="text-sm text-gray-600">
//                 This person is not in the database
//               </p>
//               <div className="mt-2 text-xs text-gray-500">
//                 Score: {(result.score * 100).toFixed(1)}%
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//           {error}
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Loader2, CameraIcon, UserSearchIcon } from 'lucide-react';

interface IdentificationResult {
  match: string | null;
  person_id: number | null;
  score: number;
  confidence: string;
}

export function IdentifyPerson() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError('');
    const fileInput = document.getElementById('identify-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return setError('Please select an image');
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await apiClient.identifyPerson({ image });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow space-y-6">
      <h1 className="text-3xl font-bold text-center flex items-center gap-2 justify-center text-gray-900">
        <UserSearchIcon className="w-7 h-7 text-green-600" /> Identify Person
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="identify-image" className="block text-sm font-semibold mb-1 text-gray-600">Upload Image</label>
          <input
            type="file"
            id="identify-image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-md p-2 file:mr-3 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm text-gray-400 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        {previewUrl && (
          <div className="relative">
            <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
            >×</button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !image}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="animate-spin h-5 w-5" />} Identify Person
        </button>
      </form>

      {result && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-600">Result</h3>
          {result.match ? (
            <>
              <p><strong className="text-gray-600">Match:</strong> <span className="text-green-600 font-semibold">{result.match}</span></p>
              <p>
                <strong className="text-gray-600">Confidence:</strong>{' '}
                <span className={`px-2 py-1 text-xs rounded ${getConfidenceColor(result.confidence)}`}>
                  {result.confidence.toUpperCase()}
                </span>
              </p>
              <p>
                <strong className="text-gray-600">Score:</strong>{' '}
                <span className="text-green-600 font-semibold">{(result.score * 100).toFixed(2)}%</span>
              </p>
            </>
          ) : (
            <p className="text-red-600 font-semibold">No Match Found (Score: {(result.score * 100).toFixed(2)}%)</p>
          )}
        </div>
      )}

      {error && <div className="bg-red-100 text-red-700 p-3 rounded border border-red-300">{error}</div>}
    </div>
  );
}
