import React, { useEffect, useState } from 'react';
import { getEvents } from '../services/storageService';
import { VolunteerEvent } from '../types';
import EventCard from '../components/EventCard';
import { Search, History, Sparkles, MapPin, MousePointer2, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  const [activeEvents, setActiveEvents] = useState<VolunteerEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<VolunteerEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const allEvents = getEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active: VolunteerEvent[] = [];
    const past: VolunteerEvent[] = [];

    allEvents.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= today) {
        active.push(event);
      } else {
        past.push(event);
      }
    });

    active.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setActiveEvents(active);
    setPastEvents(past);
  }, []);

  const filterEvents = (events: VolunteerEvent[]) => {
    if (!searchQuery) return events;
    const lowerQuery = searchQuery.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(lowerQuery) || 
      e.venue.toLowerCase().includes(lowerQuery) ||
      e.category.toLowerCase().includes(lowerQuery) ||
      e.organizationName.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredActive = filterEvents(activeEvents);
  const filteredPast = filterEvents(pastEvents);

  return (
    <div className="space-y-20 pb-20 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white rounded-[4rem] shadow-2xl shadow-brand-100/50 border-4 border-brand-50/50 group">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none">
          <Sparkles size={240} className="text-brand-500" />
        </div>
        
        <div className="px-8 py-20 md:px-20 md:py-28 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-500 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] mb-10 border border-brand-100 shadow-sm animate-bounce-gentle">
             <MapPin size={12} className="fill-brand-500" />
             SETAGAYA · TOKYO
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-brand-900 mb-10 leading-[1.2] tracking-tight">
            世田谷で、<br className="md:hidden"/>
            <span className="text-brand-500 relative inline-block">
              “心地よい”
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="#e87a90" strokeWidth="4" fill="transparent" /></svg>
            </span><br className="md:hidden"/>
            つながりを。
          </h2>
          
          <p className="text-gray-500 text-sm md:text-xl leading-relaxed max-w-2xl mx-auto font-medium mb-14 px-4">
            「ちょっといいこと」を世田谷のあちこちで。<br className="hidden md:block"/>
            ビンゴを楽しみながら地域と出会う、新しいボランティア・プラットフォーム。
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group/search">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none transition-transform group-focus-within/search:scale-110">
              <Search className="text-brand-400" size={28} />
            </div>
            <input 
              type="text" 
              placeholder="何をしてみたいですか？" 
              className="w-full pl-20 pr-8 py-8 rounded-[2.5rem] border-4 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-accent-500 focus:ring-12 focus:ring-accent-50 outline-none text-brand-900 text-xl placeholder-gray-300 font-bold transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-6 top-6 hidden md:flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-gray-100 text-[10px] font-black text-gray-400 shadow-sm">
              <MousePointer2 size={14} className="text-accent-500" /> FIND EVENTS
            </div>
          </div>
        </div>

        {/* Floating Decor */}
        <div className="absolute bottom-10 left-10 hidden lg:block opacity-20 animate-pulse-soft">
           <Star className="text-accent-500 fill-accent-500" size={40} />
        </div>
      </div>

      {/* Active Events */}
      <section className="px-2">
        <div className="flex items-end justify-between mb-12 px-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-500">
               <Sparkles size={18} />
               <span className="text-[10px] font-black tracking-widest uppercase">Now Recruiting</span>
            </div>
            <h3 className="text-3xl font-black text-brand-900 flex items-center gap-4">
              <span className="w-3 h-10 bg-brand-500 rounded-full shadow-lg shadow-brand-200"></span>
              募集中の活動
            </h3>
          </div>
          <div className="hidden sm:flex flex-col items-end border-r-4 border-brand-100 pr-6">
            <span className="text-4xl font-black text-brand-500 leading-none">{filteredActive.length}</span>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Events Total</span>
          </div>
        </div>

        {filteredActive.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredActive.map((event, idx) => (
              <div key={event.id} className="animate-in fade-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-gray-50 transition-all hover:bg-gray-50/50">
             <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200 shadow-inner">
               <Search size={40} />
             </div>
             <p className="text-gray-400 font-bold text-lg mb-2">まだ活動がありません</p>
             <p className="text-gray-300 text-sm font-medium mb-6">条件を変えて探してみてください。</p>
             <button onClick={() => setSearchQuery('')} className="bg-brand-500 text-white font-black px-10 py-4 rounded-2xl shadow-lg hover:bg-brand-600 transition-all transform active:scale-95">
               検索をクリアする
             </button>
          </div>
        )}
      </section>

      {/* Archive / Past Events */}
      {filteredPast.length > 0 && (
        <section className="px-2 pt-16">
          <div className="flex items-center gap-4 mb-12 border-b-4 border-gray-50 pb-6">
            <div className="bg-gray-100 p-3 rounded-2xl">
              <History className="text-gray-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">Archive</h3>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">これまでの活動記録</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 opacity-70 grayscale-[0.3] hover:grayscale-0 transition-all duration-700">
            {filteredPast.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Footer Support Message */}
      <div className="text-center py-20">
         <div className="inline-block p-1 rounded-full bg-brand-50 mb-6">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
               <Star size={24} className="text-brand-500 fill-brand-500" />
            </div>
         </div>
         <h4 className="text-xl font-black text-brand-900 mb-4">世田谷の明日を、一緒につくろう。</h4>
         <p className="text-sm text-gray-400 font-medium">ボランティア募集を出したい団体様は<br className="md:hidden"/>上部メニューの「募集する」からどうぞ。</p>
      </div>
    </div>
  );
};

export default HomePage;
