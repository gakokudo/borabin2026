import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { saveEvent, getEventById } from '../services/storageService';
import { generateEventImage } from '../services/geminiService';
import { VolunteerEvent } from '../types';
import { BINGO_CATEGORIES } from '../constants';
import { Image, Upload, Wand2, Loader2, Save, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [generatingImage, setGeneratingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<VolunteerEvent>>({
    title: '',
    date: '',
    startTime: '10:00',
    endTime: '12:00',
    venue: '',
    address: '',
    content: '',
    requirements: '',
    category: '',
    secretKey: '',
    manageKey: '',
    imageUrl: '',
    organizationName: '',
    organizationAddress: '',
    organizationUrl: '',
    organizationDescription: '',
    contactPerson: '',
    email: '',
    phoneNumber: ''
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputManageKey, setInputManageKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [acceptancePassword, setAcceptancePassword] = useState('');

  useEffect(() => {
    const isCopy = location.pathname.includes('/copy/');
    const isEdit = location.pathname.includes('/edit/');
    setIsCopyMode(isCopy);
    setIsEditMode(isEdit);

    if (id) {
      const event = getEventById(id);
      if (event) {
        if (isCopy) {
          setFormData({
            ...event,
            id: '',
            title: `${event.title} (コピー)`,
            date: '',
            activityReport: '',
            activityReportImage: '',
            feedbacks: []
          });
          setIsAuthenticated(false);
        } else if (isEdit) {
          setFormData(event);
          setIsAuthenticated(false);
        }
      }
    } else {
      setIsAuthenticated(true); // 新規作成時は認証不要
    }
  }, [id, location.pathname]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const event = getEventById(id!);
    if (event && event.manageKey === inputManageKey) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('管理キーが間違っています');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setFormData(prev => ({ ...prev, imageUrl: canvas.toDataURL('image/jpeg', 0.8) }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAiImage = async () => {
    if (!formData.title || !formData.category) {
      alert("AIで画像を生成するには、先に「案件名」と「カテゴリー」を入力してください。");
      return;
    }
    setGeneratingImage(true);
    try {
      const imageUrl = await generateEventImage(formData.title, formData.category);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl }));
      } else {
        alert("画像の生成に失敗しました。時間をおいて再度お試しください。");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingImage(false);
    }
  };

  const isAcceptanceCorrect = acceptancePassword === 'bin5';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAcceptanceCorrect) {
      alert("正しい「受入団体用パスワード」を入力してください。");
      return;
    }

    if (!formData.title || !formData.date || !formData.category || !formData.secretKey || !formData.manageKey) {
      alert("必須項目（*印）をすべて入力してください。");
      return;
    }

    const eventToSave: VolunteerEvent = {
      ...formData as VolunteerEvent,
      id: isEditMode && id ? id : Date.now().toString(),
      imageUrl: formData.imageUrl || `https://placehold.co/800x450/e87a90/ffffff?text=${encodeURIComponent(formData.title || 'Event')}`,
    };

    saveEvent(eventToSave);
    alert(isEditMode ? "案件を更新しました！" : "案件を公開しました！");
    navigate(`/event/${eventToSave.id}`);
  };

  if (id && !isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-brand-100 text-center">
          <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-500">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-brand-900 mb-2">編集権限の確認</h2>
          <p className="text-sm text-gray-500 mb-8">この案件を作成した際に設定した<br/>「管理用パスワード（管理キー）」を入力してください。</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input 
              type="password" 
              value={inputManageKey}
              onChange={(e) => setInputManageKey(e.target.value)}
              className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 text-center text-lg font-bold focus:border-brand-500 outline-none transition-all"
              placeholder="管理キーを入力"
              autoFocus
            />
            {authError && <p className="text-red-500 text-xs font-bold">{authError}</p>}
            <button type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-brand-600 active:scale-95 transition-all">
              認証する
            </button>
            <button type="button" onClick={() => navigate(-1)} className="text-xs text-gray-400 flex items-center justify-center gap-1 mx-auto hover:text-gray-600 transition-colors">
              <ArrowLeft size={14} /> 一覧へ戻る
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-8">
      <div className="bg-white rounded-[3rem] shadow-xl border border-brand-50 overflow-hidden">
        <div className="p-8 md:p-12 space-y-12">
          <div className="border-l-8 border-brand-500 pl-6">
            <h2 className="text-3xl font-black text-brand-900 leading-tight">
              {isEditMode ? '活動情報を修正' : 'ボランティアを募集する'}
            </h2>
            <p className="text-gray-500 font-medium">世田谷の地域活動をさらに楽しく、広げましょう。</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-16">
            
            {/* 1. 写真とAI生成 */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-brand-300 uppercase tracking-widest flex items-center gap-2">
                  <Image size={16} /> 01. Main Visual
                </h3>
                {formData.imageUrl && (
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} className="text-[10px] font-bold text-red-400 hover:text-red-600">
                    リセット
                  </button>
                )}
              </div>
              
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-gray-50 border-4 border-dashed border-gray-100 group">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Main Visual" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-6">
                    <div className="flex flex-wrap justify-center gap-4">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 bg-white px-8 py-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <Upload className="text-brand-500" size={24} />
                        <span className="text-xs font-bold text-gray-600">写真を選択</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={handleAiImage}
                        disabled={generatingImage}
                        className="flex flex-col items-center gap-2 bg-brand-500 px-8 py-5 rounded-2xl shadow-lg hover:bg-brand-600 hover:-translate-y-0.5 transition-all text-white disabled:opacity-50"
                      >
                        {generatingImage ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                        <span className="text-xs font-bold">{generatingImage ? '生成中...' : 'AIにお任せ'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold max-w-xs leading-relaxed">
                      ※AI生成を使うには、下の「案件名」と「カテゴリー」を入力してください。
                    </p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </section>

            {/* 2. 基本情報 */}
            <section className="space-y-8">
              <h3 className="text-xs font-black text-brand-300 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} /> 02. Activity Details
              </h3>
              
              <div className="grid gap-8 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ボランティア案件名 <span className="text-brand-500">*</span></label>
                  <input name="title" required value={formData.title} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl p-5 font-bold text-lg focus:border-brand-500 focus:bg-white transition-all outline-none" placeholder="例：下北沢あおぞらマルシェの設営お手伝い" />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">カテゴリー <span className="text-brand-500">*</span></label>
                  <select name="category" required value={formData.category} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl p-5 font-bold focus:border-brand-500 focus:bg-white transition-all outline-none appearance-none">
                    <option value="">選択してください</option>
                    {BINGO_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">実施日 <span className="text-brand-500">*</span></label>
                  <input name="date" type="date" required value={formData.date} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl p-5 font-bold focus:border-brand-500 focus:bg-white transition-all outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">開始時間</label>
                  <input name="startTime" type="time" value={formData.startTime} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl p-5 font-bold focus:border-brand-500 focus:bg-white transition-all outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">終了時間</label>
                  <input name="endTime" type="time" value={formData.endTime} onChange={handleChange} className="w-full border-2 border-gray-50 bg-gray-50 rounded-2xl p-5 font-bold focus:border-brand-500 focus:bg-white transition-all outline-none" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">会場名・住所</label>
                  <input name="venue" value={formData.venue} onChange={handleChange} className="w-full border-2 border-gray-100 bg-white rounded-2xl p-4 font-bold mb-3 focus:border-brand-500 outline-none" placeholder="会場名（例：世田谷ボランティアセンター）" />
                  <input name="address" value={formData.address} onChange={handleChange} className="w-full border-2 border-gray-100 bg-white rounded-2xl p-4 font-bold focus:border-brand-500 outline-none" placeholder="住所（例：世田谷区太子堂1-12-40）" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">活動内容の詳細</label>
                  <textarea name="content" rows={4} value={formData.content} onChange={handleChange} className="w-full border-2 border-gray-100 bg-white rounded-2xl p-5 font-bold focus:border-brand-500 outline-none leading-relaxed" placeholder="参加者がワクワクするような活動内容を記入してください。" />
                </div>
              </div>
            </section>

            {/* 3. 合言葉・管理キー */}
            <section className="space-y-8 pt-10 border-t-2 border-brand-50">
              <h3 className="text-xs font-black text-brand-300 uppercase tracking-widest flex items-center gap-2">
                <Lock size={16} /> 03. Passwords
              </h3>
              
              <div className="grid gap-8 md:grid-cols-2">
                <div className="bg-brand-50 p-8 rounded-[2.5rem] border-2 border-brand-100 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-brand-700 mb-2 uppercase tracking-widest">Stamp Password (合言葉) <span className="text-brand-500">*</span></label>
                    <p className="text-[10px] text-brand-400 mb-4 leading-relaxed font-bold">当日参加者に伝えてください。これを入れるとビンゴが埋まります。</p>
                    <input name="secretKey" required value={formData.secretKey} onChange={handleChange} className="w-full bg-white border-2 border-brand-100 rounded-2xl p-4 font-black text-center text-xl tracking-widest focus:border-brand-500 outline-none" placeholder="例: さくら" />
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-gray-100 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Admin Key (管理キー) <span className="text-brand-500">*</span></label>
                    <p className="text-[10px] text-gray-400 mb-4 leading-relaxed font-bold">この募集を後で編集したり、活動報告を書くために必要です。</p>
                    <input name="manageKey" required value={formData.manageKey} onChange={handleChange} className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 font-black text-center text-xl tracking-widest focus:border-gray-500 outline-none" placeholder="任意の英数字" />
                  </div>
                </div>
              </div>
            </section>

            {/* 4. 受入団体認証 */}
            <section className="space-y-6 pt-10 border-t-8 border-accent-500">
               <div className="bg-accent-50 p-10 rounded-[3rem] border-2 border-accent-100">
                  <div className="flex items-start gap-4 mb-6">
                    <AlertCircle className="text-accent-600 shrink-0" size={28} />
                    <div className="space-y-1">
                      <h4 className="font-bold text-brand-900 text-lg">受入団体用パスワード</h4>
                      <p className="text-xs text-accent-700 font-medium">事務局から提供された、公開用の共通パスワードを入力してください。</p>
                    </div>
                  </div>
                  <input 
                    type="password" 
                    value={acceptancePassword} 
                    onChange={(e) => setAcceptancePassword(e.target.value)} 
                    className={`w-full p-5 rounded-[2rem] text-center text-2xl font-black border-4 transition-all outline-none ${isAcceptanceCorrect ? 'bg-white border-green-400 text-green-600' : 'bg-white border-accent-200 focus:border-accent-500 shadow-inner'}`} 
                    placeholder="••••" 
                  />
                  {isAcceptanceCorrect && (
                    <p className="text-center text-green-600 text-[10px] font-black mt-4 flex items-center justify-center gap-1 uppercase tracking-widest">
                      <CheckCircle2 size={16} /> Verified / パスワードを確認しました
                    </p>
                  )}
               </div>
            </section>

            <button 
              type="submit" 
              disabled={!isAcceptanceCorrect} 
              className={`w-full py-8 rounded-[2.5rem] text-2xl font-black shadow-2xl transition-all flex items-center justify-center gap-4 transform active:scale-95 ${isAcceptanceCorrect ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-200 hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Save size={28} />
              {isEditMode ? '情報を更新して保存' : 'ボランティアを公開する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
