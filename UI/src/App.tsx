
import { gql } from '@apollo/client';
import './App.css'
import { Vehicle } from './interfaces/Vehicle.interface';
import { useQuery } from '@apollo/client/react';

export const VEHICLES_QUERY = gql`
  query ListVehicles {
    vehicles {
      id
      vin
      name
      modelCode
      tractionType
      releaseYear
      batchNumber
      color
      mileage
      status
      createdAt
      updatedAt
    }
  }
`;

type VehiclesQueryResponse = {
  vehicles: Vehicle[];
};

function App() {
  const { data, error, loading } = useQuery<VehiclesQueryResponse>(VEHICLES_QUERY);

  const vehicles = data?.vehicles ?? [];

  if (loading) return <p>Loading..</p>;
  if (error) return <p>Error: {error?.message}</p>;
  
  return (
    <>

      <h1>Vehicles List</h1>
      {vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        <ul>
          {vehicles.map((vehicle) => (
            <li key={vehicle.id}>
              {vehicle.name} - {vehicle.vin} - {vehicle.color}
            </li>
          ))}
        </ul>
      )}

    </>
  )
}

export default App
