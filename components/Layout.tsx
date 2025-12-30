import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, PlusCircle, Home, Grid3X3, Download, Upload, LogOut, User as UserIcon } from 'lucide-react';
import { exportData, importData, getUserProfile, logoutUser } from '../services/storageService';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getUserProfile());
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("ログアウトしますか？")) {
      logoutUser();
      setUser(null);
      navigate('/');
    }
  };

  const handleBackup = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `setagaya-volunteer-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => {
    if (window.confirm("現在のデータが上書きされます。よろしいですか？")) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importData(content)) {
        alert("データを復元しました。ページをリロードします。");
        window.location.reload();
      } else {
        alert("データの復元に失敗しました。ファイルが正しいか確認してください。");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 font-sans text-brand-900">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b-4 border-accent-500 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group shrink-0">
            <div className="bg-brand-500 text-white p-1.5 rounded-lg group-hover:bg-brand-600 transition-colors shadow-sm transform group-hover:rotate-6">
              <MapPin size={24} />
            </div>
            <h1 className="hidden sm:block text-lg md:text-xl font-bold text-brand-900 tracking-tight">
              世田谷<span className="text-brand-500">ボランティア</span>ビンゴツアーズ
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center space-x-6 mr-4">
              <Link 
                to="/" 
                className={`text-sm font-bold transition-colors ${isActive('/') ? 'text-brand-500' : 'text-brand-900/60 hover:text-brand-900'}`}
              >
                さがす
              </Link>
              <Link 
                to="/bingo" 
                className={`text-sm font-bold transition-colors ${isActive('/bingo') ? 'text-brand-500' : 'text-brand-900/60 hover:text-brand-900'}`}
              >
                ビンゴカード
              </Link>
              <Link 
                to="/create" 
                className={`text-sm font-bold transition-colors ${isActive('/create') ? 'text-brand-500' : 'text-brand-900/60 hover:text-brand-900'}`}
              >
                募集する
              </Link>
            </nav>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="text-right hidden xs:block">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Challenger</p>
                  <p className="text-xs font-bold text-brand-900">{user.name} 様</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-500 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-inner"
                  title="ログアウト"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link 
                to="/register" 
                className="bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:bg-brand-600 transition-all flex items-center gap-2"
              >
                <UserIcon size={14} />
                参加者登録
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-100 pb-safe z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center h-16">
          <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-brand-900/40 hover:text-brand-500">
            <Home size={24} className={isActive('/') ? 'text-brand-500 fill-brand-50' : ''} />
            <span className={`text-[10px] mt-1 font-bold ${isActive('/') ? 'text-brand-500' : ''}`}>ホーム</span>
          </Link>
          <Link to="/bingo" className="flex flex-col items-center justify-center w-full h-full text-brand-900/40 hover:text-brand-500">
            <Grid3X3 size={24} className={isActive('/bingo') ? 'text-brand-500 fill-brand-50' : ''} />
            <span className={`text-[10px] mt-1 font-bold ${isActive('/bingo') ? 'text-brand-500' : ''}`}>ビンゴ</span>
          </Link>
          <Link to="/create" className="flex flex-col items-center justify-center w-full h-full text-brand-900/40 hover:text-brand-500">
            <PlusCircle size={24} className={isActive('/create') ? 'text-brand-500 fill-brand-50' : ''} />
            <span className={`text-[10px] mt-1 font-bold ${isActive('/create') ? 'text-brand-500' : ''}`}>募集作成</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-brand-50 border-t border-brand-100 py-8 mt-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-brand-900/60 text-sm font-medium">
            <p>© 2024 世田谷ボランティアビンゴツアーズ</p>
            <p className="mt-2 text-xs">地域のみんなで、楽しくつながる。</p>
          </div>
          
          {/* Data Management Section */}
          <div className="mt-6 pt-6 border-t border-brand-100 flex justify-center gap-4 text-xs">
            <button 
              onClick={handleBackup}
              className="flex items-center text-brand-600 hover:text-brand-800 transition-colors"
            >
              <Download size={14} className="mr-1" />
              データを保存
            </button>
            <span className="text-brand-200">|</span>
            <button 
              onClick={handleRestoreClick}
              className="flex items-center text-brand-600 hover:text-brand-800 transition-colors"
            >
              <Upload size={14} className="mr-1" />
              データを復元
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
