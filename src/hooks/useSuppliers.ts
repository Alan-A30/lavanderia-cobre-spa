import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Supplier } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { addHistoryRecord } from '@/lib/history';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'suppliers'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const suppliersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Supplier[];
      
      setSuppliers(suppliersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching suppliers:', error);
      toast.error('Error al cargar proveedores');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'suppliers'), {
        ...supplierData,
        createdAt: Timestamp.now(),
      });

      await addHistoryRecord({
        action: 'create',
        entityType: 'supplier',
        entityId: docRef.id,
        userId: user!.uid,
        userName: user!.displayName,
        changes: supplierData,
      });

      toast.success('Proveedor creado exitosamente');
      return docRef.id;
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Error al crear proveedor');
      throw error;
    }
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    try {
      const supplierRef = doc(db, 'suppliers', id);
      await updateDoc(supplierRef, supplierData);

      await addHistoryRecord({
        action: 'update',
        entityType: 'supplier',
        entityId: id,
        userId: user!.uid,
        userName: user!.displayName,
        changes: supplierData,
      });

      toast.success('Proveedor actualizado exitosamente');
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error('Error al actualizar proveedor');
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'suppliers', id));

      await addHistoryRecord({
        action: 'delete',
        entityType: 'supplier',
        entityId: id,
        userId: user!.uid,
        userName: user!.displayName,
      });

      toast.success('Proveedor eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Error al eliminar proveedor');
      throw error;
    }
  };

  return { suppliers, loading, addSupplier, updateSupplier, deleteSupplier };
}