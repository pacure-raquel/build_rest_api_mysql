export interface User {
    username: string;
    email: string;
    password: string;
}

export interface UnitUser extends User {
    id: number;
}

export interface Users {
    [key: string]: UnitUser;
}