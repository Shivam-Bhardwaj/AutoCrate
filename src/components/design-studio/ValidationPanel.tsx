'use client'

import { useValidationResults } from '@/stores/crate-store'
import { getValidationExplanation } from '@/lib/domain/validation'

export function ValidationPanel() {
  const validationResults = useValidationResults()
  
  if (validationResults.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating configuration...</p>
        </div>
      </div>
    )
  }
  
  const latestResult = validationResults[0]
  
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h2>
      
      {/* Overall Status */}
      <div className={`p-4 rounded-lg mb-4 ${
        latestResult.isValid 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            latestResult.isValid ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className={`font-medium ${
            latestResult.isValid ? 'text-green-800' : 'text-red-800'
          }`}>
            {latestResult.isValid ? 'Configuration Valid' : 'Issues Found'}
          </span>
        </div>
        <p className={`text-sm mt-1 ${
          latestResult.isValid ? 'text-green-700' : 'text-red-700'
        }`}>
          {latestResult.isValid 
            ? 'All constraints satisfied and Applied Materials standards met.'
            : `${latestResult.errors.length} error(s) and ${latestResult.warnings.length} warning(s) found.`
          }
        </p>
      </div>
      
      {/* Errors */}
      {latestResult.errors.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-medium text-red-800 mb-2">Errors</h3>
          <div className="space-y-2">
            {latestResult.errors.map((error, index) => (
              <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{error.message}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Field: {error.field}
                    </p>
                    {error.appliedMaterialsStandard && (
                      <p className="text-xs text-red-600">
                        Standard: {error.appliedMaterialsStandard}
                      </p>
                    )}
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                        Why is this required?
                      </summary>
                      <p className="text-xs text-red-600 mt-1 pl-4">
                        {getValidationExplanation(error.code)}
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Warnings */}
      {latestResult.warnings.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-medium text-yellow-800 mb-2">Warnings</h3>
          <div className="space-y-2">
            {latestResult.warnings.map((warning, index) => (
              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">{warning.message}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Field: {warning.field}
                    </p>
                    {warning.suggestion && (
                      <p className="text-xs text-yellow-600 mt-1">
                        <strong>Suggestion:</strong> {warning.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Validation Timestamp */}
      <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
        Last validated: {latestResult.timestamp.toLocaleString()}
      </div>
    </div>
  )
}
