import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductList() {
  const { products, loading, deleteProduct, removeFromInventory } = useProducts();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="p-8 flex items-center justify-center">
        <div className="text-xl">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
        {isAdmin && (
          <Link
            to="/productos/crear"
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
            Nuevo Producto
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar en inventario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                    product.quantity < 10 ? 'bg-red-50' : 
                    product.quantity < 25 ? 'bg-yellow-50' : 'bg-green-50'
                  }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  {product.brand && <div className="text-gray-500 text-xs">{product.brand}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.unitQuantity && product.unit ? `${product.unitQuantity} ${product.unit}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`font-semibold ${
                    product.quantity < 10 ? 'text-red-600' :
                    product.quantity < 25 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {product.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.supplier}</td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">No se encontraron productos</div>
        )}
      </div>

      {selectedProduct && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          onClick={() => setSelectedProduct(null)}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Retirar del Inventario</h2>

            <div className="text-sm text-gray-600 mb-2">
              <strong>Nombre:</strong> {selectedProduct.name}
            </div>
            {selectedProduct.brand && (
              <div className="text-sm text-gray-600 mb-2">
                <strong>Marca:</strong> {selectedProduct.brand}
              </div>
            )}
            <div className="text-sm text-gray-600 mb-2">
              <strong>Categoría:</strong> {selectedProduct.category}
            </div>
            {selectedProduct.unit && (
              <div className="text-sm text-gray-600 mb-2">
                <strong>Unidad:</strong> {selectedProduct.unit}
              </div>
            )}
            <div className="text-sm text-gray-600 mb-2">
              <strong>Proveedor:</strong> {selectedProduct.supplier}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <strong>Stock disponible:</strong> {selectedProduct.quantity}
            </div>

            <input
              type="number"
              placeholder="Cantidad a retirar"
              value={quantityToRemove || ''}
              onChange={(e) => setQuantityToRemove(Number(e.target.value))}
              min="1"
              max={selectedProduct.quantity}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-orange-500"
            />

            <div className="text-sm font-semibold text-gray-700 mb-4">
              Stock restante: {Math.max(0, selectedProduct.quantity - (quantityToRemove || 0))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoveQuantity}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Retirar
              </button>
            </div>
          </div>
        </div>
      )}

      {productToDelete && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          onClick={() => setProductToDelete(null)}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Eliminar Producto</h2>
            </div>

            <p className="text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar este producto?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-semibold text-gray-800">{productToDelete.name}</p>
            </div>

            <p className="text-sm text-red-600 mb-4">
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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