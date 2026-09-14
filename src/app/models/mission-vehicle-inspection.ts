import { MissionVehiclePhoto } from './mission-vehicle-photo';

export interface MissionVehicleInspection {

  id: string;

  inspectionType: 'BEFORE' | 'AFTER';

  inspectionDate: string;

  notes: string;

  mileage: number;

  fuelLevel: number;

  tirePressure: string;

  oilChange: string;

  waterCheck: string;

  partsCondition: string;

  repairStatus: string;

  accidentOccurred: boolean;

  createdAt: string;

  updatedAt: string;

  photos: MissionVehiclePhoto[];
}