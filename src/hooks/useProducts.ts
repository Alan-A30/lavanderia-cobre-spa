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
import { Product } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { addHistoryRecord } from '@/lib/history';
import { COLLECTIONS } from '@/lib/collections';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.products), orderBy('createdAt', 'desc'));
    
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
      const docRef = await addDoc(collection(db, COLLECTIONS.products), {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await addHistoryRecord({
        action: 'create',
        entityType: 'product',
        entityId: docRef.id,
        entityName: productData.name,
        userId: user!.uid,
        userName: user!.displayName,
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

  const updateProduct = async (id: string, productData: Partial<Product>, isRestock: boolean = false) => {
    try {
      const product = products.find(p => p.id === id);
      const productName = product?.name || 'Producto';

      const productRef = doc(db, COLLECTIONS.products, id);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: Timestamp.now(),
      });

      // Si es restock, registrar como add_stock
      if (isRestock && 'quantity' in productData && product) {
        const previousQuantity = product.quantity;
        const newQuantity = productData.quantity!;
        const difference = newQuantity - previousQuantity;

        await addHistoryRecord({
          action: 'add_stock',
          entityType: 'product',
          entityId: id,
          entityName: productName,
          userId: user!.uid,
          userName: user!.displayName,
          changes: { 
            previousQuantity,
            newQuantity,
            quantityAdded: difference
          },
        });
      } else {
        // Actualización normal
        await addHistoryRecord({
          action: 'update',
          entityType: 'product',
          entityId: id,
          entityName: productName,
          userId: user!.uid,
          userName: user!.displayName,
          changes: productData,
        });
      }

      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      const productName = product?.name || 'Producto';

      await deleteDoc(doc(db, COLLECTIONS.products, id));

      await addHistoryRecord({
        action: 'delete',
        entityType: 'product',
        entityId: id,
        entityName: productName,
        userId: user!.uid,
        userName: user!.displayName,
      });

      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
      throw error;
    }
  };

  const removeFromInventory = async (id: string, quantity: number, productName: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) {
        toast.error('Producto no encontrado');
        return;
      }

      const newQuantity = product.quantity - quantity;
      if (newQuantity < 0) {
        toast.error('No puedes retirar más de lo disponible');
        return;
      }

      const productRef = doc(db, COLLECTIONS.products, id);
      await updateDoc(productRef, {
        quantity: newQuantity,
        updatedAt: Timestamp.now(),
      });

      await addHistoryRecord({
        action: 'remove_stock',
        entityType: 'product',
        entityId: id,
        entityName: productName,
        userId: user!.uid,
        userName: user!.displayName,
        changes: { 
          previousQuantity: product.quantity,
          newQuantity,
          quantityRemoved: quantity
        },
      });

      toast.success('Stock retirado exitosamente');
    } catch (error) {
      console.error('Error removing from inventory:', error);
      toast.error('Error al retirar del inventario');
      throw error;
    }
  };

  const addToInventory = async (id: string, quantity: number, productName: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) {
        toast.error('Producto no encontrado');
        return;
      }

      const newQuantity = product.quantity + quantity;

      const productRef = doc(db, COLLECTIONS.products, id);
      await updateDoc(productRef, {
        quantity: newQuantity,
        updatedAt: Timestamp.now(),
      });

      await addHistoryRecord({
        action: 'add_stock',
        entityType: 'product',
        entityId: id,
        entityName: productName,
        userId: user!.uid,
        userName: user!.displayName,
        changes: { 
          previousQuantity: product.quantity,
          newQuantity,
          quantityAdded: quantity
        },
      });

      toast.success('Stock agregado exitosamente');
    } catch (error) {
      console.error('Error adding to inventory:', error);
      toast.error('Error al agregar al inventario');
      throw error;
    }
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, removeFromInventory, addToInventory };
}
