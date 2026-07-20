export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  adminId: string;
  adminName: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
}