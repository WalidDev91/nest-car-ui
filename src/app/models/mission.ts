export interface Mission {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehiclePlateNumber: string;
  createdAt: string;
  updatedAt: string;
}