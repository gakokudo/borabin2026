
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Package, User, Users, Mail, Phone, ArrowLeft, Building2, Tag, CheckCircle, KeyRound, Edit, FileText, Send, Image as ImageIcon, Copy, Globe } from 'lucide-react';
// Removed non-existent hasStamped export from storageService.
import { getEventById, stampCategory, updateActivityReport, addFeedback, saveParticipation, hasParticipated, hasRegistered } from '../services/storageService';
import { VolunteerEvent, Feedback } from '../types';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<VolunteerEvent | undefined>();
  const [loading, setLoading] = useState(true);
  const [isParticipated, setIsParticipated] = useState(false);
  
  // State for password input
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // State for Report & Feedback
  const [isPastEvent, setIsPastEvent] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportImage, setReportImage] = useState('');
  const [reportAuthKey, setReportAuthKey] = useState('');
  // Fix: Ensure reportFileRef is available for the upload button
  const reportFileRef = useRef<HTMLInputElement>(null);

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackName, setFeedbackName] = useState('');

  useEffect(() => {
    if (id) {
      const foundEvent = getEventById(id);
      setEvent(foundEvent);
      if (foundEvent) {
        // Check if user has participated in THIS specific event
        setIsParticipated(hasParticipated(foundEvent.id));
        
        // Check if event is past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(foundEvent.date);
        setIsPastEvent(eventDate < today);
        
        // Init report state
        setReportText(foundEvent.activityReport || '');
        setReportImage(foundEvent.activityReportImage || '');
      }
      setLoading(false);
    }
  }, [id]);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!hasRegistered()) {
      const confirmRegister = window.confirm("ボランティアに参加するには、初回登録と規約への同意が必要です。登録ページへ移動しますか？");
      if (confirmRegister) {
        navigate('/register');
      }
      return;
    }

    // If registered, open mailer
    window.location.href = `mailto:${event.email}?subject=ボランティア申し込み: ${event.title}`;
  };

  const handleVerifyPassword = () => {
    if (!event) return;
    const input = passwordInput.trim();
    const correctKey = event.secretKey || ''; 

    if (input === correctKey) {
      // 1. Stamp the category for Bingo
      stampCategory(event.category);
      // 2. Save participation record for History
      saveParticipation(event.id);
      
      setIsParticipated(true);
      setShowPasswordInput(false);
      alert(`「${event.category}」のスタンプをゲットしました！\n活動履歴に記録されました。`);
    } else {
      setErrorMessage('合言葉が違います');
    }
  };

  const handleEditClick = () => {
    navigate(`/edit/${event?.id}`);
  };

  const handleCopyClick = () => {
    navigate(`/copy/${event?.id}`);
  };

  // Report Handling
  const handleReportImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
         const canvas = document.createElement('canvas');
         const MAX_WIDTH = 800;
         const scaleSize = MAX_WIDTH / img.width;
         canvas.width = MAX_WIDTH;
         canvas.height = img.height * scaleSize;
         const ctx = canvas.getContext('2d');
         ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
         setReportImage(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReport = () => {
    if (!event) return;
    if (reportAuthKey !== event.manageKey) {
      alert('管理キーが間違っています');
      return;
    }
    updateActivityReport(event.id, reportText, reportImage);
    setEvent({ ...event, activityReport: reportText, activityReportImage: reportImage });
    setShowReportForm(false);
    alert('活動報告を更新しました');
  };

  const handleSubmitFeedback = () => {
    if (!event || !feedbackText.trim()) return;
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      author: feedbackName || '匿名',
      content: feedbackText,
      date: new Date().toISOString().split('T')[0]
    };
    addFeedback(event.id, newFeedback);
    setEvent({ ...event, feedbacks: [newFeedback, ...(event.feedbacks || [])] });
    setFeedbackText('');
    setFeedbackName('');
    alert('感想を投稿しました！');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/800x600/e87a90/ffffff?text=No+Image';
  };

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  if (!event) return <div className="text-center p-10 text-gray-500">案件が見つかりませんでした。</div>;

  const dateObj = new Date(event.date);
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];
  const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日 (${dayOfWeek})`;

  return (
    <div className="space-y-8">
      {/* Top Nav */}
      <div className="flex justify-between items-center">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-brand-600 transition-colors">
          <ArrowLeft size={18} className="mr-1" />
          一覧に戻る
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={handleCopyClick}
            className="text-xs font-bold text-gray-400 hover:text-brand-600 flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
          >
            <Copy size={14} className="mr-1" />
            コピーして作成
          </button>
          <button 
            onClick={handleEditClick}
            className="text-xs font-bold text-gray-400 hover:text-brand-600 flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
          >
            <Edit size={14} className="mr-1" />
            管理者編集
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Image */}
        <div className="relative h-64 md:h-80 w-full bg-gray-200">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            onError={handleImageError}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          {isPastEvent && (
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
               <span className="bg-black/70 text-white px-6 py-2 rounded-full font-bold text-lg transform -rotate-6 border-2 border-white">終了しました</span>
             </div>
          )}
          <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white w-full">
            <div className="inline-block bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-sm">
              {event.category}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 shadow-black drop-shadow-md">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm md:text-base font-medium opacity-90">
              <span className="flex items-center"><Calendar size={18} className="mr-1.5" /> {formattedDate}</span>
              <span className="flex items-center"><Clock size={18} className="mr-1.5" /> {event.startTime} 〜 {event.endTime}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 p-6 md:p-8">
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-10">
            
            {/* Event Info */}
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2 border-gray-100">
                  <span className="bg-brand-100 text-brand-700 p-1.5 rounded-md mr-2"><MapPin size={20} /></span>
                  実施場所
                </h2>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-bold text-gray-800 text-lg mb-1">{event.venue}</p>
                  <p className="text-gray-600">{event.address}</p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2 border-gray-100">
                  <span className="bg-brand-100 text-brand-700 p-1.5 rounded-md mr-2"><Building2 size={20} /></span>
                  ボランティア活動内容
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.content}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2 border-gray-100">
                  <span className="bg-brand-100 text-brand-700 p-1.5 rounded-md mr-2"><Package size={20} /></span>
                  必要なもの
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.requirements.split(/,|、/).map((item, idx) => (
                    <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm">
                      {item.trim()}
                    </span>
                  ))}
                </div>
              </section>

              {/* Organization Introduction Section */}
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2 border-gray-100">
                  <span className="bg-brand-100 text-brand-700 p-1.5 rounded-md mr-2"><Users size={20} /></span>
                  団体紹介
                </h2>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">{event.organizationName}</h3>
                  
                  {event.organizationDescription && (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm mb-4">
                      {event.organizationDescription}
                    </p>
                  )}

                  <div className="flex flex-col gap-2 text-sm">
                    {event.organizationUrl && (
                      <a href={event.organizationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-brand-600 hover:text-brand-800 font-bold hover:underline">
                        <Globe size={16} className="mr-2" />
                        {event.organizationUrl}
                      </a>
                    )}
                    
                    {event.organizationAddress && (
                      <div className="flex items-start text-gray-600">
                          <MapPin size={16} className="mr-2 mt-0.5 shrink-0 text-gray-400" />
                          <span>{event.organizationAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Post-Event: Activity Report */}
            {isPastEvent && (
              <section className="bg-cream-100 rounded-2xl p-6 border-2 border-brand-100">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-brand-800 flex items-center">
                      <FileText className="mr-2" />
                      活動報告
                    </h2>
                    {!showReportForm && (
                      <button 
                        onClick={() => setShowReportForm(true)}
                        className="text-xs text-brand-600 hover:text-brand-800 underline"
                      >
                        {event.activityReport ? '編集する' : '報告を投稿する(管理者のみ)'}
                      </button>
                    )}
                 </div>

                 {showReportForm ? (
                   <div className="space-y-4 bg-white p-4 rounded-xl border border-brand-200">
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">報告用画像</label>
                       {reportImage && <img src={reportImage} className="h-32 rounded mb-2 object-cover" alt="report preview" />}
                       <button type="button" onClick={() => reportFileRef.current?.click()} className="text-sm bg-gray-100 px-3 py-2 rounded flex items-center"><ImageIcon size={16} className="mr-2"/>画像を選択</button>
                       <input type="file" ref={reportFileRef} className="hidden" accept="image/*" onChange={handleReportImageUpload} />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">報告内容</label>
                       <textarea className="w-full border p-2 rounded" rows={4} value={reportText} onChange={e => setReportText(e.target.value)} placeholder="活動の様子はどうでしたか？" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">投稿用パスワード(管理キー)</label>
                       <input type="password" className="w-full border p-2 rounded" value={reportAuthKey} onChange={e => setReportAuthKey(e.target.value)} />
                     </div>
                     <div className="flex gap-2">
                       <button onClick={handleSubmitReport} className="flex-1 bg-brand-500 text-white font-bold py-2 rounded">投稿</button>
                       <button onClick={() => setShowReportForm(false)} className="px-4 py-2 text-gray-500">キャンセル</button>
                     </div>
                   </div>
                 ) : (
                   event.activityReport ? (
                     <div className="bg-white p-4 rounded-xl border border-white/50 shadow-sm">
                       {event.activityReportImage && (
                         <img src={event.activityReportImage} alt="Report" className="w-full h-48 md:h-64 object-cover rounded-lg mb-4" />
                       )}
                       <p className="text-brand-900 whitespace-pre-wrap">{event.activityReport}</p>
                     </div>
                   ) : (
                     <p className="text-center text-gray-500 py-4 text-sm">まだ活動報告はありません。</p>
                   )
                 )}
              </section>
            )}

            {/* Post-Event: Feedbacks */}
            {isPastEvent && (
              <section className="space-y-4">
                 <h2 className="text-xl font-bold text-gray-800 flex items-center border-b pb-2 border-gray-100">
                   <User className="mr-2 text-accent-500" />
                   みんなの感想
                 </h2>

                 {/* Feedback Form */}
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                   <p className="font-bold text-sm text-gray-600 mb-2">感想を投稿する</p>
                   <div className="flex gap-2 mb-2">
                     <input 
                        className="flex-1 border border-gray-300 rounded-lg p-2 text-sm" 
                        placeholder="お名前 (任意)" 
                        value={feedbackName} 
                        onChange={e => setFeedbackName(e.target.value)}
                     />
                   </div>
                   <textarea 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-2" 
                      rows={2} 
                      placeholder="楽しかったこと、気づきなどをシェアしよう！"
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                   />
                   <button 
                    onClick={handleSubmitFeedback}
                    className="w-full bg-accent-500 text-white font-bold py-2 rounded-lg text-sm hover:bg-accent-600 flex items-center justify-center"
                   >
                     <Send size={16} className="mr-2" />
                     投稿する
                   </button>
                 </div>

                 {/* Feedback List */}
                 <div className="space-y-4">
                    {event.feedbacks && event.feedbacks.length > 0 ? (
                      event.feedbacks.map(fb => (
                        <div key={fb.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-brand-600 text-sm">{fb.author}</span>
                            <span className="text-xs text-gray-400">{fb.date}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{fb.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm text-center">まだ感想はありません。</p>
                    )}
                 </div>
              </section>
            )}

          </div>

          {/* Right Column: CTA & Contact */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Sticky Application Box */}
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg shadow-brand-100 border border-brand-100 overflow-hidden">
              <div className="p-6 text-center space-y-4">
                
                {isPastEvent ? (
                  <div className="bg-gray-100 text-gray-500 font-bold py-4 rounded-xl">
                    受付終了
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">このボランティアに参加しよう！</p>
                    <button 
                      onClick={handleApplyClick}
                      className="block w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 rounded-xl shadow-md transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                      <span className="flex items-center justify-center">
                        <Mail className="mr-2" size={20} />
                        申し込む
                      </span>
                    </button>
                  </>
                )}

                <div className="border-t border-gray-100 my-4 pt-4">
                  <p className="text-xs text-gray-400 mb-2">参加して合言葉を教えてもらおう！</p>
                  
                  {isParticipated ? (
                    <button
                      disabled
                      className="w-full font-bold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center bg-brand-100 text-brand-700 cursor-default"
                    >
                      <CheckCircle size={20} className="mr-2" />
                      参加・スタンプ済
                    </button>
                  ) : showPasswordInput ? (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <p className="text-xs text-brand-600 font-bold mb-2">合言葉を入力してください</p>
                      <input 
                        type="text" 
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          setErrorMessage('');
                        }}
                        className="w-full border border-gray-300 rounded-lg p-2 text-center text-lg font-bold mb-2 focus:ring-2 focus:ring-brand-50 outline-none"
                        placeholder="合言葉"
                      />
                      {errorMessage && <p className="text-xs text-red-500 mb-2 font-bold">{errorMessage}</p>}
                      <button 
                        onClick={handleVerifyPassword}
                        className="w-full bg-brand-500 text-white font-bold py-2 rounded-lg hover:bg-brand-600 transition-colors"
                      >
                        認証する
                      </button>
                      <button 
                        onClick={() => setShowPasswordInput(false)}
                        className="text-xs text-gray-400 mt-2 hover:text-gray-600"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPasswordInput(true)}
                      className="w-full font-bold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center bg-white border-2 border-brand-500 text-brand-600 hover:bg-brand-50"
                    >
                      <KeyRound size={20} className="mr-2" />
                      ビンゴをあける
                    </button>
                  )}
                </div>

              </div>
              <div className="bg-gray-50 p-5 border-t border-gray-100">
                 <h3 className="font-bold text-gray-700 mb-3 text-sm">お問い合わせ</h3>
                 <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Building2 size={16} className="text-gray-400 mr-2 shrink-0" />
                      <span className="text-gray-600 font-bold">{event.organizationName}</span>
                    </div>

                    <div className="flex items-center">
                      <User size={16} className="text-gray-400 mr-2 shrink-0" />
                      <span className="text-gray-600">{event.contactPerson}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-400 mr-2 shrink-0" />
                      <a href={`tel:${event.phoneNumber}`} className="text-gray-600 hover:text-brand-600 underline decoration-gray-300 underline-offset-2">
                        {event.phoneNumber}
                      </a>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
