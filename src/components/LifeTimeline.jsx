import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiX, FiChevronDown, FiChevronUp, FiHeart, FiStar, 
  FiBookmark, FiCalendar, FiClock, FiMapPin, FiShare2, FiEdit2, 
  FiTrash2, FiChevronLeft, FiChevronRight, FiSearch, FiFilter,
  FiMoon, FiSun, FiCloud, FiWind, FiDroplet, FiZap
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { quranApi } from '../api/quranApi';

// API_CONFIG for emotions - NO DUPLICATES
const API_CONFIG = {
  EMOTIONS: [
    { id: 'grateful', name: 'Grateful', icon: '🙏', color: 'text-emerald-600', surah: 14, verse: 7, text: 'If you are grateful, I will surely increase you' },
    { id: 'joyful', name: 'Joyful', icon: '😊', color: 'text-pink-600', surah: 10, verse: 58, text: 'In the bounty of Allah and His mercy, let them rejoice' },
    { id: 'peaceful', name: 'Peaceful', icon: '🕊️', color: 'text-teal-600', surah: 13, verse: 28, text: 'In the remembrance of Allah do hearts find rest' },
    { id: 'sad', name: 'Sad', icon: '😢', color: 'text-blue-600', surah: 12, verse: 86, text: 'I only complain of my grief and sorrow to Allah' },
    { id: 'anxious', name: 'Anxious', icon: '😰', color: 'text-amber-600', surah: 9, verse: 40, text: 'Do not grieve; indeed Allah is with us' },
    { id: 'hopeful', name: 'Hopeful', icon: '🌅', color: 'text-orange-600', surah: 39, verse: 53, text: 'Do not despair of Allah\'s mercy' },
    { id: 'blessed', name: 'Blessed', icon: '🌟', color: 'text-yellow-600', surah: 14, verse: 34, text: 'If you count the blessings of Allah, you cannot enumerate them' },
    { id: 'confident', name: 'Confident', icon: '💪', color: 'text-blue-600', surah: 3, verse: 160, text: 'If Allah helps you, none can overcome you' },
    { id: 'inspired', name: 'Inspired', icon: '✨', color: 'text-purple-600', surah: 96, verse: 1, text: 'Read! In the name of your Lord' },
    { id: 'loved', name: 'Loved', icon: '💝', color: 'text-red-600', surah: 3, verse: 31, text: 'Allah loves those who follow the Prophet' },
    { id: 'compassionate', name: 'Compassionate', icon: '🤗', color: 'text-rose-600', surah: 90, verse: 14, text: 'Or feeding on a day of severe hunger' },
  ]
};

// Islamic Calendar Events Data
const ISLAMIC_EVENTS_2025 = {
  1: { 1: { name: "Islamic New Year", type: "holiday", icon: "🌙" }, 10: { name: "Day of Ashura", type: "important", icon: "🕋" } },
  3: { 12: { name: "Mawlid al-Nabi (Prophet's Birthday)", type: "holiday", icon: "🕌" } },
  7: { 27: { name: "Al-Isra' wal-Mi'raj", type: "important", icon: "✨" } },
  8: { 15: { name: "Nisf Sha'ban", type: "important", icon: "🌙" } },
  9: { 1: { name: "First Day of Ramadan", type: "ramadan", icon: "🌙" }, 27: { name: "Laylat al-Qadr", type: "important", icon: "⭐" } },
  10: { 1: { name: "Eid al-Fitr", type: "eid", icon: "🎉" } },
  12: { 9: { name: "Day of Arafah", type: "important", icon: "🕋" }, 10: { name: "Eid al-Adha", type: "eid", icon: "🐏" } }
};

const getIslamicEvent = (month, day) => ISLAMIC_EVENTS_2025[month]?.[day] || null;
const getArabicMonthName = (monthIndex) => ["Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani", "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah"][monthIndex];
const getEmotionIcon = (emotionId) => API_CONFIG.EMOTIONS.find(e => e.id === emotionId)?.icon || '💫';
const getEmotionColor = (emotionId) => API_CONFIG.EMOTIONS.find(e => e.id === emotionId)?.color || 'text-gray-500';
const getEmotionName = (emotionId) => API_CONFIG.EMOTIONS.find(e => e.id === emotionId)?.name || emotionId;
const getEventTypeColor = (type) => ({ eid: 'from-emerald-500 to-green-500', ramadan: 'from-purple-500 to-indigo-500', important: 'from-amber-500 to-orange-500', holiday: 'from-blue-500 to-cyan-500' }[type] || 'from-emerald-500 to-teal-500');

