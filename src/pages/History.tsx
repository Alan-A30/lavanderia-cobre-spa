import { useHistory } from '@/hooks/useHistory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Package, Users, UserPlus, Pencil, Trash2, PlusCircle, MinusCircle } from 'lucide-react';

export default function History() {
  const { history, loading } = useHistory(100);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <PlusCircle size={20} className="text-green-600" />;
      case 'update':
        return <Pencil size={20} className="text-blue-600" />;
      case 'delete':
        return <Trash2 size={20} className="text-red-600" />;
      case 'add_stock':
        return <PlusCircle size={20} className="text-green-600" />;
      case 'remove_stock':
        return <MinusCircle size={20} className="text-orange-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'product':
        return <Package size={20} className="text-orange-600" />;
      case 'supplier':
        return <Users size={20} className="text-purple-600" />;
      case 'user':
        return <UserPlus size={20} className="text-teal-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

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

  const formatChanges = (changes: any) => {
    const fieldLabels: { [key: string]: string } = {
      name: 'Nombre',
      quantity: 'Cantidad',
      price: 'Precio',
      category: 'Categoría',
      supplier: 'Proveedor',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      address: 'Dirección',
      contact: 'Contacto',
      notes: 'Notas',
      description: 'Descripción',
      stock: 'Stock',
      minStock: 'Stock mínimo',
      maxStock: 'Stock máximo',
      unit: 'Unidad',
      barcode: 'Código de barras',
      sku: 'SKU',
      brand: 'Marca',
      model: 'Modelo',
      location: 'Ubicación',
      status: 'Estado',
      createdAt: 'Fecha de creación',
      updatedAt: 'Última actualización',
      quantityAdded: 'Cantidad agregada',
      quantityRemoved: 'Cantidad retirada',
      previousQuantity: 'Cantidad anterior',
      newQuantity: 'Cantidad nueva',
    };

    if (!changes || typeof changes !== 'object') {
      return null;
    }

    return (
      <div className="space-y-1.5">
        {Object.entries(changes).map(([key, value]) => {
          const label = fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
          const displayValue = typeof value === 'object' && value !== null
            ? JSON.stringify(value)
            : String(value);

          return (
            <div key={key} className="flex gap-2">
              <span className="font-medium text-gray-700 min-w-[120px]">{label}:</span>
              <span className="text-gray-600">{displayValue}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-xl">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Historial de Actividades</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {history.map((record) => (
            <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex gap-2 mt-1">
                  {getEntityIcon(record.entityType)}
                  {getActionIcon(record.action)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-900">
                      <span className="font-semibold">{record.userName}</span>
                      {' '}{getActionText(record.action)}{' '}
                      {record.entityName && (
                        <span className="font-medium text-orange-600">"{record.entityName}"</span>
                      )}
                    </p>
                    <span className="text-sm text-gray-500">
                      {format(record.timestamp, "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}
                    </span>
                  </div>
                  
                  {record.changes && (
                    <div className="mt-2 p-4 bg-gray-50 rounded text-sm">
                      <p className="text-gray-600 font-medium mb-3">Detalles:</p>
                      {formatChanges(record.changes)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No hay actividades registradas
          </div>
        )}
      </div>
    </div>
  );
}