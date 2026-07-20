export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'FLEET_MANAGER' | 'DRIVER';
    isValidate: boolean;
    adminId: string;
    adminName: string;
    createdAt: string;
    updatedAt: string;
    imageUrl?: string | null;
}