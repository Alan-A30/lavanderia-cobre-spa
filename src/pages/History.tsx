import { useMemo, useState } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { useProducts } from '@/hooks/useProducts';
import { format, startOfDay, startOfWeek, startOfMonth, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText, Package, Users, UserPlus, Pencil, Trash2, PlusCircle,
  MinusCircle, FileDown, X, Calendar, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Función auxiliar para cargar la imagen
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

export default function History() {
  const { history, loading } = useHistory(1000);
  const { products } = useProducts();
 
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewTimeRange, setViewTimeRange] = useState('');
  const [reportPeriod, setReportPeriod] = useState('month');

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <PlusCircle size={18} className="text-green-600 sm:w-5 sm:h-5" />;
      case 'update': return <Pencil size={18} className="text-blue-600 sm:w-5 sm:h-5" />;
      case 'delete': return <Trash2 size={18} className="text-red-600 sm:w-5 sm:h-5" />;
      case 'add_stock': return <PlusCircle size={18} className="text-green-600 sm:w-5 sm:h-5" />;
      case 'remove_stock': return <MinusCircle size={18} className="text-orange-600 sm:w-5 sm:h-5" />;
      default: return <FileText size={18} className="text-gray-600 sm:w-5 sm:h-5" />;
    }
  };

  const getActionText = (action: string) => {
    const actions: Record<string, string> = {
      create: 'creó', update: 'editó', delete: 'eliminó',
      remove_stock: 'retiró del inventario', add_stock: 'agregó al inventario',
    };
    return actions[action] || action;
  };

// --- FORMATEO NATURAL MEJORADO (Para PDF) ---
const formatNaturalLanguage = (action: string, changes: any) => {
  if (!changes || typeof changes !== 'object') return 'Sin detalles';

  // Función helper para obtener valores numéricos seguros
  const getNum = (key: string) => {
    const val = changes[key];
    if (val === undefined || val === null || val === '') return 'N/A';
    const num = Number(val);
    return isNaN(num) ? 'N/A' : num.toString();
  };

  switch (action) {
    case 'create':
      return 'Registro creado en el sistema';
   
    case 'update': {
      const ignored = ['updatedAt', 'createdAt', 'id', 'uid'];
      const keys = Object.keys(changes).filter(k => !ignored.includes(k));
     
      if (keys.length === 0) return 'Actualizacion general';

      const mapKeys: Record<string, string> = {
        name: 'Nombre', price: 'Precio', quantity: 'Stock',
        category: 'Categoria', supplier: 'Proveedor', phone: 'Telefono',
        unit: 'Unidad', unitQuantity: 'Cant/Unidad', brand: 'Marca',
        email: 'Email', address: 'Direccion'
      };
     
      const changedList = keys.map(key => mapKeys[key] || key).join(', ');
      return `Modifico: ${changedList}`;
    }

    case 'add_stock': {
      const added = getNum('quantityAdded');
      const prev = getNum('previousQuantity');
      const now = getNum('newQuantity');
      return `Entrada: +${added} unids. (${prev} -> ${now})`;
    }

    case 'remove_stock': {
      const removed = getNum('quantityRemoved');
      const prev = getNum('previousQuantity');
      const now = getNum('newQuantity');
      return `Salida: -${removed} unids. (${prev} -> ${now})`;
    }

    case 'delete':
      return 'Eliminacion del registro';

    default:
      return 'Cambio registrado';
  }
};

