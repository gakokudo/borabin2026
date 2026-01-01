import React, { useEffect, useState } from 'react';
import { getEvents } from '../services/storageService';
import { VolunteerEvent } from '../types';
import EventCard from '../components/EventCard';
import { Search, History } from 'lucide-react';

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
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-brand-100 p-10 md:p-16 text-center">
        <div className="space-y-4 mb-10">
          <h2 className="font-bold text-brand-900 leading-tight">
            <span className="text-2xl md:text-4xl block mb-2">
              気軽に1時間ボランティア体験！
            </span>
            <span className="text-brand-600 text-[13px] md:text-sm block font-bold opacity-80 mt-1">
              世田谷の非営利団体や福祉の活動を体験して地域とつながろう
            </span>
          </h2>
        </div>
        
        <div className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto mb-10 space-y-4 leading-relaxed">
          <p>
            世田谷ボランティアビンゴツアーズ（世田谷ボラビン）は、
            地域に関わりたい参加者がビンゴを目指して
            世田谷の福祉事業所・NPOなどで１時間のボランティアを体験し、
            地域につながりをつくる期間限定のイベントです。
          </p>
          <p className="font-medium text-brand-900/60">
            世田谷のNPOや福祉事業所の活動を知ることで、
            新たな何かが生まれるかもしれません。
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="text-gray-300 group-focus-within:text-brand-500 transition-colors" size={24} />
          </div>
          <input 
            type="text" 
            placeholder="活動をさがす（例：清掃、こども）" 
            className="w-full pl-16 pr-6 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-brand-500 outline-none text-brand-900 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Active Events */}
      <section>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-2 h-8 bg-brand-500 rounded-full"></div>
          <h3 className="text-2xl font-bold text-brand-900">
            募集中の活動
          </h3>
          <span className="text-sm font-bold text-gray-400 ml-auto">{filteredActive.length} 件</span>
        </div>

        {filteredActive.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActive.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
             <p className="text-gray-400 font-bold">該当する活動が見つかりませんでした</p>
             <button onClick={() => setSearchQuery('')} className="text-brand-500 text-sm font-bold mt-4 underline">
               検索をリセット
             </button>
          </div>
        )}
      </section>

      {/* Archive / Past Events */}
      {filteredPast.length > 0 && (
        <section className="pt-10 opacity-80">
          <div className="flex items-center gap-3 mb-8 px-2">
            <History className="text-gray-400" size={24} />
            <h3 className="text-xl font-bold text-gray-400">これまでの活動記録</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPast.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
