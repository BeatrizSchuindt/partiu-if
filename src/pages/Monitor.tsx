import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { Turma } from '../types';

export function Monitor() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState('turma_1');
  const [dataChamada, setDataChamada] = useState(new Date().toISOString().split('T')[0]);
  const [chamadaSelecionada, setChamadaSelecionada] = useState<'1' | '2' | '3'>('1');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'turmas'), (snapshot) => {
      const listaTurmas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Turma[];
      setTurmas(listaTurmas);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const turmaAtual = turmas.find(t => t.id === turmaId);

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
        <h1 className="text-xl font-bold text-green-600">PartiuIF: Monitor</h1>
        <button onClick={handleLogout} className="text-red-500 font-semibold text-sm">Sair</button>
      </header>

      <div className="space-y-4">
        <section className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
          <select 
            value={turmaId} 
            onChange={(e) => setTurmaId(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
          >
            {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>

          <div className="flex gap-2">
            <input 
              type="date" 
              value={dataChamada}
              onChange={(e) => setDataChamada(e.target.value)}
              className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500" 
            />
            <select 
              value={chamadaSelecionada}
              onChange={(e) => setChamadaSelecionada(e.target.value as '1' | '2' | '3')}
              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="1">1ª Chamada</option>
              <option value="2">2ª Chamada</option>
              <option value="3">3ª Chamada</option>
            </select>
          </div>
        </section>

        {/*Lista de Alunos*/}
        <main className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm text-gray-500 font-medium">LISTA DE ALUNOS ({turmaAtual?.alunos.length || 0})</p>
          </div>
          <ul className="divide-y">
            {turmaAtual?.alunos.map(aluno => (
              <li key={aluno.id} className="p-4 flex justify-between items-center">
                <span className="text-gray-700 font-medium">{aluno.nome}</span>
                <div className="flex gap-2">
                   <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-xs active:bg-green-600 active:text-white transition-all">P</button>
                   <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-xs active:bg-red-600 active:text-white transition-all">F</button>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}