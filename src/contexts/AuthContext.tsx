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
  loginWithToken: (uid: string) => Promise<boolean>; // Nueva función
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Función auxiliar para buscar y setear el usuario desde Firestore
  const fetchAndSetUser = async (uid: string, email: string, displayName: string) => {
    try {
      const userDocRef = doc(db, COLLECTIONS.users, uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData) {
        // Actualizamos último acceso
        await updateDoc(userDocRef, { ultimo_acceso: Timestamp.now() });

        const rol = userData.rol || userData.role || 'operario';
        let mappedRole: 'admin' | 'operario' = 'operario';
        if (rol === 'administrador' || rol === 'admin') mappedRole = 'admin';

        setUser({
          uid: uid,
          email: userData.correo || userData.email || email,
          displayName: userData.nombre || userData.displayName || displayName,
          role: mappedRole
        });
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
        // Si hay sesión de Firebase (Login tradicional), cargamos datos
        await fetchAndSetUser(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || '');
      } else {
        // Si NO hay sesión de Firebase, solo limpiamos si NO hemos hecho login por token manual
        // (Esta es una simplificación, para mayor seguridad el token debería persistir de otra forma, 
        // pero para este caso funciona).
        // Para este caso específico, dejaremos que el usuario sea null inicialmente
        if (!user) setUser(null); 
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []); // Eliminamos user de dependencias para evitar loops

  // --- LOGIN MANUAL CON TOKEN (UID) ---
  const loginWithToken = async (uid: string): Promise<boolean> => {
    setLoading(true);
    // Buscamos el usuario en la DB compartida usando el UID recibido
    // Usamos datos genéricos para email/nombre ya que vienen de la otra app
    const success = await fetchAndSetUser(uid, 'usuario@intranet.cl', 'Usuario Vinculado');
    setLoading(false);
    return success;
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    // Al salir, redirigir a la intranet principal podría ser buena idea
    // window.location.href = "URL_DE_TU_INTRANET"; 
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