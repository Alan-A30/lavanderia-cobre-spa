import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProducts } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useSuppliers';

const productSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .refine((val) => !/\d/.test(val), {
      message: 'El nombre no puede contener números'
    }),
  brand: z.string()
    .max(50, 'La marca no puede tener más de 50 caracteres')
    .optional()
    .or(z.literal('')),
  unitQuantity: z.number().optional().or(z.nan()),
  unit: z.string().optional().or(z.literal('')),
  quantity: z.number()
    .min(0, 'El stock debe ser mayor o igual a 0')
    .max(10000, 'El stock no puede ser mayor a 10.000 unidades'),
  price: z.number()
    .min(0, 'El precio debe ser mayor o igual a 0')
    .max(10000000, 'El precio no puede ser mayor a $10.000.000'),
  category: z.string().min(1, 'La categoría es requerida'),
  supplier: z.string().min(1, 'El proveedor es requerido'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useProducts();
  const { suppliers } = useSuppliers();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      brand: '',
      unitQuantity: undefined,
      unit: '',
      quantity: 0,
      price: 0,
      category: '',
      supplier: '',
    }
  });

  const selectedSupplier = watch('supplier');
  const currentPrice = watch('price');
  const currentStock = watch('quantity');

  useEffect(() => {
    if (id) {
      const product = products.find(p => p.id === id);
      if (product) {
        reset({
          name: product.name,
          brand: product.brand || '',
          unitQuantity: product.unitQuantity,
          unit: product.unit || '',
          quantity: product.quantity,
          price: product.price,
          category: product.category,
          supplier: product.supplier,
        });
      }
    }
  }, [id, products, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      // Limpiar campos opcionales vacíos
      const cleanData: any = { ...data };
      if (!cleanData.brand || cleanData.brand === '') delete cleanData.brand;
      if (!cleanData.unitQuantity || isNaN(cleanData.unitQuantity)) delete cleanData.unitQuantity;
      if (!cleanData.unit || cleanData.unit === '') delete cleanData.unit;

      if (id) {
        await updateProduct(id, cleanData);
      } else {
        await addProduct(cleanData);
      }
      navigate('/productos');
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Detergentes',
    'Suavizantes',
    'Blanqueadores',
    'Quitamanchas',
    'Jabones',
    'Desinfectantes',
    'Otros',
    'Accesorios'
  ];

  const units = ['Litros', 'ml', 'kg', 'gramos', 'metros', 'cm', 'Unidades', 'Paquetes', 'Cajas'];

  // Agregar "Lavandería" como primera opción en proveedores
  const supplierOptions = [
    { id: 'lavanderia', name: 'Lavandería' },
    ...suppliers
  ];

  // Formatear precio a formato chileno (punto como separador de miles)
  const formatChileanPrice = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '';
    return value.toLocaleString('es-CL');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">
        {id ? 'Editar Producto' : 'Crear Producto'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="Ej: Detergente Ariel"
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.name && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.name.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">No se permiten números en el nombre</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <input
              type="text"
              {...register('brand')}
              placeholder="Ej: Ariel, Downy, etc."
              maxLength={50}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.brand && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.brand.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Máximo 50 caracteres</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad por Unidad
              </label>
              <input
                type="number"
                step="0.01"
                {...register('unitQuantity', { valueAsNumber: true })}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ej: 3, 5, 10"
              />
              {errors.unitQuantity && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.unitQuantity.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Ej: 3 Litros, 5 kg</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida
              </label>
              <select
                {...register('unit')}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Selecciona unidad</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                max="10000"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {errors.quantity && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.quantity.message}</p>
              )}
              {currentStock > 5000 && currentStock <= 10000 && (
                <p className="mt-1 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ Está ingresando una cantidad elevada de stock
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Máximo 10.000 unidades</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="1"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="10000"
                  min="0"
                  max="10000000"
                  className="w-full pl-8 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.price.message}</p>
              )}
              {currentPrice > 0 && (
                <p className="mt-1 text-xs text-green-600">
                  Precio: ${formatChileanPrice(currentPrice)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Ej: 10000, 25500, 3500</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              {...register('category')}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor *
            </label>
            <select
              {...register('supplier')}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Selecciona un proveedor</option>
              {supplierOptions.map(supplier => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {errors.supplier && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.supplier.message}</p>
            )}
            {selectedSupplier === 'Lavandería' && (
              <p className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                ℹ️ Este producto fue comprado directamente por la lavandería
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-orange-500 text-white py-2.5 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
            >
              {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/productos')}
              className="w-full sm:flex-1 bg-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
