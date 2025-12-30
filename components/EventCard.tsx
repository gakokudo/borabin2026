import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ImageOff } from 'lucide-react';
import { VolunteerEvent } from '../types';

interface EventCardProps {
  event: VolunteerEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Parse date for display
  const dateObj = new Date(event.date);
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];
  const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日 (${dayOfWeek})`;

  // Determine if event is past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date);
  const isPast = eventDate < today;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.src = 'https://placehold.co/800x600/e87a90/ffffff?text=No+Image';
  };

  return (
    <Link to={`/event/${event.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            onError={handleImageError}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${
            isPast 
              ? 'bg-gray-600/90 text-white' 
              : 'bg-white/90 text-brand-700'
          }`}>
            {isPast ? '終了' : '募集中'}
          </div>
        </div>
        <div className="p-5">
          {/* Category Badge */}
          <div className="mb-2">
            <span className="inline-block bg-brand-50 text-brand-600 border border-brand-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {event.category}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {event.title}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar size={16} className="text-brand-500 mr-2 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="text-brand-500 mr-2 flex-shrink-0" />
              <span>{event.startTime} 〜 {event.endTime}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="text-brand-500 mr-2 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400 font-medium">{event.organizationName}</span>
            <span className="text-brand-600 text-sm font-bold flex items-center">
              詳細を見る
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
