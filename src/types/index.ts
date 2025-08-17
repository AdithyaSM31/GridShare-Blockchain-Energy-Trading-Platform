export interface User {
  id: string;
  name: string;
  email: string;
  role: 'consumer' | 'prosumer' | 'both';
  walletAddress: string;
  energyPreferences: {
    maxPrice: number;
    preferRenewable: boolean;
    autoTrade: boolean;
  };
  location: {
    address: string;
    coordinates: [number, number];
  };
  createdAt: Date;
}

export interface EnergyListing {
  id: string;
  prosumerId: string;
  prosumerName: string;
  energyAmount: number; // kWh
  pricePerKwh: number; // USD
  availableFrom: Date;
  availableUntil: Date;
  energySource: 'solar' | 'wind' | 'hydro' | 'mixed';
  location: string;
  status: 'available' | 'sold' | 'expired';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  energyAmount: number;
  pricePerKwh: number;
  totalAmount: number;
  transactionHash: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  energySource: string;
}

export interface EnergyData {
  userId: string;
  timestamp: Date;
  production: number; // kWh
  consumption: number; // kWh
  gridImport: number; // kWh
  gridExport: number; // kWh
  batteryLevel?: number; // %
}

export interface PriceData {
  timestamp: Date;
  p2pPrice: number;
  gridPrice: number;
  savings: number;
}