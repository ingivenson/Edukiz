 import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Create UserContext
export const UserContext = createContext();

// UserProvider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    console.log('🔄 UserContext: Kap koute chanjman authentication...');
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('👤 UserContext: Authentication state changed:', !!currentUser);
      if (currentUser) {
        console.log('✅ User konekte:', currentUser.email || currentUser.uid);
      } else {
        console.log('❌ User pa konekte');
      }
      
      setUser(currentUser);
      setCheckingAuth(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 UserContext: Cleanup authentication listener');
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    checkingAuth,
    setUser // Pou manual updates si bezwen
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// IJAN: Custom hook pou itilize UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};

// Export default pou backward compatibility
export default UserContext;