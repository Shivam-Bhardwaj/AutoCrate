'use client';

import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Thermometer,
  Droplets,
  Clock,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  validateISPM15Compliance,
  getCountrySpecificRequirements,
  CountryCode,
  WoodType,
  ISPM15TreatmentMethod,
  ISPM15ValidationResult,
} from '@/types/ispm15-compliance';
import { AMATTreatmentSpecs } from '@/types/material-specifications';
import { useState, useEffect } from 'react';

export function ISPM15ComplianceSection() {
  const { configuration } = useCrateStore();
  const _updateAMATCompliance = (_p: Partial<typeof configuration.amatCompliance>) => {};
  const { addLog } = useLogsStore();
  const compliance = configuration.amatCompliance;

  const [treatmentData, setTreatmentData] = useState({
    method: 'heat-treatment' as ISPM15TreatmentMethod,
    temperature: 56,
    duration: 30,
    coreTemperature: 56,
    chemical: 'methyl-bromide' as
      | 'methyl-bromide'
      | 'sulfuryl-fluoride'
      | 'phosphine'
      | 'heat-only',
    concentration: 48,
    woodType: 'softwood' as WoodType,
    moistureContent: 12,
    hasBark: false,
    thickness: 19,
    destinationCountry: 'US' as CountryCode,
  });

  const [validationResult, setValidationResult] = useState<ISPM15ValidationResult | null>(null);

  useEffect(() => {
    // Validate ISPM-15 compliance whenever treatment data changes
    const result = validateISPM15Compliance(
      treatmentData.method,
      {
        temperature: treatmentData.temperature,
        duration: treatmentData.duration,
        coreTemperature: treatmentData.coreTemperature,
        chemical: treatmentData.chemical,
        concentration: treatmentData.concentration,
      },
      {
        woodType: treatmentData.woodType,
        moistureContent: treatmentData.moistureContent,
        hasBark: treatmentData.hasBark,
        thickness: treatmentData.thickness,
      },
      treatmentData.destinationCountry
    );
    setValidationResult(result);
  }, [treatmentData]);

  if (!compliance) return null;

  const handleTreatmentMethodChange = (method: ISPM15TreatmentMethod) => {
    setTreatmentData((prev) => ({ ...prev, method }));
    addLog(
      'info',
      'config',
      `Changed ISPM-15 treatment method to ${method}`,
      undefined,
      undefined,
      'ISPM15ComplianceSection'
    );
  };

  const handleTemperatureChange = (temperature: number) => {
    setTreatmentData((prev) => ({ ...prev, temperature }));
  };

  const handleDurationChange = (duration: number) => {
    setTreatmentData((prev) => ({ ...prev, duration }));
  };

  const handleDestinationCountryChange = (country: CountryCode) => {
    setTreatmentData((prev) => ({ ...prev, destinationCountry: country }));
    addLog(
      'info',
      'config',
      `Changed destination country to ${country}`,
      undefined,
      undefined,
      'ISPM15ComplianceSection'
    );
  };

  const handleWoodTypeChange = (woodType: WoodType) => {
    setTreatmentData((prev) => ({ ...prev, woodType }));
  };

  const handleMoistureContentChange = (moistureContent: number) => {
    setTreatmentData((prev) => ({ ...prev, moistureContent }));
  };

  const getTreatmentSpecs = () => {
    const specs = AMATTreatmentSpecs['ISPM-15 Heat Treatment'];
    return (
      specs || {
        type: 'heat-treatment',
        temperature: { min: 56, max: 60, duration: 30 },
        penetration: { minDepth: 2.5, uniformity: 'Uniform throughout' },
        certification: { required: true, agency: 'USDA APHIS', standard: 'ISPM-15' },
        stamp: { required: true, type: 'IPPC HT', location: 'Both ends of each piece' },
        compliance: ['ISPM-15', 'AMAT-STD'],
      }
    );
  };

  const countryRequirements = getCountrySpecificRequirements(treatmentData.destinationCountry);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ISPM-15 Compliance Validation
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ISPM-15 Overview */}
        <Alert>
          <AlertDescription>
            <strong>ISPM-15 International Standards</strong> ensure wood packaging materials are
            treated to prevent the spread of pests and diseases in international trade. All wood
            components must be heat treated (56°C for 30 minutes) or chemically treated and marked
            with IPPC stamps.
          </AlertDescription>
        </Alert>

        {/* Treatment Method Selection */}
        <div className="space-y-2">
          <Label htmlFor="treatment-method">Treatment Method</Label>
          <Select value={treatmentData.method} onValueChange={handleTreatmentMethodChange}>
            <SelectTrigger id="treatment-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heat-treatment">Heat Treatment (HT)</SelectItem>
              <SelectItem value="chemical-treatment">Chemical Treatment (MB)</SelectItem>
              <SelectItem value="fumigation">Fumigation</SelectItem>
              <SelectItem value="kiln-drying">Kiln Drying</SelectItem>
              <SelectItem value="dielectric-heating">Dielectric Heating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Treatment Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temperature" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature (°C)
            </Label>
            <Input
              id="temperature"
              type="number"
              value={treatmentData.temperature}
              onChange={(e) => handleTemperatureChange(Number(e.target.value))}
              min="0"
              max="100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration (min)
            </Label>
            <Input
              id="duration"
              type="number"
              value={treatmentData.duration}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              min="1"
              max="480"
            />
          </div>
        </div>

        {/* Wood Specifications */}
        <Separator />
        <div className="space-y-4">
          <Label>Wood Material Specifications</Label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wood-type">Wood Type</Label>
              <Select value={treatmentData.woodType} onValueChange={handleWoodTypeChange}>
                <SelectTrigger id="wood-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="softwood">Softwood</SelectItem>
                  <SelectItem value="hardwood">Hardwood</SelectItem>
                  <SelectItem value="plywood">Plywood</SelectItem>
                  <SelectItem value="particleboard">Particleboard</SelectItem>
                  <SelectItem value="MDF">MDF</SelectItem>
                  <SelectItem value="OSB">OSB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moisture-content" className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Moisture Content (%)
              </Label>
              <Input
                id="moisture-content"
                type="number"
                value={treatmentData.moistureContent}
                onChange={(e) => handleMoistureContentChange(Number(e.target.value))}
                min="0"
                max="30"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thickness">Wood Thickness (mm)</Label>
            <Input
              id="thickness"
              type="number"
              value={treatmentData.thickness}
              onChange={(e) =>
                setTreatmentData((prev) => ({ ...prev, thickness: Number(e.target.value) }))
              }
              min="5"
              max="100"
            />
          </div>
        </div>

        {/* Destination Country */}
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="destination-country">Destination Country</Label>
          <Select
            value={treatmentData.destinationCountry}
            onValueChange={handleDestinationCountryChange}
          >
            <SelectTrigger id="destination-country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="MX">Mexico</SelectItem>
              <SelectItem value="EU">European Union</SelectItem>
              <SelectItem value="CN">China</SelectItem>
              <SelectItem value="JP">Japan</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
              <SelectItem value="NZ">New Zealand</SelectItem>
              <SelectItem value="BR">Brazil</SelectItem>
              <SelectItem value="AR">Argentina</SelectItem>
              <SelectItem value="CL">Chile</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Country-Specific Requirements */}
        {countryRequirements && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>{countryRequirements.country} Requirements:</strong>
              <ul className="mt-2 ml-4 space-y-1 text-sm">
                <li className="list-disc">
                  Preferred method: {countryRequirements.treatmentRequirements.preferredMethod}
                </li>
                <li className="list-disc">
                  Treatment validity:{' '}
                  {countryRequirements.importRestrictions.treatmentValidityPeriod} months
                </li>
                <li className="list-disc">
                  Re-treatment required:{' '}
                  {countryRequirements.importRestrictions.reTreatmentRequired ? 'Yes' : 'No'}
                </li>
                {countryRequirements.treatmentRequirements.specialRequirements.map((req, index) => (
                  <li key={index} className="list-disc">
                    {req}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Compliance Validation Results */}
        {validationResult && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>ISPM-15 Compliance Status</Label>
                <div
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    validationResult.overall.compliant
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {validationResult.overall.overallScore}% Compliant
                </div>
              </div>

              {/* Treatment Validation */}
              <div className="space-y-2">
                <div className="font-medium text-sm">Treatment Validation</div>
                {validationResult.treatment.isValid ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Treatment parameters valid ({validationResult.treatment.validationScore}%)
                  </div>
                ) : (
                  <div className="space-y-1">
                    {validationResult.treatment.errors.map((error: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
                        <XCircle className="h-4 w-4" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}
                {validationResult.treatment.warnings.length > 0 && (
                  <div className="space-y-1">
                    {validationResult.treatment.warnings.map((warning: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-yellow-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wood Validation */}
              <div className="space-y-2">
                <div className="font-medium text-sm">Wood Material Validation</div>
                {validationResult.wood.isValid ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Wood specifications valid
                  </div>
                ) : (
                  <div className="space-y-1">
                    {validationResult.wood.errors.map((error: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
                        <XCircle className="h-4 w-4" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}
                {validationResult.wood.warnings.length > 0 && (
                  <div className="space-y-1">
                    {validationResult.wood.warnings.map((warning: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-yellow-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Overall Compliance Status */}
              <Alert
                className={
                  validationResult.overall.compliant
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }
              >
                {validationResult.overall.compliant ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <div className="font-medium">
                    {validationResult.overall.compliant
                      ? 'ISPM-15 Compliant'
                      : 'ISPM-15 Non-Compliant'}
                  </div>
                  <div className="text-sm mt-1">
                    Overall Score: {validationResult.overall.overallScore}%
                  </div>
                  {validationResult.documentation.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {validationResult.documentation.errors.map((error: string, index: number) => (
                        <div key={index} className="text-sm text-red-600">
                          • {error}
                        </div>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}

        {/* Required Treatments from Material Specifications */}
        <Separator />
        <div className="space-y-4">
          <Label>Required ISPM-15 Treatments</Label>
          {getTreatmentSpecs() && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">{getTreatmentSpecs().type.replace('-', ' ')}</span>
              </div>
              {getTreatmentSpecs().temperature && (
                <div className="ml-6 text-muted-foreground">
                  Temperature: {getTreatmentSpecs().temperature!.min}-
                  {getTreatmentSpecs().temperature!.max}°C for{' '}
                  {getTreatmentSpecs().temperature!.duration}min
                </div>
              )}
              <div className="ml-6 text-muted-foreground">
                Penetration: {getTreatmentSpecs().penetration.minDepth}mm minimum
              </div>
              <div className="ml-6 text-muted-foreground">
                Certification: {getTreatmentSpecs().certification.agency} -{' '}
                {getTreatmentSpecs().certification.standard}
              </div>
              <div className="ml-6 text-muted-foreground">
                Stamp: {getTreatmentSpecs().stamp.type} - {getTreatmentSpecs().stamp.location}
              </div>
            </div>
          )}
        </div>

        {/* International Shipping Alert */}
        {compliance.isInternational && (
          <>
            <Separator />
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>International Shipping Requirements:</strong>
                <ul className="mt-2 ml-4 space-y-1 text-sm">
                  <li className="list-disc">
                    All wood packaging materials must be ISPM-15 treated
                  </li>
                  <li className="list-disc">IPPC stamps required on all treated wood components</li>
                  <li className="list-disc">Treatment certificates must accompany shipments</li>
                  <li className="list-disc">Country-specific requirements may apply</li>
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}
