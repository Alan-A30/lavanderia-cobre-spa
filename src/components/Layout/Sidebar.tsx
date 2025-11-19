import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  LogOut,
  PlusCircle,
  List
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const menuItems = [
    { 
      title: 'PRINCIPAL', 
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard }
      ]
    },
    { 
      title: 'INVENTARIO', 
      items: [
        { name: 'Inventario', path: '/productos', icon: Package },
        { name: 'Crear Producto', path: '/productos/crear', icon: PlusCircle },
        { name: 'Registrar Productos', path: '/productos/registrar', icon: List }
      ]
    },
    { 
      title: 'GESTIÓN', 
      items: [
        { name: 'Proveedores', path: '/proveedores', icon: Users }
      ]
    },
    { 
      title: 'REPORTES', 
      items: [
        { name: 'Historial', path: '/historial', icon: FileText }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-orange-500 to-orange-600 text-white min-h-screen fixed left-0 top-0">
      {/* Logo y Nombre */}
      <div className="p-4">
        {/* Contenedor blanco para el logo */}
        <div className="bg-white rounded-lg p-4 shadow-md mb-3 flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-32 h-auto object-contain max-h-24"
          />
        </div>
        
        {/* Nombre de la empresa */}
        <h1 className="text-lg font-bold text-center text-white leading-tight">
          Lavandería<br />el Cobre<br />"SPA"
        </h1>
      </div>

      {/* Usuario Info */}
      <div className="px-4 py-3 bg-white/10 mx-2 rounded-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-orange-800 font-semibold">
              {user?.displayName.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{user?.displayName}</p>
            <p className="text-xs text-orange-100">Administrador</p>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="mt-2">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-orange-200 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors",
                        isActive && "bg-white/20 border-l-4 border-white"
                      )}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Botón de cerrar sesión */}
      <button
        onClick={() => signOut()}
        className="absolute bottom-6 left-4 right-4 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
      >
        <LogOut size={20} />
        <span>Cerrar Sesión</span>
      </button>
    </aside>
  );
}