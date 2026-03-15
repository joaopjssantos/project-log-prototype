'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Clock, CheckCircle2, AlertCircle, Plus, Ticket, Loader2, X, Paperclip, ExternalLink } from 'lucide-react';

export default function ChamadosPage() {
    const [chamados, setChamados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para o Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Estados do Formulário
    const [formData, setFormData] = useState({
        motorista: '',
        destino: '',
        prioridade: 'Média',
        unidade: 'CD Recife'
    });
    // NOVO: Estado para guardar o arquivo da foto
    const [foto, setFoto] = useState<File | null>(null);

    const fetchChamados = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://prototype-log-backend-268059657803.southamerica-east1.run.app/api/chamados');
            const data = await response.json();
            setChamados(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            setChamados([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchChamados(); }, []);

    // Função de envio com suporte a FOTO (Duas etapas: 1º Sobe a foto, 2º Salva os dados)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            let urlComprovante = null;

            // ETAPA 1: Se o usuário escolheu uma foto, enviamos ela pro Cloud Storage primeiro
            if (foto) {
                const formDataFoto = new FormData();
                formDataFoto.append('comprovativo', foto); // O nome tem que bater com o upload.single('comprovativo') do backend

                const resFoto = await fetch('https://prototype-log-backend-268059657803.southamerica-east1.run.app/api/upload', {
                    method: 'POST',
                    body: formDataFoto
                });

                if (!resFoto.ok) {
                    const erroFoto = await resFoto.json();
                    throw new Error(erroFoto.erro || "Falha ao enviar a foto para o Storage.");
                }

                const dataFoto = await resFoto.json();
                urlComprovante = dataFoto.url; // Pegamos o link público da foto gerado pelo Google
            }

            // ETAPA 2: Enviamos os dados do chamado + o link da foto para o Firestore
            const response = await fetch('https://prototype-log-backend-268059657803.southamerica-east1.run.app/api/chamados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    comprovativoUrl: urlComprovante, // Salvamos o link junto!
                    status: 'PENDENTE'
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                // Sucesso Total!
                setIsModalOpen(false);
                setFormData({ motorista: '', destino: '', prioridade: 'Média', unidade: 'CD Recife' });
                setFoto(null); // Limpa o arquivo selecionado
                fetchChamados(); // Atualiza a tabela
            } else {
                alert(`🚨 ERRO DO SERVIDOR: ${responseData.erro || responseData.details}`);
            }
        } catch (error: any) {
            console.error(error);
            alert(`Erro na operação: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    const listaSegura = Array.isArray(chamados) ? chamados : [];

    return (
        <div className="flex flex-col gap-6 relative">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Central de Chamados</h1>
                    <p className="text-slate-500 font-medium text-sm italic">Gestão de tickets e suporte operacional</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#E60014] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
                >
                    <Plus size={20} /> NOVO CHAMADO
                </button>
            </div>

            {/* Tabela Principal */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Motorista</th>
                                <th className="px-6 py-4">Destino</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Prioridade</th>
                                <th className="px-6 py-4">Comprovante</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-10 font-bold text-slate-400 animate-pulse">Carregando dados...</td></tr>
                            ) : listaSegura.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 font-bold text-slate-400">Nenhum chamado encontrado.</td></tr>
                            ) : listaSegura.map((item, i) => (
                                <tr key={item.id || i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{item.motorista || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{item.destino || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                                            {item.status || 'PENDENTE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.prioridade || 'Média'}</td>
                                    <td className="px-6 py-4">
                                        {/* NOVO: Exibe o link do comprovante se existir */}
                                        {item.comprovativoUrl ? (
                                            <a
                                                href={item.comprovativoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg w-fit transition-colors"
                                            >
                                                <ExternalLink size={14} /> Ver Foto
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 text-xs font-medium">Sem anexo</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE ENTRADA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <Plus className="text-[#E60014]" /> Novo Chamado
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nome do Motorista</label>
                                <input
                                    required
                                    type="text"
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#E60014]/20 focus:border-[#E60014] transition-all"
                                    placeholder="Ex: Carlos Silva"
                                    value={formData.motorista}
                                    onChange={(e) => setFormData({ ...formData, motorista: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cidade de Destino</label>
                                <input
                                    required
                                    type="text"
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#E60014]/20 focus:border-[#E60014] transition-all"
                                    placeholder="Ex: Recife, PE"
                                    value={formData.destino}
                                    onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Unidade</label>
                                    <select
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                                        value={formData.unidade}
                                        onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                                    >
                                        <option>CD Recife</option>
                                        <option>CD Suape</option>
                                        <option>CD Itaquera</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prioridade</label>
                                    <select
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                                        value={formData.prioridade}
                                        onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                                    >
                                        <option>Baixa</option>
                                        <option>Média</option>
                                        <option>Alta</option>
                                    </select>
                                </div>
                            </div>

                            {/* NOVO CAMPO: ANEXAR COMPROVANTE */}
                            <div className="flex flex-col gap-1.5 mt-2 border-t border-slate-100 pt-4">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Paperclip size={14} /> Anexar Comprovante (Opcional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-50 file:text-[#E60014] hover:file:bg-red-100 transition-all cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full bg-[#E60014] text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-red-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-red-200 disabled:opacity-50"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {foto ? 'Enviando Foto e Dados...' : 'Registrando na Prancheta...'}
                                    </>
                                ) : 'Registrar na Prancheta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}