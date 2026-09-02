export interface VehicleDocument {

  id: string;

  title: string;

  type: 'LICENSE' | 'TECHNICAL_CHECK' | 'INSURANCE' | 'VEHICLE_TAX' | 'OTHER';

  fileUrl: string;

  expiryDate: string;

  vehicleId: string;

  vehiclePlateNumber: string;

  uploadedByName: string;

  createdAt: string;

  updatedAt: string;

}