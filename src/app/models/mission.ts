import { MissionVehicleInspection } from './mission-vehicle-inspection';
//import { MissionVehiclePhoto } from './mission-vehicle-photo';
import { MissionDocument } from './mission-document';



export interface Mission {


  id: string;

  title: string;

  description: string;

  startDate: string;

  endDate: string;


  status:
  | 'PLANNED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';



  // ==========================
  // ASSIGNMENT
  // ==========================

  driverId?: string;

  driverName?: string;


  vehicleId?: string;

  vehiclePlateNumber?: string;




  // ==========================
  // DOCUMENT VERIFICATION
  // ==========================

  documentsVerified?: boolean;

  documentsVerificationDate?: string;




  // ==========================
  // DOCUMENTS
  // ==========================

  documents?: MissionDocument[];




  // ==========================
  // INSPECTION
  // ==========================

  vehicleInspection?: MissionVehicleInspection | null;



  // ==========================
  // AUDIT
  // ==========================

  createdAt: string;

  updatedAt: string;


}