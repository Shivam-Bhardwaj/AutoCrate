'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Settings, Box, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function NXInstructions() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            NX CAD Implementation Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This guide explains how to import and use the generated expression file in NX CAD
            software using a simplified two-point box construction method.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="quick-start" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
          <TabsTrigger value="construction">Construction</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="troubleshoot">Troubleshoot</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-start" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Step-by-Step Implementation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <div>
                    <h4 className="font-medium">Download Expression File</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the &quot;Download&quot; button in the Output section to save the .exp
                      file
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  <div>
                    <h4 className="font-medium">Open NX CAD</h4>
                    <p className="text-sm text-muted-foreground">
                      Start NX and create a new part file (File → New → Model)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  <div>
                    <h4 className="font-medium">Import Expressions</h4>
                    <p className="text-sm text-muted-foreground">
                      Tools → Expression → Import → Select your .exp file
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    4
                  </span>
                  <div>
                    <h4 className="font-medium">Execute Block Features</h4>
                    <p className="text-sm text-muted-foreground">
                      The expressions define parametric blocks. Create each component using:
                      <br />
                      Insert → Design Feature → Block → Use expressions for dimensions
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    5
                  </span>
                  <div>
                    <h4 className="font-medium">Verify Assembly</h4>
                    <p className="text-sm text-muted-foreground">
                      Check that all panels align correctly and dimensions match specifications
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="construction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Box className="h-4 w-4" />
                Two-Point Box Construction Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Coordinate System</h4>
                <ul className="text-sm space-y-1">
                  <li>• Origin (0,0,0): Lower-left corner at base level</li>
                  <li>• X-axis: Length direction (left to right)</li>
                  <li>• Y-axis: Height direction (bottom to top)</li>
                  <li>• Z-axis: Width direction (back to front)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Box Definition Points</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Each crate component is defined by two diagonal corner points:
                </p>
                <div className="space-y-2">
                  <div className="border rounded p-3">
                    <p className="font-mono text-sm">
                      Point 1: (x1, y1, z1) - Lower-left-back corner
                    </p>
                    <p className="font-mono text-sm">
                      Point 2: (x2, y2, z2) - Upper-right-front corner
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Component Examples</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted rounded">
                    <span className="font-medium">Base Skid:</span>
                    <span className="font-mono ml-2">(0,0,0) to (length,skid_height,width)</span>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="font-medium">Front Panel:</span>
                    <span className="font-mono ml-2">
                      (0,base_height,width-thickness) to (length,total_height,width)
                    </span>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="font-medium">Top Panel:</span>
                    <span className="font-mono ml-2">
                      (0,height-thickness,0) to (length,height,width)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm flex items-start gap-2">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  This uniform construction method minimizes parameters needed - just two 3D points
                  define each rectangular component, making the model easy to modify and understand.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Expression Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Primary Dimensions (p0-p2)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p0</span>
                    <span>Crate Length</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p1</span>
                    <span>Crate Width</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p2</span>
                    <span>Crate Height</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Base Configuration (p10-p13)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p10</span>
                    <span>Skid Height</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p11</span>
                    <span>Skid Width</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p12</span>
                    <span>Number of Skids</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p13</span>
                    <span>Floorboard Thickness</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Panel Thicknesses (p20-p24)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p20</span>
                    <span>Top Panel</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p21</span>
                    <span>Front Panel</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p22</span>
                    <span>Back Panel</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p23</span>
                    <span>Left Panel</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">p24</span>
                    <span>Right Panel</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                <p className="text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  All parameters are linked - changing primary dimensions will automatically update
                  component positions to maintain proper assembly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Troubleshooting Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Expression Import Failed
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure the file has .exp extension and NX is in modeling mode.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Components Not Aligning
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Check that coordinate system is set correctly. Origin should be at (0,0,0).
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Missing Features
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Execute blocks in sequence: Base → Skids → Panels → Top. Check expression values
                    are properly loaded.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-medium flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Dimension Errors
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Verify units match between AutoCrate and NX. Default is millimeters.
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Pro Tip:</strong> Use NX&apos;s Expression Editor (Tools → Expression) to
                  modify parameters after import for quick design iterations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
