import { Link } from 'react-router-dom';
import { Package, Users, FileText, PlusCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useHistory } from '@/hooks/useHistory';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const { products } = useProducts();
  const { history } = useHistory(10);
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const lowStockProducts = products.filter(p => p.quantity < 10);
  const mediumStockProducts = products.filter(p => p.quantity >= 10 && p.quantity < 25);

  const adminCards = [
    {
      title: 'Registrar Productos',
      icon: Package,
      path: '/productos/registrar',
      color: 'bg-white hover:shadow-lg'
    },
    {
      title: 'Crear Proveedor',
      icon: Users,
      path: '/proveedores/crear',
      color: 'bg-white hover:shadow-lg'
    },
    {
      title: 'Visualizar Historial',
      icon: FileText,
      path: '/historial',
      color: 'bg-white hover:shadow-lg'
    },
    {
      title: 'Crear Productos',
      icon: PlusCircle,
      path: '/productos/crear',
      color: 'bg-white hover:shadow-lg'
    }
  ];

  const getActionText = (action: string) => {
    const actions = {
      create: 'creó',
      update: 'editó',
      delete: 'eliminó',
      remove_stock: 'retiró del inventario',
      add_stock: 'agregó al inventario',
    };
    return actions[action as keyof typeof actions] || action;
  };

  const getEntityText = (entityType: string) => {
    const entities = {
      product: 'producto',
      supplier: 'proveedor',
      user: 'usuario',
    };
    return entities[entityType as keyof typeof entities] || entityType;
  };

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Productos</p>
                <p className="text-3xl font-bold mt-2">{products.length}</p>
              </div>
              <Package size={40} className="text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Bajo Stock</p>
                <p className="text-3xl font-bold mt-2">{lowStockProducts.length}</p>
                <p className="text-red-100 text-xs mt-1">Menos de 10 unidades</p>
              </div>
              <AlertTriangle size={40} className="text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Stock Medio</p>
                <p className="text-3xl font-bold mt-2">{mediumStockProducts.length}</p>
                <p className="text-yellow-100 text-xs mt-1">Entre 10 y 25 unidades</p>
              </div>
              <TrendingUp size={40} className="text-yellow-200" />
            </div>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Productos con Bajo Stock</h2>
            </div>
            <div className="space-y-3">
              {lowStockProducts.slice(0, 10).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.brand && `${product.brand} • `}
                      {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{product.quantity}</p>
                    <p className="text-xs text-gray-500">{product.unit || 'unidades'}</p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length > 10 && (
                <Link 
                  to="/productos" 
                  className="block text-center text-orange-500 hover:text-orange-600 font-medium mt-2"
                >
                  Ver todos ({lowStockProducts.length})
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Productos</p>
                  <p className="text-3xl font-bold mt-2">{products.length}</p>
                </div>
                <Package size={40} className="text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Bajo Stock</p>
                  <p className="text-3xl font-bold mt-2">{lowStockProducts.length}</p>
                  <p className="text-red-100 text-xs mt-1">Menos de 10 unidades</p>
                </div>
                <AlertTriangle size={40} className="text-red-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Stock Medio</p>
                  <p className="text-3xl font-bold mt-2">{mediumStockProducts.length}</p>
                  <p className="text-yellow-100 text-xs mt-1">Entre 10 y 25 unidades</p>
                </div>
                <TrendingUp size={40} className="text-yellow-200" />
              </div>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Productos con Bajo Stock</h2>
              </div>
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.brand && `${product.brand} • `}
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{product.quantity}</p>
                      <p className="text-xs text-gray-500">{product.unit || 'unidades'}</p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <Link 
                    to="/productos" 
                    className="block text-center text-orange-500 hover:text-orange-600 font-medium mt-2"
                  >
                    Ver todos ({lowStockProducts.length})
                  </Link>
                )}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.path}
                    to={card.path}
                    className={`${card.color} rounded-lg p-6 transition-all duration-200 flex items-center gap-4 shadow-md`}
                  >
                    <Icon size={48} className="text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-700">
                      {card.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-orange-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Actividad Reciente</h2>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No hay actividad reciente</p>
              ) : (
                history.map((record) => (
                  <div key={record.id} className="border-l-4 border-orange-500 pl-3 py-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{record.userName}</span>
                      {' '}{getActionText(record.action)}{' '}
                      {record.entityName && (
                        <span className="font-medium text-orange-600">"{record.entityName}"</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(record.timestamp, "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <Link 
                to="/historial" 
                className="block text-center text-orange-500 hover:text-orange-600 font-medium mt-4 pt-4 border-t"
              >
                Ver historial completo
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}