// --- FORMATEO WEB MEJORADO (Para pantalla) ---
const formatChangesWeb = (changes: any, action: string) => {
  if (!changes || typeof changes !== 'object') return null;
 
  const labels: Record<string, string> = {
    name: 'Nombre', quantity: 'Stock', price: 'Precio', category: 'Categoría',
    supplier: 'Proveedor', previousQuantity: 'Stock anterior', newQuantity: 'Stock nuevo',
    quantityAdded: 'Cantidad agregada', quantityRemoved: 'Cantidad retirada',
    brand: 'Marca', phone: 'Teléfono', email: 'Email', address: 'Dirección',
    unit: 'Unidad', unitQuantity: 'Cantidad por unidad'
  };

  // Función helper para obtener valores numéricos
  const getNum = (key: string, defaultVal = '0') => {
    const val = changes[key];
    if (val === undefined || val === null || val === '') return defaultVal;
    const num = Number(val);
    return isNaN(num) ? defaultVal : num.toString();
  };

  // Para movimientos de stock - MEJORADO
  if (action === 'add_stock') {
    const added = getNum('quantityAdded', '0');
    const prev = getNum('previousQuantity', '0');
    const now = getNum('newQuantity', '0');
    
    return (
      <div className="space-y-1.5">
        <div className="flex gap-2 text-sm">
          <span className="font-medium text-green-700">✓ Entrada de stock:</span>
          <span className="text-gray-900 font-semibold">{added} unidades</span>
        </div>
        <div className="flex gap-2 text-xs text-gray-600">
          <span>Stock: {prev}</span>
          <span className="text-green-600 font-bold">→</span>
          <span className="font-medium text-green-600">{now}</span>
        </div>
      </div>
    );
  }

  if (action === 'remove_stock') {
    const removed = getNum('quantityRemoved', '0');
    const prev = getNum('previousQuantity', '0');
    const now = getNum('newQuantity', '0');
    
    return (
      <div className="space-y-1.5">
        <div className="flex gap-2 text-sm">
          <span className="font-medium text-orange-700">↓ Salida de stock:</span>
          <span className="text-gray-900 font-semibold">{removed} unidades</span>
        </div>
        <div className="flex gap-2 text-xs text-gray-600">
          <span>Stock: {prev}</span>
          <span className="text-orange-600 font-bold">→</span>
          <span className="font-medium text-orange-600">{now}</span>
        </div>
      </div>
    );
  }

  // Para creaciones
  if (action === 'create') {
    return (
      <div className="space-y-1">
        <div className="text-xs font-medium text-green-700 mb-2">✓ Datos iniciales:</div>
        {Object.entries(changes).map(([key, value]) => {
          if (['updatedAt', 'createdAt', 'id', 'uid'].includes(key)) return null;
          
          const label = labels[key] || key;
          let displayVal = (value !== null && value !== undefined && value !== '') ? String(value) : '-';
          
          if (key === 'price' && value && !isNaN(Number(value))) {
            displayVal = `$${Number(value).toLocaleString('es-CL')}`;
          }
          
          return (
            <div key={key} className="flex gap-2 text-xs">
              <span className="font-medium text-gray-600 min-w-[100px]">{label}:</span>
              <span className="text-gray-900">{displayVal}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Para actualizaciones - MEJORADO con valores anteriores y nuevos
  if (action === 'update') {
    const ignored = ['updatedAt', 'createdAt', 'id', 'uid', 'previousQuantity', 'newQuantity'];
    const relevantChanges = Object.entries(changes).filter(([key]) => !ignored.includes(key));

    if (relevantChanges.length === 0) {
      return <div className="text-xs text-gray-500">Actualización general del registro</div>;
    }

    return (
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-blue-700 mb-2">✎ Campos modificados:</div>
        {relevantChanges.map(([key, value]) => {
          const label = labels[key] || key;
          
          // Si es un objeto con before/after, mostrarlo con flecha
          if (value && typeof value === 'object' && 'before' in value && 'after' in value) {
            const before = value.before !== null && value.before !== undefined && value.before !== '' 
              ? String(value.before) 
              : '-';
            const after = value.after !== null && value.after !== undefined && value.after !== '' 
              ? String(value.after) 
              : '-';
            
            return (
              <div key={key} className="flex gap-2 text-xs items-center">
                <span className="font-medium text-gray-600 min-w-[100px]">{label}:</span>
                <span className="text-gray-500">{before}</span>
                <span className="text-blue-600 font-bold">→</span>
                <span className="text-gray-900 font-semibold">{after}</span>
              </div>
            );
          }
          
          // Valor simple
          let displayVal = (value !== null && value !== undefined && value !== '') ? String(value) : '-';
          
          if (key === 'price' && value && !isNaN(Number(value))) {
            displayVal = `$${Number(value).toLocaleString('es-CL')}`;
          }
          
          return (
            <div key={key} className="flex gap-2 text-xs items-center">
              <span className="font-medium text-gray-600 min-w-[100px]">{label}:</span>
              <span className="text-blue-600 font-bold">→</span>
              <span className="text-gray-900 font-semibold">{displayVal}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Para eliminaciones
  if (action === 'delete') {
    return (
      <div className="text-xs text-red-700 font-medium">
        ✕ Registro eliminado permanentemente
      </div>
    );
  }

  // Fallback genérico
  return (
    <div className="space-y-1">
      {Object.entries(changes).map(([key, value]) => {
        if (['updatedAt', 'createdAt', 'id', 'uid'].includes(key)) return null;
        
        const label = labels[key] || key;
        const displayVal = (value !== null && value !== undefined && value !== '') 
          ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) 
          : '-';

        return (
          <div key={key} className="flex gap-2 text-xs">
            <span className="font-medium text-gray-600">{label}:</span>
            <span className="text-gray-900">{displayVal}</span>
          </div>
        );
      })}
    </div>
  );
};


  const filterRecords = (records: any[], timeFilter: string) => {
    return records.filter((record) => {
      let matchesTime = true;
      if (timeFilter && timeFilter !== 'all') {
        const date = new Date(record.timestamp);
        const now = new Date();
        if (timeFilter === 'today') matchesTime = isAfter(date, startOfDay(now));
        if (timeFilter === 'week') matchesTime = isAfter(date, startOfWeek(now, { locale: es, weekStartsOn: 1 }));
        if (timeFilter === 'month') matchesTime = isAfter(date, startOfMonth(now));
      }

      const matchesAction = !selectedAction || record.action === selectedAction;
      const matchesEntity = !selectedEntityType || record.entityType === selectedEntityType;
      const matchesSearch = !searchTerm ||
        record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.entityName && record.entityName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesAction && matchesEntity && matchesTime && matchesSearch;
    });
  };

  const filteredHistory = useMemo(() => {
    return filterRecords(history, viewTimeRange);
  }, [history, selectedAction, selectedEntityType, viewTimeRange, searchTerm]);

  const clearFilters = () => {
    setSelectedAction('');
    setSelectedEntityType('');
    setViewTimeRange('');
    setSearchTerm('');
  };

  const activeFiltersCount = [selectedAction, selectedEntityType, viewTimeRange].filter(Boolean).length;

  const stats = useMemo(() => ({
    total: filteredHistory.length,
    creates: filteredHistory.filter(h => h.action === 'create').length,
    updates: filteredHistory.filter(h => h.action === 'update').length,
    deletes: filteredHistory.filter(h => h.action === 'delete').length,
    stockChanges: filteredHistory.filter(h => h.action === 'add_stock' || h.action === 'remove_stock').length,
  }), [filteredHistory]);

  // --- GENERAR PDF MEJORADO ---
  const generateStyledPDF = async (title: string, data: any[], isStockReport = false) => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd 'de' MMMM, yyyy - HH:mm", { locale: es });

    // Encabezado
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
   
    // Logo
    try {
      const logoImg = await loadImage('/logo.png');
      doc.addImage(logoImg, 'PNG', 10, 2, 26, 26);
    } catch (e) {
      console.error("No se pudo cargar el logo", e);
    }

    // Título de Empresa
    doc.setTextColor(249, 115, 22);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("Lavanderia el Cobre SPA", 42, 19);

    // Título del Reporte
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 45);

    // Subtítulo
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${dateStr}`, 14, 51);
    doc.text(`Total registros: ${data.length}`, 14, 56);

    // Configuración de la tabla
    const headers = isStockReport
      ? ["Producto", "Marca", "Categoria", "Stock", "Estado", "Precio", "Proveedor"]
      : ["Fecha", "Usuario", "Accion", "Entidad", "Descripcion del Cambio"];

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 65,
      theme: 'striped',
      styles: {
        fontSize: isStockReport ? 8.5 : 8,
        cellPadding: isStockReport ? 3 : 4,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [55, 65, 81],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: isStockReport ? 9 : 8.5,
        cellPadding: 4
      },
      columnStyles: isStockReport ? {
        0: { fontStyle: 'bold', cellWidth: 42 }, // Producto
        1: { cellWidth: 28 }, // Marca
        2: { cellWidth: 30 }, // Categoria
        3: { halign: 'center', cellWidth: 14 }, // Stock
        4: { halign: 'center', cellWidth: 22 }, // Estado
        5: { halign: 'right', cellWidth: 24 }, // Precio
        6: { cellWidth: 30 } // Proveedor
      } : {
        0: { cellWidth: 28, halign: 'center', fontSize: 7.5 }, // Fecha
        1: { cellWidth: 26, fontSize: 8 }, // Usuario
        2: { cellWidth: 22, halign: 'center', fontStyle: 'bold', fontSize: 8 }, // Accion
        3: { cellWidth: 34, fontSize: 8 }, // Entidad
        4: { cellWidth: 76, fontSize: 8, cellPadding: 4 } // Descripcion
      },
      didParseCell: (data) => {
        // Colores para acciones en Historial
        if (!isStockReport && data.section === 'body' && data.column.index === 2) {
          const text = data.cell.raw as string;
          if (text === 'SALIDA' || text === 'ELIMINAR') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'ENTRADA' || text === 'CREAR') {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [37, 99, 235];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        
        // Colores para Stock
        if (isStockReport && data.section === 'body') {
          const row = data.row.raw as string[];
          const stockVal = parseInt(row[3]);
          
          // Columna de Stock
          if (data.column.index === 3) {
            if (stockVal < 10) {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            } else if (stockVal < 25) {
              data.cell.styles.textColor = [202, 138, 4];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = 'bold';
            }
          }
          
          // Columna de Estado con fondo de color
          if (data.column.index === 4) {
            const estado = row[4];
            if (estado === 'CRITICO') {
              data.cell.styles.fillColor = [254, 226, 226];
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            } else if (estado === 'BAJO') {
              data.cell.styles.fillColor = [254, 243, 199];
              data.cell.styles.textColor = [161, 98, 7];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.fillColor = [220, 252, 231];
              data.cell.styles.textColor = [22, 163, 74];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      },
      didDrawPage: (data) => {
        // Pie de página
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Pagina ${data.pageNumber} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
    });

    return doc;
  };

  const generateHistoryPDF = async () => {
    try {
      const recordsForReport = filterRecords(history, reportPeriod);
      const periodText = reportPeriod === 'week' ? 'Semana Actual' : reportPeriod === 'month' ? 'Mes Actual' : 'Completo';

      const rows = recordsForReport.map(record => [
        format(record.timestamp, 'dd/MM/yy HH:mm', { locale: es }),
        record.userName || 'Sistema',
        record.action === 'add_stock' ? 'ENTRADA' :
        record.action === 'remove_stock' ? 'SALIDA' :
        record.action === 'delete' ? 'ELIMINAR' :
        record.action === 'create' ? 'CREAR' : 'EDITAR',
        record.entityName || '(sin nombre)',
        formatNaturalLanguage(record.action, record.changes)
      ]);

      const doc = await generateStyledPDF(`Reporte de Movimientos - ${periodText}`, rows, false);
      doc.save(`historial_${reportPeriod}_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`);
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el PDF');
    }
  };

  const generateStockPDF = async () => {
    try {
      const rows = products.map(product => [
        product.name,
        product.brand || '-',
        product.category,
        product.quantity.toString(),
        product.quantity < 10 ? 'CRITICO' : product.quantity < 25 ? 'BAJO' : 'OK',
        `$${product.price.toLocaleString('es-CL')}`,
        product.supplier || '-'
      ]);

      const doc = await generateStyledPDF('Reporte de Inventario Actual', rows, true);
      doc.save(`inventario_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`);
      toast.success('Reporte de inventario generado');
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el PDF');
    }
  };

  if (loading) {
    return (
      <div className="p-8 pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-500">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Historial de Actividades</h1>
          <p className="text-gray-500 text-sm mt-1">Registro de movimientos y auditoría</p>
        </div>
       
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-xs font-semibold text-gray-500 uppercase">Periodo del Reporte</label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="all">Histórico Completo</option>
            </select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={generateHistoryPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <FileDown size={18} />
              PDF Historial
            </button>
            <button
              onClick={generateStockPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <FileDown size={18} />
              PDF Stock
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-400">
          <p className="text-xs text-gray-500">Total Movimientos</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Creaciones</p>
          <p className="text-2xl font-bold text-green-600">{stats.creates}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Ediciones</p>
          <p className="text-2xl font-bold text-blue-600">{stats.updates}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <p className="text-xs text-gray-500">Eliminaciones</p>
          <p className="text-2xl font-bold text-red-600">{stats.deletes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-500">Entradas/Salidas</p>
          <p className="text-2xl font-bold text-orange-600">{stats.stockChanges}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full sm:w-96">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar usuario, producto o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
         
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Acción</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-orange-500"
            >
              <option value="">Todas</option>
              <option value="create">Creación</option>
              <option value="update">Edición</option>
              <option value="delete">Eliminación</option>
              <option value="add_stock">Entrada Stock</option>
              <option value="remove_stock">Salida Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Entidad</label>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-orange-500"
            >
              <option value="">Todo</option>
              <option value="product">Productos</option>
              <option value="supplier">Proveedores</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <Filter size={12} /> Vista en Pantalla
            </label>
            <select
              value={viewTimeRange}
              onChange={(e) => setViewTimeRange(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-orange-500"
            >
              <option value="all">Histórico completo</option>
              <option value="today">Solo Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Mostrando {filteredHistory.length} registros
      </div>

      {/* Lista de Historial MEJORADA */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredHistory.map((record) => (
            <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-gray-100 rounded-lg flex-shrink-0">
                  {getActionIcon(record.action)}
                </div>
               
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{record.userName}</span>
                      <span className="font-normal text-gray-500"> {getActionText(record.action)} </span>
                      <span className="font-semibold text-orange-600">
                        {record.entityName || 'elemento eliminado'}
                      </span>
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                      <Calendar size={12} />
                      {format(record.timestamp, "dd MMM yyyy, HH:mm", { locale: es })}
                    </span>
                  </div>
                 
                  {record.changes && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {formatChangesWeb(record.changes, record.action)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="p-12 text-center text-gray-500 bg-gray-50">
            <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-3">
              <Filter size={24} className="text-gray-300" />
            </div>
            <p>No se encontraron registros con los filtros actuales</p>
          </div>
        )}
      </div>
    </div>
  );
}
