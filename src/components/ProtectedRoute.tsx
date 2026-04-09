import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
  readonly allowedRole: UserRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserRole(userDocSnap.data().role as UserRole);
          } else {
            console.error("User document not found in Firestore.");
            setUserRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Verificando credenciais...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (userRole && userRole !== allowedRole) {
    const redirectPath = userRole === 'coordenacao' ? '/coordenacao' : '/monitor';
    return <Navigate to={redirectPath} replace />;
  }

  if (!userRole) {
     return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500 font-medium p-4 bg-white rounded shadow">Acesso negado: Perfil de usuário não configurado corretamente.</p>
      </div>
    );
  }

  return <>{children}</>;
}