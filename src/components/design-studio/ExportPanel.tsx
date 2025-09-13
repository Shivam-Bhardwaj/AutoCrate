'use client'

import { useCrateStore, useExportQueue } from '@/stores/crate-store'
import { useState } from 'react'

export function ExportPanel() {
  const exportQueue = useExportQueue()
  const configuration = useCrateStore(state => state.configuration)
  const addExportJob = useCrateStore(state => state.addExportJob)
  const updateExportJob = useCrateStore(state => state.updateExportJob)
  const removeExportJob = useCrateStore(state => state.removeExportJob)
  const [isExporting, setIsExporting] = useState(false)
  
  const handleExport = async (type: 'nx-expressions' | 'step-file' | 'pdf-drawing') => {
    setIsExporting(true)
    
    // Add job to queue
    const jobId = addExportJob({
      type,
      status: 'pending',
      progress: 0
    })
    
    try {
      // Update status to processing
      updateExportJob(jobId, { status: 'processing', progress: 10 })
      
      // Call the appropriate API endpoint
      let endpoint = ''
      let fileExtension = ''
      
      switch (type) {
        case 'nx-expressions':
          endpoint = '/api/generate-nx'
          fileExtension = 'txt'
          break
        case 'step-file':
          endpoint = '/api/export-step'
          fileExtension = 'stp'
          break
        case 'pdf-drawing':
          endpoint = '/api/export-pdf'
          fileExtension = 'pdf'
          break
      }
      
      updateExportJob(jobId, { progress: 30 })
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuration),
      })
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }
      
      updateExportJob(jobId, { progress: 60 })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Export failed')
      }
      
      updateExportJob(jobId, { progress: 80 })
      
      // Create and download the file
      const filename = data.expressions?.filename || data.content?.filename || `autocrate_${type}_${new Date().toISOString().split('T')[0]}.${fileExtension}`
      const content = data.expressions?.content || data.content?.content || JSON.stringify(data, null, 2)
      
      // Create blob and download
      const blob = new Blob([content], { 
        type: type === 'pdf-drawing' ? 'application/pdf' : 'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Mark as completed
      updateExportJob(jobId, {
        status: 'completed',
        progress: 100,
        downloadUrl: url,
        completedAt: new Date()
      })
      
    } catch (error) {
      updateExportJob(jobId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Export failed'
      })
    } finally {
      setIsExporting(false)
    }
  }
  
  return (
    <div className="p-6 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-primary mb-4">Export</h2>
      
      {/* Export Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleExport('nx-expressions')}
          disabled={isExporting}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export NX Expressions
        </button>
        
        <button
          onClick={() => handleExport('step-file')}
          disabled={isExporting}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Export STEP File
        </button>
        
        <button
          onClick={() => handleExport('pdf-drawing')}
          disabled={isExporting}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Export PDF Drawing
        </button>
      </div>
      
      {/* Export Queue */}
      {exportQueue.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">Export Queue</h3>
          <div className="space-y-2">
            {exportQueue.map((job) => (
              <div key={job.id} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    {job.type.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                    job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                {job.status === 'processing' && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {job.status === 'completed' && job.downloadUrl && (
                  <a
                    href={job.downloadUrl}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Download File
                  </a>
                )}
                
                {job.status === 'failed' && job.error && (
                  <p className="text-sm text-red-600">{job.error}</p>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {job.createdAt.toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => removeExportJob(job.id)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
