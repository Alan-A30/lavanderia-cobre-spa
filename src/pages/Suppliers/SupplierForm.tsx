import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Smartphone, Phone } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';

const supplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string()
    .min(1, 'El teléfono es requerido')
    .regex(/^\+569\d{8}$|^\+56[2-9]\d{8}$/, 'Formato de teléfono inválido'),
  address: z.string().min(1, 'La dirección es requerida'),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SupplierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { suppliers, addSupplier, updateSupplier } = useSuppliers();
  const [loading, setLoading] = useState(false);
  const [phoneType, setPhoneType] = useState<'mobile' | 'landline'>('mobile');
  const [phoneValue, setPhoneValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  useEffect(() => {
    if (id) {
      const supplier = suppliers.find(s => s.id === id);
      if (supplier) {
        reset({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
        });
        setPhoneValue(supplier.phone);
        // Detect phone type from existing number
        if (supplier.phone.startsWith('+569')) {
          setPhoneType('mobile');
        } else {
          setPhoneType('landline');
        }
      }
    }
  }, [id, suppliers, reset]);

  const formatPhoneDisplay = (phone: string): string => {
    if (!phone) return '';
    // Remove +56 prefix for display
    const cleaned = phone.replace(/^\+56/, '');
    if (phoneType === 'mobile') {
      // Format: 9 XXXX XXXX
      return cleaned.replace(/(\d)(\d{4})(\d{4})/, '$1 $2 $3');
    } else {
      // Format: 2 XXXX XXXX (or other area codes)
      return cleaned.replace(/(\d)(\d{4})(\d{4})/, '$1 $2 $3');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove all non-digit characters except +
    const cleaned = input.replace(/[^\d+]/g, '');

    // Build the formatted number based on type
    let formatted = '';
    if (phoneType === 'mobile') {
      // Mobile: +569XXXXXXXX
      const digits = cleaned.replace(/^\+56/, '').replace(/^9/, '');
      if (digits.length > 0) {
        formatted = '+569' + digits.slice(0, 8);
      } else {
        formatted = '+569';
      }
    } else {
      // Landline: +56XXXXXXXXX
      const digits = cleaned.replace(/^\+56/, '');
      if (digits.length > 0) {
        const areaCode = digits[0] || '2';
        formatted = '+56' + areaCode + digits.slice(1, 9);
      } else {
        formatted = '+562';
      }
    }

    setPhoneValue(formatted);
    setValue('phone', formatted, { shouldValidate: true });
  };

  const handlePhoneTypeChange = (type: 'mobile' | 'landline') => {
    setPhoneType(type);
    // Reset phone value when changing type
    const newValue = type === 'mobile' ? '+569' : '+562';
    setPhoneValue(newValue);
    setValue('phone', newValue, { shouldValidate: true });
  };

  const onSubmit = async (data: SupplierFormData) => {
    setLoading(true);
    try {
      if (id) {
        await updateSupplier(id, data);
      } else {
        await addSupplier(data);
      }
      navigate('/proveedores');
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {id ? 'Editar Proveedor' : 'Crear Proveedor'}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proveedor *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>

            {/* Phone Type Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => handlePhoneTypeChange('mobile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  phoneType === 'mobile'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Smartphone size={16} />
                <span>Móvil</span>
              </button>
              <button
                type="button"
                onClick={() => handlePhoneTypeChange('landline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  phoneType === 'landline'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Phone size={16} />
                <span>Fijo</span>
              </button>
            </div>

            <input
              type="tel"
              value={phoneValue}
              onChange={handlePhoneChange}
              placeholder={phoneType === 'mobile' ? '+569 XXXX XXXX' : '+562 XXXX XXXX'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            {phoneValue && phoneValue.length > 4 && (
              <p className="mt-1 text-sm text-gray-600">
                Vista previa: +56 {formatPhoneDisplay(phoneValue)}
              </p>
            )}

            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
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
              onClick={() => navigate('/proveedores')}
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
