import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductRegister() {
  const { products, loading, updateProduct, deleteProduct } = useProducts();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);

  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const isAdmin = user?.role === 'admin';

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
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
    setNewQuantity(0);
  };

  const handleAddQuantity = async () => {
    if (!selectedProduct || newQuantity <= 0) {
      toast.error('Ingrese una cantidad válida');
      return;
    }

    const updatedQuantity = selectedProduct.quantity + newQuantity;
    await updateProduct(selectedProduct.id, { quantity: updatedQuantity });

    toast.success(`Se actualizaron las existencias de ${selectedProduct.name}`);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-xl">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Registrar Productos</h1>
        <Link
          to="/productos"
          className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Ver Inventario
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
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
                    product.quantity < 10 ? 'bg-red-50': 
                    product.quantity < 25 ? 'bg-yellow-50' : 'bg-green-50'}`}
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
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No se encontraron productos con ese criterio de búsqueda' : 'No hay productos registrados'}
          </div>
        )}
      </div>

      {/* Modal de registrar producto */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Producto</h2>

            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600">
                <strong className="text-gray-700">Producto:</strong> {selectedProduct.name}
              </div>
              {selectedProduct.brand && (
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-700">Marca:</strong> {selectedProduct.brand}
                </div>
              )}
              {selectedProduct.unitQuantity && selectedProduct.unit && (
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-700">Cantidad:</strong> {selectedProduct.unitQuantity} {selectedProduct.unit}
                </div>
              )}
              <div className="text-sm text-gray-600">
                <strong className="text-gray-700">Categoría:</strong> {selectedProduct.category}
              </div>
              <div className="text-sm text-gray-600">
                <strong className="text-gray-700">Proveedor:</strong> {selectedProduct.supplier}
              </div>
              <div className="text-sm text-gray-600">
                <strong className="text-gray-700">Precio unitario:</strong> ${selectedProduct.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 pb-2 border-b">
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
                placeholder="Ingrese la cantidad"
                value={newQuantity || ''}
                onChange={(e) => setNewQuantity(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-600 mb-1">
                Nuevo stock: <span className="font-semibold text-gray-800">{selectedProduct.quantity + (newQuantity || 0)}</span>
              </div>
              <div className="text-base font-bold text-orange-600">
                Total a pagar: ${((newQuantity || 0) * selectedProduct.price).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddQuantity}
                disabled={!newQuantity || newQuantity <= 0}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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