import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProducts } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useSuppliers';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  quantity: z.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  category: z.string().min(1, 'La categoría es requerida'),
  supplier: z.string().min(1, 'El proveedor es requerido'),
  brand: z.string().min(1, 'La marca es requerida'),
  unit: z.string().min(1, 'La unidad de medida es requerida'),
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
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (id) {
      const product = products.find(p => p.id === id);
      if (product) {
        reset({
          name: product.name,
          quantity: product.quantity,
          price: product.price,
          category: product.category,
          supplier: product.supplier,
          brand: product.brand || '',
          unit: product.unit || '',
        });
      }
    }
  }, [id, products, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      if (id) {
        await updateProduct(id, data);
      } else {
        await addProduct(data);
      }
      navigate('/productos');
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Detergentes', 'Suavizantes', 'Blanqueadores', 'Accesorios', 'Otros'];
  const units = [
    'Litros (L)',
    'Mililitros (ml)',
    'Kilogramos (kg)',
    'Gramos (g)',
    'Metros (m)',
    'Centímetros (cm)',
    'Unidades (un)',
    'Paquetes (paq)',
    'Cajas (caj)'
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {id ? 'Editar Producto' : 'Crear Producto'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                {...register('brand')}
                placeholder="Ej: Tide, Ariel, Clorox"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida *
              </label>
              <select
                {...register('unit')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Selecciona una unidad</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor *
            </label>
            <select
              {...register('supplier')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Selecciona un proveedor</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {errors.supplier && (
              <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/productos')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}