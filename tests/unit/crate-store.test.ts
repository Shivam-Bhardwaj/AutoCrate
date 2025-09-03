import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCrateStore } from '@/store/crate-store';
import { createMockCrateConfiguration } from '../utils/test-utils';

describe('CrateStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useCrateStore());
    act(() => {
      result.current.resetConfiguration();
    });
  });

  describe('initial state', () => {
    it('should have default configuration', () => {
      const { result } = renderHook(() => useCrateStore());

      expect(result.current.configuration.dimensions.length).toBe(1200);
      expect(result.current.configuration.dimensions.width).toBe(800);
      expect(result.current.configuration.dimensions.height).toBe(600);
      expect(result.current.configuration.dimensions.unit).toBe('mm');
    });

    it('should have default weight configuration', () => {
      const { result } = renderHook(() => useCrateStore());

      expect(result.current.configuration.weight.product).toBe(50);
      expect(result.current.configuration.weight.maxGross).toBe(150);
    });

    it('should have default base configuration', () => {
      const { result } = renderHook(() => useCrateStore());
      const base = result.current.configuration.base;

      expect(base.type).toBe('standard');
      expect(base.floorboardThickness).toBe(25);
      expect(base.skidHeight).toBe(100);
      expect(base.material).toBe('pine');
    });
  });

  describe('updateDimensions', () => {
    it('should update dimensions', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateDimensions({
          length: 1500,
          width: 1000,
        });
      });

      expect(result.current.configuration.dimensions.length).toBe(1500);
      expect(result.current.configuration.dimensions.width).toBe(1000);
      expect(result.current.configuration.dimensions.height).toBe(600); // unchanged
    });

    it('should update unit and convert dimensions', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateDimensions({
          unit: 'inches',
        });
      });

      expect(result.current.configuration.dimensions.unit).toBe('inches');
    });

    it('should handle partial updates', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateDimensions({ height: 700 });
      });

      expect(result.current.configuration.dimensions.height).toBe(700);
      expect(result.current.configuration.dimensions.length).toBe(1200); // unchanged
      expect(result.current.configuration.dimensions.width).toBe(800); // unchanged
    });
  });

  describe('updateWeight', () => {
    it('should update product weight', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateWeight({ product: 75 });
      });

      expect(result.current.configuration.weight.product).toBe(75);
      expect(result.current.configuration.weight.maxGross).toBe(150); // unchanged
    });

    it('should update max gross weight', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateWeight({ maxGross: 200 });
      });

      expect(result.current.configuration.weight.maxGross).toBe(200);
      expect(result.current.configuration.weight.product).toBe(50); // unchanged
    });

    it('should update both weights simultaneously', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateWeight({ product: 80, maxGross: 250 });
      });

      expect(result.current.configuration.weight.product).toBe(80);
      expect(result.current.configuration.weight.maxGross).toBe(250);
    });
  });

  describe('updateBase', () => {
    it('should update base type', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateBase({ type: 'heavy-duty' });
      });

      expect(result.current.configuration.base.type).toBe('heavy-duty');
    });

    it('should update floorboard thickness', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateBase({ floorboardThickness: 30 });
      });

      expect(result.current.configuration.base.floorboardThickness).toBe(30);
    });

    it('should update multiple base properties', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateBase({
          skidHeight: 120,
          skidWidth: 110,
          skidCount: 4,
          material: 'oak',
        });
      });

      expect(result.current.configuration.base.skidHeight).toBe(120);
      expect(result.current.configuration.base.skidWidth).toBe(110);
      expect(result.current.configuration.base.skidCount).toBe(4);
      expect(result.current.configuration.base.material).toBe('oak');
    });
  });

  describe('updatePanel', () => {
    it('should update top panel configuration', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updatePanel('topPanel', {
          thickness: 25,
          material: 'osb',
        });
      });

      expect(result.current.configuration.cap.topPanel.thickness).toBe(25);
      expect(result.current.configuration.cap.topPanel.material).toBe('osb');
    });

    it('should update panel enabled status', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updatePanel('frontPanel', { enabled: false });
      });

      expect(result.current.configuration.cap.frontPanel.enabled).toBe(false);
    });

    it('should update ventilation option', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updatePanel('leftPanel', { ventilation: true });
      });

      expect(result.current.configuration.cap.leftPanel.ventilation).toBe(true);
    });

    it('should not affect other panels when updating one', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updatePanel('backPanel', { thickness: 30 });
      });

      expect(result.current.configuration.cap.backPanel.thickness).toBe(30);
      expect(result.current.configuration.cap.frontPanel.thickness).toBe(20); // unchanged
      expect(result.current.configuration.cap.topPanel.thickness).toBe(20); // unchanged
    });
  });

  describe('updateAccessories', () => {
    it('should update corner protectors', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateAccessories({ cornerProtectors: true });
      });

      expect(result.current.configuration.accessories.cornerProtectors).toBe(true);
    });

    it('should update custom markings', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateAccessories({ customMarkings: 'FRAGILE' });
      });

      expect(result.current.configuration.accessories.customMarkings).toBe('FRAGILE');
    });

    it('should update multiple accessories', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateAccessories({
          handles: true,
          labels: true,
          moisture: true,
        });
      });

      expect(result.current.configuration.accessories.handles).toBe(true);
      expect(result.current.configuration.accessories.labels).toBe(true);
      expect(result.current.configuration.accessories.moisture).toBe(true);
    });
  });

  describe('updateFasteners', () => {
    it('should update fastener type', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateFasteners({ type: 'screws' });
      });

      expect(result.current.configuration.fasteners.type).toBe('screws');
    });

    it('should update fastener spacing', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateFasteners({ spacing: 200 });
      });

      expect(result.current.configuration.fasteners.spacing).toBe(200);
    });

    it('should update multiple fastener properties', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateFasteners({
          type: 'bolts',
          size: 'large',
          material: 'stainless',
          spacing: 100,
        });
      });

      expect(result.current.configuration.fasteners.type).toBe('bolts');
      expect(result.current.configuration.fasteners.size).toBe('large');
      expect(result.current.configuration.fasteners.material).toBe('stainless');
      expect(result.current.configuration.fasteners.spacing).toBe(100);
    });
  });

  describe('updateVinyl', () => {
    it('should enable vinyl', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateVinyl({ enabled: true });
      });

      expect(result.current.configuration.vinyl.enabled).toBe(true);
    });

    it('should update vinyl type', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateVinyl({
          enabled: true,
          type: 'vapor-barrier',
        });
      });

      expect(result.current.configuration.vinyl.type).toBe('vapor-barrier');
    });

    it('should update vinyl properties when enabled', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateVinyl({
          enabled: true,
          thickness: 2,
          coverage: 'partial',
        });
      });

      expect(result.current.configuration.vinyl.enabled).toBe(true);
      expect(result.current.configuration.vinyl.thickness).toBe(2);
      expect(result.current.configuration.vinyl.coverage).toBe('partial');
    });
  });

  describe('setConfiguration', () => {
    it('should replace entire configuration', () => {
      const { result } = renderHook(() => useCrateStore());
      const newConfig = createMockCrateConfiguration();
      newConfig.dimensions.length = 2000;

      act(() => {
        result.current.setConfiguration(newConfig);
      });

      expect(result.current.configuration).toEqual(newConfig);
      expect(result.current.configuration.dimensions.length).toBe(2000);
    });
  });

  describe('resetConfiguration', () => {
    it('should reset to default configuration', () => {
      const { result } = renderHook(() => useCrateStore());

      // Modify configuration
      act(() => {
        result.current.updateDimensions({ length: 2000 });
        result.current.updateWeight({ product: 100 });
      });

      expect(result.current.configuration.dimensions.length).toBe(2000);
      expect(result.current.configuration.weight.product).toBe(100);

      // Reset configuration
      act(() => {
        result.current.resetConfiguration();
      });

      expect(result.current.configuration.dimensions.length).toBe(1200);
      expect(result.current.configuration.weight.product).toBe(50);
    });
  });

  describe('state persistence', () => {
    it('should maintain state across multiple hook calls', () => {
      const { result: result1 } = renderHook(() => useCrateStore());

      act(() => {
        result1.current.updateDimensions({ length: 1800 });
      });

      const { result: result2 } = renderHook(() => useCrateStore());

      expect(result2.current.configuration.dimensions.length).toBe(1800);
    });
  });
});
