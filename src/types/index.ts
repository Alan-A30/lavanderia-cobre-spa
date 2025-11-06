export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface HistoryRecord {
  id: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'product' | 'supplier' | 'user';
  entityId: string;
  userId: string;
  userName: string;
  timestamp: Date;
  changes?: Record<string, any>;
}