export default function LifeTimeline() {
  const { userId, addXP, updateActivity } = useUser();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', emotion: '', date: '', description: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => { loadEvents(); }, [userId]);
  useEffect(() => { if (viewMode === 'calendar') generateCalendarDays(currentDate); }, [currentDate, viewMode, events]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const savedEvents = localStorage.getItem(`timeline_events_${userId}`);
      const parsedEvents = savedEvents ? JSON.parse(savedEvents) : [];
      const sorted = parsedEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEvents(sorted);
    } catch (error) { console.error('Error loading events:', error); toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  const saveEvents = (updatedEvents) => {
    localStorage.setItem(`timeline_events_${userId}`, JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      const searchLower = searchQuery.toLowerCase().trim();
      if (!searchLower && !filterEmotion) return true;
      const matchesSearch = !searchLower || event.title.toLowerCase().includes(searchLower) || (event.description && event.description.toLowerCase().includes(searchLower)) || (event.location && event.location.toLowerCase().includes(searchLower)) || (event.emotion && getEmotionName(event.emotion).toLowerCase().includes(searchLower)) || (event.date && event.date.includes(searchLower));
      const matchesEmotion = !filterEmotion || event.emotion === filterEmotion;
      return matchesSearch && matchesEmotion;
    });
  }, [events, searchQuery, filterEmotion]);

  const clearSearch = () => { setSearchQuery(''); setFilterEmotion(''); setShowSearchResults(false); toast.success('Search cleared'); };
  const getSearchResultText = () => (!searchQuery && !filterEmotion) ? '' : `Found ${filteredEvents.length} result${filteredEvents.length !== 1 ? 's' : ''}`;

  const generateCalendarDays = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const daysArray = [];
    for (let i = 0; i < startingDayOfWeek; i++) daysArray.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDateObj = new Date(year, month, i);
      const hasEvent = events.some(event => event.date === currentDateObj.toISOString().split('T')[0] || new Date(event.createdAt).toDateString() === currentDateObj.toDateString());
      const islamicMonth = (month + 1);
      const islamicEvent = getIslamicEvent(islamicMonth, i);
      daysArray.push({ day: i, hasEvent, islamicEvent, fullDate: currentDateObj, isToday: currentDateObj.toDateString() === new Date().toDateString() });
    }
    setCalendarDays(daysArray);
  };

  const changeMonth = (increment) => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1)); setSelectedDate(null); };

  const getQuranVerseForEmotion = async (emotionId) => {
    const emotion = API_CONFIG.EMOTIONS.find(e => e.id === emotionId);
    if (emotion) {
      try {
        const verse = await quranApi.getVerse(emotion.surah, emotion.verse);
        return { ...emotion, verseText: verse?.data?.text || emotion.text, arabic: verse?.data?.arabic || '', surahName: `Surah ${emotion.surah}`, verse: emotion.verse };
      } catch (error) { return { ...emotion, verseText: emotion.text, arabic: '', surahName: `Surah ${emotion.surah}`, verse: emotion.verse }; }
    }
    return null;
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.emotion) { toast.error('Please fill in title and emotion'); return; }
    const quranMatch = await getQuranVerseForEmotion(newEvent.emotion);
    const eventWithQuran = { ...newEvent, id: Date.now(), quranMatch, date: newEvent.date || new Date().toLocaleDateString(), createdAt: new Date().toISOString(), likes: 0, comments: [] };
    const updatedEvents = [eventWithQuran, ...events];
    saveEvents(updatedEvents);
    setShowAddEvent(false);
    setNewEvent({ title: '', emotion: '', date: '', description: '', location: '' });
    addXP(10);
    if (updateActivity) updateActivity(userId, 'event_added');
    toast.success(`✨ "${newEvent.title}" added to your timeline! +10 XP`);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      saveEvents(updatedEvents);
      toast.success('Memory removed from timeline');
    }
  };

  const handleBookmark = async (event, e) => { e.stopPropagation(); if (event.quranMatch) { toast.success(`📖 Verse from "${event.title}" saved to bookmarks! +5 XP`); addXP(5); } };
  const handleShare = async (event, e) => {
    e.stopPropagation();
    const shareText = `📜 ${event.title}\n💭 ${event.description || 'A sacred moment in my journey'}\n\nReflecting with Echoes of Jannah`;
    if (navigator.share) { try { await navigator.share({ title: 'My Spiritual Journey', text: shareText }); } catch (error) { console.log('Error sharing:', error); } }
    else { navigator.clipboard.writeText(shareText); toast.success('Copied to clipboard!'); }
  };

  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = new Date(event.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(event);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your sacred timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full mb-4">
            <FiStar className="text-emerald-600" size={14} />
            <span className="text-sm text-emerald-700 font-medium">{filteredEvents.length} Sacred Moments</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Your Sacred Timeline</h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            Every moment of your life has an echo in the Quran. Record your journey and see how Allah speaks to your heart.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by title, description, location, emotion, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">All Emotions</option>
            {API_CONFIG.EMOTIONS.map(e => (<option key={e.id} value={e.id}>{e.icon} {e.name}</option>))}
          </select>
          {(searchQuery || filterEmotion) && (
            <button onClick={clearSearch} className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition text-sm font-medium">
              Clear All
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {(searchQuery || filterEmotion) && (
          <div className="mb-6 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-emerald-600 font-semibold text-sm">🔍 Search Results:</span>
                <span className="text-gray-600 text-sm ml-2">{getSearchResultText()}</span>
                {searchQuery && <span className="text-gray-500 text-xs ml-2">for "{searchQuery}"</span>}
                {filterEmotion && <span className="text-gray-500 text-xs ml-2">{searchQuery ? 'with' : 'filtered by'} emotion: {getEmotionName(filterEmotion)}</span>}
              </div>
              <button onClick={clearSearch} className="text-xs text-gray-400 hover:text-gray-600">Clear search</button>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { id: 'timeline', label: 'Timeline', icon: FiClock },
            { id: 'calendar', label: 'Calendar', icon: FiCalendar },
            { id: 'map', label: 'Map View', icon: FiMapPin }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-5 py-2 rounded-full capitalize transition-all duration-300 flex items-center gap-2 text-sm font-medium ${
                viewMode === mode.id 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <mode.icon size={14} />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="relative">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <div className="text-6xl mb-4">{(searchQuery || filterEmotion) ? '🔍' : '📜'}</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">{(searchQuery || filterEmotion) ? 'No matching memories found' : 'No memories yet'}</h3>
                <p className="text-gray-400 text-sm">{(searchQuery || filterEmotion) ? 'Try adjusting your search or filters' : 'Click the + button to add your first life chapter'}</p>
                {(searchQuery || filterEmotion) && (<button onClick={clearSearch} className="mt-4 px-5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-sm">Clear Search</button>)}
              </div>
            ) : (
              Object.entries(groupedEvents).map(([monthYear, monthEvents], monthIdx) => (
                <div key={monthIdx} className="mb-8">
                  <div className="sticky top-20 z-10 mb-4">
                    <div className="bg-gray-100 px-3 py-1 rounded-full inline-block">
                      <h3 className="text-sm font-medium text-gray-600">{monthYear}</h3>
                    </div>
                  </div>
                  {monthEvents.map((event, idx) => (
                    <div key={event.id} className="relative pl-10 md:pl-16 mb-4">
                      <div className="absolute left-0 top-4 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm z-10">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                      
                      <div
                        className="bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer overflow-hidden"
                        onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`text-3xl ${getEmotionColor(event.emotion)}`}>
                              {getEmotionIcon(event.emotion)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{event.title}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <FiCalendar size={11} className="text-gray-400" />
                                  <span className="text-xs text-gray-500">{event.date}</span>
                                </div>
                                <span className="text-xs text-gray-300">•</span>
                                <span className={`text-xs ${getEmotionColor(event.emotion)}`}>
                                  {getEmotionName(event.emotion)}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-gray-500 text-sm mt-2">
                                  {event.description.length > 100 && selectedEvent !== event.id
                                    ? `${event.description.substring(0, 100)}...`
                                    : event.description}
                                </p>
                              )}
                              {event.location && (
                                <div className="flex items-center gap-1 mt-2">
                                  <FiMapPin size={11} className="text-gray-400" />
                                  <p className="text-gray-400 text-xs">{event.location}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button onClick={(e) => handleBookmark(event, e)} className="p-1.5 text-gray-400 hover:text-emerald-600 transition rounded-lg" title="Bookmark">
                                <FiBookmark size={14} />
                              </button>
                              <button onClick={(e) => handleShare(event, e)} className="p-1.5 text-gray-400 hover:text-emerald-600 transition rounded-lg" title="Share">
                                <FiShare2 size={14} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg" title="Delete">
                                <FiTrash2 size={14} />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-gray-600">
                                {selectedEvent === event.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                              </button>
                            </div>
                          </div>

                          {selectedEvent === event.id && event.quranMatch && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="bg-emerald-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <FiHeart className="text-emerald-500" size={12} />
                                  <p className="text-emerald-600 text-xs font-medium">Allah speaks to this moment:</p>
                                </div>
                                <p className="font-arabic text-base text-right mb-2 leading-loose text-gray-700">{event.quranMatch.arabic || '...'}</p>
                                <p className="text-gray-500 text-xs italic">{event.quranMatch.surahName}, Verse {event.quranMatch.verse}</p>
                                <p className="text-gray-600 text-xs mt-2">"{event.quranMatch.verseText || event.quranMatch.text}"</p>
                                
                                <button
                                  onClick={(e) => { e.stopPropagation(); toast.success(`🌙 Reflecting on "${event.title}". May Allah bless your journey!`); }}
                                  className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 rounded-lg transition-all text-xs"
                                >
                                  📿 Reflect & Strengthen Connection
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
                <FiChevronLeft size={20} className="text-gray-600" />
              </button>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <p className="text-xs text-gray-500 mt-1">{getArabicMonthName(currentDate.getMonth())} {currentDate.getFullYear()} AH</p>
              </div>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 transition">
                <FiChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-emerald-600 font-medium py-2 text-xs">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  onClick={() => day && setSelectedDate(day)}
                  className={`min-h-[80px] bg-white border rounded-lg p-1 transition-all cursor-pointer hover:border-emerald-300 ${
                    day?.hasEvent ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'
                  } ${day?.isToday ? 'ring-1 ring-emerald-500' : ''}`}
                >
                  {day && (
                    <div className="flex flex-col items-center h-full">
                      <span className={`text-xs font-medium ${day.hasEvent ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {day.day}
                      </span>
                      {day.islamicEvent && (
                        <div className="mt-1">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getEventTypeColor(day.islamicEvent.type)} flex items-center justify-center text-[10px] shadow-sm`} title={day.islamicEvent.name}>
                            <span>{day.islamicEvent.icon}</span>
                          </div>
                        </div>
                      )}
                      {day.hasEvent && !day.islamicEvent && (
                        <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-5 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-xs text-gray-500">Your Memory</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div><span className="text-xs text-gray-500">Eid</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div><span className="text-xs text-gray-500">Ramadan</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div><span className="text-xs text-gray-500">Important</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div><span className="text-xs text-gray-500">Holiday</span></div>
            </div>

            {selectedDate && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">
                      {selectedDate.fullDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h4>
                    {selectedDate.islamicEvent && (
                      <p className="text-emerald-600 text-xs mt-1">{selectedDate.islamicEvent.icon} {selectedDate.islamicEvent.name}</p>
                    )}
                    {selectedDate.hasEvent && <p className="text-gray-500 text-xs mt-1">✨ You have a memory recorded on this day</p>}
                  </div>
                  <button
                    onClick={() => {
                      setNewEvent({ ...newEvent, date: selectedDate.fullDate.toISOString().split('T')[0] });
                      setShowAddEvent(true);
                      setSelectedDate(null);
                    }}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium"
                  >
                    Add Memory
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map View Placeholder */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="text-5xl mb-3">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">Interactive Map Coming Soon</h3>
            <p className="text-gray-500 text-sm">Visualize your spiritual journey across the world with location-based memories.</p>
            <div className="mt-5 flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse delay-200"></div>
            </div>
          </div>
        )}

        {/* FAB Button */}
        <div className="fixed bottom-8 right-8 z-30">
          <button
            onClick={() => setShowAddEvent(true)}
            className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center hover:bg-emerald-700 hover:scale-105 transition-all duration-200 group"
          >
            <FiPlus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Modal - Fixed with proper z-index */}
        <AnimatePresence>
          {showAddEvent && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[100]"
                onClick={() => setShowAddEvent(false)}
              />
              
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white shadow-2xl z-[101] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-gray-100 p-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <FiPlus className="text-emerald-600" size={18} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Record a Life Moment</h3>
                    </div>
                    <button onClick={() => setShowAddEvent(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                      <FiX size={16} />
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2 ml-12">Every moment has an echo in the Quran</p>
                </div>
                
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      Event Title <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 'My father's advice', 'Graduation Day'"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      How did you feel? <span className="text-emerald-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {API_CONFIG.EMOTIONS.map(emotion => (
                        <button
                          key={emotion.id}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, emotion: emotion.id })}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                            newEvent.emotion === emotion.id
                              ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <span className="text-xl">{emotion.icon}</span>
                          <span className={`text-xs ${newEvent.emotion === emotion.id ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                            {emotion.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
                    <textarea
                      rows="3"
                      placeholder="What happened? What did you learn? How did it shape you?"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Location (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., 'Masjid Al-Noor', 'Home', 'University'"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <FiStar className="text-emerald-500 text-sm" />
                      <p className="text-emerald-700 text-xs font-medium">Quran Connection</p>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">
                      Based on your emotion, a Quran verse will be matched to this moment automatically.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowAddEvent(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddEvent}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-sm font-medium shadow-sm"
                    >
                      Add to Timeline
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .font-arabic { 
          font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', serif; 
        }
      `}</style>
    </div>
  );
}