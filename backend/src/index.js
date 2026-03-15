const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// Inicializa o Firebase e guarda a conexão na variável 'appFirebase'
const appFirebase = admin.initializeApp();

// Conecta aos recursos que você já criou no Google Cloud
const db = getFirestore(appFirebase, 'bd-prototype-log');
const bucket = getStorage(appFirebase).bucket('prototype-log-comprovantes');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Multer (guarda a foto temporariamente na memória RAM)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limite generoso de 5MB por foto/PDF
});

// ROTA DE TESTE (Ping)
app.get('/api/ping', (req, res) => res.send('Pong! Conectado ao bd-prototype-log e Storage prontos.'));

// ROTA DE LEITURA (Puxa os dados para a tabela)
app.get('/api/chamados', async (req, res) => {
    try {
        // Traz ordenado pelos mais recentes (se o campo criado_em existir)
        const snapshot = await db.collection('chamados').orderBy('criado_em', 'desc').get();
        const chamados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(chamados);
    } catch (e) {
        console.error("Erro na leitura:", e);
        // Fallback: se der erro de índice por causa do orderBy, busca normal
        try {
            const fallbackSnapshot = await db.collection('chamados').get();
            const fallbackChamados = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.json(fallbackChamados);
        } catch (fallbackError) {
            res.status(500).json({ erro: "Erro na leitura", detalhes: fallbackError.message });
        }
    }
});

// ==========================================
// ROTAS DE USUÁRIOS (ADMINISTRAÇÃO)
// ==========================================

// 1. LISTAR TODOS OS USUÁRIOS
app.get('/api/usuarios', async (req, res) => {
    try {
        const snapshot = await db.collection('usuarios').orderBy('criado_em', 'desc').get();
        const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(usuarios);
    } catch (e) {
        console.error("Erro na leitura de usuários:", e);
        // Fallback caso o índice de ordenação ainda não exista
        try {
            const fallback = await db.collection('usuarios').get();
            res.json(fallback.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            res.status(500).json({ erro: "Erro na leitura", detalhes: err.message });
        }
    }
});

// 2. CRIAR NOVO USUÁRIO INTERNAMENTE
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nome, email, password, cargo, unidade } = req.body;

        // A. Cria a conta de login oficial no Firebase Auth (Sem deslogar você)
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: nome,
        });

        // B. Salva a "Ficha do Funcionário" no banco de dados para a sua tabela
        await db.collection('usuarios').doc(userRecord.uid).set({
            nome: nome,
            email: email,
            cargo: cargo,
            unidade: unidade,
            status: "ATIVO",
            criado_em: new Date().toISOString()
        });

        res.status(201).json({ uid: userRecord.uid });
    } catch (e) {
        console.error("Erro ao criar usuário:", e);
        res.status(500).json({ erro: "Erro ao criar usuário", detalhes: e.message });
    }
});

// ROTA DE UPLOAD DA FOTO (A Mágica do Storage sem bloqueios)
app.post('/api/upload', upload.single('comprovativo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ erro: 'Nenhum ficheiro enviado.' });

        // Cria um nome único e limpo para o ficheiro
        const nomeLimpo = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
        const nomeFicheiro = `entregas/${Date.now()}-${nomeLimpo}`;
        const fileRef = bucket.file(nomeFicheiro);

        // Envia para o Cloud Storage
        await fileRef.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype }
        });

        // Como o Bucket inteiro já foi liberado no terminal para leitura pública,
        // NÃO usamos mais o fileRef.makePublic() aqui. Apenas montamos a URL final:
        const urlPublica = `https://storage.googleapis.com/${bucket.name}/${nomeFicheiro}`;

        console.log("Upload feito com sucesso:", urlPublica);
        res.status(200).json({ url: urlPublica });

    } catch (e) {
        console.error("Erro interno no upload:", e);
        res.status(500).json({ erro: "Erro ao guardar foto", detalhes: e.message });
    }
});

// ROTA DE REGISTRO (Salva o chamado na prancheta com o link da foto, se houver)
app.post('/api/chamados', async (req, res) => {
    try {
        const dados = req.body;

        const docRef = await db.collection('chamados').add({
            motorista: dados.motorista || "Sem Nome",
            destino: dados.destino || "Sem Destino",
            unidade: dados.unidade || "CD Recife",
            prioridade: dados.prioridade || "Média",
            comprovativoUrl: dados.comprovativoUrl || null, // O link da foto vem para cá
            status: "PENDENTE",
            criado_em: new Date().toISOString()
        });

        console.log("Novo chamado registrado:", docRef.id);
        res.status(201).json({ id: docRef.id });

    } catch (e) {
        console.error("Erro na gravação do Firestore:", e);
        res.status(500).json({ erro: "Erro na gravação", detalhes: e.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));