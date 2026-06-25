export interface Mission {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehiclePlateNumber: string;
  createdAt: string;
  updatedAt: string;
}