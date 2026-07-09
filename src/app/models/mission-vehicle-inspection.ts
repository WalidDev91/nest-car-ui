import { MissionVehiclePhoto } from './mission-vehicle-photo';

export interface MissionVehicleInspection {
  id: string;
  inspectionDate: string;
  mileage: number;
  fuelLevel: number;
  notes: string;
  photos: MissionVehiclePhoto[];
}