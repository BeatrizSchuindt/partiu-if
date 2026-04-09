import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { Aluno, Turma, PresencaDoc } from '../types';
import { ModalHistorico } from '../components/ModalHistorico';

export function Coordenacao() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<'relatorios' | 'turmas'>('relatorios');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState('turma_1');
  const [novoAluno, setNovoAluno] = useState('');

  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7));
  const [todasPresencas, setTodasPresencas] = useState<PresencaDoc[]>([]);

  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);

  useEffect(() => {
    const unsubscribeTurmas = onSnapshot(collection(db, 'turmas'), (snapshot) => {
      const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Turma[];
      setTurmas(lista);
    });

    const unsubscribePresencas = onSnapshot(collection(db, 'presencas'), (snapshot) => {
      const lista = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      })) as PresencaDoc[];
      setTodasPresencas(lista);
    });

    return () => {
      unsubscribeTurmas();
      unsubscribePresencas();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const adicionarAluno = async () => {
    if (novoAluno.trim() === '') return;
    const turmaRef = doc(db, 'turmas', turmaId);
    await updateDoc(turmaRef, {
      alunos: arrayUnion({ id: crypto.randomUUID(), nome: novoAluno, ativo: true })
    });
    setNovoAluno('');
  };

  const removerAluno = async (aluno: Aluno) => {
    if (!window.confirm(`Remover ${aluno.nome} da turma? O histórico de faltas será perdido.`)) return;
    const turmaRef = doc(db, 'turmas', turmaId);
    await updateDoc(turmaRef, {
      alunos: arrayRemove(aluno)
    });
  };

  const turmaAtual = turmas.find(t => t.id === turmaId);

  const presencasTurmaMes = todasPresencas.filter(
    p => p.turmaId === turmaId && p.data.startsWith(mesSelecionado)
  );

  const presencasPorDia = presencasTurmaMes.reduce((acc, p) => {
    if (!acc[p.data]) acc[p.data] = [];
    acc[p.data].push(p);
    return acc;
  }, {} as Record<string, PresencaDoc[]>);

  const relatorio = turmaAtual?.alunos.map(aluno => {
    let faltasNoMes = 0;

    Object.values(presencasPorDia).forEach(chamadasDoDia => {
      const faltouNesteDia = chamadasDoDia.some(chamada => chamada.lista[aluno.id] === 'F');
      if (faltouNesteDia) {
        faltasNoMes++;
      }
    });

    return {
      ...aluno,
      faltasNoMes
    };
  }).sort((a, b) => a.nome.localeCompare(b.nome)) || [];

  const obterStatusFalta = (faltas: number) => {
    if (faltas >= 3) {
      return { classe: 'bg-red-50 border-red-200 text-red-700', texto: 'Bolsa cancelada no mês', badge: 'bg-red-500' };
    }
    if (faltas === 1 || faltas === 2) {
      return { classe: 'bg-yellow-50 border-yellow-200 text-yellow-800', texto: '1 ou 2 faltas para cancelar a bolsa no mês', badge: 'bg-yellow-500' };
    }
    return { classe: 'bg-green-50 border-green-200 text-green-700', texto: 'Regular (0 faltas)', badge: 'bg-green-500' };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-10">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-purple-600">Coordenação</h1>
        <button onClick={handleLogout} className="text-red-500 font-semibold text-sm">Sair</button>
      </header>

      <nav className="flex gap-2 mb-6">
        <button 
          onClick={() => setAbaAtiva('relatorios')} 
          className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-sm ${abaAtiva === 'relatorios' ? 'bg-purple-600 text-white' : 'bg-white text-gray-500'}`}
        >
          Relatórios
        </button>
        <button 
          onClick={() => setAbaAtiva('turmas')} 
          className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-sm ${abaAtiva === 'turmas' ? 'bg-purple-600 text-white' : 'bg-white text-gray-500'}`}
        >
          Gerenciar
        </button>
      </nav>

      <main className="bg-white p-6 rounded-2xl shadow-sm">
        <select 
          value={turmaId} 
          onChange={(e) => setTurmaId(e.target.value)} 
          className="w-full p-3 border rounded-xl mb-6 outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 font-medium"
        >
          {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>

        {abaAtiva === 'relatorios' ? (
          <div className="space-y-4">
            
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border">
              <label className="text-sm font-bold text-gray-600">Mês de Referência:</label>
              <input 
                type="month" 
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
                className="p-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
              />
            </div>

            {presencasTurmaMes.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed">
                <span className="text-4xl mb-3">📅</span>
                <p className="text-gray-500 font-medium text-center">Sem registro de Faltas nesse mês.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="p-4 font-bold text-gray-600 uppercase text-xs">Aluno</th>
                      <th className="p-4 font-bold text-gray-600 uppercase text-xs text-center">Faltas (Dias)</th>
                      <th className="p-4 font-bold text-gray-600 uppercase text-xs">Status da Bolsa</th>
                      <th className="p-4 font-bold text-gray-600 uppercase text-xs text-center">Detalhes</th> {/* NOVA COLUNA */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {relatorio.map((aluno) => {
                      const status = obterStatusFalta(aluno.faltasNoMes);
                      
                      return (
                        <tr key={aluno.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-800">{aluno.nome}</td>
                          <td className="p-4 font-black text-xl text-center text-gray-700">
                            {aluno.faltasNoMes}
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${status.classe}`}>
                              <span className={`w-2 h-2 rounded-full ${status.badge}`}></span>
                              {status.texto}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => setAlunoSelecionado(aluno)}
                              className="text-purple-600 hover:text-purple-800 hover:underline font-bold text-sm transition-colors"
                            >
                              Ver Histórico
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800">Gerenciar Alunos</h2>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nome do aluno" 
                className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" 
                value={novoAluno}
                onChange={(e) => setNovoAluno(e.target.value)}
              />
              <button 
                onClick={adicionarAluno} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-xl font-bold transition-colors active:scale-95"
              >
                +
              </button>
            </div>

            <ul className="divide-y border-t mt-4">
              {turmaAtual?.alunos.map(aluno => (
                <li key={aluno.id} className="py-4 flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{aluno.nome}</span>
                  <button 
                    onClick={() => removerAluno(aluno)} 
                    className="text-red-500 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    REMOVER
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <ModalHistorico 
        alunoSelecionado={alunoSelecionado} 
        presencasPorDia={presencasPorDia} 
        onClose={() => setAlunoSelecionado(null)} 
      />

    </div>
  );
}