
export interface FixedAsset {
  id: number;
  name: string;
  category: string;
  acquisitionDate: string;
  acquisitionCost: number;
  depreciationMethod: 'straight_line' | 'reducing_balance';
  usefulLifeYears: number;
  residualValue: number;
  currentBookValue: number;
  location: string;
  supplier?: string;
  status: 'active' | 'retired' | 'disposed';
  createdAt: string;
  updatedAt: string;
}

export interface AssetDepreciation {
  assetId: number;
  year: number;
  month: number;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  bookValue: number;
  createdAt: string;
}

export interface AssetSummary {
  totalAssets: number;
  totalOriginalCost: number;
  totalCurrentValue: number;
  totalDepreciation: number;
  activeAssets: number;
  retiredAssets: number;
}

class FixedAssetService {
  private static STORAGE_KEY = 'fixed_assets';
  private static DEPRECIATION_KEY = 'asset_depreciation';

  static getAllAssets(): FixedAsset[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : this.getDefaultAssets();
  }

  static getDefaultAssets(): FixedAsset[] {
    const defaultAssets: FixedAsset[] = [
      {
        id: 1,
        name: "Dell Laptop - IT001",
        category: "Computer Equipment",
        acquisitionDate: "2023-05-15",
        acquisitionCost: 850000,
        depreciationMethod: 'straight_line',
        usefulLifeYears: 4,
        residualValue: 0,
        currentBookValue: 637500,
        location: "IT Department",
        supplier: "Dell Rwanda",
        status: "active",
        createdAt: "2023-05-15T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Toyota Hiace - Vehicle001",
        category: "Vehicle",
        acquisitionDate: "2022-08-20",
        acquisitionCost: 15000000,
        depreciationMethod: 'straight_line',
        usefulLifeYears: 5,
        residualValue: 3000000,
        currentBookValue: 9600000,
        location: "Main Office",
        supplier: "Toyota Rwanda",
        status: "active",
        createdAt: "2022-08-20T00:00:00Z",
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: "Office Furniture Set",
        category: "Furniture",
        acquisitionDate: "2024-01-10",
        acquisitionCost: 1200000,
        depreciationMethod: 'straight_line',
        usefulLifeYears: 10,
        residualValue: 0,
        currentBookValue: 1080000,
        location: "Administration",
        supplier: "Furniture Plus",
        status: "active",
        createdAt: "2024-01-10T00:00:00Z",
        updatedAt: new Date().toISOString()
      }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultAssets));
    return defaultAssets;
  }

  static saveAssets(assets: FixedAsset[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assets));
  }

  static addAsset(assetData: Omit<FixedAsset, 'id' | 'currentBookValue' | 'createdAt' | 'updatedAt'>): FixedAsset {
    const assets = this.getAllAssets();
    const newAsset: FixedAsset = {
      ...assetData,
      id: Math.max(0, ...assets.map(a => a.id)) + 1,
      currentBookValue: assetData.acquisitionCost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    assets.push(newAsset);
    this.saveAssets(assets);
    return newAsset;
  }

  static updateAsset(id: number, updates: Partial<FixedAsset>): boolean {
    const assets = this.getAllAssets();
    const index = assets.findIndex(a => a.id === id);
    
    if (index === -1) return false;

    assets[index] = {
      ...assets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveAssets(assets);
    return true;
  }

  static deleteAsset(id: number): boolean {
    const assets = this.getAllAssets();
    const filteredAssets = assets.filter(a => a.id !== id);
    
    if (filteredAssets.length === assets.length) return false;

    this.saveAssets(filteredAssets);
    return true;
  }

  static calculateDepreciation(asset: FixedAsset, asOfDate: Date = new Date()): {
    annualDepreciation: number;
    monthsUsed: number;
    accumulatedDepreciation: number;
    currentBookValue: number;
  } {
    const acquisitionDate = new Date(asset.acquisitionDate);
    const monthsUsed = this.getMonthsDifference(acquisitionDate, asOfDate);
    const totalUsefulMonths = asset.usefulLifeYears * 12;
    
    if (asset.depreciationMethod === 'straight_line') {
      const annualDepreciation = (asset.acquisitionCost - asset.residualValue) / asset.usefulLifeYears;
      const monthlyDepreciation = annualDepreciation / 12;
      const accumulatedDepreciation = Math.min(
        monthlyDepreciation * monthsUsed,
        asset.acquisitionCost - asset.residualValue
      );
      const currentBookValue = Math.max(
        asset.acquisitionCost - accumulatedDepreciation,
        asset.residualValue
      );

      return {
        annualDepreciation,
        monthsUsed,
        accumulatedDepreciation,
        currentBookValue
      };
    }

    // For now, only implement straight line
    return {
      annualDepreciation: 0,
      monthsUsed,
      accumulatedDepreciation: 0,
      currentBookValue: asset.acquisitionCost
    };
  }

  static updateAllDepreciation(): void {
    const assets = this.getAllAssets();
    const updatedAssets = assets.map(asset => {
      if (asset.status === 'active') {
        const depreciation = this.calculateDepreciation(asset);
        return {
          ...asset,
          currentBookValue: depreciation.currentBookValue,
          updatedAt: new Date().toISOString()
        };
      }
      return asset;
    });

    this.saveAssets(updatedAssets);
  }

  static getAssetSummary(): AssetSummary {
    const assets = this.getAllAssets();
    
    return {
      totalAssets: assets.length,
      totalOriginalCost: assets.reduce((sum, asset) => sum + asset.acquisitionCost, 0),
      totalCurrentValue: assets.reduce((sum, asset) => sum + asset.currentBookValue, 0),
      totalDepreciation: assets.reduce((sum, asset) => {
        const depreciation = this.calculateDepreciation(asset);
        return sum + depreciation.accumulatedDepreciation;
      }, 0),
      activeAssets: assets.filter(a => a.status === 'active').length,
      retiredAssets: assets.filter(a => a.status !== 'active').length
    };
  }

  static retireAsset(id: number, disposalDate: string, disposalAmount?: number): boolean {
    const assets = this.getAllAssets();
    const asset = assets.find(a => a.id === id);
    
    if (!asset) return false;

    const depreciation = this.calculateDepreciation(asset, new Date(disposalDate));
    
    // Calculate gain/loss on disposal if disposal amount provided
    let gainLoss = 0;
    if (disposalAmount !== undefined) {
      gainLoss = disposalAmount - depreciation.currentBookValue;
    }

    this.updateAsset(id, {
      status: disposalAmount !== undefined ? 'disposed' : 'retired',
      currentBookValue: disposalAmount !== undefined ? disposalAmount : depreciation.currentBookValue
    });

    return true;
  }

  static getAssetsByCategory(): { [category: string]: FixedAsset[] } {
    const assets = this.getAllAssets();
    return assets.reduce((acc, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = [];
      }
      acc[asset.category].push(asset);
      return acc;
    }, {} as { [category: string]: FixedAsset[] });
  }

  static exportToCSV(): string {
    const assets = this.getAllAssets();
    const headers = [
      'Asset Name',
      'Category',
      'Acquisition Date',
      'Original Cost (RWF)',
      'Current Value (RWF)',
      'Depreciation Method',
      'Useful Life (Years)',
      'Location',
      'Status'
    ];

    const csvData = [
      headers.join(','),
      ...assets.map(asset => [
        asset.name,
        asset.category,
        asset.acquisitionDate,
        asset.acquisitionCost,
        asset.currentBookValue,
        asset.depreciationMethod,
        asset.usefulLifeYears,
        asset.location,
        asset.status
      ].join(','))
    ].join('\n');

    return csvData;
  }

  static getDepreciationSchedule(assetId: number): Array<{
    year: number;
    openingValue: number;
    depreciation: number;
    closingValue: number;
  }> {
    const asset = this.getAllAssets().find(a => a.id === assetId);
    if (!asset) return [];

    const schedule = [];
    const annualDepreciation = (asset.acquisitionCost - asset.residualValue) / asset.usefulLifeYears;
    let currentValue = asset.acquisitionCost;

    for (let year = 1; year <= asset.usefulLifeYears; year++) {
      const openingValue = currentValue;
      const depreciation = Math.min(annualDepreciation, currentValue - asset.residualValue);
      currentValue = Math.max(currentValue - depreciation, asset.residualValue);

      schedule.push({
        year,
        openingValue,
        depreciation,
        closingValue: currentValue
      });

      if (currentValue <= asset.residualValue) break;
    }

    return schedule;
  }

  private static getMonthsDifference(date1: Date, date2: Date): number {
    const months = (date2.getFullYear() - date1.getFullYear()) * 12;
    return months - date1.getMonth() + date2.getMonth();
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

export default FixedAssetService;
