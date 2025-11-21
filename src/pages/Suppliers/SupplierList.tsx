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
        {filteredSuppliers.map((supplier) => (
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
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center text-gray-500">
          No se encontraron proveedores
        </div>
      )}
    </div>
  );
}