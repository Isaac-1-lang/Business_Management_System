
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

import { apiService } from './apiService';

class FixedAssetService {
  private static STORAGE_KEY = 'fixed_assets';
  private static DEPRECIATION_KEY = 'asset_depreciation';

  static async getAllAssets(): Promise<FixedAsset[]> {
    const res = await apiService.getAssets();
    if (res.success && res.data?.assets) return res.data.assets as FixedAsset[];
    return [];
  }

  static getDefaultAssets(): FixedAsset[] {
    // Return empty array when no data exists
    return [];
  }

  static saveAssets(_assets: FixedAsset[]): void {}

  static async addAsset(assetData: Omit<FixedAsset, 'id' | 'currentBookValue' | 'createdAt' | 'updatedAt'>): Promise<FixedAsset | null> {
    const res = await apiService.createAsset(assetData);
    if (res.success && res.data?.asset) return res.data.asset as FixedAsset;
    return null;
  }

  static async updateAsset(id: number, updates: Partial<FixedAsset>): Promise<boolean> {
    const res = await apiService.updateAsset(String(id), updates);
    return !!res.success;
  }

  static async deleteAsset(id: number): Promise<boolean> {
    const res = await apiService.deleteAsset(String(id));
    return !!res.success;
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

  static async updateAllDepreciation(): Promise<void> {
    const assets = await this.getAllAssets();
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

  static async getAssetSummary(): Promise<AssetSummary> {
    const assets = await this.getAllAssets();
    
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

  static async retireAsset(id: number, disposalDate: string, disposalAmount?: number): Promise<boolean> {
    const assets = await this.getAllAssets();
    const asset = assets.find(a => a.id === id);
    
    if (!asset) return false;

    const depreciation = this.calculateDepreciation(asset, new Date(disposalDate));
    
    // Calculate gain/loss on disposal if disposal amount provided
    let gainLoss = 0;
    if (disposalAmount !== undefined) {
      gainLoss = disposalAmount - depreciation.currentBookValue;
    }

    await this.updateAsset(id, {
      status: disposalAmount !== undefined ? 'disposed' : 'retired',
      currentBookValue: disposalAmount !== undefined ? disposalAmount : depreciation.currentBookValue
    });

    return true;
  }

  static async getAssetsByCategory(): Promise<{ [category: string]: FixedAsset[] }> {
    const assets = await this.getAllAssets();
    return assets.reduce((acc, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = [];
      }
      acc[asset.category].push(asset);
      return acc;
    }, {} as { [category: string]: FixedAsset[] });
  }

  static async exportToCSV(): Promise<string> {
    const assets = await this.getAllAssets();
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
