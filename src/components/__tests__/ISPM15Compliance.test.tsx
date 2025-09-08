import { describe, it, expect } from 'vitest';
import {
  validateISPM15HeatTreatment,
  validateISPM15ChemicalTreatment,
  validateISPM15WoodRequirements,
  validateISPM15Compliance,
  getCountrySpecificRequirements,
  ISPM15StandardRequirements,
  CountrySpecificRequirementsDB,
  CountryCode,
} from '../../types/ispm15-compliance';

describe('ISPM-15 Heat Treatment Validation', () => {
  it('should validate compliant heat treatment parameters', () => {
    const result = validateISPM15HeatTreatment(56, 30, 56);

    expect(result.isValid).toBe(true);
    expect(result.validationScore).toBe(100);
    expect(result.complianceDetails.temperatureAchieved).toBe(true);
    expect(result.complianceDetails.durationMet).toBe(true);
    expect(result.complianceDetails.coreTemperatureMet).toBe(true);
  });

  it('should reject heat treatment with insufficient temperature', () => {
    const result = validateISPM15HeatTreatment(54, 30, 54);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.validationScore).toBeLessThan(100);
    expect(result.complianceDetails.temperatureAchieved).toBe(false);
  });

  it('should reject heat treatment with insufficient duration', () => {
    const result = validateISPM15HeatTreatment(56, 25, 56);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.validationScore).toBeLessThan(100);
    expect(result.complianceDetails.durationMet).toBe(false);
  });

  it('should reject heat treatment with insufficient core temperature', () => {
    const result = validateISPM15HeatTreatment(56, 30, 54);

    expect(result.isValid).toBe(false);
    expect(result.complianceDetails.coreTemperatureMet).toBe(false);
  });

  it('should provide warnings for borderline conditions', () => {
    const result = validateISPM15HeatTreatment(57, 32, 57);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.validationScore).toBeLessThan(100);
    expect(result.validationScore).toBeGreaterThanOrEqual(90); // Should be between 90-100
  });
});

describe('ISPM-15 Chemical Treatment Validation', () => {
  it('should validate compliant methyl bromide treatment', () => {
    const result = validateISPM15ChemicalTreatment('methyl-bromide', 48, 20, 16);

    expect(result.isValid).toBe(true);
    expect(result.validationScore).toBe(100);
    expect(result.complianceDetails.chemicalConcentrationMet).toBe(true);
  });

  it('should reject chemical treatment with insufficient concentration', () => {
    const result = validateISPM15ChemicalTreatment('methyl-bromide', 40, 20, 16);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.validationScore).toBeLessThan(100);
  });

  it('should reject chemical treatment with invalid temperature', () => {
    const result = validateISPM15ChemicalTreatment('methyl-bromide', 48, 5, 16);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject chemical treatment with insufficient duration', () => {
    const result = validateISPM15ChemicalTreatment('methyl-bromide', 48, 20, 12);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should validate sulfuryl fluoride treatment', () => {
    const result = validateISPM15ChemicalTreatment('sulfuryl-fluoride', 24, 20, 16);

    expect(result.isValid).toBe(true);
    expect(result.validationScore).toBe(100);
  });

  it('should validate phosphine treatment', () => {
    const result = validateISPM15ChemicalTreatment('phosphine', 1, 20, 16);

    expect(result.isValid).toBe(true);
    expect(result.validationScore).toBe(100);
  });
});

describe('ISPM-15 Wood Requirements Validation', () => {
  it('should validate compliant wood specifications', () => {
    const result = validateISPM15WoodRequirements('softwood', 12, false, 19);

    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject wood with excessive moisture content', () => {
    const result = validateISPM15WoodRequirements('softwood', 22, false, 19);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Moisture content');
  });

  it('should reject wood with bark', () => {
    const result = validateISPM15WoodRequirements('softwood', 12, true, 19);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Bark is not allowed');
  });

  it('should reject wood with insufficient thickness', () => {
    const result = validateISPM15WoodRequirements('softwood', 12, false, 3);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Thickness');
  });

  it('should provide warnings for hardwood', () => {
    const result = validateISPM15WoodRequirements('hardwood', 12, false, 19);

    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Hardwood may require longer treatment times');
  });
});

describe('ISPM-15 Country-Specific Requirements', () => {
  it('should return US requirements', () => {
    const requirements = getCountrySpecificRequirements('US');

    expect(requirements.country).toBe('US');
    expect(requirements.treatmentRequirements.preferredMethod).toBe('heat-treatment');
    expect(requirements.treatmentRequirements.bannedMethods).toEqual([]);
    expect(requirements.importRestrictions.treatmentValidityPeriod).toBe(6);
  });

  it('should return EU requirements', () => {
    const requirements = getCountrySpecificRequirements('EU');

    expect(requirements.country).toBe('EU');
    expect(requirements.treatmentRequirements.preferredMethod).toBe('heat-treatment');
    expect(requirements.documentation.notarizationRequired).toBe(true);
    expect(requirements.importRestrictions.treatmentValidityPeriod).toBe(12);
  });

  it('should return China requirements', () => {
    const requirements = getCountrySpecificRequirements('CN');

    expect(requirements.country).toBe('CN');
    expect(requirements.treatmentRequirements.preferredMethod).toBe('heat-treatment');
    expect(requirements.treatmentRequirements.bannedMethods).toContain('chemical-treatment');
    expect(requirements.importRestrictions.reTreatmentRequired).toBe(true);
  });

  it('should return default requirements for unknown country', () => {
    const requirements = getCountrySpecificRequirements('OTHER' as CountryCode);

    expect(requirements.country).toBe('OTHER');
    expect(requirements.treatmentRequirements.preferredMethod).toBe('heat-treatment');
  });
});

