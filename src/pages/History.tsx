import { useHistory } from '@/hooks/useHistory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Package, Users, UserPlus, Pencil, Trash2, PlusCircle } from 'lucide-react';

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
      update: 'actualizó',
      delete: 'eliminó',
    };
    return actions[action as keyof typeof actions] || action;
  };

  const getEntityText = (entityType: string) => {
    const entities = {
      product: 'producto',
      supplier: 'proveedor',
      user: 'usuario',
    };
    return entities[entityType as keyof typeof entities] || entityType;
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
                      <span className="font-medium">{getEntityText(record.entityType)}</span>
                    </p>
                    <span className="text-sm text-gray-500">
                      {format(record.timestamp, "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}
                    </span>
                  </div>
                  
                  {record.changes && (
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      <p className="text-gray-600 font-medium mb-1">Cambios:</p>
                      <pre className="text-gray-700 overflow-x-auto">
                        {JSON.stringify(record.changes, null, 2)}
                      </pre>
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