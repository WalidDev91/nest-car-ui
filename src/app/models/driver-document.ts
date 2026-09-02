export interface DriverDocument {

  id: string;

  title: string;

  type: 'DRIVER_LICENSE' | 'ID_CARD';

  fileUrl: string;

  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  expiryDate: string;

  uploadedAt: string;

  validatedAt: string | null;

  driverId: string;

  driverName: string;

  createdAt: string;

  updatedAt: string;

}