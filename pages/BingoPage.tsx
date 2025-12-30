import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBingoProgress, getParticipatedEventIds, getEventById, getUserProfile } from '../services/storageService';
import { BINGO_CATEGORIES } from '../constants';
import { Trophy, Star, History, Calendar, UserCheck, ChevronRight, LayoutGrid } from 'lucide-react';
import { VolunteerEvent, UserProfile } from '../types';

const BingoPage: React.FC = () => {
  const navigate = useNavigate();
  const [stampedCategories, setStampedCategories] = useState<string[]>([]);
  const [participatedEvents, setParticipatedEvents] = useState<VolunteerEvent[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const profile = getUserProfile();
    if (!profile) {
      return; // 未ログインの場合はレンダリング側でハンドリング
    }
    setUserProfile(profile);
    setStampedCategories(getBingoProgress());

    const pIds = getParticipatedEventIds();
    const events = pIds
      .map(id => getEventById(id))
      .filter((e): e is VolunteerEvent => !!e);
    setParticipatedEvents(events);
  }, []);

  if (!userProfile) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-brand-500">
          <LayoutGrid size={40} />
        </div>
        <h2 className="text-2xl font-bold text-brand-900">ビンゴカードを見る</h2>
        <p className="text-gray-500 text-sm">
          自分のビンゴカードを確認したり、活動履歴を記録するにはログインまたは登録が必要です。
        </p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-brand-500 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:bg-brand-600 transition-all">
          ログイン・登録はこちら
          <ChevronRight size={18} />
        </Link>
      </div>
    );
  }

  // 5x5 Grid
  const gridItems = [];
  let categoryIndex = 0;
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      gridItems.push({ isFree: true, label: "世田谷LOVE", stamped: true });
    } else {
      const category = BINGO_CATEGORIES[categoryIndex];
      gridItems.push({
        isFree: false,
        label: category,
        stamped: stampedCategories.includes(category)
      });
      categoryIndex++;
    }
  }

  return (
    <div className="space-y-12 pb-12">
      <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-brand-500 text-white p-3 rounded-2xl shadow-brand-100 shadow-lg">
            <UserCheck size={28} />
          </div>
          <div>
            <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest">Active Challenger</p>
            <h2 className="text-xl font-bold text-brand-900">{userProfile.name} 様</h2>
            <p className="text-xs text-gray-400 font-medium">{userProfile.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="bg-accent-50 border border-accent-100 px-4 py-2 rounded-xl text-center">
             <p className="text-[10px] text-accent-600 font-bold uppercase">Stamps</p>
             <p className="text-lg font-bold text-accent-700">{stampedCategories.length}</p>
           </div>
           <div className="bg-brand-50 border border-brand-100 px-4 py-2 rounded-xl text-center">
             <p className="text-[10px] text-brand-600 font-bold uppercase">Events</p>
             <p className="text-lg font-bold text-brand-700">{participatedEvents.length}</p>
           </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto bg-white p-4 md:p-6 rounded-[2.5rem] shadow-xl border-4 border-brand-100">
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {gridItems.map((item, index) => (
            <div 
              key={index}
              className={`
                aspect-square flex flex-col items-center justify-center p-1 md:p-2 rounded-xl text-center transition-all duration-300 relative
                ${item.stamped 
                  ? "bg-brand-500 text-white shadow-inner scale-100" 
                  : "bg-gray-50 border border-gray-200 text-gray-400"
                }
              `}
            >
              <span className={`text-[8px] md:text-xs font-bold leading-tight break-words w-full ${item.isFree ? "text-[10px] md:text-sm" : ""}`}>
                {item.label}
              </span>
              {item.stamped && <Star size={12} className="mt-1 fill-white/50 text-white/50" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <h3 className="font-bold text-brand-900 text-xl flex items-center mb-6">
          <History className="mr-2 text-brand-500" />
          {userProfile.name}さんの活動履歴
        </h3>
        
        {participatedEvents.length > 0 ? (
          <div className="grid gap-4">
            {participatedEvents.map(event => (
              <Link 
                to={`/event/${event.id}`} 
                key={event.id} 
                className="flex bg-white p-4 rounded-2xl shadow-sm border border-brand-50 items-center hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 mr-4">
                  <img src={event.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center text-[10px] mb-1">
                     <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded font-bold mr-2">{event.category}</span>
                     <span className="text-gray-400">{event.date}</span>
                   </div>
                   <h4 className="font-bold text-brand-900 truncate">{event.title}</h4>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-brand-500" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-brand-100">
            <p className="text-gray-400 text-sm">まだ活動の記録がありません。<br/>ボランティアに参加してスタンプをゲットしましょう！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BingoPage;
