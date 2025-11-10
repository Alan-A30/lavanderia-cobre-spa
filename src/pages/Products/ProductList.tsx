import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductList() {
  const { products, loading, deleteProduct, updateProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    category: string;
    supplier: string;
    price: number;
    quantity: number;
  } | null>(null);

  const [newQuantity, setNewQuantity] = useState<number>(0);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      await deleteProduct(id);
    }
  };

  const handleRowClick = (product: any) => {
    setSelectedProduct(product);
    setNewQuantity(0);
  };

  const handleAddQuantity = async () => {
    if (!selectedProduct) return;

    const updatedQuantity = selectedProduct.quantity + newQuantity;
    await updateProduct(selectedProduct.id, { quantity: updatedQuantity });

    toast.success(`Se actualizaron las existencias (${selectedProduct.name})`);
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
        <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
        <Link
          to="/productos/crear"
          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          Nuevo Producto
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                onClick={() => handleRowClick(product)}
                className={`cursor-pointer hover:bg-gray-50
                  ${
                    product.quantity < 10? 'bg-red-50': 
                    product.quantity < 25? 'bg-yellow-50' : 'bg-green-50'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.supplier}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/productos/editar/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                    <Pencil size={18} className="inline" />
                  </Link>
                  <button onClick={() => handleDelete(product.id, product.name)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">No se encontraron productos</div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar producto</h2>

            <div className="text-sm text-gray-600 mb-2">
              <strong>Nombre:</strong> {selectedProduct.name}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Categoría:</strong> {selectedProduct.category}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Proveedor:</strong> {selectedProduct.supplier}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Precio:</strong> ${selectedProduct.price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <strong>Stock actual:</strong> {selectedProduct.quantity}
            </div>

            <input
              type="number"
              placeholder="Cantidad a agregar"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-orange-500"
            />

            <div className="text-sm font-semibold text-gray-700 mb-4">
              Total: ${((newQuantity || 0) * selectedProduct.price).toLocaleString()}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddQuantity}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}