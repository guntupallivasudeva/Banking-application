export interface UserModel {
    id?: string;
    name: string | undefined;
    email: string | undefined;
    password: string | undefined;
    role?: 'customer' | 'admin';
}
