'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-100 py-20 px-4 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-10">Facial Recognition System</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <button
          onClick={() => router.push('/register')}
          className="px-6 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Register Person
        </button>
        
        <button
          onClick={() => router.push('/identify')}
          className="px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white rounded-md"
        >
          Identify Person
        </button>
      </div>
    </main>
  );
}
