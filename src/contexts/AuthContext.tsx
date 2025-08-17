import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('gridshare_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('gridshare_users') || '[]');
    const foundUser = users.find((u: User) => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('gridshare_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('gridshare_users') || '[]');
    
    // Check if user already exists
    if (users.find((u: User) => u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    users.push(newUser);
    localStorage.setItem('gridshare_users', JSON.stringify(users));
    
    setUser(newUser);
    localStorage.setItem('gridshare_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gridshare_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('gridshare_user', JSON.stringify(updatedUser));
      
      // Update in users list
      const users = JSON.parse(localStorage.getItem('gridshare_users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('gridshare_users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};