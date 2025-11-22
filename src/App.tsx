import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Layout/Sidebar';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
// IMPORTANTE: Eliminamos la importación de Login porque ya no existirá
// import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import ProductRegister from './pages/Products/ProductRegister';
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierForm from './pages/Suppliers/SupplierForm';
import History from './pages/History';

// URL A LA QUE SE REDIRIGE SI NO HAY PERMISO (Tu Intranet Principal)
const MAIN_INTRANET_URL = "https://lavanderia-cobre-landingpage.vercel.app/intranet/dashboard"; // <--- AJUSTA ESTO

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, loginWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const authToken = searchParams.get('auth_token');

  useEffect(() => {
    const verifyAccess = async () => {
      // 1. Si ya tenemos usuario, todo bien.
      if (user) {
        setIsVerifying(false);
        return;
      }

      // 2. Si no hay usuario pero hay token en URL, intentamos entrar
      if (authToken) {
        const success = await loginWithToken(authToken);
        if (!success) {
          // Si el token no es válido (no existe en DB), expulsar
          window.location.href = MAIN_INTRANET_URL;
        }
        setIsVerifying(false);
      } else {
        // 3. Si no hay usuario y no hay token, y ya cargó Firebase...
        if (!loading) {
           // Expulsar inmediatamente
           window.location.href = MAIN_INTRANET_URL;
        }
      }
    };

    verifyAccess();
  }, [user, loading, authToken, loginWithToken]);

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl font-semibold text-orange-600">Validando acceso...</div>
        </div>
      </div>
    );
  }

  // Doble chequeo de seguridad
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 lg:ml-64">
        {children}
      </main>
    </div>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Reutilizamos la lógica de protección básica, pero validamos rol
  if (!user) return <Navigate to="/" />; // ProtectedRoute manejará la redirección externa

  if (user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Acceso Restringido</h1>
        <p>No tienes permisos de administrador para ver esta sección.</p>
        <button onClick={() => window.history.back()} className="mt-4 text-blue-600 underline">Volver</button>
      </div>
    );
  }

  // Renderizado del layout admin (mismo que ProtectedRoute)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg shadow-lg"
      >
        <Menu size={24} />
      </button>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 lg:ml-64">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* ELIMINADA LA RUTA /LOGIN */}
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Rutas Protegidas */}
          <Route path="/productos" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          
          {/* Rutas Admin */}
          <Route path="/productos/crear" element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/productos/editar/:id" element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/productos/registrar" element={<AdminRoute><ProductRegister /></AdminRoute>} />
          <Route path="/proveedores" element={<AdminRoute><SupplierList /></AdminRoute>} />
          <Route path="/proveedores/crear" element={<AdminRoute><SupplierForm /></AdminRoute>} />
          <Route path="/proveedores/editar/:id" element={<AdminRoute><SupplierForm /></AdminRoute>} />
          <Route path="/historial" element={<AdminRoute><History /></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;