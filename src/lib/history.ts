import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

interface HistoryData {
  action: 'create' | 'update' | 'delete' | 'remove_stock' | 'add_stock';
  entityType: 'product' | 'supplier' | 'user';
  entityId: string;
  userId: string;
  userName: string;
  changes?: Record<string, any>;
  entityName?: string;
}

export async function addHistoryRecord(data: HistoryData) {
  try {
    await addDoc(collection(db, 'history'), {
      ...data,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding history record:', error);
  }
}