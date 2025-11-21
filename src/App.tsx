import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Layout/Sidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import ProductRegister from './pages/Products/ProductRegister';
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierForm from './pages/Suppliers/SupplierForm';
import History from './pages/History';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
        <div className="text-xl font-semibold text-orange-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido principal */}
      <main className="flex-1 min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 lg:ml-64">
        {children}
      </main>
    </div>
  );
}

// Componente para rutas solo de administrador
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
        <div className="text-xl font-semibold text-orange-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido principal */}
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
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Inventario - Todos pueden ver */}
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
          />
          
          {/* Solo Admin - Crear Producto */}
          <Route
            path="/productos/crear"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />
          
          {/* Solo Admin - Editar Producto */}
          <Route
            path="/productos/editar/:id"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />
          
          {/* Solo Admin - Registrar Productos */}
          <Route
            path="/productos/registrar"
            element={
              <AdminRoute>
                <ProductRegister />
              </AdminRoute>
            }
          />
          
          {/* Solo Admin - Proveedores */}
          <Route
            path="/proveedores"
            element={
              <AdminRoute>
                <SupplierList />
              </AdminRoute>
            }
          />
          
          <Route
            path="/proveedores/crear"
            element={
              <AdminRoute>
                <SupplierForm />
              </AdminRoute>
            }
          />
          
          <Route
            path="/proveedores/editar/:id"
            element={
              <AdminRoute>
                <SupplierForm />
              </AdminRoute>
            }
          />
          
          {/* Solo Admin - Historial */}
          <Route
            path="/historial"
            element={
              <AdminRoute>
                <History />
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;