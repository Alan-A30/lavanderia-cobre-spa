import { Link } from 'react-router-dom';
import { Package, Users, FileText, PlusCircle, UserPlus } from 'lucide-react';

export default function Dashboard() {
  const cards = [
    {
      title: 'Registrar Productos',
      icon: Package,
      path: '/productos/registrar',
      color: 'bg-white hover:shadow-lg'
    },
    {
      title: 'Crear Proveedor',
      icon: Users,
      path: '/proveedores/crear',
      color: 'bg-white hover:shadow-lg'
    },
    {
      title: 'Visualizar Historial',
      icon: FileText,
      path: '/historial',
      color: 'bg-white hover:shadow-lg'
    },
    {
      title: 'Crear Productos',
      icon: PlusCircle,
      path: '/productos/crear',
      color: 'bg-white hover:shadow-lg'
    },
    {
      title: 'Crear Usuario',
      icon: UserPlus,
      path: '/usuarios/crear',
      color: 'bg-white hover:shadow-lg'
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.path}
              to={card.path}
              className={`${card.color} rounded-lg p-8 transition-all duration-200 flex flex-col items-center justify-center gap-4 min-h-[200px]`}
            >
              <Icon size={64} className="text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-700 text-center">
                {card.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}