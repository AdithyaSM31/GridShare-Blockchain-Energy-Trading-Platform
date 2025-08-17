import { useState, useEffect } from 'react';
import { EnergyData, PriceData } from '../types';
import { addHours, subDays, format } from 'date-fns';

export const useEnergyData = (userId: string) => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate mock energy data
    const generateEnergyData = (): EnergyData[] => {
      const data: EnergyData[] = [];
      const now = new Date();
      
      for (let i = 0; i < 24 * 7; i++) { // 7 days of hourly data
        const timestamp = subDays(addHours(now, -i), 0);
        const hour = timestamp.getHours();
        
        // Solar production pattern (peak at noon)
        const solarMultiplier = Math.max(0, Math.sin((hour - 6) * Math.PI / 12));
        const production = solarMultiplier * (8 + Math.random() * 4); // 0-12 kWh
        
        // Consumption pattern (higher in morning and evening)
        const baseConsumption = 2 + Math.sin((hour - 8) * Math.PI / 8) * 3;
        const consumption = Math.max(1, baseConsumption + Math.random() * 2);
        
        const gridImport = Math.max(0, consumption - production);
        const gridExport = Math.max(0, production - consumption);
        
        data.push({
          userId,
          timestamp,
          production: Math.round(production * 100) / 100,
          consumption: Math.round(consumption * 100) / 100,
          gridImport: Math.round(gridImport * 100) / 100,
          gridExport: Math.round(gridExport * 100) / 100,
          batteryLevel: 50 + Math.random() * 40,
        });
      }
      
      return data.reverse();
    };

    // Generate mock price data
    const generatePriceData = (): PriceData[] => {
      const data: PriceData[] = [];
      const now = new Date();
      
      for (let i = 0; i < 30; i++) { // 30 days of daily data
        const timestamp = subDays(now, i);
        const p2pPrice = 0.12 + Math.random() * 0.08; // $0.12-0.20 per kWh
        const gridPrice = 0.18 + Math.random() * 0.06; // $0.18-0.24 per kWh
        const savings = ((gridPrice - p2pPrice) / gridPrice) * 100;
        
        data.push({
          timestamp,
          p2pPrice: Math.round(p2pPrice * 1000) / 1000,
          gridPrice: Math.round(gridPrice * 1000) / 1000,
          savings: Math.round(savings * 10) / 10,
        });
      }
      
      return data.reverse();
    };

    setTimeout(() => {
      setEnergyData(generateEnergyData());
      setPriceData(generatePriceData());
      setLoading(false);
    }, 500);
  }, [userId]);

  return { energyData, priceData, loading };
};