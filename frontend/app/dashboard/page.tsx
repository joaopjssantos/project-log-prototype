'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCcw, Headset, CheckCircle2, AlertTriangle, Truck, MapPin, Loader2, Navigation } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardPage() {
  const [chamados, setChamados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unidade, setUnidade] = useState('Todas'); // Filtro de Unidade

  const fetchChamados = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://prototype-log-backend-268059657803.southamerica-east1.run.app/api/chamados');
      const data = await response.json();
      setChamados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChamados();
  }, []);

  // ==========================================
  // CÁLCULO DE INDICADORES (KPIs)
  // ==========================================
  const chamadosFiltrados = unidade === 'Todas' ? chamados : chamados.filter(c => c.unidade === unidade);

  const abertos = chamadosFiltrados.filter(c => c.status === 'PENDENTE').length;
  const resolvidos = chamadosFiltrados.filter(c => c.status === 'CONCLUÍDO').length;
  const criticos = chamadosFiltrados.filter(c => c.prioridade === 'Alta' && c.status === 'PENDENTE').length;
  const total = abertos + resolvidos;
  const taxaResolucao = total > 0 ? Math.round((resolvidos / total) * 100) : 0;

  // ==========================================
  // DADOS PARA O GRÁFICO (Agrupados por prioridade)
  // ==========================================
  const dataGrafico = [
    { name: 'Baixa', quantidade: chamadosFiltrados.filter(c => c.prioridade === 'Baixa').length, color: '#3b82f6' },
    { name: 'Média', quantidade: chamadosFiltrados.filter(c => c.prioridade === 'Média').length, color: '#f59e0b' },
    { name: 'Alta', quantidade: chamadosFiltrados.filter(c => c.prioridade === 'Alta').length, color: '#ef4444' },
  ];

  // Pegar os últimos 5 motoristas com chamados pendentes
  const motoristasEmRota = chamadosFiltrados
    .filter(c => c.status === 'PENDENTE' && c.motorista)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 p-2 md:p-0">
      {/* CABEÇALHO E FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm italic">Monitoramento Real-Time da Operação</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex-1 md:flex-none flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UNIDADE / CD</span>
            <select
              className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
            >
              <option value="Todas">Todas as Unidades</option>
              <option value="CD Recife">CD Recife</option>
              <option value="CD Suape">CD Suape</option>
              <option value="CD Itaquera">CD Itaquera</option>
            </select>
          </div>
          <button
            onClick={fetchChamados}
            className="bg-[#E60014] text-white p-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            title="Atualizar Dados"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* LINHA 1: CARDS DE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Headset size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chamados Abertos</p>
            <h3 className="text-2xl font-black text-slate-800">{loading ? '-' : abertos}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full text-green-600"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolvidos</p>
            <h3 className="text-2xl font-black text-slate-800">{loading ? '-' : resolvidos}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-full text-red-600"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alertas Críticos</p>
            <h3 className="text-2xl font-black text-slate-800">{loading ? '-' : criticos}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxa de Resolução</p>
            <span className="text-sm font-black text-[#E60014]">{loading ? '-' : taxaResolucao}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-[#E60014] h-2 rounded-full transition-all duration-1000" style={{ width: `${taxaResolucao}%` }}></div>
          </div>
        </div>
      </div>

      {/* LINHA 2: GRÁFICO E LISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* GRÁFICO (Ocupa 2 colunas) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-4 bg-[#E60014] rounded-full"></div>
            <h3 className="font-bold text-slate-800">Volume por Prioridade (Abertos)</h3>
          </div>

          <div className="flex-1 min-h-[250px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
            ) : total === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Nenhum dado para exibir</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="quantidade" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {dataGrafico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* LISTA DE MOTORISTAS (Ocupa 1 coluna) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Truck className="text-slate-400" size={18} /> Motoristas em Rota
          </h3>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[250px] pr-2">
            {loading ? (
              <p className="text-center text-slate-400 text-sm py-4">Carregando...</p>
            ) : motoristasEmRota.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-500 text-sm font-medium">Pátio limpo. Nenhuma rota pendente.</p>
              </div>
            ) : (
              motoristasEmRota.map((chamado, idx) => (
                <div key={idx} className="bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-3 flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-slate-700 shadow-sm">
                      {chamado.motorista ? chamado.motorista.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{chamado.motorista}</p>
                      <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                        <MapPin size={10} /> {chamado.destino}
                      </p>
                    </div>
                  </div>
                  <div title="Em trânsito">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}