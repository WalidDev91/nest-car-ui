import { MissionVehiclePhoto } from './mission-vehicle-photo';


export interface MissionVehicleInspection {

  id: string;

  inspectionDate: string;

  notes: string;

  mileage: number;

  fuelLevel: number;

  missionId: string;

  missionTitle: string;

  createdAt: string;

  updatedAt: string;

  photos: MissionVehiclePhoto[];

}