describe('ISPM-15 Overall Compliance Validation', () => {
  it('should validate compliant heat treatment for US destination', () => {
    const result = validateISPM15Compliance(
      'heat-treatment',
      { temperature: 58, duration: 35, coreTemperature: 58 },
      { woodType: 'softwood', moistureContent: 12, hasBark: false, thickness: 19 },
      'US'
    );

    expect(result.overall.compliant).toBe(true);
    expect(result.overall.overallScore).toBe(100);
    expect(result.treatment.isValid).toBe(true);
    expect(result.wood.isValid).toBe(true);
  });

  it('should reject non-compliant heat treatment', () => {
    const result = validateISPM15Compliance(
      'heat-treatment',
      { temperature: 54, duration: 25, coreTemperature: 54 },
      { woodType: 'softwood', moistureContent: 12, hasBark: false, thickness: 19 },
      'US'
    );

    expect(result.overall.compliant).toBe(false);
    expect(result.overall.overallScore).toBeLessThan(100);
    expect(result.treatment.isValid).toBe(false);
  });

  it('should reject wood with compliance issues', () => {
    const result = validateISPM15Compliance(
      'heat-treatment',
      { temperature: 56, duration: 30, coreTemperature: 56 },
      { woodType: 'softwood', moistureContent: 22, hasBark: true, thickness: 3 },
      'US'
    );

    expect(result.overall.compliant).toBe(false);
    expect(result.wood.isValid).toBe(false);
  });

  it('should validate chemical treatment for EU destination', () => {
    const result = validateISPM15Compliance(
      'chemical-treatment',
      { chemical: 'methyl-bromide', concentration: 48, temperature: 20, duration: 16 },
      { woodType: 'softwood', moistureContent: 12, hasBark: false, thickness: 19 },
      'EU'
    );

    expect(result.overall.compliant).toBe(true);
    expect(result.treatment.isValid).toBe(true);
  });

  it('should handle unsupported treatment methods', () => {
    const result = validateISPM15Compliance(
      'unsupported-method' as 'heat-treatment',
      {},
      { woodType: 'softwood', moistureContent: 12, hasBark: false, thickness: 19 },
      'US'
    );

    expect(result.overall.compliant).toBe(false);
    expect(result.treatment.isValid).toBe(false);
    expect(result.treatment.errors[0]).toContain('not supported');
  });
});

describe('ISPM-15 Standard Requirements Constants', () => {
  it('should have correct heat treatment minimum requirements', () => {
    expect(ISPM15StandardRequirements.heatTreatment.minimumTemperature).toBe(56);
    expect(ISPM15StandardRequirements.heatTreatment.minimumDuration).toBe(30);
    expect(ISPM15StandardRequirements.heatTreatment.temperatureTolerance).toBe(2);
  });

  it('should have correct chemical treatment requirements', () => {
    expect(ISPM15StandardRequirements.chemicalTreatment.minimumConcentration).toBe(48);
    expect(ISPM15StandardRequirements.chemicalTreatment.minimumDuration).toBe(16);
    expect(ISPM15StandardRequirements.chemicalTreatment.temperatureRange).toEqual([10, 35]);
  });

  it('should have correct wood quality requirements', () => {
    expect(ISPM15StandardRequirements.woodQuality.maximumMoistureContent).toBe(20);
    expect(ISPM15StandardRequirements.woodQuality.minimumThickness).toBe(5);
    expect(ISPM15StandardRequirements.woodQuality.barkMaximumCoverage).toBe(0);
  });

  it('should have correct marking requirements', () => {
    expect(ISPM15StandardRequirements.marking.minimumHeight).toBe(25);
    expect(ISPM15StandardRequirements.marking.minimumWidth).toBe(50);
    expect(ISPM15StandardRequirements.marking.fontSize).toBe(12);
  });
});

describe('Country Requirements Database', () => {
  it('should have all required countries defined', () => {
    const expectedCountries = [
      'US',
      'CA',
      'MX',
      'EU',
      'CN',
      'JP',
      'AU',
      'NZ',
      'BR',
      'AR',
      'CL',
      'OTHER',
    ];

    expectedCountries.forEach((country) => {
      expect(CountrySpecificRequirementsDB[country as CountryCode]).toBeDefined();
      expect(CountrySpecificRequirementsDB[country as CountryCode].country).toBe(country);
    });
  });

  it('should have valid treatment requirements for all countries', () => {
    Object.values(CountrySpecificRequirementsDB).forEach((country) => {
      expect(country.treatmentRequirements.preferredMethod).toBeDefined();
      expect(Array.isArray(country.treatmentRequirements.alternativeMethods)).toBe(true);
      expect(Array.isArray(country.treatmentRequirements.bannedMethods)).toBe(true);
      expect(country.importRestrictions.treatmentValidityPeriod).toBeGreaterThan(0);
    });
  });

  it('should have valid documentation requirements for all countries', () => {
    Object.values(CountrySpecificRequirementsDB).forEach((country) => {
      expect(Array.isArray(country.documentation.additionalCertificates)).toBe(true);
      expect(Array.isArray(country.documentation.languageRequirements)).toBe(true);
      expect(typeof country.documentation.notarizationRequired).toBe('boolean');
      expect(typeof country.documentation.apostilleRequired).toBe('boolean');
    });
  });
});
