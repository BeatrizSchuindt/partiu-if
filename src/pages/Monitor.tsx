import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export function Monitor() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Usuário deslogado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-green-600">Área do Monitor</h1>
        
        <button 
          onClick={handleLogout}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors active:scale-95"
        >
          Sair
        </button>
      </header>

      <main className="bg-white p-6 rounded-2xl shadow-sm">
        <p className="text-gray-600">
          Aqui faremos os filtros de turma e a lista de presença.
        </p>
      </main>

    </div>
  );
}