import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginWithToken: (uid: string) => Promise<boolean>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'lavanderia_cobre_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(!user);

  const saveUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  const clearUserSession = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      uid: 'guest-user',
      email: 'prueba@elcobre.cl',
      displayName: 'Usuario de Prueba',
      role: 'admin'
    };
    saveUserSession(guestUser);
    setLoading(false);
  };

  const fetchAndSetUser = async (uid: string, email?: string, displayName?: string) => {
    try {
      const userDocRef = doc(db, COLLECTIONS.users, uid);
      const userDoc = await getDoc(userDocRef);
      
      let role: 'admin' | 'operario' = 'operario';
      let name = displayName || 'Usuario Intranet';
      let userEmail = email || 'usuario@elcobre.cl';

      if (userDoc.exists()) {
        const data = userDoc.data();
        updateDoc(userDocRef, { ultimo_acceso: serverTimestamp() }).catch(console.error);
        
        name = data.nombre || data.displayName || name;
        userEmail = data.correo || data.email || userEmail;
        
        if (data.rol === 'administrador' || data.role === 'admin') {
          role = 'admin';
        }
      }

      const newUser: User = {
        uid,
        email: userEmail,
        displayName: name,
        role
      };

      saveUserSession(newUser);
      return true;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!user || user.uid !== firebaseUser.uid) {
            await fetchAndSetUser(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || '');
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithToken = async (uid: string): Promise<boolean> => {
    if (user?.uid === uid) return true;
    return await fetchAndSetUser(uid);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    clearUserSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, loginWithToken, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}