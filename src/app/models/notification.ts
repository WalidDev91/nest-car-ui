export interface Notification {
    id: string;
    type: 'DOCUMENT_UPLOADED' | 'DOCUMENT_APPROVED' | 'DOCUMENT_REJECTED' | 'DOCUMENT_EXPIRING_SOON' | 'DOCUMENT_EXPIRED' | 'MISSION_ASSIGNED' | 'VEHICLE_ASSIGNED' | 'REQUEST_SUBMITTED' | 'REQUEST_REVIEWED';
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
}