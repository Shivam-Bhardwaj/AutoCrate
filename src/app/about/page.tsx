export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About AutoCrate</h1>
          <p className="text-xl text-gray-600">Professional Industrial Crate Design Solution</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">What is AutoCrate?</h2>
            <p className="text-gray-600 mb-4">
              AutoCrate is a cutting-edge web application designed for engineers and manufacturers
              to create precise, parametric shipping crate designs. Our system generates NX CAD
              expression files that can be directly imported into Siemens NX for manufacturing.
            </p>
            <p className="text-gray-600">
              With real-time 3D visualization and comprehensive configuration options, AutoCrate
              streamlines the design process from concept to production-ready CAD models.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Key Benefits</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Reduce design time by up to 80% with automated expression generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Ensure compliance with international shipping standards</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Minimize material waste with optimized designs</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Real-time cost estimation for budgeting</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Seamless integration with existing CAD workflows</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Core Components</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 mb-3 shadow">
                <div className="text-3xl mb-2">📦</div>
                <h3 className="font-semibold">Shipping Base</h3>
              </div>
              <p className="text-sm text-gray-600">
                Customizable floorboards and skids for stable transport
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 mb-3 shadow">
                <div className="text-3xl mb-2">🔲</div>
                <h3 className="font-semibold">Crate Cap</h3>
              </div>
              <p className="text-sm text-gray-600">
                Five-panel system with configurable materials and thickness
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 mb-3 shadow">
                <div className="text-3xl mb-2">🔩</div>
                <h3 className="font-semibold">Fasteners</h3>
              </div>
              <p className="text-sm text-gray-600">
                Klimp connectors, nails, screws, and ventilation options
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 mb-3 shadow">
                <div className="text-3xl mb-2">🛡️</div>
                <h3 className="font-semibold">Vinyl Protection</h3>
              </div>
              <p className="text-sm text-gray-600">
                Optional waterproof and vapor barrier coatings
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Industry Standards</h3>
            <p className="text-gray-600">
              Compliant with ISPM-15, IPPC regulations, and international shipping requirements for
              wooden packaging materials.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">CAD Integration</h3>
            <p className="text-gray-600">
              Direct export to Siemens NX with parametric expressions for easy modifications and
              design iterations.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Cost Optimization</h3>
            <p className="text-gray-600">
              Real-time material calculations and cost estimates help optimize designs for budget
              constraints.
            </p>
          </div>
        </div>

        <div className="text-center bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Technical Specifications</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-700 mb-2">Supported Dimensions</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Length: 100mm - 6000mm</li>
                <li>• Width: 100mm - 3000mm</li>
                <li>• Height: 100mm - 3000mm</li>
                <li>• Units: Metric (mm) and Imperial (inches)</li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-700 mb-2">Material Options</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Pine, Oak, Plywood, OSB</li>
                <li>• Panel thickness: 9mm - 50mm</li>
                <li>• Weight capacity: up to 5000kg</li>
                <li>• Customizable fastener spacing</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">AutoCrate - Engineering Excellence in Shipping Solutions</p>
          <p className="text-gray-400 text-sm mt-2">
            Version 2.2.0 | Powered by Next.js and Three.js
          </p>
          <div className="mt-4 p-4 bg-green-50 rounded-lg max-w-2xl mx-auto">
            <p className="text-green-800 text-sm font-semibold">Latest Update (v2.2.0)</p>
            <p className="text-green-700 text-xs mt-1">
              Automatic skid sizing based on crate weight • Dynamic spacing calculations • 
              Rub strip detection for long crates • Enhanced 3D visualization with individual skids
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
