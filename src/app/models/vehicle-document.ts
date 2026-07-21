export interface VehicleDocument {
  id: string;
  title: string;
  type: 'LICENSE' | 'TECHNICAL_CHECK' | 'INSURANCE';
  fileUrl: string;
  year: number;
  vehicleId: string;
  vehiclePlateNumber: string;
  createdAt: string;
  updatedAt: string;
}