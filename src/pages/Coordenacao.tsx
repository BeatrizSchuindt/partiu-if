import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Aluno, Turma } from '../types';

export function Coordenacao() {
  const [abaAtiva, setAbaAtiva] = useState<'relatorios' | 'turmas'>('relatorios');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState('turma_1');
  const [novoAluno, setNovoAluno] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'turmas'), (snapshot) => {
      const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Turma[];
      setTurmas(lista);
    });
    return () => unsubscribe();
  }, []);

  const adicionarAluno = async () => {
    if (novoAluno.trim() === '') return;
    const turmaRef = doc(db, 'turmas', turmaId);
    await updateDoc(turmaRef, {
      alunos: arrayUnion({ id: crypto.randomUUID(), nome: novoAluno, ativo: true })
    });
    setNovoAluno('');
  };

  const removerAluno = async (aluno: Aluno) => {
    if (!window.confirm(`Remover ${aluno.nome}?`)) return;
    const turmaRef = doc(db, 'turmas', turmaId);
    await updateDoc(turmaRef, {
      alunos: arrayRemove(aluno)
    });
  };

  const turmaAtual = turmas.find(t => t.id === turmaId);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-6 bg-white p-4 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-purple-600">Coordenação</h1>
      </header>

      <nav className="flex gap-2 mb-6">
        <button onClick={() => setAbaAtiva('relatorios')} className={`flex-1 py-2 rounded-lg font-medium ${abaAtiva === 'relatorios' ? 'bg-purple-600 text-white' : 'bg-white text-gray-500'}`}>Relatórios</button>
        <button onClick={() => setAbaAtiva('turmas')} className={`flex-1 py-2 rounded-lg font-medium ${abaAtiva === 'turmas' ? 'bg-purple-600 text-white' : 'bg-white text-gray-500'}`}>Turmas</button>
      </nav>

      <main className="bg-white p-6 rounded-2xl shadow-sm">
        {abaAtiva === 'relatorios' ? (
          <p className="text-gray-500 italic">Área de relatórios em desenvolvimento.</p>
        ) : (
          <div className="space-y-6">
            <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="w-full p-3 border rounded-xl">
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nome do aluno" 
                className="flex-1 p-3 border rounded-xl outline-none" 
                value={novoAluno}
                onChange={(e) => setNovoAluno(e.target.value)}
              />
              <button onClick={adicionarAluno} className="bg-purple-600 text-white px-6 rounded-xl font-bold">+</button>
            </div>

            <ul className="divide-y border-t">
              {turmaAtual?.alunos.map(aluno => (
                <li key={aluno.id} className="py-3 flex justify-between items-center">
                  <span className="text-gray-700">{aluno.nome}</span>
                  <button onClick={() => removerAluno(aluno)} className="text-red-500 text-xs font-bold">REMOVER</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}