import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"

export default function Cadastro() {
  const [postos, setPostos] = useState([])
  const [editando, setEditando] = useState(null)

  // todos os campos do banco
  const initialForm = {
    posto_atendimento: "",
    tipo_posto: "",
    localidade: "",
    ponto_atendimento_cin: "",
    qtd_atendentes: "",
    qtd_horas_atendimento: "",
    qtd_atendimento: "",
    media_atendimento_dia_util: "",
    media_atendimento_atendente: "",
    tma_minutos: "",
    capacidade_estimado: "",
    qtd_atendimento_por_atendente: "",
    icm_percent: "",
    tx_ociosidade_percent: ""
  }

  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    fetchPostos()
  }, [])

  async function fetchPostos() {
    const { data, error } = await supabase.from("postos_atendimento").select("*").order("id")
    if (!error) setPostos(data)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editando) {
      await supabase.from("postos_atendimento").update(form).eq("id", editando)
      setEditando(null)
    } else {
      await supabase.from("postos_atendimento").insert([form])
    }
    setForm(initialForm)
    fetchPostos()
  }

  async function handleDelete(id) {
    await supabase.from("postos_atendimento").delete().eq("id", id)
    fetchPostos()
  }

  function handleEdit(posto) {
    setEditando(posto.id)
    setForm(posto)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Cadastro de Postos</h2>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 bg-white p-4 rounded shadow mb-6">
        {Object.keys(initialForm).map((field) => (
          <input
            key={field}
            className="border p-2 rounded"
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field}
          />
        ))}
        <button type="submit" className="col-span-3 bg-indigo-600 text-white py-2 rounded">
          {editando ? "Salvar Alterações" : "Adicionar"}
        </button>
      </form>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full border bg-white rounded shadow text-xs">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2 border">Posto</th>
              <th className="p-2 border">Tipo</th>
              <th className="p-2 border">Localidade</th>
              <th className="p-2 border">Qtd Atendentes</th>
              <th className="p-2 border">Qtd Atendimentos</th>
              <th className="p-2 border">Média Dia Útil</th>
              <th className="p-2 border">Média por Atendente</th>
              <th className="p-2 border">TMA</th>
              <th className="p-2 border">Capacidade</th>
              <th className="p-2 border">ICM %</th>
              <th className="p-2 border">Ociosidade %</th>
              <th className="p-2 border">Criado em</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {postos.map((p) => (
              <tr key={p.id} className="even:bg-gray-50">
                <td className="p-2 border">{p.posto_atendimento}</td>
                <td className="p-2 border">{p.tipo_posto}</td>
                <td className="p-2 border">{p.localidade}</td>
                <td className="p-2 border">{p.qtd_atendentes}</td>
                <td className="p-2 border">{p.qtd_atendimento}</td>
                <td className="p-2 border">{p.media_atendimento_dia_util}</td>
                <td className="p-2 border">{p.media_atendimento_atendente}</td>
                <td className="p-2 border">{p.tma_minutos}</td>
                <td className="p-2 border">{p.capacidade_estimado}</td>
                <td className="p-2 border">{p.icm_percent}%</td>
                <td className="p-2 border">{p.tx_ociosidade_percent}%</td>
                <td className="p-2 border">{new Date(p.criado_em).toLocaleDateString()}</td>
                <td className="p-2 border">
                  <button onClick={() => handleEdit(p)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-600 text-white rounded">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
