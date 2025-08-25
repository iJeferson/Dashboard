import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const location = useLocation();

  const navItems = [
    { path: "/cadastro", label: "Cadastro" },
    { path: "/dashboard", label: "Dashboard" },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md w-full">
        <h1 className="font-bold text-lg md:text-xl tracking-wide">
          📊 Consórcio Bahia Digital
        </h1>
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`transition-colors duration-200 ${
                location.pathname === item.path
                  ? "font-semibold border-b-2 border-white"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1 w-full p-4 md:p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-200 text-gray-700 text-sm text-center py-3 w-full shadow-inner">
        © {new Date().getFullYear()} Consórcio Bahia Digital — Todos os direitos reservados.
      </footer>
    </div>
  );
}
