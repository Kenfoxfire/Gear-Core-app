export interface Role {
    ID: number;
    Name: string;
    CreatedAt: string;
}

export interface User {
    ID: number;
    Email: string;
    PasswordHash: string;
    RoleID: number;
    Role?: Role;
    CreatedAt: string;
}
