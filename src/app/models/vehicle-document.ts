export interface VehicleDocument {
  id: string;
  title: string;
  type: 'LICENSE' | 'TECHNICAL_CHECK' | 'INSURANCE';
  fileUrl: string;
  year: number;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
}