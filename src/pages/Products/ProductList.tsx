import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Search, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ITEMS_PER_PAGE = 12;

export default function ProductList() {
  const { products, loading, deleteProduct, removeFromInventory } = useProducts();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de filtros
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStock, setSelectedStock] = useState('');

  // Estado de paginación
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);

  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    category: string;
    supplier: string;
    price: number;
    quantity: number;
    brand?: string;
    unit?: string;
  } | null>(null);

  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [quantityToRemove, setQuantityToRemove] = useState<number>(0);

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
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Productos a mostrar (con paginación)
  const displayedProducts = filteredProducts.slice(0, displayedItems);
  const hasMore = displayedItems < filteredProducts.length;

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedSupplier('');
    setSelectedStock('');
    setSearchTerm('');
    setDisplayedItems(ITEMS_PER_PAGE);
  };

  const loadMore = () => {
    setDisplayedItems(prev => prev + ITEMS_PER_PAGE);
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
    setQuantityToRemove(0);
  };

  const handleRemoveQuantity = async () => {
    if (!selectedProduct) return;

    if (quantityToRemove <= 0) {
      toast.error('Debes ingresar una cantidad válida');
      return;
    }

    if (quantityToRemove > selectedProduct.quantity) {
      toast.error('No puedes retirar más de lo disponible');
      return;
    }

    await removeFromInventory(selectedProduct.id, quantityToRemove, selectedProduct.name);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
        <div className="text-lg sm:text-xl">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Inventario</h1>
        {isAdmin && (
          <Link
            to="/productos/crear"
            className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
          >
            <Plus size={18} />
            Nuevo Producto
          </Link>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar en inventario..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDisplayedItems(ITEMS_PER_PAGE);
            }}
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
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setDisplayedItems(ITEMS_PER_PAGE);
                }}
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
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setDisplayedItems(ITEMS_PER_PAGE);
                }}
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
                onChange={(e) => {
                  setSelectedSupplier(e.target.value);
                  setDisplayedItems(ITEMS_PER_PAGE);
                }}
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
                onChange={(e) => {
                  setSelectedStock(e.target.value);
                  setDisplayedItems(ITEMS_PER_PAGE);
                }}
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
        Mostrando <span className="font-semibold">{displayedProducts.length}</span> de <span className="font-semibold">{filteredProducts.length}</span> productos
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
              {displayedProducts.map((product) => (
                <tr
                  key={product.id}
                  onClick={(e) => handleRowClick(product, e)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors
                    ${
                      product.quantity < 10 ? 'bg-red-50' : 
                      product.quantity < 25 ? 'bg-yellow-50' : 'bg-green-50'
                    }`}
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
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toLocaleString()}</td>
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
          <div className="text-center py-12 text-gray-500">No se encontraron productos</div>
        )}
      </div>

      {/* Cards para móvil */}
      <div className="md:hidden space-y-3">
        {displayedProducts.map((product) => (
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
                <p className="font-medium text-gray-700">${product.price.toLocaleString()}</p>
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
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Botón Mostrar Más */}
      {hasMore && (
        <div className="flex justify-center mt-6 mb-4">
          <button
            onClick={loadMore}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors shadow-md font-medium"
          >
            <span>Mostrar más</span>
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      {/* Modal retirar producto */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Retirar del Inventario</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="text-gray-600">
                <strong>Nombre:</strong> {selectedProduct.name}
              </div>
              {selectedProduct.brand && (
                <div className="text-gray-600">
                  <strong>Marca:</strong> {selectedProduct.brand}
                </div>
              )}
              <div className="text-gray-600">
                <strong>Categoría:</strong> {selectedProduct.category}
              </div>
              {selectedProduct.unit && (
                <div className="text-gray-600">
                  <strong>Unidad:</strong> {selectedProduct.unit}
                </div>
              )}
              <div className="text-gray-600">
                <strong>Proveedor:</strong> {selectedProduct.supplier}
              </div>
              <div className="text-gray-600">
                <strong>Stock disponible:</strong> {selectedProduct.quantity}
              </div>
            </div>

            <input
              type="number"
              placeholder="Cantidad a retirar"
              value={quantityToRemove || ''}
              onChange={(e) => setQuantityToRemove(Number(e.target.value))}
              min="1"
              max={selectedProduct.quantity}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm focus:ring-2 focus:ring-orange-500"
            />

            <div className="text-sm font-semibold text-gray-700 mb-4">
              Stock restante: {Math.max(0, selectedProduct.quantity - (quantityToRemove || 0))}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoveQuantity}
                className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
              >
                Retirar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar producto */}
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
