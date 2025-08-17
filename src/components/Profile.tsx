import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  MapPin, 
  Wallet, 
  Settings, 
  Bell, 
  Shield,
  Save,
  Edit2,
  DollarSign,
  Leaf,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.location?.address || '',
    maxPrice: user?.energyPreferences?.maxPrice || 0.20,
    preferRenewable: user?.energyPreferences?.preferRenewable || true,
    autoTrade: user?.energyPreferences?.autoTrade || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUser({
        ...user,
        name: formData.name,
        email: formData.email,
        location: {
          ...user.location,
          address: formData.address,
        },
        energyPreferences: {
          ...user.energyPreferences,
          maxPrice: formData.maxPrice,
          preferRenewable: formData.preferRenewable,
          autoTrade: formData.autoTrade,
        },
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account and energy preferences
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-500 capitalize">{user.role}</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.location.address}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600 mt-2">
                  <Wallet className="w-4 h-4 mr-1" />
                  {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Account Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member since</span>
                <span className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account type</span>
                <span className="text-sm font-medium capitalize bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max price/kWh</span>
                <span className="text-sm font-medium">
                  ${user.energyPreferences.maxPrice.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* Energy Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <Settings className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Energy Preferences</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Price per kWh ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="maxPrice"
                      step="0.001"
                      min="0"
                      max="1"
                      value={formData.maxPrice}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Leaf className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Prefer Renewable Energy</p>
                      <p className="text-sm text-gray-500">Prioritize solar, wind, and hydro sources</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, preferRenewable: !prev.preferRenewable }))}
                    disabled={!isEditing}
                    className={`flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  >
                    {formData.preferRenewable ? (
                      <ToggleRight className="w-8 h-8 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-300" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Automatic Trading</p>
                      <p className="text-sm text-gray-500">Enable automatic energy purchases within your preferences</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, autoTrade: !prev.autoTrade }))}
                    disabled={!isEditing}
                    className={`flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  >
                    {formData.autoTrade ? (
                      <ToggleRight className="w-8 h-8 text-blue-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <Shield className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Wallet Address</p>
                    <p className="text-sm text-gray-500 font-mono">
                      {user.walletAddress}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};