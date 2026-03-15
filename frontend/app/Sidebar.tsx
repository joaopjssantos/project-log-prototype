import './globals.css';
import Sidebar from './components/Sidebar'; // Ajuste o caminho dependendo de onde você salvou o arquivo!

export const metadata = {
    title: 'Prototype Logística',
    description: 'Sistema de gestão logística e chamados',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className="bg-slate-50 text-slate-900 font-sans min-h-screen">

                {/* Aqui entra o nosso menu inteligente */}
                <Sidebar />

                {/* Aqui entra o conteúdo das páginas. O md:ml-64 empurra o conteúdo pro lado só no PC! */}
                <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
                    {children}
                </main>

            </body>
        </html>
    );
}