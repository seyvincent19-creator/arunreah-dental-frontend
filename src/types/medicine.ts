export interface Medicine {
  id: number;
  medicine_code: string;
  medicine_name: string;
  category: string;
  unit: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface MedicinePayload {
  medicine_name: string;
  category: string;
  unit: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
  status?: 'active' | 'inactive';
}
