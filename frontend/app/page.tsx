'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Clock, CheckCircle2, AlertCircle, Plus, Ticket, Loader2, X, Paperclip, ExternalLink, LogOut, Lock, UserPlus, KeyRound, ArrowLeft } from 'lucide-react';

// IMPORTAÇÕES DO FIREBASE (Adicionadas as funções de Criar e Resetar)
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, User } from 'firebase/auth';

export default function ChamadosPage() {
    // ESTADOS DE AUTENTICAÇÃO
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // NOVO: Controle de qual tela de auth estamos vendo ('login', 'register', 'reset')
    const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authMessage, setAuthMessage] = useState({ type: '', text: '' }); // Guarda erros ou sucessos
    const [isProcessingAuth, setIsProcessingAuth] = useState(false);

    // ESTADOS DO SISTEMA (Tabela e Modal)
    const [chamados, setChamados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [formData, setFormData] = useState({ motorista: '', destino: '', prioridade: 'Média', unidade: 'CD Recife' });
    const [foto, setFoto] = useState<File | null>(null);

    // VERIFICA SE O USUÁRIO ESTÁ LOGADO
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
            if (currentUser) {
                fetchChamados();
            }
        });
        return () => unsubscribe();
    }, []);

    // FUNÇÃO MESTRA DE AUTENTICAÇÃO (Lida com Login, Cadastro e Reset)
    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessingAuth(true);
        setAuthMessage({ type: '', text: '' });

        try {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                // Se der certo, o onAuthStateChanged detecta e muda a tela
            }
            else if (authMode === 'register') {
                await createUserWithEmailAndPassword(auth, email, password);
                // Se der certo, já loga direto
            }
            else if (authMode === 'reset') {
                await sendPasswordResetEmail(auth, email);
                setAuthMessage({ type: 'success', text: 'E-mail de recuperação enviado! Verifique sua caixa de entrada.' });
                setAuthMode('login'); // Volta pro login
                setPassword(''); // Limpa a senha por segurança
            }
        } catch (error: any) {
            // Traduzindo os erros horríveis do Firebase para o usuário
            let msg = 'Ocorreu um erro. Tente novamente.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                msg = 'E-mail ou senha incorretos.';
            } else if (error.code === 'auth/email-already-in-use') {
                msg = 'Este e-mail já está cadastrado no sistema.';
            } else if (error.code === 'auth/weak-password') {
                msg = 'A senha é muito fraca (mínimo de 6 caracteres).';
            } else if (error.code === 'auth/invalid-email') {
                msg = 'Formato de e-mail inválido.';
            }
            setAuthMessage({ type: 'error', text: msg });
        } finally {
            setIsProcessingAuth(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setChamados([]);
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            let urlComprovante = null;

            if (foto) {
                const formDataFoto = new FormData();
                formDataFoto.append('comprovativo', foto);
                const resFoto = await fetch('https://prototype-log-backend-268059657803.southamerica-east1.run.app/api/upload', {
                    method: 'POST',
                    body: formDataFoto
                });
                if (!resFoto.ok) throw new Error("Falha ao enviar a foto.");
                const dataFoto = await resFoto.json();
                urlComprovante = dataFoto.url;
            }

            const response = await fetch('https://prototype-log-backend-268059657803.southamerica-east1.run.app/api/chamados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, comprovativoUrl: urlComprovante, status: 'PENDENTE' })
            });

            if (response.ok) {
                setIsModalOpen(false);
                setFormData({ motorista: '', destino: '', prioridade: 'Média', unidade: 'CD Recife' });
                setFoto(null);
                fetchChamados();
            } else {
                alert(`Erro ao salvar: Verifique o console.`);
            }
        } catch (error: any) {
            alert(`Erro na operação: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-[#E60014]" size={40} /></div>;
    }

    // ==========================================
    // TELA DE AUTENTICAÇÃO (LOGIN / CADASTRO / RESET)
    // ==========================================
    if (!user) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-100 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

                    {/* Ícone e Título Dinâmico */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-50 p-4 rounded-full">
                            {authMode === 'login' && <Lock className="text-[#E60014]" size={32} />}
                            {authMode === 'register' && <UserPlus className="text-[#E60014]" size={32} />}
                            {authMode === 'reset' && <KeyRound className="text-[#E60014]" size={32} />}
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-center text-slate-800 tracking-tight mb-2">
                        {authMode === 'login' ? 'PROJETO LOG' : authMode === 'register' ? 'Criar Conta' : 'Recuperar Senha'}
                    </h1>
                    <p className="text-center text-slate-500 text-sm mb-6 font-medium">
                        {authMode === 'login' ? 'Faça login para acessar o sistema' : authMode === 'register' ? 'Cadastre-se para operar o sistema' : 'Enviaremos um link para o seu e-mail'}
                    </p>

                    {/* Mensagens de Erro ou Sucesso */}
                    {authMessage.text && (
                        <div className={`p-3 rounded-xl text-sm font-bold mb-4 text-center ${authMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {authMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleAuthAction} className="space-y-4">
                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">E-mail</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#E60014]/20 focus:border-[#E60014] transition-all"
                                placeholder="Insira seu e-mail"
                            />
                        </div>

                        {/* Esconde a senha se for a tela de reset */}
                        {authMode !== 'reset' && (
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Senha</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#E60014]/20 focus:border-[#E60014] transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isProcessingAuth}
                            className="w-full bg-[#E60014] text-white py-3.5 rounded-xl font-black uppercase tracking-widest mt-2 hover:bg-red-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-red-200 disabled:opacity-50"
                        >
                            {isProcessingAuth ? <Loader2 className="animate-spin" size={20} /> :
                                authMode === 'login' ? 'Entrar no Sistema' :
                                    authMode === 'register' ? 'Criar Conta' : 'Enviar Link de Recuperação'}
                        </button>
                    </form>

                    {/* Links de Navegação entre as telas */}
                    <div className="mt-6 flex flex-col gap-3 text-center text-sm font-semibold">
                        {authMode === 'login' && (
                            <>
                                <button type="button" onClick={() => { setAuthMode('reset'); setAuthMessage({ type: '', text: '' }); }} className="text-slate-500 hover:text-[#E60014] transition-colors">
                                    Esqueci minha senha
                                </button>
                                <button type="button" onClick={() => { setAuthMode('register'); setAuthMessage({ type: '', text: '' }); }} className="text-slate-500 hover:text-[#E60014] transition-colors">
                                    Não tem conta? <span className="text-[#E60014]">Cadastre-se</span>
                                </button>
                            </>
                        )}

                        {(authMode === 'register' || authMode === 'reset') && (
                            <button type="button" onClick={() => { setAuthMode('login'); setAuthMessage({ type: '', text: '' }); }} className="text-slate-500 hover:text-[#E60014] transition-colors flex items-center justify-center gap-1">
                                <ArrowLeft size={16} /> Voltar para o Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // TELA PRINCIPAL (Se estiver logado - Mantida intacta)
    // ==========================================
    const listaSegura = Array.isArray(chamados) ? chamados : [];

    return (
        <div className="flex flex-col gap-4 md:gap-6 relative p-2 md:p-0">
            {/* Header Responsivo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Central de Chamados</h1>
                    <p className="text-slate-500 font-medium text-xs md:text-sm italic">Gestão de tickets e suporte operacional</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 md:flex-none justify-center bg-[#E60014] text-white px-4 md:px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} /> <span className="hidden md:block">NOVO CHAMADO</span> <span className="md:hidden">NOVO</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
                        title="Sair do sistema"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Tabela Principal (Mobile First) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200">
                            <tr>
                                <th className="px-4 md:px-6 py-4">Motorista</th>
                                <th className="px-4 md:px-6 py-4">Destino</th>
                                <th className="px-4 md:px-6 py-4">Status</th>
                                <th className="px-4 md:px-6 py-4">Prioridade</th>
                                <th className="px-4 md:px-6 py-4">Comprovante</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-10 font-bold text-slate-400 animate-pulse">Carregando dados...</td></tr>
                            ) : listaSegura.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 font-bold text-slate-400">Nenhum chamado encontrado.</td></tr>
                            ) : listaSegura.map((item, i) => (
                                <tr key={item.id || i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 md:px-6 py-4 font-bold text-slate-800">{item.motorista || 'N/A'}</td>
                                    <td className="px-4 md:px-6 py-4 text-slate-600 font-medium">{item.destino || 'N/A'}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                                            {item.status || 'PENDENTE'}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500">{item.prioridade || 'Média'}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        {item.comprovativoUrl ? (
                                            <a
                                                href={item.comprovativoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg w-fit transition-colors"
                                            >
                                                <ExternalLink size={14} /> <span className="hidden md:block">Ver Foto</span><span className="md:hidden">Ver</span>
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 text-[10px] md:text-xs font-medium">Sem anexo</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE ENTRADA (Ajustado para Celular) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">
                        <div className="bg-slate-50 p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <Plus className="text-[#E60014]" /> Novo Chamado
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-200 p-1.5 rounded-full"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nome do Motorista</label>
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
                                <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cidade de Destino</label>
                                <input
                                    required
                                    type="text"
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#E60014]/20 focus:border-[#E60014] transition-all"
                                    placeholder="Ex: Recife, PE"
                                    value={formData.destino}
                                    onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Unidade</label>
                                    <select
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-3 text-sm font-semibold outline-none"
                                        value={formData.unidade}
                                        onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                                    >
                                        <option>CD Recife</option>
                                        <option>CD Suape</option>
                                        <option>CD Itaquera</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prioridade</label>
                                    <select
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-3 text-sm font-semibold outline-none"
                                        value={formData.prioridade}
                                        onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                                    >
                                        <option>Baixa</option>
                                        <option>Média</option>
                                        <option>Alta</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 mt-2 border-t border-slate-100 pt-4">
                                <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Paperclip size={14} /> Anexar Comprovante (Opcional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
                                    className="block w-full text-xs md:text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 md:file:py-2.5 md:file:px-4 file:rounded-xl file:border-0 file:text-xs md:file:text-sm file:font-bold file:bg-red-50 file:text-[#E60014] hover:file:bg-red-100 transition-all cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full bg-[#E60014] text-white py-3.5 md:py-4 rounded-2xl font-black uppercase tracking-widest mt-4 hover:bg-red-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-red-200 disabled:opacity-50 text-sm md:text-base"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        {foto ? 'Enviando...' : 'Registrando...'}
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