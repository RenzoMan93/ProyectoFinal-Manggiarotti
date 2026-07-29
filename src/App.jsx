import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ReportDetail from './pages/ReportDetail';
import NewReport from './pages/NewReport';
import MyReports from './pages/MyReports';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categoria/:category" element={<CategoryPage />} />
          <Route path="/reporte/:id" element={<ReportDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route
            path="/nuevo-reporte"
            element={
              <ProtectedRoute>
                <NewReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-reportes"
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
