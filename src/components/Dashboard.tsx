import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEnergyData } from '../hooks/useEnergyData';
import { useEnergyTrading } from '../hooks/useEnergyTrading';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Leaf,
  Battery,
  Sun,
  Wind,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { energyData, priceData, loading: energyLoading } = useEnergyData(user?.id || '');
  const { transactions, loading: tradingLoading } = useEnergyTrading();

  if (energyLoading || tradingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate statistics
  const currentEnergy = energyData[energyData.length - 1];
  const dailyProduction = energyData.slice(-24).reduce((sum, d) => sum + d.production, 0);
  const dailyConsumption = energyData.slice(-24).reduce((sum, d) => sum + d.consumption, 0);
  const dailySavings = priceData[priceData.length - 1]?.savings || 0;
  const monthlyTransactions = transactions.filter(t => 
    t.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const stats = [
    {
      name: 'Current Production',
      value: `${currentEnergy?.production.toFixed(1) || '0'} kWh`,
      icon: Sun,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Daily Consumption',
      value: `${dailyConsumption.toFixed(1)} kWh`,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '-3%',
      changeType: 'positive' as const,
    },
    {
      name: 'Monthly Savings',
      value: `${dailySavings.toFixed(1)}%`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Transactions',
      value: monthlyTransactions.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%',
      changeType: 'positive' as const,
    },
  ];

  // Prepare chart data
  const last24Hours = energyData.slice(-24).map(data => ({
    time: format(data.timestamp, 'HH:mm'),
    production: data.production,
    consumption: data.consumption,
    net: data.production - data.consumption,
  }));

  const priceComparisonData = priceData.slice(-7).map(data => ({
    date: format(data.timestamp, 'MMM dd'),
    p2p: data.p2pPrice,
    grid: data.gridPrice,
    savings: data.savings,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's your energy overview for today
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Battery className="w-4 h-4" />
            <span>Battery: {currentEnergy?.batteryLevel?.toFixed(0) || '0'}%</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'positive' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Flow Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 text-blue-500 mr-2" />
            Energy Flow (24h)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={last24Hours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Area
                type="monotone"
                dataKey="production"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Production"
              />
              <Area
                type="monotone"
                dataKey="consumption"
                stackId="2"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Consumption"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Price Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 text-green-500 mr-2" />
            Price Comparison (7d)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Line
                type="monotone"
                dataKey="p2p"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
                name="P2P Price"
              />
              <Line
                type="monotone"
                dataKey="grid"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
                name="Grid Price"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="p-6">
          {transactions.slice(0, 5).length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.status === 'confirmed' ? 'bg-green-100' :
                      transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {transaction.energySource === 'solar' ? (
                        <Sun className={`w-4 h-4 ${
                          transaction.status === 'confirmed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      ) : (
                        <Wind className={`w-4 h-4 ${
                          transaction.status === 'confirmed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.energyAmount} kWh from {transaction.sellerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(transaction.timestamp, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${transaction.totalAmount.toFixed(2)}</p>
                    <p className={`text-sm capitalize ${
                      transaction.status === 'confirmed' ? 'text-green-600' :
                      transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Start trading energy to see your activity here</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};