import { useState } from 'react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Search, Mail, Phone, Package, X } from 'lucide-react';

export default function SupplierList() {
  const { suppliers, loading, deleteSupplier } = useSuppliers();
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el proveedor "${name}"?`)) {
      await deleteSupplier(id);
    }
  };

  // Obtener productos del proveedor seleccionado
  const getSupplierProducts = (supplierName: string) => {
    return products.filter(p => p.supplier === supplierName);
  };

  const supplierProducts = selectedSupplier ? getSupplierProducts(selectedSupplier) : [];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
        <div className="text-lg sm:text-xl">Cargando proveedores...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Proveedores</h1>
        <Link
          to="/proveedores/crear"
          className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
        >
          <Plus size={18} />
          Nuevo Proveedor
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSuppliers.map((supplier) => {
          const productCount = getSupplierProducts(supplier.name).length;
          
          return (
            <div key={supplier.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex-1 min-w-0 break-words pr-2">{supplier.name}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    to={`/proveedores/editar/${supplier.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </Link>
                  <button
                    onClick={() => handleDelete(supplier.id, supplier.name)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-gray-600 text-sm">
                <div className="flex items-start gap-2">
                  <Mail size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="break-all">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="flex-shrink-0" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-3 pt-3 border-t">
                  {supplier.address}
                </div>
              </div>

              {/* Botón para ver productos */}
              <button
                onClick={() => setSelectedSupplier(supplier.name)}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
              >
                <Package size={16} />
                Ver Productos ({productCount})
              </button>
            </div>
          );
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center text-gray-500">
          No se encontraron proveedores
        </div>
      )}

      {/* Modal de productos del proveedor */}
      {selectedSupplier && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4"
          onClick={() => setSelectedSupplier(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-orange-500 text-white p-4 sm:p-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Productos de {selectedSupplier}</h2>
                <p className="text-sm text-orange-100 mt-1">{supplierProducts.length} productos encontrados</p>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-white hover:bg-orange-600 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {supplierProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay productos de este proveedor
                </div>
              ) : (
                <div className="space-y-3">
                  {supplierProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        product.quantity < 10 ? 'bg-red-50 border-red-500' :
                        product.quantity < 25 ? 'bg-yellow-50 border-yellow-500' :
                        'bg-green-50 border-green-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          {product.brand && (
                            <p className="text-xs text-gray-500">{product.brand}</p>
                          )}
                        </div>
                        <span className={`text-lg font-bold ${
                          product.quantity < 10 ? 'text-red-600' :
                          product.quantity < 25 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {product.quantity}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Categoría:</span>
                          <p className="font-medium text-gray-700">{product.category}</p>
                        </div>
                        {product.unitQuantity && product.unit && (
                          <div>
                            <span className="text-gray-500">Cantidad:</span>
                            <p className="font-medium text-gray-700">{product.unitQuantity} {product.unit}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Precio:</span>
                          <p className="font-medium text-gray-700">${product.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <p className={`font-semibold ${
                            product.quantity < 10 ? 'text-red-600' :
                            product.quantity < 25 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {product.quantity} unidades
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-4 flex justify-end border-t">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
