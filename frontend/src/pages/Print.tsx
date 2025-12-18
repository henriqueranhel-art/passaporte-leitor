import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelectedChild, useChildren, useStore } from '../lib/store';
import { statsApi, booksApi } from '../lib/api';
import { Card, Button, Modal } from '../components/ui';
import { GENRES } from '../lib/types';

export default function PrintPage() {
  const children = useChildren();
  const selectedChild = useSelectedChild();
  const { setSelectedChild } = useStore();
  const [showCertificate, setShowCertificate] = useState(false);
  const [showPassport, setShowPassport] = useState(false);

  const child = selectedChild || children[0];

  const { data: stats } = useQuery({
    queryKey: ['childStats', child?.id],
    queryFn: () => statsApi.getChildStats(child!.id),
    enabled: !!child,
  });

  const { data: booksData } = useQuery({
    queryKey: ['childBooks', child?.id],
    queryFn: () => booksApi.getByChild(child!.id),
    enabled: !!child,
  });

  // Only show finished books in the passport
  const books = (booksData?.books || []).filter((book: any) => book.status === 'finished');

  const printItems = [
    {
      id: 'certificate',
      icon: '🏆',
      name: 'Certificado de Conquista',
      desc: 'Celebrar marcos importantes',
      action: () => setShowCertificate(true),
    },
    {
      id: 'passport',
      icon: '📖',
      name: 'Página do Passaporte',
      desc: 'Carimbos dos livros lidos',
      action: () => setShowPassport(true),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">🖨️ Centro de Impressão</h1>
        <p className="text-gray-500">
          Materiais físicos para complementar a experiência digital.
        </p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <Card className="mb-6">
          <p className="text-sm font-medium mb-3 text-gray-800">Imprimir para:</p>
          <div className="flex gap-3">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-80 cursor-pointer ${child?.id === c.id
                  ? 'ring-2 ring-primary bg-primary/10'
                  : 'bg-gray-100'
                  }`}
              >
                <span className="text-2xl">{c.avatar}</span>
                <span className="font-medium">{c.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Print Items */}
      <div className="grid grid-cols-2 gap-4">
        {printItems.map((item) => (
          <Card key={item.id} hover onClick={item.action}>
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-bold mb-1 text-gray-800">{item.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
            <Button variant="primary" size="sm" className="w-full">
              Pré-visualizar
            </Button>
          </Card>
        ))}
      </div>

      {/* Tip */}
      <Card
        className="mt-6"
        style={{ backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }}
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <p className="font-bold mb-1 text-gray-800">Porquê materiais físicos?</p>
            <p className="text-sm text-gray-600">
              O passaporte físico é a estrela da experiência! A criança pode decorá-lo,
              mostrar aos amigos e sentir orgulho tangível nas suas conquistas. O
              digital é apenas um apoio para registar rapidamente.
            </p>
          </div>
        </div>
      </Card>

      {/* Certificate Modal */}
      {showCertificate && child && (
        <CertificateModal
          child={child}
          stats={stats}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Passport Modal */}
      {showPassport && child && (
        <PassportModal
          child={child}
          books={books}
          onClose={() => setShowPassport(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// CERTIFICATE MODAL
// ============================================================================

function CertificateModal({
  child,
  stats,
  onClose,
}: {
  child: { id: string; name: string; avatar: string };
  stats: any;
  onClose: () => void;
}) {
  const handlePrint = () => window.print();

  return (
    <Modal isOpen onClose={onClose} title="🏆 Certificado de Explorador" size="lg">
      {/* Certificate Preview */}
      <div
        className="print-area aspect-[1.4/1] rounded-lg p-8 flex flex-col items-center justify-center text-center mb-6"
        style={{
          backgroundColor: '#FDF6E3',
          border: '8px double #E67E22',
        }}
      >
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold mb-2 text-primary">
          CERTIFICADO DE EXPLORADOR
        </h2>
        <p className="text-gray-500 mb-6">Passaporte do Leitor</p>

        <p className="text-lg mb-2 text-gray-800">Este certificado é atribuído a</p>
        <p className="text-4xl font-bold mb-2 text-gray-800">
          {child.name} {child.avatar}
        </p>
        <p className="text-xl mb-4 text-primary">
          {stats?.level.current.icon} {stats?.level.current.name}
        </p>

        <div className="px-8 py-3 rounded-full bg-success text-white font-bold text-lg mb-6">
          🎉 {stats?.books.read || 0} Livros Lidos!
        </div>

        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('pt-PT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <div className="mt-6 pt-4 border-t border-dashed w-48 border-gray-300">
          <p className="text-xs text-gray-400">Assinatura do Explorador</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 no-print">
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="primary" onClick={handlePrint} className="flex-1">
          🖨️ Imprimir Certificado
        </Button>
      </div>
    </Modal>
  );
}

// ============================================================================
// PASSPORT MODAL
// ============================================================================

function PassportModal({
  child,
  books,
  onClose,
}: {
  child: { id: string; name: string; avatar: string };
  books: any[];
  onClose: () => void;
}) {
  const handlePrint = () => window.print();

  return (
    <Modal isOpen onClose={onClose} title="📖 Página do Passaporte" size="lg">
      {/* Passport Preview */}
      <div
        className="print-area aspect-[1/1.4] rounded-lg p-6 mb-6"
        style={{
          backgroundColor: '#FDF6E3',
          border: '4px solid #E67E22',
        }}
      >
        {/* Header */}
        <div
          className="text-center border-b-2 border-dashed pb-4 mb-4"
          style={{ borderColor: '#E67E22' }}
        >
          <h3 className="font-bold text-lg text-primary">📚 Passaporte do Leitor</h3>
          <p className="text-sm text-gray-800">
            {child.name} {child.avatar}
          </p>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => {
            const book = books[i];
            const genre = book ? GENRES[book.genre as keyof typeof GENRES] : null;

            return (
              <div
                key={i}
                className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2"
                style={{
                  borderColor: book ? genre?.color : '#ddd',
                  backgroundColor: book ? genre?.mapColor : 'transparent',
                }}
              >
                {book ? (
                  <>
                    <span className="text-2xl mb-1">{genre?.icon}</span>
                    <p className="text-xs font-bold text-center line-clamp-2 text-gray-800">
                      {book.title}
                    </p>
                    {book.finishDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(book.finishDate).toLocaleDateString('pt-PT')}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-2xl opacity-30">📖</span>
                    <p className="text-xs text-gray-300 mt-1">Carimbo</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="text-center mt-4 pt-4 border-t-2 border-dashed"
          style={{ borderColor: '#E67E22' }}
        >
          <p className="text-xs text-gray-400">
            Página 1 • Total: {books.length} livros
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 no-print">
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="primary" onClick={handlePrint} className="flex-1">
          🖨️ Imprimir Página
        </Button>
      </div>
    </Modal>
  );
}
