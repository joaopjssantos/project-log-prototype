'use client';

import React, { useEffect, useState } from 'react';
import { Users, Key, ShieldCheck, UserPlus, Search, X, Loader2, MoreHorizontal } from 'lucide-react';

export default function AdminPage() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Estado do formulário de novo usuário
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        password: '', // Senha provisória para o primeiro acesso
        cargo: 'Operador Logístico',
        unidade: 'CD Recife'
    });

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://prototype-log-backend-268059657803.southamerica-east1.run.app/api/usuarios');
            const data = await response.json();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // Função de criação via Backend
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const response = await fetch('https://prototype-log-backend-268059657803.southamerica-east1.run.app/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setIsModalOpen(false);
                setFormData({ nome: '', email: '', password: '', cargo: 'Operador Logístico', unidade: 'CD Recife' });
                fetchUsuarios(); // Atualiza a tabela
                alert('Usuário criado com sucesso!');
            } else {
                alert(`Erro: ${data.erro || data.detalhes}`);
            }
        } catch (error: any) {
            alert(`Erro na comunicação: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    const ativosCount = usuarios.filter(u => u.status === 'ATIVO').length;

    return (
        <div className="flex flex-col gap-6 p-2 md:p-0">
            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Painel Administrativo</h1>
                    <p className="text-slate-500 font-medium text-xs md:text-sm italic">Gestão de acessos, usuários e permissões do sistema</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto justify-center bg-[#E60014] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
                >
                    <UserPlus size={20} /> NOVO USUÁRIO
                </button>
            </div>

            {/* CARDS DE RESUMO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Usuários Ativos</p>
                        <h3 className="text-3xl font-black text-slate-800">{loading ? '-' : ativosCount}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                        <Users size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Acessos Pendentes</p>
                        <h3 className="text-3xl font-black text-orange-500">0</h3>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                        <Key size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Níveis de Permissão</p>
                        <h3 className="text-3xl font-black text-slate-800">3</h3>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                        <ShieldCheck size={24} />
                    </div>
                </div>
            </div>

            {/* TABELA DE USUÁRIOS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-slate-800 text-sm border-b-2 border-[#E60014] pb-1">Todos os Usuários</h3>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar usuário..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-[#E60014] transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Cargo / Nível</th>
                                <th className="px-6 py-4">Unidade Base</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-10 font-bold text-slate-400 animate-pulse">Carregando quadro...</td></tr>
                            ) : usuarios.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 font-bold text-slate-400">Nenhum usuário cadastrado.</td></tr>
                            ) : (
                                usuarios.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{user.nome}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-600">{user.cargo}</td>
                                        <td className="px-6 py-4 text-slate-500">{user.unidade}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                                                {user.status || 'ATIVO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            <button className="hover:text-slate-600 p-1"><MoreHorizontal size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE NOVO USUÁRIO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <UserPlus className="text-[#E60014]" /> Novo Colaborador
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-200 p-1.5 rounded-full"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                                <input required type="text" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#E60014] transition-all"
                                    value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: João Silva" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">E-mail Profissional</label>
                                <input required type="email" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#E60014] transition-all"
                                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="joao@log.com" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Senha Provisória</label>
                                <input required type="text" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#E60014] transition-all"
                                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Ex: Mudar@123" />
                                <span className="text-[10px] text-slate-400">O usuário poderá alterar depois.</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cargo</label>
                                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                                        value={formData.cargo} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}>
                                        <option>Operador Logístico</option>
                                        <option>Motorista</option>
                                        <option>Coordenador</option>
                                        <option>Administrador</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Unidade</label>
                                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                                        value={formData.unidade} onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}>
                                        <option>CD Recife</option>
                                        <option>CD Suape</option>
                                        <option>CD Itaquera</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={isSending} className="w-full bg-[#E60014] text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-red-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                                {isSending ? <><Loader2 className="animate-spin" size={18} /> Cadastrando...</> : 'Criar Acesso'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}