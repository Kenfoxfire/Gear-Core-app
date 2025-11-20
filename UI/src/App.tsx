import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { VehicleDetailPage } from "./pages/VehicleDetailPage";
import { VehicleCreatePage } from "./pages/VehicleCreatePage";
import { VehicleEditPage } from "./pages/VehicleEditPage";
import { UsersPage } from "./pages/UsersPage";
import { ReportPage } from "./pages/ReportPage";

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/vehicles" replace />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <Layout>
              <VehiclesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicles/new"
        element={
          <ProtectedRoute>
            <Layout>
              <VehicleCreatePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicles/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <VehicleDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vehicles/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <VehicleEditPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Layout>
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        }
      />


      <Route path="*" element={<Navigate to="/vehicles" replace />} />
    </Routes>
  );
};
