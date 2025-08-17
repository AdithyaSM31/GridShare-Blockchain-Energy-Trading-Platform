import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEnergyData } from '../hooks/useEnergyData';
import { useEnergyTrading } from '../hooks/useEnergyTrading';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { motion } from 'framer-motion';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { energyData, priceData, loading } = useEnergyData(user?.id || '');
  const { transactions } = useEnergyTrading();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months'>('month');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter data based on time range
  const getFilteredData = (days: number) => {
    const cutoff = subDays(new Date(), days);
    return energyData.filter(data => data.timestamp >= cutoff);
  };

  const filteredEnergyData = getFilteredData(
    timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90
  );

  // Prepare chart data
  const dailyEnergyData = filteredEnergyData.reduce((acc: any[], curr) => {
    const date = format(curr.timestamp, 'yyyy-MM-dd');
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.production += curr.production;
      existing.consumption += curr.consumption;
    } else {
      acc.push({
        date,
        displayDate: format(curr.timestamp, 'MMM dd'),
        production: curr.production,
        consumption: curr.consumption,
        net: curr.production - curr.consumption,
      });
    }
    return acc;
  }, []).slice(-14); // Show last 14 days

  // Energy source distribution
  const sourceDistribution = transactions.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.energySource);
    if (existing) {
      existing.value += curr.energyAmount;
    } else {
      acc.push({
        name: curr.energySource,
        value: curr.energyAmount,
        color: curr.energySource === 'solar' ? '#f59e0b' :
               curr.energySource === 'wind' ? '#3b82f6' :
               curr.energySource === 'hydro' ? '#06b6d4' : '#8b5cf6'
      });
    }
    return acc;
  }, []);

  // Monthly spending/earnings
  const monthlyFinancials = transactions.reduce((acc: any[], curr) => {
    const month = format(curr.timestamp, 'yyyy-MM');
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      if (curr.buyerId === user?.id) {
        existing.spending += curr.totalAmount;
      } else {
        existing.earnings += curr.totalAmount;
      }
    } else {
      acc.push({
        month,
        displayMonth: format(curr.timestamp, 'MMM yyyy'),
        spending: curr.buyerId === user?.id ? curr.totalAmount : 0,
        earnings: curr.sellerId === user?.id ? curr.totalAmount : 0,
      });
    }
    return acc;
  }, []).slice(-6);

  // Key metrics
  const totalProduction = filteredEnergyData.reduce((sum, data) => sum + data.production, 0);
  const totalConsumption = filteredEnergyData.reduce((sum, data) => sum + data.consumption, 0);
  const totalSpending = transactions
    .filter(t => t.buyerId === user?.id)
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const totalEarnings = transactions
    .filter(t => t.sellerId === user?.id)
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const metrics = [
    {
      title: 'Energy Produced',
      value: `${totalProduction.toFixed(1)} kWh`,
      change: '+12%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Energy Consumed',
      value: `${totalConsumption.toFixed(1)} kWh`,
      change: '-3%',
      changeType: 'positive' as const,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      change: '+28%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Spending',
      value: `$${totalSpending.toFixed(2)}`,
      change: '-15%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Energy Analytics</h1>
          <p className="mt-2 text-gray-600">
            Detailed insights into your energy production and trading patterns
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | '3months')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
          </select>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Production vs Consumption */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Energy Flow
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyEnergyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="displayDate" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="production" fill="#10b981" name="Production" radius={[4, 4, 0, 0]} />
              <Bar dataKey="consumption" fill="#3b82f6" name="Consumption" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Financial Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyFinancials}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="displayMonth" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip formatter={(value) => [`$${value}`, '']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
                name="Earnings"
              />
              <Line
                type="monotone"
                dataKey="spending"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
                name="Spending"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Energy Source Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Energy Source Distribution
          </h3>
          {sourceDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No trading data available</p>
            </div>
          )}
        </motion.div>

        {/* Trading Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trading Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-green-700">{transactions.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Avg. Price</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${transactions.length > 0 
                      ? (transactions.reduce((sum, t) => sum + t.pricePerKwh, 0) / transactions.length).toFixed(3)
                      : '0.000'
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Energy Traded</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {transactions.reduce((sum, t) => sum + t.energyAmount, 0).toFixed(1)} kWh
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {transactions.length > 0 
                      ? Math.round((transactions.filter(t => t.status === 'confirmed').length / transactions.length) * 100)
                      : 0
                    }%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};