import { useEffect, useMemo, useState } from 'react';
import { EnergyListing, Transaction, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { addHours, subDays } from 'date-fns';

// Storage keys
const LS_LISTINGS = 'gridshare_listings';
const LS_TRANSACTIONS = 'gridshare_transactions';

// Helpers to (de)serialize Dates stored in localStorage
const reviveListing = (raw: any): EnergyListing => ({
  ...raw,
  createdAt: new Date(raw.createdAt),
  availableFrom: new Date(raw.availableFrom),
  availableUntil: new Date(raw.availableUntil),
});

const reviveTransaction = (raw: any): Transaction => ({
  ...raw,
  timestamp: new Date(raw.timestamp),
});

const loadFromStorage = <T,>(key: string, reviver?: (r: any) => T): T[] => {
  try {
    const json = localStorage.getItem(key);
    if (!json) return [];
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return [];
    return reviver ? arr.map(reviver) : arr;
  } catch {
    return [];
  }
};

const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

// Generate some pleasant mock data for first run
const seedMockData = (currentUser: User | null) => {
  const now = new Date();
  const sources: EnergyListing['energySource'][] = ['solar', 'wind', 'hydro', 'mixed'];
  const names = ['Sunny Solar Co.', 'Windy Works', 'Hydro Hub', 'Green Mix'];

  // Listings
  const listings: EnergyListing[] = Array.from({ length: 8 }).map((_, i) => {
    const source = sources[i % sources.length];
    const amount = 5 + Math.round(Math.random() * 45); // 5-50 kWh
    const price = 0.10 + Math.random() * 0.12; // $0.10-$0.22
    const createdAt = subDays(now, Math.floor(Math.random() * 5));
    return {
      id: `listing_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      prosumerId: `prosumer_${i}`,
      prosumerName: names[i % names.length],
      energyAmount: amount,
      pricePerKwh: Math.round(price * 1000) / 1000,
      availableFrom: createdAt,
      availableUntil: addHours(createdAt, 48 + Math.floor(Math.random() * 48)),
      energySource: source,
      location: ['Brooklyn, NY', 'Austin, TX', 'Portland, OR', 'Boulder, CO'][i % 4],
      status: 'available',
      createdAt,
    };
  });

  // Transactions (some historical)
  const transactions: Transaction[] = Array.from({ length: 10 }).map((_, i) => {
    const energyAmount = 1 + Math.round(Math.random() * 9);
    const pricePerKwh = 0.12 + Math.random() * 0.1;
    const status: Transaction['status'] = Math.random() < 0.85 ? 'confirmed' : Math.random() < 0.5 ? 'pending' : 'failed';
    const timestamp = subDays(now, Math.floor(Math.random() * 20));
    const energySource = sources[i % sources.length];
    return {
      id: `tx_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      buyerId: currentUser?.id || `buyer_${i}`,
      sellerId: `seller_${i}`,
      buyerName: currentUser?.name || 'You',
      sellerName: names[i % names.length],
      energyAmount,
      pricePerKwh: Math.round(pricePerKwh * 1000) / 1000,
      totalAmount: Math.round(pricePerKwh * energyAmount * 100) / 100,
      transactionHash: Math.random().toString(16).slice(2),
      blockNumber: 1000 + i,
      status,
      timestamp,
      energySource,
    };
  });

  saveToStorage(LS_LISTINGS, listings);
  saveToStorage(LS_TRANSACTIONS, transactions);
  return { listings, transactions };
};

export const useEnergyTrading = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage or seed
  useEffect(() => {
    const storedListings = loadFromStorage<EnergyListing>(LS_LISTINGS, reviveListing);
    const storedTransactions = loadFromStorage<Transaction>(LS_TRANSACTIONS, reviveTransaction);

    if (storedListings.length === 0 && storedTransactions.length === 0) {
      const seeded = seedMockData(user || null);
      setListings(seeded.listings);
      setTransactions(seeded.transactions);
    } else {
      setListings(storedListings);
      setTransactions(storedTransactions);
    }
    setLoading(false);
  }, [user?.id]);

  const persist = (nextListings: EnergyListing[], nextTransactions: Transaction[]) => {
    setListings(nextListings);
    setTransactions(nextTransactions);
    saveToStorage(LS_LISTINGS, nextListings);
    saveToStorage(LS_TRANSACTIONS, nextTransactions);
  };

  // Create a new listing for the current user
  const createListing = (data: {
    energyAmount: number;
    pricePerKwh: number;
    energySource: EnergyListing['energySource'];
    availableFrom?: Date;
    availableUntil: Date;
    location: string;
  }): EnergyListing => {
    if (!user) {
      throw new Error('You must be logged in to create a listing.');
    }
    const createdAt = new Date();
    const listing: EnergyListing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      prosumerId: user.id,
      prosumerName: user.name,
      energyAmount: data.energyAmount,
      pricePerKwh: Math.round(data.pricePerKwh * 1000) / 1000,
      availableFrom: data.availableFrom || createdAt,
      availableUntil: data.availableUntil,
      energySource: data.energySource,
      location: data.location,
      status: 'available',
      createdAt,
    };
    const nextListings = [listing, ...listings];
    persist(nextListings, transactions);
    return listing;
  };

  // Purchase energy from a listing; reduces available amount and records a transaction
  const purchaseEnergy = (listingId: string, amount: number) => {
    if (!user) {
      throw new Error('You must be logged in to purchase energy.');
    }
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0.');
    }
    const listingIndex = listings.findIndex((l) => l.id === listingId);
    if (listingIndex === -1) throw new Error('Listing not found.');
    const listing = listings[listingIndex];
    if (listing.status !== 'available') throw new Error('Listing is not available.');
    if (amount > listing.energyAmount) throw new Error('Requested amount exceeds available energy.');

    const pricePerKwh = listing.pricePerKwh;
    const totalAmount = Math.round(pricePerKwh * amount * 100) / 100;
    const tx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      buyerId: user.id,
      sellerId: listing.prosumerId,
      buyerName: user.name,
      sellerName: listing.prosumerName,
      energyAmount: amount,
      pricePerKwh,
      totalAmount,
      transactionHash: Math.random().toString(16).slice(2),
      blockNumber: 1000 + Math.floor(Math.random() * 10000),
      status: 'confirmed',
      timestamp: new Date(),
      energySource: listing.energySource,
    };

    // Update listing inventory
    const remaining = Math.round((listing.energyAmount - amount) * 1000) / 1000;
    const updatedListing: EnergyListing = {
      ...listing,
      energyAmount: remaining,
      status: remaining <= 0 ? 'sold' : listing.status,
    };
    const nextListings = [...listings];
    nextListings[listingIndex] = updatedListing;
    const nextTransactions = [tx, ...transactions];
    persist(nextListings, nextTransactions);
  };

  // Expose a stable API shape used by consumers
  return useMemo(
    () => ({
      listings,
      transactions,
      loading,
      createListing,
      purchaseEnergy,
    }),
    [listings, transactions, loading]
  );
};

export type UseEnergyTrading = ReturnType<typeof useEnergyTrading>;
