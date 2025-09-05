import { renderHook, act } from '@testing-library/react';
import { useCrateStore } from '@/store/crate-store';

describe('CrateStore', () => {
  describe('initial state', () => {
    it('should have default configuration', () => {
      const { result } = renderHook(() => useCrateStore());

      expect(result.current.configuration.dimensions.length).toBe(48);
      expect(result.current.configuration.dimensions.width).toBe(40);
      expect(result.current.configuration.dimensions.height).toBe(40);
    });

    it('should have default weight configuration', () => {
      const { result } = renderHook(() => useCrateStore());

      expect(result.current.configuration.weight.product).toBe(500);
      expect(result.current.configuration.weight.maxGross).toBe(1000);
    });

    it('should have default base configuration', () => {
      const { result } = renderHook(() => useCrateStore());
      const base = result.current.configuration.base;

      expect(base.type).toBe('standard');
      expect(base.floorboardThickness).toBe(0.75);
      expect(base.material).toBe('pine');
    });
  });

  describe('updateDimensions', () => {
    it('should update dimensions', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateDimensions({
          length: 60,
          width: 50,
        });
      });

      expect(result.current.configuration.dimensions.length).toBe(60);
      expect(result.current.configuration.dimensions.width).toBe(50);
      expect(result.current.configuration.dimensions.height).toBe(40); // unchanged
    });
  });

  describe('updateWeight', () => {
    it('should update weight configuration', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateWeight({ product: 750, maxGross: 2000 });
      });

      expect(result.current.configuration.weight.product).toBe(750);
      expect(result.current.configuration.weight.maxGross).toBe(2000);
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

    it('should update base material', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateBase({ material: 'oak' });
      });

      expect(result.current.configuration.base.material).toBe('oak');
    });
  });

  describe('updatePanel', () => {
    it('should update panel thickness', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updatePanel('topPanel', { thickness: 0.75 });
      });

      expect(result.current.configuration.cap.topPanel.thickness).toBe(0.75);
    });

    it('should update panel material', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updatePanel('frontPanel', { material: 'osb' });
      });

      expect(result.current.configuration.cap.frontPanel.material).toBe('osb');
    });

    it('should toggle panel enabled state', () => {
      const { result } = renderHook(() => useCrateStore());
      const initialState = result.current.configuration.cap.topPanel.enabled;

      act(() => {
        result.current.updatePanel('topPanel', { enabled: !initialState });
      });

      expect(result.current.configuration.cap.topPanel.enabled).toBe(!initialState);
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
  });

  describe('updateVinyl', () => {
    it('should toggle vinyl enabled', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateVinyl({ enabled: true });
      });

      expect(result.current.configuration.vinyl.enabled).toBe(true);
    });

    it('should update vinyl type', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateVinyl({ type: 'waterproof' });
      });

      expect(result.current.configuration.vinyl.type).toBe('waterproof');
    });
  });

  describe('resetConfiguration', () => {
    it('should reset to default configuration', () => {
      const { result } = renderHook(() => useCrateStore());

      // Make some changes
      act(() => {
        result.current.updateDimensions({ length: 100 });
        result.current.updateWeight({ product: 2000 });
        result.current.updateBase({ type: 'heavy-duty' });
      });

      // Reset
      act(() => {
        result.current.resetConfiguration();
      });

      // Check defaults restored
      expect(result.current.configuration.dimensions.length).toBe(48);
      expect(result.current.configuration.weight.product).toBe(500);
      expect(result.current.configuration.base.type).toBe('standard');
    });
  });
});
