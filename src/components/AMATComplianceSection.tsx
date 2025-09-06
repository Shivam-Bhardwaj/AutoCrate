'use client';

import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { AMATCrateStyles, AMATSkidSizes, AMATMaterialSpecs } from '@/types/amat-specifications';
import { AMATCompliance } from '@/types/crate';
import { ISPM15ComplianceSection } from './ISPM15ComplianceSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export function AMATComplianceSection() {
  const { configuration } = useCrateStore();
  const updateAMATCompliance = (p: Partial<AMATCompliance>) => {};
  const { addLog } = useLogsStore();
  const compliance = configuration.amatCompliance;

  if (!compliance) return null;

  const currentStyle = AMATCrateStyles[compliance.style];
  const recommendedSkid = AMATSkidSizes.find(
    (skid) =>
      configuration.weight.product * 1.2 >= skid.weightCapacity.min &&
      configuration.weight.product * 1.2 <= skid.weightCapacity.max
  );

  const handleStyleChange = (style: string) => {
    updateAMATCompliance({ style: style as 'A' | 'B' | 'C' | 'D' });
    addLog(
      'info',
      'config',
      `Changed AMAT crate style to ${style}`,
      undefined,
      undefined,
      'AMATComplianceSection'
    );
  };

  const handleInternationalChange = (checked: boolean) => {
    updateAMATCompliance({ isInternational: checked });
    addLog(
      'info',
      'config',
      `International shipping ${checked ? 'enabled' : 'disabled'}`,
      undefined,
      undefined,
      'AMATComplianceSection'
    );
  };

  const handleMoistureBagChange = (checked: boolean) => {
    updateAMATCompliance({ requiresMoistureBag: checked });
    addLog(
      'info',
      'config',
      `Moisture barrier bag ${checked ? 'enabled' : 'disabled'}`,
      undefined,
      undefined,
      'AMATComplianceSection'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AMAT Compliance Settings
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-detected Style */}
        <Alert>
          <AlertDescription>
            Based on product weight ({configuration.weight.product} lbs), the recommended AMAT style
            is <strong>Style {compliance.style}</strong>: {currentStyle.description}
          </AlertDescription>
        </Alert>

        {/* Manual Style Override */}
        <div className="space-y-2">
          <Label htmlFor="amat-style">AMAT Crate Style</Label>
          <Select value={compliance.style} onValueChange={handleStyleChange}>
            <SelectTrigger id="amat-style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AMATCrateStyles).map(([key, style]) => (
                <SelectItem key={key} value={key}>
                  {style.name} ({style.weightRange.min.toLocaleString()} -{' '}
                  {style.weightRange.max.toLocaleString()} lbs)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Style Features */}
        <div className="space-y-2">
          <Label>Style Features</Label>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            {currentStyle.features.map((feature, index) => (
              <li key={index} className="list-disc">
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Skid Recommendation */}
        <div className="space-y-2">
          <Label>Recommended Skid Size</Label>
          <div className="text-sm">
            <strong>{recommendedSkid?.nominalSize || 'Custom'}</strong>
            {recommendedSkid && (
              <span className="text-muted-foreground ml-2">
                ({recommendedSkid.actualDimensions.width}&quot; x{' '}
                {recommendedSkid.actualDimensions.height}&quot;)
              </span>
            )}
          </div>
        </div>

        <Separator />

        {/* Compliance Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="international">International Shipping</Label>
              <p className="text-sm text-muted-foreground">Enable ISPM-15 compliance</p>
            </div>
            <Switch
              id="international"
              checked={compliance.isInternational}
              onCheckedChange={handleInternationalChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="moisture-bag">Moisture Barrier Bag</Label>
              <p className="text-sm text-muted-foreground">Per SEMI E137 specification</p>
            </div>
            <Switch
              id="moisture-bag"
              checked={compliance.requiresMoistureBag}
              onCheckedChange={handleMoistureBagChange}
            />
          </div>
        </div>

        <Separator />

        {/* Calculated Values */}
        <div className="space-y-2">
          <Label>Calculated Requirements</Label>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Foam Density:</span>
              <span className="ml-2 font-medium">{compliance.foamDensity} pcf</span>
            </div>
            <div>
              <span className="text-muted-foreground">Desiccant Units:</span>
              <span className="ml-2 font-medium">{compliance.desiccantUnits}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Shock Indicator:</span>
              <span className="ml-2 font-medium">
                {compliance.requiresShockIndicator ? 'Required' : 'Not Required'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Tilt Indicator:</span>
              <span className="ml-2 font-medium">
                {compliance.requiresTiltIndicator ? 'Required' : 'Not Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Comprehensive Material Specifications */}
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Material Specifications</Label>
            {compliance.materialValidation && (
              <div
                className={`text-xs font-medium px-2 py-1 rounded ${
                  compliance.materialValidation.isValid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {compliance.materialValidation.complianceScore}% Compliant
              </div>
            )}
          </div>

          {/* Material Validation Status */}
          {compliance.materialValidation && (
            <div className="space-y-2">
              {compliance.materialValidation.errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Material Compliance Issues:</div>
                    <ul className="ml-4 space-y-0.5 text-sm">
                      {compliance.materialValidation.errors.map((error, index) => (
                        <li key={index} className="list-disc">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {compliance.materialValidation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Material Warnings:</div>
                    <ul className="ml-4 space-y-0.5 text-sm">
                      {compliance.materialValidation.warnings.map((warning, index) => (
                        <li key={index} className="list-disc">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {compliance.materialValidation.recommendations.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Recommendations:</div>
                    <ul className="ml-4 space-y-0.5 text-sm">
                      {compliance.materialValidation.recommendations.map((rec, index) => (
                        <li key={index} className="list-disc">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Comprehensive Materials Display */}
          {compliance.comprehensiveMaterials && (
            <div className="space-y-4 text-sm">
              {/* Wood Specifications */}
              <div className="space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Wood Materials
                </div>
                {compliance.comprehensiveMaterials.wood.map((wood, index) => (
                  <div key={index} className="ml-6 space-y-1">
                    <div className="font-medium">
                      {wood.species} - {wood.grade}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Moisture: {wood.moistureContent.target}% | Density: {wood.density.min}-
                      {wood.density.max} {wood.density.unit}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Strength: {wood.strength.bending} psi bending
                    </div>
                  </div>
                ))}
              </div>

              {/* Hardware Specifications */}
              <div className="space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Hardware
                </div>
                {compliance.comprehensiveMaterials.hardware.map((hardware, index) => (
                  <div key={index} className="ml-6 space-y-1">
                    <div className="font-medium capitalize">
                      {hardware.type}: {hardware.grade}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Material: {hardware.material} | Finish: {hardware.finish}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Tensile: {hardware.strength.tensile.toLocaleString()} psi
                    </div>
                  </div>
                ))}
              </div>

              {/* Treatment Specifications */}
              {compliance.comprehensiveMaterials.treatments.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Treatments
                  </div>
                  {compliance.comprehensiveMaterials.treatments.map((treatment, index) => (
                    <div key={index} className="ml-6 space-y-1">
                      <div className="font-medium capitalize">
                        {treatment.type.replace('-', ' ')}
                      </div>
                      {treatment.temperature && (
                        <div className="text-muted-foreground text-xs">
                          Temp: {treatment.temperature.min}-{treatment.temperature.max}°C for{' '}
                          {treatment.temperature.duration}min
                        </div>
                      )}
                      <div className="text-muted-foreground text-xs">
                        Compliance: {treatment.compliance.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Finish Specifications */}
              {compliance.comprehensiveMaterials.finishes.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Finishes
                  </div>
                  {compliance.comprehensiveMaterials.finishes.map((finish, index) => (
                    <div key={index} className="ml-6 space-y-1">
                      <div className="font-medium capitalize">
                        {finish.type}: {finish.material}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Thickness: {finish.thickness.target} mils | Coats:{' '}
                        {finish.application.coats}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Color: {finish.color.standard}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Legacy Basic Material Requirements (for reference) */}
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Show basic material requirements
            </summary>
            <div className="mt-3 space-y-3">
              {AMATMaterialSpecs.map((spec, index) => (
                <div key={index} className="space-y-1">
                  <div className="font-medium capitalize">
                    {spec.type}: {spec.grade}
                  </div>
                  <ul className="text-muted-foreground ml-4 space-y-0.5">
                    {spec.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="list-disc text-xs">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* ISPM-15 Compliance Section */}
        {compliance.isInternational && (
          <>
            <Separator />
            <ISPM15ComplianceSection />
          </>
        )}
      </CardContent>
    </Card>
  );
}
