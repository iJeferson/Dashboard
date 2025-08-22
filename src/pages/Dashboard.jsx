import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [postos, setPostos] = useState([]);

  useEffect(() => {
    fetchPostos();
  }, []);

  async function fetchPostos() {
    const { data } = await supabase
      .from("postos_atendimento")
      .select("*")
      .order("id");
    setPostos(data || []);
  }

  // KPIs
  const totalAtendimentos = postos.reduce((acc, p) => acc + (p.qtd_atendimento || 0), 0);
  const mediaTMA = postos.length
    ? Math.round(postos.reduce((acc, p) => acc + (p.tma_minutos || 0), 0) / postos.length)
    : 0;
  const mediaOciosidade = postos.length
    ? Math.round(postos.reduce((acc, p) => acc + (p.tx_ociosidade_percent || 0), 0) / postos.length)
    : 0;
  const postoMaisEficiente = postos.length
    ? postos.reduce((best, p) => (p.icm_percent > (best.icm_percent || 0) ? p : best), {})
        .posto_atendimento
    : "-";

  // Top 3 Postos por Atendimentos
  const top3 = [...postos]
    .sort((a, b) => (b.qtd_atendimento || 0) - (a.qtd_atendimento || 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen w-full bg-gray-100 p-4 md:p-6">
  {/* Logo + Título */}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-4 md:p-6 rounded-2xl shadow-lg text-center">
          <p className="text-sm opacity-80">Total Atendimentos</p>
          <h3 className="text-2xl md:text-3xl font-bold">{totalAtendimentos}</h3>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white p-4 md:p-6 rounded-2xl shadow-lg text-center">
          <p className="text-sm opacity-80">Média TMA (min)</p>
          <h3 className="text-2xl md:text-3xl font-bold">{mediaTMA}</h3>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-4 md:p-6 rounded-2xl shadow-lg text-center">
          <p className="text-sm opacity-80">Média Ociosidade</p>
          <h3 className="text-2xl md:text-3xl font-bold">{mediaOciosidade}%</h3>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-4 md:p-6 rounded-2xl shadow-lg text-center">
          <p className="text-sm opacity-80">Posto Mais Eficiente</p>
          <h3 className="text-lg md:text-xl font-bold">{postoMaisEficiente || "-"}</h3>
        </div>
      </div>

      {/* Conteúdo em grid responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 text-gray-800">
          <h3 className="font-semibold mb-4 text-lg md:text-xl text-gray-700">📋 Detalhes por Posto</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-gray-800">
              <thead className="bg-indigo-50 text-gray-800">
                <tr>
                  <th className="p-2 border text-left">Posto</th>
                  <th className="p-2 border text-left hidden md:table-cell">Tipo</th>
                  <th className="p-2 border text-left hidden lg:table-cell">Localidade</th>
                  <th className="p-2 border text-center">Atend.</th>
                  <th className="p-2 border text-center hidden sm:table-cell">Atendentes</th>
                  <th className="p-2 border text-center">ICM %</th>
                  <th className="p-2 border text-center">Ocios. %</th>
                </tr>
              </thead>
              <tbody>
                {postos.map((p) => (
                  <tr key={p.id} className="even:bg-gray-50 text-gray-800">
                    <td className="p-2 border whitespace-nowrap">{p.posto_atendimento}</td>
                    <td className="p-2 border whitespace-nowrap hidden md:table-cell">{p.tipo_posto}</td>
                    <td className="p-2 border whitespace-nowrap hidden lg:table-cell">{p.localidade}</td>
                    <td className="p-2 border text-center">{p.qtd_atendimento}</td>
                    <td className="p-2 border text-center hidden sm:table-cell">{p.qtd_atendentes}</td>
                    <td className="p-2 border text-center">{p.icm_percent}%</td>
                    <td
                      className={`p-2 border text-center font-bold ${
                        p.tx_ociosidade_percent < 30 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {p.tx_ociosidade_percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráficos */}
        <div className="space-y-6">
          {/* Atendimentos */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg text-gray-800">
            <h3 className="font-semibold mb-4 text-lg md:text-xl text-gray-700">📌 Atendimentos por Posto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={postos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="posto_atendimento" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="qtd_atendimento" name="Qtd Atendimentos" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Eficiência */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg text-gray-800">
            <h3 className="font-semibold mb-4 text-lg md:text-xl text-gray-700">⚖️ Eficiência</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={postos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="posto_atendimento" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="icm_percent" name="ICM %" fill="#22c55e" />
                <Bar dataKey="tx_ociosidade_percent" name="Ociosidade %" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 3 */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg text-gray-800">
            <h3 className="font-semibold mb-4 text-lg md:text-xl text-gray-700">🏆 Top 3 Postos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={top3}
                  dataKey="qtd_atendimento"
                  nameKey="posto_atendimento"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {top3.map((_, index) => (
                    <Cell key={index} fill={["#6366f1", "#22c55e", "#f59e0b"][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}