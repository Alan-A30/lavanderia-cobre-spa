import { Link } from 'react-router-dom';
import { Package, Users, FileText, PlusCircle, AlertTriangle, TrendingUp, Clock, ChevronDown } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useHistory } from '@/hooks/useHistory';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

const LOW_STOCK_ITEMS = 5;
const ACTIVITY_ITEMS = 10;

export default function Dashboard() {
  const { products } = useProducts();
  const { history } = useHistory(50);
  const { user } = useAuth();
  const [displayedLowStock, setDisplayedLowStock] = useState(LOW_STOCK_ITEMS);
  const [displayedActivity, setDisplayedActivity] = useState(ACTIVITY_ITEMS);

  const isAdmin = user?.role === 'admin';

  const lowStockProducts = products.filter(p => p.quantity < 10);
  const mediumStockProducts = products.filter(p => p.quantity >= 10 && p.quantity < 25);

  const lowStockToShow = lowStockProducts.slice(0, displayedLowStock);
  const hasMoreLowStock = displayedLowStock < lowStockProducts.length;

  const activityToShow = history.slice(0, displayedActivity);
  const hasMoreActivity = displayedActivity < history.length;

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

  if (!isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Productos</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{products.length}</p>
              </div>
              <Package size={32} className="text-blue-200 sm:w-10 sm:h-10" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 sm:p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs sm:text-sm font-medium">Bajo Stock</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{lowStockProducts.length}</p>
                <p className="text-red-100 text-xs mt-1">Menos de 10 unidades</p>
              </div>
              <AlertTriangle size={32} className="text-red-200 sm:w-10 sm:h-10" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 sm:p-6 text-white shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs sm:text-sm font-medium">Stock Medio</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{mediumStockProducts.length}</p>
                <p className="text-yellow-100 text-xs mt-1">Entre 10 y 25 unidades</p>
              </div>
              <TrendingUp size={32} className="text-yellow-200 sm:w-10 sm:h-10" />
            </div>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-red-500" size={20} />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Productos con Bajo Stock</h2>
            </div>
            <div className="space-y-3">
              {lowStockToShow.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {product.brand && `${product.brand} • `}
                      {product.category}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{product.quantity}</p>
                    <p className="text-xs text-gray-500">{product.unit || 'unidades'}</p>
                  </div>
                </div>
              ))}
              
              {hasMoreLowStock && (
                <button
                  onClick={() => setDisplayedLowStock(prev => prev + LOW_STOCK_ITEMS)}
                  className="w-full flex items-center justify-center gap-2 mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
                >
                  <span>Mostrar más</span>
                  <ChevronDown size={16} />
                </button>
              )}
              
              {lowStockProducts.length > LOW_STOCK_ITEMS && displayedLowStock >= lowStockProducts.length && (
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
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Productos</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{products.length}</p>
                </div>
                <Package size={32} className="text-blue-200 sm:w-10 sm:h-10" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 sm:p-6 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs sm:text-sm font-medium">Bajo Stock</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{lowStockProducts.length}</p>
                  <p className="text-red-100 text-xs mt-1">Menos de 10 unidades</p>
                </div>
                <AlertTriangle size={32} className="text-red-200 sm:w-10 sm:h-10" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 sm:p-6 text-white shadow-md sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs sm:text-sm font-medium">Stock Medio</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{mediumStockProducts.length}</p>
                  <p className="text-yellow-100 text-xs mt-1">Entre 10 y 25 unidades</p>
                </div>
                <TrendingUp size={32} className="text-yellow-200 sm:w-10 sm:h-10" />
              </div>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-500" size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Productos con Bajo Stock</h2>
              </div>
              <div className="space-y-3">
                {lowStockToShow.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {product.brand && `${product.brand} • `}
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl sm:text-2xl font-bold text-red-600">{product.quantity}</p>
                      <p className="text-xs text-gray-500">{product.unit || 'unidades'}</p>
                    </div>
                  </div>
                ))}
                
                {hasMoreLowStock && (
                  <button
                    onClick={() => setDisplayedLowStock(prev => prev + LOW_STOCK_ITEMS)}
                    className="w-full flex items-center justify-center gap-2 mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    <span>Mostrar más</span>
                    <ChevronDown size={16} />
                  </button>
                )}
                
                {lowStockProducts.length > 5 && displayedLowStock >= lowStockProducts.length && (
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
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {adminCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.path}
                    to={card.path}
                    className={`${card.color} rounded-lg p-4 sm:p-6 transition-all duration-200 flex items-center gap-3 sm:gap-4 shadow-md`}
                  >
                    <Icon size={40} className="text-orange-500 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                      {card.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-orange-500" size={20} />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Actividad Reciente</h2>
            </div>
            
            <div className="space-y-3 max-h-[400px] lg:max-h-[600px] overflow-y-auto">
              {activityToShow.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No hay actividad reciente</p>
              ) : (
                <>
                  {activityToShow.map((record) => (
                    <div key={record.id} className="border-l-4 border-orange-500 pl-3 py-2 bg-gray-50 rounded">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-semibold">{record.userName}</span>
                        {' '}{getActionText(record.action)}{' '}
                        {record.entityName && (
                          <span className="font-medium text-orange-600 break-words">"{record.entityName}"</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(record.timestamp, "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    </div>
                  ))}
                  
                  {hasMoreActivity && (
                    <button
                      onClick={() => setDisplayedActivity(prev => prev + ACTIVITY_ITEMS)}
                      className="w-full flex items-center justify-center gap-2 mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium"
                    >
                      <span>Mostrar más</span>
                      <ChevronDown size={14} />
                    </button>
                  )}
                </>
              )}
            </div>

            {history.length > 0 && (
              <Link 
                to="/historial" 
                className="block text-center text-orange-500 hover:text-orange-600 font-medium mt-4 pt-4 border-t text-sm sm:text-base"
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
