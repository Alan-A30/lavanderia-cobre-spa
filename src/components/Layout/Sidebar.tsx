import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  LogOut,
  PlusCircle,
  List,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// IMPORTANTE: Añadimos ?action=logout al final de tu URL
const MAIN_LOGOUT_URL = "https://lavanderia-el-cobre-landingpage.vercel.app/?action=logout";

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogoutAndRedirect = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // 1. Matamos la sesión en ESTE equipo (Equipo 4)
      await signOut(); 
    } catch (error) {
      console.error("Error al cerrar sesión local:", error);
    } finally {
      // 2. Redirigimos a tu Intranet con la orden de autodestruir su sesión
      window.location.href = MAIN_LOGOUT_URL;
    }
  };

  // ... (El resto del código de menús adminMenuItems y operarioMenuItems se mantiene IGUAL) ...
  const adminMenuItems = [
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

  const operarioMenuItems = [
    { 
      title: 'PRINCIPAL', 
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard }
      ]
    },
    { 
      title: 'INVENTARIO', 
      items: [
        { name: 'Inventario', path: '/productos', icon: Package }
      ]
    }
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : operarioMenuItems;

  return (
    <aside 
      className={cn(
        "w-64 bg-gradient-to-b from-orange-500 to-orange-600 text-white min-h-screen fixed left-0 top-0 z-40 transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <button onClick={onClose} className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
        <X size={24} />
      </button>

      <div className="p-4">
        <div className="bg-white rounded-lg p-4 shadow-md mb-3 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-32 h-auto object-contain max-h-24" />
        </div>
        <h1 className="text-lg font-bold text-center text-white leading-tight">Lavandería<br />el Cobre<br />"SPA"</h1>
      </div>

      <div className="px-4 py-3 bg-white/10 mx-2 rounded-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-orange-800 font-semibold">{user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{user?.displayName || 'Usuario'}</p>
            <p className="text-xs text-orange-100 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Operario'}</p>
          </div>
        </div>
      </div>

      <nav className="mt-2 overflow-y-auto max-h-[calc(100vh-400px)]">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-orange-200 uppercase tracking-wider mb-2">{section.title}</h3>
            <ul>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link to={item.path} onClick={() => onClose()} className={cn("flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors", isActive && "bg-white/20 border-l-4 border-white")}>
                      <Icon size={20} /><span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <button
        onClick={handleLogoutAndRedirect}
        className="absolute bottom-6 left-4 right-4 flex items-center justify-center gap-2 py-3 bg-orange-700/50 hover:bg-orange-700 rounded-lg transition-colors text-white cursor-pointer"
      >
        <LogOut size={20} className="rotate-180" />
        <span>Cerrar Sesión</span>
      </button>
    </aside>
  );
}