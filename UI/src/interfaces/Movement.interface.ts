import { Vehicle } from "./Vehicle.interface";

export interface Movement {
    ID: number;
    VehicleID: number;
    Vehicle?: Vehicle;
    Type: string;
    Description: string;
    OccurredAt: string;
    Metadata: { [key: string]: any };
    CreatedBy: number;
    CreatedAt: string;
}