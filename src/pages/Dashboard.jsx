import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { supabase } from "../supabaseClient";

const ITEMS_PER_PAGE = 10;

const Dashboard = () => {
  const [postos, setPostos] = useState([]);
  const [tipoFilter, setTipoFilter] = useState("");
  const [localidadeFilter, setLocalidadeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPostos = async () => {
      const { data } = await supabase
        .from("postos_atendimento")
        .select("*")
        .order("qtd_atendimento", { ascending: false });
      setPostos(data || []);
    };
    fetchPostos();
  }, []);

  const filteredPostos = postos.filter(
    (p) =>
      (!tipoFilter || p.tipo_posto === tipoFilter) &&
      (!localidadeFilter || p.localidade === localidadeFilter)
  );

  const totalPages = Math.ceil(filteredPostos.length / ITEMS_PER_PAGE);
  const paginatedPostos = filteredPostos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // KPIs
  const totalAtendimentos = filteredPostos.reduce(
    (acc, p) => acc + (p.qtd_atendimento || 0),
    0
  );

  const totalAtendentes = filteredPostos.reduce(
    (acc, p) => acc + (p.qtd_atendentes || 0),
    0
  );

  const mediaTMA = filteredPostos.length
    ? Math.round(
        filteredPostos.reduce((acc, p) => acc + (p.tma_minutos || 0), 0) /
          filteredPostos.length
      )
    : 0;

  const mediaOciosidade = filteredPostos.length
    ? Math.round(
        filteredPostos.reduce(
          (acc, p) => acc + (p.tx_ociosidade_percent || 0),
          0
        ) / filteredPostos.length
      )
    : 0;

  // Top 3 postos
  const top3 = [...filteredPostos]
    .sort((a, b) => (b.qtd_atendimento || 0) - (a.qtd_atendimento || 0))
    .slice(0, 3);

  // Função para calcular capacidade diária (média por atendente * quantidade de atendentes)
  const calcularCapacidadeDiaria = (posto) => {
    const mediaAtendente = posto.media_atendimento_atendente || 0;
    const qtdAtendentes = posto.qtd_atendentes || 0;
    return Math.round(mediaAtendente * qtdAtendentes);
  };

  // Gráficos
  const atendimentosChart = {
    title: { text: "Atendimentos por Posto", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: filteredPostos.map((p) => p.posto_atendimento),
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: [{ type: "value", name: "Atendimentos" }],
    dataZoom: [{ type: "slider", start: 0, end: 100 }, { type: "inside" }],
    series: [
      {
        name: "Atendimentos",
        type: "bar",
        data: filteredPostos.map((p) => p.qtd_atendimento),
        color: "#4CAF50",
      },
    ],
  };

  const eficienciaChart = {
    title: { text: "Eficiência por Posto", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: filteredPostos.map((p) => p.posto_atendimento),
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: [
      { type: "value", name: "ICM %" },
      { type: "value", name: "Ociosidade %", position: "right" },
    ],
    dataZoom: [{ type: "slider", start: 0, end: 100 }, { type: "inside" }],
    series: [
      {
        name: "ICM %",
        type: "line",
        data: filteredPostos.map((p) => p.icm_percent),
        color: "#22c55e",
      },
      {
        name: "Ociosidade %",
        type: "line",
        data: filteredPostos.map((p) => p.tx_ociosidade_percent),
        color: "#ef4444",
      },
    ],
  };

  const top3Chart = {
    title: { text: "Top 3 Postos", left: "center" },
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        name: "Atendimentos",
        type: "pie",
        radius: "50%",
        data: top3.map((p) => ({
          name: p.posto_atendimento,
          value: p.qtd_atendimento,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0,0,0,0.5)",
          },
        },
      },
    ],
  };

  // Novos gráficos solicitados
  const atendentesChart = {
    title: { text: "Quantidade de Atendentes por Posto", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: filteredPostos.map((p) => p.posto_atendimento),
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: [{ type: "value", name: "Atendentes" }],
    dataZoom: [{ type: "slider", start: 0, end: 100 }, { type: "inside" }],
    series: [
      {
        name: "Atendentes",
        type: "bar",
        data: filteredPostos.map((p) => p.qtd_atendentes || 0),
        color: "#3b82f6",
      },
    ],
  };

  const tmaChart = {
    title: {
      text: "TMA (Tempo Médio de Atendimento) por Posto",
      left: "center",
    },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: filteredPostos.map((p) => p.posto_atendimento),
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: [{ type: "value", name: "Minutos" }],
    dataZoom: [{ type: "slider", start: 0, end: 100 }, { type: "inside" }],
    series: [
      {
        name: "TMA",
        type: "bar",
        data: filteredPostos.map((p) => p.tma_minutos || 0),
        color: "#f59e0b",
      },
    ],
  };

  const capacidadeChart = {
    title: { text: "Capacidade Diária Estimada por Posto", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: filteredPostos.map((p) => p.posto_atendimento),
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: [{ type: "value", name: "Capacidade" }],
    dataZoom: [{ type: "slider", start: 0, end: 100 }, { type: "inside" }],
    series: [
      {
        name: "Capacidade",
        type: "bar",
        data: filteredPostos.map((p) => calcularCapacidadeDiaria(p)),
        color: "#8b5cf6",
      },
    ],
  };

  const mediaAtendenteChart = {
    title: { text: "Média de Atendimento por Atendente", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: filteredPostos.map((p) => p.posto_atendimento),
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: [{ type: "value", name: "Atendimentos" }],
    dataZoom: [{ type: "slider", start: 0, end: 100 }, { type: "inside" }],
    series: [
      {
        name: "Média por Atendente",
        type: "bar",
        data: filteredPostos.map((p) => p.media_atendimento_atendente || 0),
        color: "#10b981",
      },
    ],
  };

  const comparativoChart = {
    title: {
      text: "Comparativo Diário: Atendimentos vs Capacidade",
      left: "center",
    },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: filteredPostos.map((p) => p.posto_atendimento),
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: [
      { type: "value", name: "Atendimentos" },
      { type: "value", name: "Capacidade", position: "right" },
    ],
    dataZoom: [{ type: "slider", start: 0, end: 100 }, { type: "inside" }],
    series: [
      {
        name: "Atendimentos",
        type: "bar",
        data: filteredPostos.map((p) => p.qtd_atendimento || 0),
        color: "#4CAF50",
      },
      {
        name: "Capacidade",
        type: "line",
        yAxisIndex: 1,
        data: filteredPostos.map((p) => calcularCapacidadeDiaria(p)),
        color: "#8b5cf6",
      },
    ],
  };

  return (
    <div className="w-full p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="p-2 rounded border border-gray-300 bg-white text-gray-800"
        >
          <option value="">Todos os Tipos</option>
          {[...new Set(postos.map((p) => p.tipo_posto))].map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        <select
          value={localidadeFilter}
          onChange={(e) => setLocalidadeFilter(e.target.value)}
          className="p-2 rounded border border-gray-300 bg-white text-gray-800"
        >
          <option value="">Todas as Localidades</option>
          {[...new Set(postos.map((p) => p.localidade))].map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-indigo-600 text-white p-4 rounded-xl shadow text-center">
          <p>Total Atendimentos</p>
          <h3 className="text-2xl font-bold">{totalAtendimentos}</h3>
        </div>
        <div className="bg-purple-600 text-white p-4 rounded-xl shadow text-center">
          <p>Quantidade de Postos</p>
          <h3 className="text-2xl font-bold">{filteredPostos.length}</h3>
        </div>
        <div className="bg-yellow-600 text-white p-4 rounded-xl shadow text-center">
          <p>Quantidade de Atendentes</p>
          <h3 className="text-2xl font-bold">{totalAtendentes}</h3>
        </div>
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow text-center">
          <p>Média TMA</p>
          <h3 className="text-2xl font-bold">{mediaTMA} min</h3>
        </div>
        <div className="bg-red-600 text-white p-4 rounded-xl shadow text-center">
          <p>Média Ociosidade</p>
          <h3 className="text-2xl font-bold">{mediaOciosidade}%</h3>
        </div>
      </div>

      {/* Tabela com paginação */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow p-4 mb-6">
        <table className="w-full text-sm border-collapse text-gray-800">
          <thead className="bg-indigo-50 text-gray-800">
            <tr>
              <th className="p-2 border">Posto</th>
              <th className="p-2 border">Tipo</th>
              <th className="p-2 border">Localidade</th>
              <th className="p-2 border text-center">Atendimentos</th>
              <th className="p-2 border text-center">Atendentes</th>
              <th className="p-2 border text-center">Média/Atendente</th>
              <th className="p-2 border text-center">Capacidade Diária</th>
              <th className="p-2 border text-center">ICM %</th>
              <th className="p-2 border text-center">Ociosidade %</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPostos.map((p) => (
              <tr key={p.id} className="even:bg-gray-50">
                <td className="p-2 border">{p.posto_atendimento}</td>
                <td className="p-2 border">{p.tipo_posto}</td>
                <td className="p-2 border">{p.localidade}</td>
                <td className="p-2 border text-center">{p.qtd_atendimento}</td>
                <td className="p-2 border text-center">
                  {p.qtd_atendentes || 0}
                </td>
                <td className="p-2 border text-center">
                  {p.media_atendimento_atendente || 0}
                </td>
                <td className="p-2 border text-center">
                  {calcularCapacidadeDiaria(p)}
                </td>
                <td className="p-2 border text-center">{p.icm_percent}%</td>
                <td
                  className={`p-2 border text-center font-bold ${
                    p.tx_ociosidade_percent < 30
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {p.tx_ociosidade_percent}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-2 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 rounded border bg-gray-200"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            {currentPage}/{totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 rounded border bg-gray-200"
          >
            Próximo
          </button>
        </div>
      </div>

      {/* Gráficos */}
      <div className="space-y-6">
        <ReactECharts
          option={atendimentosChart}
          style={{ height: "400px", width: "100%" }}
        />
        <ReactECharts
          option={eficienciaChart}
          style={{ height: "400px", width: "100%" }}
        />
        <ReactECharts
          option={top3Chart}
          style={{ height: "400px", width: "100%" }}
        />

        {/* Novos gráficos */}
        <ReactECharts
          option={atendentesChart}
          style={{ height: "400px", width: "100%" }}
        />
        <ReactECharts
          option={tmaChart}
          style={{ height: "400px", width: "100%" }}
        />
        <ReactECharts
          option={capacidadeChart}
          style={{ height: "400px", width: "100%" }}
        />
        <ReactECharts
          option={mediaAtendenteChart}
          style={{ height: "400px", width: "100%" }}
        />
        <ReactECharts
          option={comparativoChart}
          style={{ height: "400px", width: "100%" }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
