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

// Clave para persistencia local
const SESSION_KEY = 'lavanderia_cobre_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Inicializar leyendo del localStorage para carga instantánea
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

  // Buscar usuario en Firestore y mapear roles
  const fetchAndSetUser = async (uid: string, email: string, displayName: string) => {
    try {
      const userDocRef = doc(db, COLLECTIONS.users, uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData) {
        // Actualizar último acceso en segundo plano
        updateDoc(userDocRef, { ultimo_acceso: Timestamp.now() }).catch(console.error);

        const rol = userData.rol || userData.role || 'operario';
        
        let mappedRole: 'admin' | 'operario' = 'operario';

        // --- CAMBIO AQUÍ: Ahora 'recepcionista' también es 'admin' en este proyecto ---
        if (rol === 'administrador' || rol === 'admin' || rol === 'recepcionista') {
          mappedRole = 'admin';
        }

        const newUser: User = {
          uid: uid,
          email: userData.correo || userData.email || email,
          displayName: userData.nombre || userData.displayName || displayName,
          role: mappedRole // Se asigna el rol con permisos elevados
        };

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
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login mediante token en URL (UID)
  const loginWithToken = async (uid: string): Promise<boolean> => {
    if (user?.uid === uid) return true;

    setLoading(true);
    // Usamos datos genéricos ya que vienen de la intranet principal
    const success = await fetchAndSetUser(uid, 'usuario@intranet.cl', 'Usuario Vinculado');
    setLoading(false);
    return success;
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    clearUserSession();
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