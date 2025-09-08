'use client';

import dynamic from 'next/dynamic';

// Test dynamic import with loading fallback
const TestReactThreeFiber = dynamic(() => import('@/components/TestReactThreeFiber'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p>Loading React Three Fiber test...</p>
      </div>
    </div>
  ),
});

export default function TestFiberPage() {
  console.log('TestFiberPage rendering');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">React Three Fiber Test</h1>
        <p className="mb-4">Testing React Three Fiber with dynamic loading</p>
        <div className="w-full h-[600px] bg-white rounded-lg shadow-lg p-4">
          <TestReactThreeFiber />
        </div>
      </div>
    </div>
  );
}
