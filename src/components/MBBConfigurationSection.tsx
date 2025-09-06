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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Shield, Droplets, Thermometer } from 'lucide-react';
import {
  MoistureSensitivityLevel,
  MoistureSensitivityLevels,
  StandardMBBConfigurations,
  DesiccantTypes,
  determineMBBRequirements,
  calculateDesiccantQuantity,
  calculateHumidityIndicatorQuantity,
  getRecommendedMBBConfiguration,
} from '@/types/amat-specifications';

export function MBBConfigurationSection() {
  const { configuration, updateAMATCompliance } = useCrateStore();
  const { addLog } = useLogsStore();
  const compliance = configuration.amatCompliance;

  if (!compliance?.requiresMoistureBag) {
    return null;
  }

  const msl = compliance.moistureSensitivityLevel || 'MSL2';
  const mslRequirements = MoistureSensitivityLevels[msl];
  const semiRequirements = determineMBBRequirements(msl);
  const isESDSensitive = compliance.isESDSensitive || false;

  // Calculate package volume in cubic inches
  const packageVolume =
    configuration.dimensions.length *
    configuration.dimensions.width *
    configuration.dimensions.height;

  const handleMSLChange = (newMSL: MoistureSensitivityLevel) => {
    const requirements = determineMBBRequirements(newMSL);
    const recommendedConfig = getRecommendedMBBConfiguration(newMSL, isESDSensitive);
    const standardConfig = StandardMBBConfigurations[recommendedConfig];

    // Calculate quantities based on new MSL
    const desiccantQuantity = calculateDesiccantQuantity(packageVolume, newMSL);
    const humidityIndicatorQuantity = calculateHumidityIndicatorQuantity(newMSL);

    updateAMATCompliance({
      moistureSensitivityLevel: newMSL,
      mbbConfiguration: requirements.mbbRequired
        ? {
            enabled: true,
            bagType: standardConfig.bagType,
            sealType: standardConfig.sealType,
            thickness: standardConfig.thickness,
            materialType: standardConfig.materialType,
            sealIntegrityTest: standardConfig.sealIntegrityTest,
          }
        : undefined,
      desiccantConfiguration: requirements.desiccantRequired
        ? {
            type: 'silica-gel',
            quantity: desiccantQuantity,
            packaging: 'sachet',
            placement: 'inside-bag',
          }
        : undefined,
      humidityIndicator: requirements.humidityIndicatorRequired
        ? {
            type: '30%',
            quantity: humidityIndicatorQuantity,
            placement: 'inside-bag',
            reversible: true,
          }
        : undefined,
    });

    addLog(
      'info',
      'config',
      `Moisture Sensitivity Level changed to ${newMSL}`,
      undefined,
      undefined,
      'MBBConfigurationSection'
    );
  };

  const handleESDSensitiveChange = (checked: boolean) => {
    const recommendedConfig = getRecommendedMBBConfiguration(msl, checked);
    const standardConfig = StandardMBBConfigurations[recommendedConfig];

    updateAMATCompliance({
      isESDSensitive: checked,
      mbbConfiguration: compliance.mbbConfiguration
        ? {
            ...compliance.mbbConfiguration,
            bagType: standardConfig.bagType,
            materialType: standardConfig.materialType,
            thickness: standardConfig.thickness,
          }
        : undefined,
    });

    addLog(
      'info',
      'config',
      `ESD sensitivity ${checked ? 'enabled' : 'disabled'}`,
      undefined,
      undefined,
      'MBBConfigurationSection'
    );
  };

  const handleBagTypeChange = (
    bagType: 'static-shielding' | 'moisture-barrier' | 'combination'
  ) => {
    updateAMATCompliance({
      mbbConfiguration: compliance.mbbConfiguration
        ? {
            ...compliance.mbbConfiguration,
            bagType,
          }
        : undefined,
    });

    addLog(
      'info',
      'config',
      `MBB bag type changed to ${bagType}`,
      undefined,
      undefined,
      'MBBConfigurationSection'
    );
  };

  const handleDesiccantTypeChange = (
    type: 'silica-gel' | 'clay' | 'molecular-sieve' | 'calcium-oxide'
  ) => {
    const newQuantity = calculateDesiccantQuantity(packageVolume, msl, type);

    updateAMATCompliance({
      desiccantConfiguration: compliance.desiccantConfiguration
        ? {
            ...compliance.desiccantConfiguration,
            type,
            quantity: newQuantity,
            packaging: DesiccantTypes[type].packaging,
          }
        : undefined,
    });

    addLog(
      'info',
      'config',
      `Desiccant type changed to ${type}`,
      undefined,
      undefined,
      'MBBConfigurationSection'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          SEMI E137 Moisture Barrier Bag Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* MSL Selection */}
        <div className="space-y-2">
          <Label htmlFor="msl-select">Moisture Sensitivity Level (MSL)</Label>
          <Select value={msl} onValueChange={handleMSLChange}>
            <SelectTrigger id="msl-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MoistureSensitivityLevels).map(([key, spec]) => (
                <SelectItem key={key} value={key}>
                  {key} - Floor Life:{' '}
                  {spec.maxFloorLife === Infinity ? 'Unlimited' : `${spec.maxFloorLife}h`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
            <div className="font-medium">MSL {msl} Requirements:</div>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              <li>
                • Max Floor Life:{' '}
                {mslRequirements.maxFloorLife === Infinity
                  ? 'Unlimited'
                  : `${mslRequirements.maxFloorLife} hours`}
              </li>
              <li>• Storage Humidity: ≤ {mslRequirements.storageHumidity}% RH</li>
              <li>• Baking Required: {mslRequirements.bakingRequired ? 'Yes' : 'No'}</li>
              {mslRequirements.bakingRequired && (
                <li>
                  • Baking Conditions: {mslRequirements.bakingTemp}°C for{' '}
                  {mslRequirements.bakingTime}h
                </li>
              )}
            </ul>
          </div>
        </div>

        <Separator />

        {/* ESD Sensitivity */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="esd-sensitive">ESD Sensitive Product</Label>
            <p className="text-sm text-muted-foreground">Requires static-dissipative packaging</p>
          </div>
          <Switch
            id="esd-sensitive"
            checked={isESDSensitive}
            onCheckedChange={handleESDSensitiveChange}
          />
        </div>

        {/* SEMI E137 Requirements Alert */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>SEMI E137 Requirements for {msl}:</strong>
            <ul className="mt-2 ml-4 space-y-1 text-sm">
              <li className="list-disc">
                MBB Required: {semiRequirements.mbbRequired ? 'Yes' : 'No'}
              </li>
              <li className="list-disc">
                Desiccant Required: {semiRequirements.desiccantRequired ? 'Yes' : 'No'}
              </li>
              <li className="list-disc">
                Humidity Indicator:{' '}
                {semiRequirements.humidityIndicatorRequired ? 'Required' : 'Not Required'}
              </li>
              <li className="list-disc">
                Seal Integrity Test:{' '}
                {semiRequirements.sealIntegrityTestRequired ? 'Required' : 'Not Required'}
              </li>
              <li className="list-disc">
                Traceability: {semiRequirements.traceabilityRequired ? 'Required' : 'Not Required'}
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* MBB Configuration */}
        {semiRequirements.mbbRequired && compliance.mbbConfiguration && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <Label className="text-lg font-medium">Moisture Barrier Bag Details</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bag-type">Bag Type</Label>
                  <Select
                    value={compliance.mbbConfiguration.bagType}
                    onValueChange={handleBagTypeChange}
                  >
                    <SelectTrigger id="bag-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moisture-barrier">Moisture Barrier</SelectItem>
                      <SelectItem value="static-shielding">Static Shielding</SelectItem>
                      <SelectItem value="combination">Combination ESD/Moisture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seal-type">Seal Type</Label>
                  <Select
                    value={compliance.mbbConfiguration.sealType}
                    onValueChange={(value: 'heat-seal' | 'zipper' | 'fold-over') =>
                      updateAMATCompliance({
                        mbbConfiguration: { ...compliance.mbbConfiguration!, sealType: value },
                      })
                    }
                  >
                    <SelectTrigger id="seal-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heat-seal">Heat Seal</SelectItem>
                      <SelectItem value="zipper">Zipper</SelectItem>
                      <SelectItem value="fold-over">Fold Over</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-type">Material Type</Label>
                  <Select
                    value={compliance.mbbConfiguration.materialType}
                    onValueChange={(
                      value: 'polyethylene' | 'polyester' | 'aluminum-foil-laminate'
                    ) =>
                      updateAMATCompliance({
                        mbbConfiguration: { ...compliance.mbbConfiguration!, materialType: value },
                      })
                    }
                  >
                    <SelectTrigger id="material-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="polyethylene">Polyethylene</SelectItem>
                      <SelectItem value="polyester">Polyester</SelectItem>
                      <SelectItem value="aluminum-foil-laminate">Aluminum Foil Laminate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thickness">Thickness (mils)</Label>
                  <Input
                    id="thickness"
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    value={compliance.mbbConfiguration.thickness}
                    onChange={(e) =>
                      updateAMATCompliance({
                        mbbConfiguration: {
                          ...compliance.mbbConfiguration!,
                          thickness: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="seal-integrity">Seal Integrity Test</Label>
                  <p className="text-sm text-muted-foreground">Test seal quality before use</p>
                </div>
                <Switch
                  id="seal-integrity"
                  checked={compliance.mbbConfiguration.sealIntegrityTest}
                  onCheckedChange={(checked) =>
                    updateAMATCompliance({
                      mbbConfiguration: {
                        ...compliance.mbbConfiguration!,
                        sealIntegrityTest: checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* Desiccant Configuration */}
        {semiRequirements.desiccantRequired && compliance.desiccantConfiguration && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <Label className="text-lg font-medium">Desiccant Configuration</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="desiccant-type">Desiccant Type</Label>
                  <Select
                    value={compliance.desiccantConfiguration.type}
                    onValueChange={handleDesiccantTypeChange}
                  >
                    <SelectTrigger id="desiccant-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DesiccantTypes).map(([key, spec]) => (
                        <SelectItem key={key} value={key}>
                          {key.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} (
                          {spec.absorptionCapacity}% capacity)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiccant-quantity">Quantity (grams)</Label>
                  <Input
                    id="desiccant-quantity"
                    type="number"
                    min="0"
                    value={compliance.desiccantConfiguration.quantity}
                    onChange={(e) =>
                      updateAMATCompliance({
                        desiccantConfiguration: {
                          ...compliance.desiccantConfiguration!,
                          quantity: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiccant-packaging">Packaging</Label>
                  <Select
                    value={compliance.desiccantConfiguration.packaging}
                    onValueChange={(value: 'sachet' | 'canister' | 'strip') =>
                      updateAMATCompliance({
                        desiccantConfiguration: {
                          ...compliance.desiccantConfiguration!,
                          packaging: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="desiccant-packaging">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sachet">Sachet</SelectItem>
                      <SelectItem value="canister">Canister</SelectItem>
                      <SelectItem value="strip">Strip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiccant-placement">Placement</Label>
                  <Select
                    value={compliance.desiccantConfiguration.placement}
                    onValueChange={(value: 'inside-bag' | 'outside-bag' | 'both') =>
                      updateAMATCompliance({
                        desiccantConfiguration: {
                          ...compliance.desiccantConfiguration!,
                          placement: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="desiccant-placement">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inside-bag">Inside Bag</SelectItem>
                      <SelectItem value="outside-bag">Outside Bag</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Humidity Indicator Configuration */}
        {semiRequirements.humidityIndicatorRequired && compliance.humidityIndicator && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label className="text-lg font-medium">Humidity Indicator Configuration</Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="humidity-type">Indicator Type</Label>
                  <Select
                    value={compliance.humidityIndicator.type}
                    onValueChange={(value: '10%' | '20%' | '30%' | '40%' | '50%' | '60%') =>
                      updateAMATCompliance({
                        humidityIndicator: { ...compliance.humidityIndicator!, type: value },
                      })
                    }
                  >
                    <SelectTrigger id="humidity-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10%">10% RH</SelectItem>
                      <SelectItem value="20%">20% RH</SelectItem>
                      <SelectItem value="30%">30% RH</SelectItem>
                      <SelectItem value="40%">40% RH</SelectItem>
                      <SelectItem value="50%">50% RH</SelectItem>
                      <SelectItem value="60%">60% RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="humidity-quantity">Quantity</Label>
                  <Input
                    id="humidity-quantity"
                    type="number"
                    min="1"
                    value={compliance.humidityIndicator.quantity}
                    onChange={(e) =>
                      updateAMATCompliance({
                        humidityIndicator: {
                          ...compliance.humidityIndicator!,
                          quantity: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="humidity-placement">Placement</Label>
                  <Select
                    value={compliance.humidityIndicator.placement}
                    onValueChange={(value: 'inside-bag' | 'outside-bag' | 'on-product') =>
                      updateAMATCompliance({
                        humidityIndicator: { ...compliance.humidityIndicator!, placement: value },
                      })
                    }
                  >
                    <SelectTrigger id="humidity-placement">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inside-bag">Inside Bag</SelectItem>
                      <SelectItem value="outside-bag">Outside Bag</SelectItem>
                      <SelectItem value="on-product">On Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="humidity-reversible">Reversible</Label>
                    <p className="text-sm text-muted-foreground">Can indicator be reset</p>
                  </div>
                  <Switch
                    id="humidity-reversible"
                    checked={compliance.humidityIndicator.reversible}
                    onCheckedChange={(checked) =>
                      updateAMATCompliance({
                        humidityIndicator: {
                          ...compliance.humidityIndicator!,
                          reversible: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Calculated Information */}
        <Separator />
        <div className="space-y-2">
          <Label>Calculated Package Information</Label>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Package Volume:</span>
              <span className="ml-2 font-medium">{packageVolume.toLocaleString()} in³</span>
            </div>
            <div>
              <span className="text-muted-foreground">Recommended Config:</span>
              <span className="ml-2 font-medium">
                {getRecommendedMBBConfiguration(msl, isESDSensitive).replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
