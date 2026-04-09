import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { Turma } from '../types';

export function Monitor() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState('turma_1');
  const [dataChamada, setDataChamada] = useState(new Date().toISOString().split('T')[0]);
  const [chamadaSelecionada, setChamadaSelecionada] = useState<'1' | '2' | '3'>('1');

  const [presencasLocais, setPresencasLocais] = useState<Record<string, 'P' | 'F'>>({});
  const [salvando, setSalvando] = useState(false);
  const [chamadaJaSalva, setChamadaJaSalva] = useState(false);

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

  useEffect(() => {
    setPresencasLocais({}); 
    setChamadaJaSalva(false);

    const buscarChamadaExistente = async () => {
      const docId = `${dataChamada}_${turmaId}_${chamadaSelecionada}`;
      const docRef = doc(db, 'presencas', docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPresencasLocais(docSnap.data().lista);
        setChamadaJaSalva(true);
      }
    };

    buscarChamadaExistente();
  }, [dataChamada, turmaId, chamadaSelecionada]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const marcarPresenca = (alunoId: string, status: 'P' | 'F') => {
    setPresencasLocais(prev => ({
      ...prev,
      [alunoId]: status
    }));
  };

  const salvarNoBanco = async () => {
    setSalvando(true);
    try {
      const docId = `${dataChamada}_${turmaId}_${chamadaSelecionada}`;
      await setDoc(doc(db, 'presencas', docId), {
        data: dataChamada,
        turmaId: turmaId,
        chamada: chamadaSelecionada,
        lista: presencasLocais,
        atualizadoEm: new Date().toISOString()
      });
      
      alert(chamadaJaSalva ? 'Chamada atualizada com sucesso!' : 'Chamada finalizada com sucesso!');
      
      if (!chamadaJaSalva) {
        if (chamadaSelecionada === '1') setChamadaSelecionada('2');
        else if (chamadaSelecionada === '2') setChamadaSelecionada('3');
        else setPresencasLocais({});
      }

    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar chamada.');
    } finally {
      setSalvando(false);
    }
  };

  const turmaAtual = turmas.find(t => t.id === turmaId);

  const totalMarcadosNaTurma = turmaAtual 
    ? turmaAtual.alunos.filter(aluno => presencasLocais[aluno.id]).length 
    : 0;

  const todosMarcados = turmaAtual && turmaAtual.alunos.length > 0 && totalMarcadosNaTurma === turmaAtual.alunos.length;
  
  const botaoDesabilitado = salvando || !todosMarcados;

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-24">
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
              <option value="1">1ª</option>
              <option value="2">2ª</option>
              <option value="3">3ª</option>
            </select>
          </div>
        </section>

        {chamadaJaSalva && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-2xl text-sm font-medium text-center shadow-sm">
            ✅ Esta chamada já foi salva no sistema. Faça alterações apenas se necessário.
          </div>
        )}

        <main className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between">
            <p className="text-sm text-gray-500 font-medium font-mono uppercase tracking-wider">
              Alunos ({turmaAtual?.alunos.length || 0})
            </p>
            <p className="text-sm text-gray-400 font-medium italic">
              Marcados: {totalMarcadosNaTurma}
            </p>
          </div>
          
          <ul className="divide-y">
            {turmaAtual?.alunos.map(aluno => (
              <li key={aluno.id} className="p-4 flex justify-between items-center transition-colors hover:bg-gray-50">
                <span className="text-gray-700 font-medium pr-2">{aluno.nome}</span>
                <div className="flex gap-2 shrink-0">
                   <button 
                    onClick={() => marcarPresenca(aluno.id, 'P')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-90
                      ${presencasLocais[aluno.id] === 'P' 
                        ? 'bg-green-600 text-white scale-105' 
                        : 'bg-gray-100 text-gray-400'}`}
                   >P</button>
                   
                   <button 
                    onClick={() => marcarPresenca(aluno.id, 'F')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-90
                      ${presencasLocais[aluno.id] === 'F' 
                        ? 'bg-red-600 text-white scale-105' 
                        : 'bg-gray-100 text-gray-400'}`}
                   >F</button>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex flex-col items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {!todosMarcados && totalMarcadosNaTurma > 0 && (
          <p className="text-xs text-orange-500 mb-2 font-medium">
            Faltam {turmaAtual!.alunos.length - totalMarcadosNaTurma} alunos para finalizar.
          </p>
        )}
        <button
          onClick={salvarNoBanco}
          disabled={botaoDesabilitado}
          className={`w-full max-w-md py-4 rounded-xl font-bold text-white transition-all active:scale-95
            ${botaoDesabilitado 
              ? 'bg-gray-300 cursor-not-allowed' 
              : chamadaJaSalva ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'}`}
        >
          {salvando ? 'Salvando...' : chamadaJaSalva ? 'Atualizar Chamada' : 'Finalizar Chamada'}
        </button>
      </footer>
    </div>
  );
}