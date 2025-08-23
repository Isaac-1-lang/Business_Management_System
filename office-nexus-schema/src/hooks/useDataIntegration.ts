
import { useEffect, useState } from 'react';
import DataIntegrationService from '@/services/dataIntegrationService';

export function useDataIntegration(module?: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get integrated data
    const integratedData = DataIntegrationService.getIntegratedData();
    setData(integratedData);
    setIsLoading(false);

    // Subscribe to updates if module specified
    if (module) {
      DataIntegrationService.subscribe(module, (updatedData: any) => {
        setData((prev: any) => ({ ...prev, [module]: updatedData }));
      });
    }

    // Perform initial sync
    DataIntegrationService.syncAllData();
  }, [module]);

  const updateData = (module: string, newData: any) => {
    DataIntegrationService.notify(module, newData);
  };

  return {
    data,
    isLoading,
    updateData,
    syncData: () => DataIntegrationService.syncAllData()
  };
}

export function useDirectorsIntegration() {
  const [directors, setDirectors] = useState([]);

  useEffect(() => {
    const loadDirectors = () => {
      const data = DataIntegrationService.getDirectorsData();
      setDirectors(data);
    };

    loadDirectors();
    DataIntegrationService.subscribe('directors', setDirectors);
  }, []);

  const updateDirector = (director: any) => {
    DataIntegrationService.updateDirectorData(director);
  };

  return { directors, updateDirector };
}

export function useFinancialIntegration() {
  const [financialData, setFinancialData] = useState<any>(null);

  useEffect(() => {
    const loadFinancialData = () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      const endDate = new Date();
      
      const report = DataIntegrationService.generateFinancialReport(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      setFinancialData(report);
    };

    loadFinancialData();
    
    // Subscribe to financial updates
    DataIntegrationService.subscribe('transactions', loadFinancialData);
    DataIntegrationService.subscribe('tax', loadFinancialData);
  }, []);

  return financialData;
}
