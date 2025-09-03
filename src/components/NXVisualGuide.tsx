'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NXVisualGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">3D Construction Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 3D Coordinate System Diagram */}
          <div className="bg-muted rounded-lg p-4">
            <svg
              viewBox="0 0 400 300"
              className="w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.2"
                  />
                </pattern>
              </defs>
              <rect width="400" height="300" fill="url(#grid)" />

              {/* Coordinate axes */}
              {/* X-axis (red) */}
              <line
                x1="50"
                y1="250"
                x2="350"
                y2="250"
                stroke="#ef4444"
                strokeWidth="2"
                markerEnd="url(#arrowRed)"
              />
              <text x="360" y="255" fill="#ef4444" fontSize="14" fontWeight="bold">
                X (Length)
              </text>

              {/* Y-axis (green) */}
              <line
                x1="50"
                y1="250"
                x2="50"
                y2="50"
                stroke="#10b981"
                strokeWidth="2"
                markerEnd="url(#arrowGreen)"
              />
              <text x="30" y="40" fill="#10b981" fontSize="14" fontWeight="bold">
                Y (Height)
              </text>

              {/* Z-axis (blue) */}
              <line
                x1="50"
                y1="250"
                x2="150"
                y2="200"
                stroke="#3b82f6"
                strokeWidth="2"
                markerEnd="url(#arrowBlue)"
              />
              <text x="155" y="195" fill="#3b82f6" fontSize="14" fontWeight="bold">
                Z (Width)
              </text>

              {/* Origin label */}
              <circle cx="50" cy="250" r="4" fill="currentColor" />
              <text x="20" y="270" fontSize="12" fill="currentColor">
                Origin (0,0,0)
              </text>

              {/* Arrow markers */}
              <defs>
                <marker
                  id="arrowRed"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                </marker>
                <marker
                  id="arrowGreen"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
                </marker>
                <marker
                  id="arrowBlue"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
                </marker>
              </defs>

              {/* 3D Box representation */}
              <g transform="translate(180, 120)">
                {/* Back face */}
                <rect
                  x="0"
                  y="20"
                  width="100"
                  height="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3"
                />
                
                {/* Front face */}
                <rect
                  x="30"
                  y="0"
                  width="100"
                  height="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                
                {/* Connecting lines */}
                <line x1="0" y1="20" x2="30" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="100" y1="20" x2="130" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="100" x2="30" y2="80" stroke="currentColor" strokeWidth="1" />
                <line x1="100" y1="100" x2="130" y2="80" stroke="currentColor" strokeWidth="1" />

                {/* Point 1 indicator */}
                <circle cx="0" cy="100" r="5" fill="#ef4444" />
                <text x="-25" y="120" fontSize="11" fill="currentColor">
                  Point 1
                </text>
                <text x="-45" y="135" fontSize="10" fill="currentColor" opacity="0.7">
                  (x1, y1, z1)
                </text>

                {/* Point 2 indicator */}
                <circle cx="130" cy="0" r="5" fill="#3b82f6" />
                <text x="105" y="-10" fontSize="11" fill="currentColor">
                  Point 2
                </text>
                <text x="85" y="-25" fontSize="10" fill="currentColor" opacity="0.7">
                  (x2, y2, z2)
                </text>

                {/* Diagonal line */}
                <line
                  x1="0"
                  y1="100"
                  x2="130"
                  y2="0"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              </g>
            </svg>
          </div>

          {/* Component Assembly Sequence */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Assembly Sequence</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span className="text-sm">Base & Skids</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span className="text-sm">Side Panels</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span className="text-sm">Front & Back</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span className="text-sm">Top Panel</span>
              </div>
            </div>
          </div>

          {/* Two-Point Method Benefits */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Two-Point Method Benefits</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Minimal parameters - only 6 values per component (x1,y1,z1,x2,y2,z2)</li>
              <li>• Uniform construction approach for all box-shaped components</li>
              <li>• Easy to visualize and modify in CAD software</li>
              <li>• Automatically maintains component relationships</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}