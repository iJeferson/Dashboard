import { Routes, Route, Link, Navigate } from "react-router-dom";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg md:text-xl">📊 Consórcio Bahia Digital</h1>
        <div className="space-x-4">
          <Link to="/cadastro" className="hover:underline">Cadastro</Link>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        </div>
      </nav>

      {/* Conteúdo */}
      <div className="flex-1 p-4 md:p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}
