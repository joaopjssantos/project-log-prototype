'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Briefcase, Lock, Shield, Laptop, Smartphone, MapPin, Building, Loader2, Save, CheckCircle2 } from 'lucide-react';

// IMPORTAÇÕES DO FIREBASE
import { auth } from '../firebase';
import { onAuthStateChanged, updateProfile, updatePassword, User as FirebaseUser } from 'firebase/auth';

export default function PerfilPage() {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Campos do Formulário
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('(81) 90000-0000'); // Placeholder
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setNome(currentUser.displayName || 'JP');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // 1. Atualiza o Nome se foi alterado
            if (nome !== user.displayName) {
                await updateProfile(user, { displayName: nome });
            }

            // 2. Atualiza a Senha se os campos foram preenchidos
            if (senha || confirmarSenha) {
                if (senha !== confirmarSenha) {
                    setMessage({ type: 'error', text: 'As senhas não coincidem.' });
                    setSaving(false);
                    return;
                }
                if (senha.length < 6) {
                    setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
                    setSaving(false);
                    return;
                }
                await updatePassword(user, senha);
            }

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setSenha('');
            setConfirmarSenha('');

            // Limpa a mensagem de sucesso após 3 segundos
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);

        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                setMessage({ type: 'error', text: 'Por segurança, faça login novamente para trocar a senha.' });
            } else {
                setMessage({ type: 'error', text: 'Erro ao atualizar o perfil. Tente novamente.' });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#E60014]" size={40} /></div>;
    }

    // Pega a inicial do nome para o Avatar
    const inicial = nome ? nome.charAt(0).toUpperCase() : 'U';

    return (
        <div className="flex flex-col gap-6 p-2 md:p-0">
            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Meu Perfil</h1>
                    <p className="text-slate-500 font-medium text-xs md:text-sm italic">Gerencie suas informações, segurança e preferências</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto justify-center bg-[#E60014] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </button>
            </div>

            {/* MENSAGEM DE ALERTA (Sucesso/Erro) */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <Shield size={20} />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUNA ESQUERDA: CARD DE IDENTIFICAÇÃO */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center h-fit">
                    <div className="w-28 h-28 bg-slate-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-4 relative">
                        <span className="text-4xl font-black text-slate-400">{inicial}</span>
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" title="Online"></div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{nome}</h2>
                    <p className="text-[11px] font-bold text-[#E60014] uppercase tracking-widest mt-1 mb-6">Administrador</p>

                    <div className="w-full border-t border-slate-100 pt-6 flex flex-col gap-3 text-left">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                            <Building size={18} className="text-slate-400" /> Prototype Logística
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                            <MapPin size={18} className="text-slate-400" /> Cabo de Santo Agostinho, PE
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: FORMULÁRIOS */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* INFORMAÇÕES PESSOAIS */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                            <User className="text-[#E60014]" size={18} /> Informações Pessoais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#E60014] transition-all text-slate-700"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail Corporativo</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telefone</label>
                                <input
                                    type="text"
                                    value={telefone}
                                    onChange={(e) => setTelefone(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#E60014] transition-all text-slate-700"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargo</label>
                                <input
                                    type="text"
                                    value="Administrador"
                                    disabled
                                    className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEGURANÇA */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                            <Lock className="text-[#E60014]" size={18} /> Segurança
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nova Senha</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#E60014] transition-all text-slate-700"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#E60014] transition-all text-slate-700"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}