import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { UserRole } from '../types';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const role = userDocSnap.data().role as UserRole;
        
        console.log(`Login efetuado. Redirecionando para painel: ${role}`);
        
        if (role === 'coordenacao') {
          navigate('/coordenacao');
        } else if (role === 'monitor') {
          navigate('/monitor');
        } else {
           setErro('Perfil de usuário inválido.');
           await auth.signOut();
        }
      } else {
        setErro('Usuário sem perfil configurado no banco de dados.');
        await auth.signOut();
      }
      
   } catch (error) {
      console.error(error);
      
      const firebaseError = error as FirebaseError;

      if (firebaseError.code === 'auth/invalid-credential') {
        setErro('E-mail ou senha incorretos. Tente novamente.');
      } else {
        setErro('Erro ao fazer login. Verifique sua conexão.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-green-600 mb-2">PartiuIF</h1>
          <p className="text-gray-500">Controle de Presença</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="monitor@partiuif.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className={`w-full text-white font-bold py-3 rounded-lg transition-colors shadow-md active:scale-[0.98] 
              ${carregando ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  );
}