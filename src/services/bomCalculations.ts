// Bill of Materials calculations
export interface MaterialItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function calculateBOM(dimensions: any, weight: number): MaterialItem[] {
  const materials: MaterialItem[] = [];

  // Calculate plywood panels
  const panelArea = dimensions.length * dimensions.width;
  const panelCount = Math.ceil(panelArea / 32); // 4x8 sheet = 32 sq ft

  materials.push({
    name: 'Plywood Panel (4x8)',
    quantity: panelCount,
    unitPrice: 45.0,
    totalPrice: panelCount * 45.0,
  });

  // Calculate lumber for frame
  const perimeterLength = 2 * (dimensions.length + dimensions.width);
  const lumberCount = Math.ceil(perimeterLength / 8); // 8ft boards

  materials.push({
    name: '2x4 Lumber (8ft)',
    quantity: lumberCount,
    unitPrice: 8.5,
    totalPrice: lumberCount * 8.5,
  });

  // Hardware
  const screwBoxes = Math.ceil((panelCount + lumberCount) / 10);
  materials.push({
    name: 'Screws (box)',
    quantity: screwBoxes,
    unitPrice: 12.0,
    totalPrice: screwBoxes * 12.0,
  });

  return materials;
}

export function calculateTotalCost(materials: MaterialItem[]): number {
  return materials.reduce((total, item) => total + item.totalPrice, 0);
}
