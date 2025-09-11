'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Package, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Star,
  Leaf,
  ArrowUpDown,
  Building,
  ChevronDown
} from 'lucide-react';
import { materialLibrary, MaterialSpec, MaterialFilter, MaterialComparison } from '@/services/materialLibrary';

export default function MaterialLibraryBrowser() {
  const [materials, setMaterials] = useState<MaterialSpec[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const [comparison, setComparison] = useState<MaterialComparison | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'sustainability'>('name');
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  useEffect(() => {
    loadMaterials();
  }, [selectedCategory, priceRange, showInStockOnly, searchQuery]);

  useEffect(() => {
    if (selectedMaterials.size >= 2) {
      const materialIds = Array.from(selectedMaterials);
      const comparisonResult = materialLibrary.compareMaterials(materialIds);
      setComparison(comparisonResult);
    } else {
      setComparison(null);
    }
  }, [selectedMaterials]);

  const loadMaterials = () => {
    const filter: MaterialFilter = {
      category: selectedCategory === 'all' ? undefined : [selectedCategory],
      priceRange,
      availability: showInStockOnly ? 'in-stock' : 'all'
    };
    
    let results = materialLibrary.searchMaterials(filter);
    
    // Apply text search
    if (searchQuery) {
      results = results.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.applications.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = Math.min(...a.vendors.flatMap(v => v.pricing.map(p => p.unitPrice)));
          const priceB = Math.min(...b.vendors.flatMap(v => v.pricing.map(p => p.unitPrice)));
          return priceA - priceB;
        case 'sustainability':
          return a.environmentalImpact.sustainabilityRating.localeCompare(b.environmentalImpact.sustainabilityRating);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    setMaterials(results);
  };

  const toggleMaterialSelection = (id: string) => {
    const newSelection = new Set(selectedMaterials);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      if (newSelection.size >= 4) {
        // Limit to 4 materials for comparison
        const firstItem = newSelection.values().next().value;
        newSelection.delete(firstItem);
      }
      newSelection.add(id);
    }
    setSelectedMaterials(newSelection);
  };

  const getBestPrice = (material: MaterialSpec): number => {
    return Math.min(...material.vendors.flatMap(v => v.pricing.map(p => p.unitPrice)));
  };

  const getBestLeadTime = (material: MaterialSpec): number => {
    return Math.min(...material.vendors.map(v => v.availability.leadTimeDays));
  };

  const getSustainabilityColor = (rating: string) => {
    switch (rating) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-lime-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'E': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Material Library</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInStockOnly(!showInStockOnly)}
            className={`border-white/20 ${showInStockOnly ? 'bg-white/10' : ''}`}
          >
            <Package className="w-4 h-4 mr-2" />
            {showInStockOnly ? 'In Stock Only' : 'All Materials'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setSortBy(sortBy === 'price' ? 'name' : sortBy === 'name' ? 'sustainability' : 'price')}
            className="border-white/20"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass-morphism p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials, applications..."
                className="pl-10 bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
          >
            <option value="all">All Categories</option>
            <option value="lumber">Lumber</option>
            <option value="plywood">Plywood</option>
            <option value="fasteners">Fasteners</option>
            <option value="hardware">Hardware</option>
            <option value="protection">Protection</option>
            <option value="packaging">Packaging</option>
          </select>
          <div className="flex gap-2">
            <Input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
              placeholder="Min $"
              className="bg-white/10 border-white/20 text-white"
            />
            <Input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              placeholder="Max $"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>
      </Card>

      {/* Material Comparison */}
      {comparison && (
        <Card className="glass-morphism p-6">
          <h3 className="text-xl font-bold text-white mb-4">Material Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2 text-white/60">Metric</th>
                  {comparison.materials.map(m => (
                    <th key={m.id} className="text-center py-2 text-white">
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.comparisonMetrics.map((metric, idx) => (
                  <tr key={idx} className="border-b border-white/10">
                    <td className="py-2 text-white/80">{metric.metric}</td>
                    {metric.values.map((value, i) => (
                      <td 
                        key={i} 
                        className={`text-center py-2 ${
                          i === metric.bestIndex ? 'text-green-400 font-bold' : 'text-white/60'
                        }`}
                      >
                        {typeof value === 'number' ? value.toFixed(2) : value} {metric.unit}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/60">Best Overall</p>
              <p className="font-semibold text-white">
                {comparison.materials.find(m => m.id === comparison.recommendation.bestOverall)?.name}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/60">Best Value</p>
              <p className="font-semibold text-white">
                {comparison.materials.find(m => m.id === comparison.recommendation.bestValue)?.name}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/60">Most Sustainable</p>
              <p className="font-semibold text-white">
                {comparison.materials.find(m => m.id === comparison.recommendation.mostSustainable)?.name}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/60">Fastest Available</p>
              <p className="font-semibold text-white">
                {comparison.materials.find(m => m.id === comparison.recommendation.fastestAvailable)?.name}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Material Grid */}
      <div className="grid grid-cols-2 gap-4">
        {materials.map(material => (
          <Card
            key={material.id}
            className={`glass-morphism p-4 transition-all cursor-pointer ${
              selectedMaterials.has(material.id) ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => toggleMaterialSelection(material.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-white text-lg">{material.name}</h4>
                <p className="text-sm text-white/60">{material.type} • {material.category}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={`${getSustainabilityColor(material.environmentalImpact.sustainabilityRating)}`}>
                  <Leaf className="w-3 h-3 mr-1" />
                  {material.environmentalImpact.sustainabilityRating}
                </Badge>
                {material.properties.ispm15Compliant && (
                  <Badge className="bg-green-500/20 text-green-400">
                    ISPM-15
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-1 text-white/60 mb-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-xs">Best Price</span>
                </div>
                <p className="font-bold text-white">
                  ${getBestPrice(material).toFixed(2)}
                  <span className="text-xs text-white/60 ml-1">/{material.unit}</span>
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-1 text-white/60 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">Lead Time</span>
                </div>
                <p className="font-bold text-white">
                  {getBestLeadTime(material)} days
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-1 text-white/60 mb-1">
                  <Building className="w-3 h-3" />
                  <span className="text-xs">Vendors</span>
                </div>
                <p className="font-bold text-white">
                  {material.vendors.length}
                </p>
              </div>
            </div>

            {material.dimensions && (
              <div className="mb-3">
                <p className="text-xs text-white/60 mb-1">Dimensions</p>
                <p className="text-sm text-white font-mono">
                  {material.dimensions.thickness && `${material.dimensions.thickness}" thick`}
                  {material.dimensions.width && ` × ${material.dimensions.width}" wide`}
                  {material.dimensions.length && ` × ${material.dimensions.length}" long`}
                </p>
              </div>
            )}

            <div className="mb-3">
              <p className="text-xs text-white/60 mb-1">Applications</p>
              <div className="flex flex-wrap gap-1">
                {material.applications.slice(0, 3).map((app, idx) => (
                  <Badge key={idx} className="bg-white/10 text-white/80 text-xs">
                    {app}
                  </Badge>
                ))}
                {material.applications.length > 3 && (
                  <Badge className="bg-white/10 text-white/60 text-xs">
                    +{material.applications.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedMaterial(expandedMaterial === material.id ? null : material.id);
              }}
              className="w-full text-white/60 hover:text-white"
            >
              <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${
                expandedMaterial === material.id ? 'rotate-180' : ''
              }`} />
              {expandedMaterial === material.id ? 'Hide' : 'Show'} Vendors
            </Button>

            {expandedMaterial === material.id && (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                {material.vendors.map(vendor => (
                  <div key={vendor.vendorId} className="bg-white/5 rounded-lg p-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white">{vendor.vendorName}</p>
                        <p className="text-xs text-white/60">SKU: {vendor.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">
                          ${vendor.pricing[0].unitPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-white/60">
                          {vendor.availability.inStock ? 
                            `${vendor.availability.quantity} in stock` : 
                            'Out of stock'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-white/10 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {vendor.availability.leadTimeDays} days
                      </Badge>
                      <Badge className="bg-white/10 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {vendor.reliability}% reliable
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {materials.length === 0 && (
        <Card className="glass-morphism p-8">
          <div className="text-center text-white/40">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No materials found matching your criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
}