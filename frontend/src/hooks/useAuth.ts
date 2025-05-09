import { useState, useEffect } from 'react';

// Basic stub for useAuth hook
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<null | { id: string; username: string }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth status
    setTimeout(() => {
      // In a real app, check localStorage, make an API call, etc.
      // For this stub, we'll assume the user is not authenticated initially.
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }, 500);
  }, []);

  const login = async (/* credentials */) => {
    setLoading(true);
    // Simulate login API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsAuthenticated(true);
        setUser({ id: '1', username: 'testuser' });
        setLoading(false);
        resolve();
      }, 1000);
    });
  };

  const logout = async () => {
    setLoading(true);
    // Simulate logout API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        resolve();
      }, 500);
    });
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
}; 