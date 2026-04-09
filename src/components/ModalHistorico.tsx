import type { Aluno, PresencaDoc } from '../types';

interface ModalHistoricoProps {
  alunoSelecionado: Aluno | null;
  presencasPorDia: Record<string, PresencaDoc[]>;
  onClose: () => void;
}

export function ModalHistorico({ alunoSelecionado, presencasPorDia, onClose }: ModalHistoricoProps) {
  if (!alunoSelecionado) return null;

  const renderEmoji = (status?: string) => {
    if (status === 'P') return '✅';
    if (status === 'F') return '❌';
    return '-';
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Histórico de Presença</h3>
            <p className="text-sm text-gray-500">{alunoSelecionado.nome}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-purple-50 rounded-lg">
                <th className="p-3 text-sm font-bold text-purple-800 text-left rounded-l-lg border-b-2 border-purple-100">Data</th>
                <th className="p-3 text-sm font-bold text-purple-800 border-b-2 border-purple-100">1ª Chamada</th>
                <th className="p-3 text-sm font-bold text-purple-800 border-b-2 border-purple-100">2ª Chamada</th>
                <th className="p-3 text-sm font-bold text-purple-800 rounded-r-lg border-b-2 border-purple-100">3ª Chamada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(presencasPorDia)
                .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
                .map(([data, chamadas]) => {
                  
                  const status1 = chamadas.find(c => c.chamada === '1')?.lista[alunoSelecionado.id];
                  const status2 = chamadas.find(c => c.chamada === '2')?.lista[alunoSelecionado.id];
                  const status3 = chamadas.find(c => c.chamada === '3')?.lista[alunoSelecionado.id];

                  const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');

                  return (
                    <tr key={data} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm text-gray-700 font-medium text-left">
                        {dataFormatada}
                      </td>
                      <td className="p-3 text-lg">{renderEmoji(status1)}</td>
                      <td className="p-3 text-lg">{renderEmoji(status2)}</td>
                      <td className="p-3 text-lg">{renderEmoji(status3)}</td>
                    </tr>
                  )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl font-bold transition-all shadow-sm shadow-purple-200"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}