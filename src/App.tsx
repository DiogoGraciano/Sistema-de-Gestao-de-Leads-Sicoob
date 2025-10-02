import { useState, useEffect } from 'react';
import LeadsList from './components/LeadsList';
import { LogsList } from './components/LogsList';
import { LoginForm } from './components/LoginForm';
import { AuthService } from './services/authService';
import type { User } from 'firebase/auth';
import './App.css';
import { ChartBar, FileText } from 'lucide-react';

type ViewType = 'leads' | 'logs';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('leads');

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    // O estado será atualizado automaticamente pelo onAuthStateChange
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex lg:justify-between justify-start space-y-4 flex-wrap items-center mb-6">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Harmonika Games" className="w-10 h-10" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Harmonika Games
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Logado como: {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Navegação entre views */}
        <div className="mb-6 flex space-x-2 bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setCurrentView('leads')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${currentView === 'leads'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center w-full justify-center">
              <ChartBar className="h-4 w-4 mr-2" />
              Leads
            </div>
          </button>
          <button
            onClick={() => setCurrentView('logs')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${currentView === 'logs'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center w-full justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Logs do Sistema
            </div>
          </button>
        </div>

        {/* Renderizar view atual */}
        {currentView === 'leads' ? (
          <LeadsList onShowLogs={() => setCurrentView('logs')} />
        ) : (
          <LogsList onShowLeads={() => setCurrentView('leads')} />
        )}
      </div>
    </div>
  );
}

export default App
