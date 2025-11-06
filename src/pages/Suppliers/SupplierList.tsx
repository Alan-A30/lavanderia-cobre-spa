import { useState } from 'react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Search, Mail, Phone } from 'lucide-react';

export default function SupplierList() {
  const { suppliers, loading, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el proveedor "${name}"?`)) {
      await deleteSupplier(id);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-xl">Cargando proveedores...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Proveedores</h1>
        <Link
          to="/proveedores/crear"
          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          Nuevo Proveedor
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{supplier.name}</h3>
              <div className="flex gap-2">
                <Link
                  to={`/proveedores/editar/${supplier.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(supplier.id, supplier.name)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span className="text-sm">{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span className="text-sm">{supplier.phone}</span>
              </div>
              <div className="text-sm text-gray-500 mt-3">
                {supplier.address}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No se encontraron proveedores
        </div>
      )}
    </div>
  );
}