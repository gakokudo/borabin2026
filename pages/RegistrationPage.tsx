import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserProfile, getUserProfile } from '../services/storageService';
import { UserProfile } from '../types';
import { UserPlus, LogIn, ExternalLink, ArrowRight, Heart, Info } from 'lucide-react';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (getUserProfile()) {
      navigate('/bingo');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isPasswordCorrect = password === 'bin5bin5';
  const canSubmit = formData.name && formData.email && isPasswordCorrect;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordCorrect) {
      alert("共通パスワードが違います。事務局からのメールを確認してください。");
      return;
    }
    
    const profile: UserProfile = {
      name: formData.name!,
      email: formData.email!.toLowerCase().trim(),
      agreedToTerms: true,
      registeredAt: new Date().toISOString()
    };

    saveUserProfile(profile);
    alert(isLoginMode ? `おかえりなさい、${profile.name} 様！` : `登録ありがとうございます！世田谷の活動を楽しみましょう。`);
    navigate('/bingo');
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="bg-brand-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-brand-500 shadow-inner animate-bounce-gentle">
          <Heart size={40} className="fill-brand-500" />
        </div>
        <h2 className="text-3xl font-bold text-brand-900 tracking-tight">
          {isLoginMode ? 'おかえりなさい！' : '冒険を始めよう'}
        </h2>
        <p className="text-gray-500 text-sm font-medium">
          {isLoginMode ? '活動記録をチェックしましょう。' : '世田谷ボランティアビンゴツアーズへようこそ。'}
        </p>
      </div>

      <div className="flex p-1.5 bg-white border-2 border-brand-100 rounded-2xl shadow-sm max-w-xs mx-auto">
        <button 
          onClick={() => setIsLoginMode(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${!isLoginMode ? 'bg-brand-500 text-white shadow-md' : 'text-brand-300 hover:text-brand-500'}`}
        >
          <UserPlus size={16} />
          新規登録
        </button>
        <button 
          onClick={() => setIsLoginMode(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${isLoginMode ? 'bg-brand-500 text-white shadow-md' : 'text-brand-300 hover:text-brand-500'}`}
        >
          <LogIn size={16} />
          ログイン
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-brand-100 overflow-hidden">
        <div className="p-8 md:p-12">
          {!isLoginMode && (
            <div className="mb-10 p-6 bg-brand-50 rounded-3xl border-2 border-dashed border-brand-200 space-y-4">
              <h4 className="font-bold text-brand-900 flex items-center gap-2">
                <Info size={18} className="text-brand-500" />
                まずは申し込みが必要です
              </h4>
              <p className="text-xs text-brand-800 leading-relaxed font-medium">
                アプリに登録するには、公式Googleフォームからの申し込みが必要です。申し込み後に届く「共通パスワード」を入力してください。
              </p>
              <a 
                href="https://forms.gle/WvDGSxt1jNn4nSV1A" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border-2 border-brand-100 text-brand-600 font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Googleフォームで申し込む
                <ExternalLink size={18} />
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="group">
                <label className="block text-[10px] font-black text-brand-300 mb-1 uppercase tracking-widest ml-1 group-focus-within:text-brand-500 transition-colors">Your Name</label>
                <input 
                  name="name" 
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50 outline-none transition-all font-bold text-lg"
                  placeholder="世田谷 太郎"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-brand-300 mb-1 uppercase tracking-widest ml-1 group-focus-within:text-brand-500 transition-colors">Email Address</label>
                <input 
                  name="email" 
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50 outline-none transition-all font-bold"
                  placeholder="example@email.com"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-brand-300 mb-1 uppercase tracking-widest ml-1 group-focus-within:text-accent-500 transition-colors">Common Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-50 outline-none transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!canSubmit}
              className={`w-full font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${
                canSubmit 
                  ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-200 transform active:scale-95' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoginMode ? 'ログイン' : '冒険をはじめる'}
              <ArrowRight size={22} />
            </button>
          </form>
        </div>
      </div>
      
      <p className="text-center text-[10px] text-gray-400 font-bold px-10 leading-relaxed uppercase tracking-tighter">
        ※ご入力いただいた情報は、世田谷ボランティアビンゴツアーズの活動目的以外には使用いたしません。
      </p>
    </div>
  );
};

export default RegistrationPage;
