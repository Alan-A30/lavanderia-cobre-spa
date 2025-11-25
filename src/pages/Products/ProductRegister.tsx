import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductRegister() {
  const { products, loading, updateProduct, deleteProduct } = useProducts();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de filtros
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStock, setSelectedStock] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);

  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const isAdmin = user?.role === 'admin';

  // Obtener opciones únicas para filtros
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return uniqueBrands.sort();
  }, [products]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  const suppliers = useMemo(() => {
    const uniqueSuppliers = [...new Set(products.map(p => p.supplier))];
    return uniqueSuppliers.sort();
  }, [products]);

  // Opciones de filtro de stock
  const stockOptions = [
    { value: '', label: 'Todos los niveles' },
    { value: 'bajo', label: 'Stock Bajo (< 10)' },
    { value: 'medio', label: 'Stock Medio (10-25)' },
    { value: 'alto', label: 'Stock Alto (> 25)' },
  ];

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSupplier = !selectedSupplier || product.supplier === selectedSupplier;
      
      // Filtro de stock
      let matchesStock = true;
      if (selectedStock === 'bajo') {
        matchesStock = product.quantity < 10;
      } else if (selectedStock === 'medio') {
        matchesStock = product.quantity >= 10 && product.quantity <= 25;
      } else if (selectedStock === 'alto') {
        matchesStock = product.quantity > 25;
      }

      return matchesSearch && matchesBrand && matchesCategory && matchesSupplier && matchesStock;
    });
  }, [products, searchTerm, selectedBrand, selectedCategory, selectedSupplier, selectedStock]);

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedSupplier('');
    setSelectedStock('');
    setSearchTerm('');
  };

  const activeFiltersCount = [selectedBrand, selectedCategory, selectedSupplier, selectedStock].filter(Boolean).length;

  const handleDeleteClick = (id: string, name: string, event: any) => {
    event.stopPropagation();
    setProductToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleRowClick = (product: any, event: any) => {
    if (event.target.closest('button') || event.target.closest('a')) {
      return;
    }
    
    setSelectedProduct(product);
    setNewQuantity(0);
  };

  const handleAddQuantity = async () => {
    if (!selectedProduct || newQuantity <= 0) {
      toast.error('Ingrese una cantidad válida');
      return;
    }

    if (newQuantity > 10000) {
      toast.error('No puede agregar más de 10.000 unidades');
      return;
    }

    const updatedQuantity = selectedProduct.quantity + newQuantity;
    await updateProduct(selectedProduct.id, { quantity: updatedQuantity }, true);

    toast.success(`Se actualizaron las existencias de ${selectedProduct.name}`);
    setSelectedProduct(null);
    setNewQuantity(0);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
        <div className="text-lg sm:text-xl">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Registrar Productos</h1>
        <Link
          to="/productos"
          className="flex items-center justify-center gap-2 bg-gray-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
        >
          Ver Inventario
        </Link>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filtros siempre visibles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Filtros</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                <X size={14} />
                Limpiar ({activeFiltersCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Marca</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todas las marcas</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Proveedor</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos los proveedores</option>
                {suppliers.map(sup => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nivel de Stock</label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {stockOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de resultados */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando <span className="font-semibold">{filteredProducts.length}</span> de <span className="font-semibold">{products.length}</span> productos
      </div>

      {/* Tabla para desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                {isAdmin && (
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  onClick={(e) => handleRowClick(product, e)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors
                    ${
                      product.quantity < 10 ? 'bg-red-50': 
                      product.quantity < 25 ? 'bg-yellow-50' : 'bg-green-50'}`}
                >
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    {product.brand && <div className="text-gray-500 text-xs">{product.brand}</div>}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.unitQuantity && product.unit ? `${product.unitQuantity} ${product.unit}` : '-'}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`font-semibold ${
                      product.quantity < 10 ? 'text-red-600' :
                      product.quantity < 25 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toLocaleString('es-CL')}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.supplier}</td>
                  {isAdmin && (
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/productos/editar/${product.id}`} 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Pencil size={18} className="inline" />
                      </Link>
                      <button 
                        onClick={(e) => handleDeleteClick(product.id, product.name, e)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} className="inline" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || activeFiltersCount > 0 ? 'No se encontraron productos con esos filtros' : 'No hay productos registrados'}
          </div>
        )}
      </div>

      {/* Cards para móvil */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={(e) => handleRowClick(product, e)}
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all
              ${
                product.quantity < 10 ? 'border-l-4 border-red-500' : 
                product.quantity < 25 ? 'border-l-4 border-yellow-500' : 'border-l-4 border-green-500'
              }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-2 ml-2 flex-shrink-0">
                  <Link 
                    to={`/productos/editar/${product.id}`} 
                    className="text-blue-600 hover:text-blue-900 p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil size={16} />
                  </Link>
                  <button 
                    onClick={(e) => handleDeleteClick(product.id, product.name, e)} 
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Categoría:</span>
                <p className="font-medium text-gray-700">{product.category}</p>
              </div>
              <div>
                <span className="text-gray-500">Stock:</span>
                <p className={`font-semibold ${
                  product.quantity < 10 ? 'text-red-600' :
                  product.quantity < 25 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {product.quantity}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Precio:</span>
                <p className="font-medium text-gray-700">${product.price.toLocaleString('es-CL')}</p>
              </div>
              <div>
                <span className="text-gray-500">Proveedor:</span>
                <p className="font-medium text-gray-700 truncate">{product.supplier}</p>
              </div>
              {product.unitQuantity && product.unit && (
                <div className="col-span-2">
                  <span className="text-gray-500">Cantidad:</span>
                  <p className="font-medium text-gray-700">{product.unitQuantity} {product.unit}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            {searchTerm || activeFiltersCount > 0 ? 'No se encontraron productos con esos filtros' : 'No hay productos registrados'}
          </div>
        )}
      </div>

      {/* Modal de registrar producto - CON VALIDACIÓN */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Registrar Producto</h2>

            <div className="space-y-2 mb-4 text-sm">
              <div className="text-gray-600">
                <strong className="text-gray-700">Producto:</strong> {selectedProduct.name}
              </div>
              {selectedProduct.brand && (
                <div className="text-gray-600">
                  <strong className="text-gray-700">Marca:</strong> {selectedProduct.brand}
                </div>
              )}
              {selectedProduct.unitQuantity && selectedProduct.unit && (
                <div className="text-gray-600">
                  <strong className="text-gray-700">Cantidad:</strong> {selectedProduct.unitQuantity} {selectedProduct.unit}
                </div>
              )}
              <div className="text-gray-600">
                <strong className="text-gray-700">Categoría:</strong> {selectedProduct.category}
              </div>
              <div className="text-gray-600">
                <strong className="text-gray-700">Proveedor:</strong> {selectedProduct.supplier}
              </div>
              <div className="text-gray-600">
                <strong className="text-gray-700">Precio unitario:</strong> ${selectedProduct.price.toLocaleString('es-CL')}
              </div>
              <div className="text-gray-600 pb-2 border-b">
                <strong className="text-gray-700">Stock actual:</strong> <span className="text-orange-600 font-semibold">{selectedProduct.quantity}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad a agregar *
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                placeholder="Ingrese la cantidad"
                value={newQuantity || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setNewQuantity(value);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
              {newQuantity > 10000 && (
                <p className="mt-1 text-xs text-red-600">
                  No puede agregar más de 10.000 unidades
                </p>
              )}
              {newQuantity > 5000 && newQuantity <= 10000 && (
                <p className="mt-1 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ Está agregando una cantidad elevada de stock
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Máximo 10.000 unidades por registro</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-600 mb-1">
                Nuevo stock: <span className="font-semibold text-gray-800">{selectedProduct.quantity + (newQuantity || 0)}</span>
              </div>
              <div className="text-base font-bold text-orange-600">
                Total a pagar: ${((newQuantity || 0) * selectedProduct.price).toLocaleString('es-CL')}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setNewQuantity(0);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddQuantity}
                disabled={!newQuantity || newQuantity <= 0 || newQuantity > 10000}
                className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de eliminar producto */}
      {productToDelete && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4"
          onClick={() => setProductToDelete(null)}
        >
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Eliminar Producto</h2>
            </div>

            <p className="text-sm sm:text-base text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar este producto?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{productToDelete.name}</p>
            </div>

            <p className="text-xs sm:text-sm text-red-600 mb-4">
              Esta acción no se puede deshacer.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
