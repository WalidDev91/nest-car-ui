export interface UserRequest {

  id: string;

  requestNumber: number;

  type:
  | 'PROFILE_CHANGE'
  | 'ROLE_REQUEST'
  | 'DOCUMENT_PROBLEM'
  | 'TECHNICAL_PROBLEM'
  | 'FLEET_PROBLEM'
  | 'OTHER';

  subject: string;

  description: string;

  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

  adminResponse: string | null;

  requesterId: string;

  requesterName: string;

  createdAt: string;

  updatedAt: string;

}