import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginWithToken: (uid: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clave para guardar la sesión en el navegador
const SESSION_KEY = 'lavanderia_cobre_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1. Inicializamos el estado leyendo directamente del localStorage (Súper rápido)
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // Si ya leímos un usuario del storage, no estamos cargando
  const [loading, setLoading] = useState(!user);

  // Helper para guardar sesión localmente
  const saveUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  // Helper para borrar sesión
  const clearUserSession = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const fetchAndSetUser = async (uid: string, email: string, displayName: string) => {
    try {
      const userDocRef = doc(db, COLLECTIONS.users, uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData) {
        // Actualizamos el último acceso en segundo plano (sin bloquear)
        updateDoc(userDocRef, { ultimo_acceso: Timestamp.now() }).catch(console.error);

        const rol = userData.rol || userData.role || 'operario';
        let mappedRole: 'admin' | 'operario' = 'operario';
        if (rol === 'administrador' || rol === 'admin') mappedRole = 'admin';

        const newUser: User = {
          uid: uid,
          email: userData.correo || userData.email || email,
          displayName: userData.nombre || userData.displayName || displayName,
          role: mappedRole
        };

        // Guardamos en el estado Y en el almacenamiento local
        saveUserSession(newUser);
        return true;
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchAndSetUser(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || '');
      }
      // Nota: No borramos el usuario si firebaseUser es null, confiamos en nuestra sesión local 
      // (login por token) hasta que se llame explícitamente a signOut.
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithToken = async (uid: string): Promise<boolean> => {
    // Si ya estamos logueados con ese mismo ID, no hacemos nada (velocidad)
    if (user?.uid === uid) return true;

    setLoading(true);
    const success = await fetchAndSetUser(uid, 'usuario@intranet.cl', 'Usuario Vinculado');
    setLoading(false);
    return success;
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    clearUserSession(); // Borramos la sesión local al salir
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, loginWithToken }}>
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