import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Layout/Sidebar';
import { useState, useEffect } from 'react';
import { Menu, XCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import ProductRegister from './pages/Products/ProductRegister';
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierForm from './pages/Suppliers/SupplierForm';
import History from './pages/History';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loginWithToken, loginAsGuest } = useAuth();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const authToken = searchParams.get('auth_token');

  useEffect(() => {
    const initAuth = async () => {
      // 1. Intento de Login con Token
      if (authToken && (!user || user.uid !== authToken)) {
        const success = await loginWithToken(authToken);
        if (success) {
          toast.success("Sesión sincronizada");
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          loginAsGuest(); // Fallback a invitado
        }
      } 
      // 2. Entrada directa sin token -> Invitado
      else if (!user && !authToken) {
        loginAsGuest();
      }
    };
    initAuth();
  }, [authToken, user, loginWithToken, loginAsGuest]);

  if (!user) {
    return <div className="min-h-screen bg-white" />; 
  }

  return (
    <div className="flex min-h-screen">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
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
  
  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4 lg:ml-64">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h1>
          <p className="text-gray-600 mb-6 text-sm">Esta sección es exclusiva para administradores.</p>
          <button 
            onClick={() => window.history.back()} 
            className="w-full py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/productos" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          
          <Route path="/productos/crear" element={
            <ProtectedRoute><AdminRoute><ProductForm /></AdminRoute></ProtectedRoute>
          } />
          <Route path="/productos/editar/:id" element={
            <ProtectedRoute><AdminRoute><ProductForm /></AdminRoute></ProtectedRoute>
          } />
          <Route path="/productos/registrar" element={
            <ProtectedRoute><AdminRoute><ProductRegister /></AdminRoute></ProtectedRoute>
          } />
          <Route path="/proveedores" element={
            <ProtectedRoute><AdminRoute><SupplierList /></AdminRoute></ProtectedRoute>
          } />
          <Route path="/proveedores/crear" element={
            <ProtectedRoute><AdminRoute><SupplierForm /></AdminRoute></ProtectedRoute>
          } />
          <Route path="/proveedores/editar/:id" element={
            <ProtectedRoute><AdminRoute><SupplierForm /></AdminRoute></ProtectedRoute>
          } />
          <Route path="/historial" element={
            <ProtectedRoute><AdminRoute><History /></AdminRoute></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;