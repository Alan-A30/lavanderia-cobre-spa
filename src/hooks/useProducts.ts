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
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { addHistoryRecord } from '@/lib/history';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[];
      
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await addHistoryRecord({
        action: 'create',
        entityType: 'product',
        entityId: docRef.id,
        userId: user!.uid,
        userName: user!.displayName,
        entityName: productData.name,
        changes: productData,
      });

      toast.success('Producto creado exitosamente');
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error al crear producto');
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const productRef = doc(db, 'products', id);
      
      const productDoc = await getDoc(productRef);
      const productName = productDoc.data()?.name || '';

      await updateDoc(productRef, {
        ...productData,
        updatedAt: Timestamp.now(),
      });

      await addHistoryRecord({
        action: 'update',
        entityType: 'product',
        entityId: id,
        userId: user!.uid,
        userName: user!.displayName,
        entityName: productName,
        changes: productData,
      });

      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto');
      throw error;
    }
  };

  const removeFromInventory = async (id: string, quantityToRemove: number, productName: string) => {
    try {
      const productRef = doc(db, 'products', id);
      const productDoc = await getDoc(productRef);
      const currentQuantity = productDoc.data()?.quantity || 0;
      const newQuantity = currentQuantity - quantityToRemove;

      await updateDoc(productRef, {
        quantity: newQuantity,
        updatedAt: Timestamp.now(),
      });

      await addHistoryRecord({
        action: 'remove_stock',
        entityType: 'product',
        entityId: id,
        userId: user!.uid,
        userName: user!.displayName,
        entityName: productName,
        changes: { 
          quantityRemoved: quantityToRemove,
          previousQuantity: currentQuantity,
          newQuantity: newQuantity
        },
      });

      toast.success(`Se retiraron ${quantityToRemove} unidades de ${productName}`);
    } catch (error) {
      console.error('Error removing from inventory:', error);
      toast.error('Error al retirar del inventario');
      throw error;
    }
  };

  const addToInventory = async (id: string, quantityToAdd: number, productName: string) => {
    try {
      const productRef = doc(db, 'products', id);
      const productDoc = await getDoc(productRef);
      const currentQuantity = productDoc.data()?.quantity || 0;
      const newQuantity = currentQuantity + quantityToAdd;

      await updateDoc(productRef, {
        quantity: newQuantity,
        updatedAt: Timestamp.now(),
      });

      await addHistoryRecord({
        action: 'add_stock',
        entityType: 'product',
        entityId: id,
        userId: user!.uid,
        userName: user!.displayName,
        entityName: productName,
        changes: { 
          quantityAdded: quantityToAdd,
          previousQuantity: currentQuantity,
          newQuantity: newQuantity
        },
      });

      toast.success(`Se agregaron ${quantityToAdd} unidades de ${productName}`);
    } catch (error) {
      console.error('Error adding to inventory:', error);
      toast.error('Error al agregar al inventario');
      throw error;
    }
  };

  const deleteProduct = async (id: string, productName: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));

      await addHistoryRecord({
        action: 'delete',
        entityType: 'product',
        entityId: id,
        userId: user!.uid,
        userName: user!.displayName,
        entityName: productName,
      });

      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
      throw error;
    }
  };

  return { 
    products, 
    loading, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    removeFromInventory,
    addToInventory
  };
}