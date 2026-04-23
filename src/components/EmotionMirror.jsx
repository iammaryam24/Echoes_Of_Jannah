// src/components/EmotionMirror.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, FiBookmark, FiShare2, FiSearch,
  FiX, FiArrowLeft, FiZap, FiBell, FiCheck,
  FiVolume2, FiBookOpen, FiInfo, FiCompass
} from 'react-icons/fi';
import { 
  getVerse, 
  getTafsir, 
  getTranslations, 
  saveBookmark, 
  updateActivity,
  updateStreak
} from '../api/quranFoundationApi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

// ============ COMPLETE EMOTIONS DATA - 80+ EMOTIONS ==========
const EMOTIONS_DATA = [
  // ========== POSITIVE & JOYFUL (20) ==========
  { id: 'grateful', name: 'Grateful', icon: '🙏', category: 'positive', color: 'from-green-500 to-emerald-500', gradient: 'emerald', description: 'Thankful and blessed for what you have', arabic: 'شَاكِر', surahNumber: 14, verseNumber: 7, surahName: 'Ibrahim', quranText: 'If you are grateful, I will surely increase you', arabicText: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', reminder: 'Gratitude opens doors to more blessings. Start your day by listing 3 things you are grateful for.', actionItems: ['Write down 3 blessings', 'Say Alhamdulillah 33 times', 'Help someone today'], dua: 'Alhamdulillahi rabbil alameen' },
  { id: 'joyful', name: 'Joyful', icon: '😊', category: 'positive', color: 'from-pink-500 to-rose-500', gradient: 'rose', description: 'Happy and content with life', arabic: 'فَرِح', surahNumber: 10, verseNumber: 58, surahName: 'Yunus', quranText: 'In the bounty of Allah and His mercy, let them rejoice', arabicText: 'بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا', reminder: 'Joy is a gift from Allah. Share your happiness with others.', actionItems: ['Share your joy with someone', 'Give charity', 'Smile more'], dua: 'Rabbi hab li min ladunka rahmah' },
  { id: 'hopeful', name: 'Hopeful', icon: '🌅', category: 'positive', color: 'from-orange-500 to-yellow-500', gradient: 'orange', description: 'Optimistic about the future', arabic: 'رَجَاء', surahNumber: 39, verseNumber: 53, surahName: 'Az-Zumar', quranText: 'Do not despair of Allah\'s mercy', arabicText: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ', reminder: 'Hope in Allah\'s mercy is an act of worship. Never lose it.', actionItems: ['Make a sincere dua', 'Read Surah Ad-Duha', 'Help someone in need'], dua: 'Rabbana atina fid dunya hasanah' },
  { id: 'peaceful', name: 'Peaceful', icon: '🕊️', category: 'positive', color: 'from-teal-500 to-cyan-500', gradient: 'teal', description: 'Calm and serene', arabic: 'سَلَام', surahNumber: 13, verseNumber: 28, surahName: 'Ar-Rad', quranText: 'In the remembrance of Allah do hearts find rest', arabicText: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', reminder: 'True peace comes from remembering Allah.', actionItems: ['Do 10 minutes of dhikr', 'Listen to Quran', 'Meditate'], dua: 'Allahumma anta as-salam wa minka as-salam' },
  { id: 'loved', name: 'Loved', icon: '💝', category: 'positive', color: 'from-red-400 to-pink-400', gradient: 'red', description: 'Feeling cherished and valued', arabic: 'مَحْبُوب', surahNumber: 3, verseNumber: 31, surahName: 'Ali Imran', quranText: 'Allah loves those who follow the Prophet', arabicText: 'إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ', reminder: 'Allah\'s love is the greatest love of all.', actionItems: ['Show love to family', 'Forgive someone', 'Make dua for others'], dua: 'Rabbana hablana min azwajina' },
  { id: 'blessed', name: 'Blessed', icon: '🌟', category: 'positive', color: 'from-amber-500 to-yellow-500', gradient: 'amber', description: 'Recognizing Allah\'s countless gifts', arabic: 'مُبَارَك', surahNumber: 14, verseNumber: 34, surahName: 'Ibrahim', quranText: 'If you count the blessings of Allah, you cannot enumerate them', arabicText: 'وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا', reminder: 'Count your blessings every day.', actionItems: ['Thank Allah', 'Share blessings', 'Give charity'], dua: 'Alhamdulillah ala kulli hal' },
  { id: 'confident', name: 'Confident', icon: '💪', category: 'positive', color: 'from-blue-500 to-indigo-500', gradient: 'blue', description: 'Sure and self-assured', arabic: 'وَاثِق', surahNumber: 3, verseNumber: 160, surahName: 'Ali Imran', quranText: 'If Allah helps you, none can overcome you', arabicText: 'إِن يَنصُرْكُمُ اللَّهُ فَلَا غَالِبَ لَكُمْ', reminder: 'True confidence comes from trusting Allah.', actionItems: ['Trust Allah\'s plan', 'Take positive action', 'Help others'], dua: 'Hasbunallahu wa nimal wakeel' },
  { id: 'excited', name: 'Excited', icon: '🎉', category: 'positive', color: 'from-yellow-500 to-orange-500', gradient: 'yellow', description: 'Eager and enthusiastic', arabic: 'مُتَحَمِّس', surahNumber: 62, verseNumber: 10, surahName: 'Al-Jumuah', quranText: 'Then disperse through the land and seek the bounty of Allah', arabicText: 'فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ', reminder: 'Channel your excitement into productive actions.', actionItems: ['Set a goal', 'Take first step', 'Make dua for success'], dua: 'Rabbana atina fid dunya hasanah' },
  { id: 'inspired', name: 'Inspired', icon: '✨', category: 'positive', color: 'from-purple-400 to-pink-400', gradient: 'purple', description: 'Motivated and driven', arabic: 'مُلْهَم', surahNumber: 96, verseNumber: 1, surahName: 'Al-Alaq', quranText: 'Read! In the name of your Lord', arabicText: 'اقْرَأْ بِاسْمِ رَبِّكَ', reminder: 'Seeking knowledge is a form of worship.', actionItems: ['Read a book', 'Learn a new skill', 'Share knowledge'], dua: 'Rabbi zidni ilma' },
  { id: 'content', name: 'Content', icon: '😌', category: 'positive', color: 'from-green-400 to-teal-400', gradient: 'green', description: 'Satisfied with what you have', arabic: 'قَانِع', surahNumber: 2, verseNumber: 286, surahName: 'Al-Baqarah', quranText: 'Allah does not burden a soul beyond that it can bear', arabicText: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', reminder: 'Contentment is great wealth.', actionItems: ['Practice gratitude', 'Avoid comparison', 'Help others'], dua: 'Allahumma inni as-aluka al-afiyah' },
  { id: 'optimistic', name: 'Optimistic', icon: '🌈', category: 'positive', color: 'from-purple-500 to-pink-500', gradient: 'purple', description: 'Looking at the bright side', arabic: 'مُتَفَائِل', surahNumber: 12, verseNumber: 87, surahName: 'Yusuf', quranText: 'Never lose hope of Allah\'s mercy', arabicText: 'لَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', reminder: 'Optimism is a form of trust in Allah.', actionItems: ['Think positive', 'Make dua', 'Take action'], dua: 'Ya Muqallibal qulub, thabbit qalbi ala dinik' },
  { id: 'forgiven', name: 'Forgiven', icon: '🤲', category: 'positive', color: 'from-emerald-500 to-green-500', gradient: 'emerald', description: 'Feeling absolved and clean', arabic: 'مَغْفُور', surahNumber: 39, verseNumber: 53, surahName: 'Az-Zumar', quranText: 'Allah forgives all sins', arabicText: 'إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا', reminder: 'Allah\'s mercy is greater than any sin.', actionItems: ['Thank Allah', 'Do good deeds', 'Help others'], dua: 'Rabbighfir li wa tub alayya' },
  { id: 'compassionate', name: 'Compassionate', icon: '🤗', category: 'positive', color: 'from-rose-400 to-pink-400', gradient: 'rose', description: 'Feeling empathy for others', arabic: 'رَحِيم', surahNumber: 90, verseNumber: 14, surahName: 'Al-Balad', quranText: 'Or feeding on a day of severe hunger', arabicText: 'أَوْ إِطْعَامٌ فِي يَوْمٍ ذِي مَسْغَبَةٍ', reminder: 'Compassion is a sign of true faith.', actionItems: ['Help someone in need', 'Listen actively', 'Give charity'], dua: 'Rabbi irhamhuma kama rabbayani saghira' },
  { id: 'empowered', name: 'Empowered', icon: '⚡', category: 'positive', color: 'from-indigo-500 to-purple-500', gradient: 'indigo', description: 'Feeling strong and capable', arabic: 'مُتَمَكِّن', surahNumber: 28, verseNumber: 5, surahName: 'Al-Qasas', quranText: 'We wished to confer favor upon those who were weak', arabicText: 'نُرِيدُ أَن نَّمُنَّ عَلَى الَّذِينَ اسْتُضْعِفُوا', reminder: 'Strength comes from Allah.', actionItems: ['Help the weak', 'Stand up for truth', 'Be confident'], dua: 'Allahumma inni as-aluka al-quwwah' },
  { id: 'serene', name: 'Serene', icon: '🏔️', category: 'positive', color: 'from-cyan-500 to-blue-500', gradient: 'cyan', description: 'Deeply calm and untroubled', arabic: 'سَاكِن', surahNumber: 48, verseNumber: 4, surahName: 'Al-Fath', quranText: 'He sent down tranquility into the hearts of the believers', arabicText: 'أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ', reminder: 'Tranquility is a gift from Allah.', actionItems: ['Do dhikr', 'Read Quran', 'Spend time in nature'], dua: 'Allahumma inni as-aluka al-sakinah' },
  { id: 'enthusiastic', name: 'Enthusiastic', icon: '🎯', category: 'positive', color: 'from-orange-400 to-red-400', gradient: 'orange', description: 'Full of energy and excitement', arabic: 'مُتَحَمِّس', surahNumber: 9, verseNumber: 88, surahName: 'At-Tawbah', quranText: 'But the Messenger and those who believed with him strove', arabicText: 'وَلَٰكِنَّ الرَّسُولَ وَالَّذِينَ آمَنُوا مَعَهُ جَاهَدُوا', reminder: 'Channel your enthusiasm for good deeds.', actionItems: ['Volunteer', 'Learn something new', 'Inspire others'], dua: 'Allahumma inni as-aluka an-nashata' },
  { id: 'fulfilled', name: 'Fulfilled', icon: '🏆', category: 'positive', color: 'from-yellow-400 to-amber-400', gradient: 'yellow', description: 'Satisfied with achievements', arabic: 'مُحَقَّق', surahNumber: 89, verseNumber: 27, surahName: 'Al-Fajr', quranText: 'O soul at peace, return to your Lord, well-pleased', arabicText: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً', reminder: 'True fulfillment is being pleased with Allah.', actionItems: ['Thank Allah', 'Help others succeed', 'Set new goals'], dua: 'Rabbana taqabbal minna' },
  { id: 'radiant', name: 'Radiant', icon: '☀️', category: 'positive', color: 'from-yellow-400 to-orange-400', gradient: 'sun', description: 'Glowing with happiness', arabic: 'مُشِعّ', surahNumber: 76, verseNumber: 11, surahName: 'Al-Insan', quranText: 'Allah will protect them and give them radiance and joy', arabicText: 'فَوَقَاهُمُ اللَّهُ شَرَّ ذَٰلِكَ الْيَوْمِ وَلَقَّاهُمْ نَضْرَةً وَسُرُورًا', reminder: 'Your radiance is a reflection of Allah\'s light.', actionItems: ['Smile more', 'Spread positivity', 'Be grateful'], dua: 'Allahumma inni as-aluka an-nur' },
  { id: 'victorious', name: 'Victorious', icon: '🏅', category: 'positive', color: 'from-yellow-500 to-amber-500', gradient: 'gold', description: 'Feeling triumphant', arabic: 'مُنْتَصِر', surahNumber: 61, verseNumber: 13, surahName: 'As-Saff', quranText: 'Victory from Allah and a near conquest', arabicText: 'نَصْرٌ مِّنَ اللَّهِ وَفَتْحٌ قَرِيبٌ', reminder: 'Victory comes from Allah alone.', actionItems: ['Thank Allah', 'Help others succeed', 'Stay humble'], dua: 'Allahumma inni as-aluka an-nasr' },
  { id: 'blissful', name: 'Blissful', icon: '😇', category: 'positive', color: 'from-blue-300 to-cyan-300', gradient: 'blue', description: 'Perfect happiness', arabic: 'سَعِيد', surahNumber: 11, verseNumber: 108, surahName: 'Hud', quranText: 'Those who were blessed will be in Paradise', arabicText: 'وَأَمَّا الَّذِينَ سُعِدُوا فَفِي الْجَنَّةِ', reminder: 'Bliss is a glimpse of Paradise.', actionItems: ['Do good deeds', 'Make dua', 'Share happiness'], dua: 'Allahumma inni as-aluka al-jannah' },

  // ========== SAD/HEAVY EMOTIONS (15) ==========
  { id: 'sad', name: 'Sad', icon: '😢', category: 'sad', color: 'from-blue-500 to-cyan-500', gradient: 'blue', description: 'Feeling down or heavy-hearted', arabic: 'حَزِين', surahNumber: 12, verseNumber: 86, surahName: 'Yusuf', quranText: 'I only complain of my grief and sorrow to Allah', arabicText: 'إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ', reminder: 'Allah is always listening. Pour your heart out to Him.', actionItems: ['Make dua', 'Read Quran', 'Talk to someone'], dua: 'Ya Allah, remove my sadness and grant me peace' },
  { id: 'lonely', name: 'Lonely', icon: '🌙', category: 'sad', color: 'from-indigo-500 to-purple-500', gradient: 'indigo', description: 'Seeking connection', arabic: 'وَحِيد', surahNumber: 19, verseNumber: 1, surahName: 'Maryam', quranText: 'A reminder of the mercy of your Lord', arabicText: 'ذِكْرُ رَحْمَتِ رَبِّكَ عَبْدَهُ زَكَرِيَّا', reminder: 'You are never alone. Allah is always with you.', actionItems: ['Connect with family', 'Join a community', 'Make dua'], dua: 'Allahumma inni as-aluka al-unsa' },
  { id: 'hopeless', name: 'Hopeless', icon: '🌑', category: 'sad', color: 'from-gray-600 to-gray-800', gradient: 'gray', description: 'Feeling lost without direction', arabic: 'يَائِس', surahNumber: 93, verseNumber: 3, surahName: 'Ad-Duha', quranText: 'Your Lord has not abandoned you, nor has He forgotten', arabicText: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَى', reminder: 'Never lose hope in Allah\'s mercy.', actionItems: ['Read Surah Ad-Duha', 'Make sincere dua', 'Seek help'], dua: 'Ya Hayyu ya Qayyum bi rahmatika astagheeth' },
  { id: 'heartbroken', name: 'Heartbroken', icon: '💔', category: 'sad', color: 'from-red-600 to-pink-600', gradient: 'red', description: 'Emotional pain from loss', arabic: 'مَكْسُور', surahNumber: 2, verseNumber: 155, surahName: 'Al-Baqarah', quranText: 'We will surely test you with fear and hunger', arabicText: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ', reminder: 'Trials bring you closer to Allah.', actionItems: ['Be patient', 'Make dua', 'Seek comfort in Quran'], dua: 'Inna lillahi wa inna ilayhi rajiun' },
  { id: 'grieving', name: 'Grieving', icon: '🕯️', category: 'sad', color: 'from-gray-700 to-gray-900', gradient: 'gray', description: 'Mourning a loss', arabic: 'ثَاكِل', surahNumber: 2, verseNumber: 156, surahName: 'Al-Baqarah', quranText: 'When disaster strikes, they say "Indeed we belong to Allah"', arabicText: 'الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ', reminder: 'Patience in grief brings great reward.', actionItems: ['Make dua for deceased', 'Be patient', 'Seek support'], dua: 'Allahumma ajurni fi musibati' },
  { id: 'disappointed', name: 'Disappointed', icon: '😔', category: 'sad', color: 'from-blue-600 to-indigo-600', gradient: 'blue', description: 'Expectations unmet', arabic: 'خَائِب', surahNumber: 2, verseNumber: 216, surahName: 'Al-Baqarah', quranText: 'You may dislike a thing while it is good for you', arabicText: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ', reminder: 'Allah\'s plan is always better.', actionItems: ['Trust Allah', 'Look for lessons', 'Move forward'], dua: 'Rabbana la tuzigh quloobana' },
  { id: 'empty', name: 'Empty', icon: '🕳️', category: 'sad', color: 'from-gray-500 to-gray-700', gradient: 'gray', description: 'Void or numb feeling', arabic: 'فَارِغ', surahNumber: 13, verseNumber: 28, surahName: 'Ar-Rad', quranText: 'In the remembrance of Allah do hearts find rest', arabicText: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', reminder: 'Fill your heart with remembrance of Allah.', actionItems: ['Increase dhikr', 'Read Quran', 'Attend lecture'], dua: 'Allahumma inni as-aluka imanan la yartaddu' },
  { id: 'weary', name: 'Weary', icon: '😫', category: 'sad', color: 'from-purple-600 to-indigo-600', gradient: 'purple', description: 'Tired and exhausted', arabic: 'كَلِيل', surahNumber: 2, verseNumber: 286, surahName: 'Al-Baqarah', quranText: 'Allah does not burden a soul beyond that it can bear', arabicText: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', reminder: 'Rest is also a blessing from Allah.', actionItems: ['Take rest', 'Make dua', 'Seek help'], dua: 'Rabbana la tuhammilna ma la taqata lana bih' },
  { id: 'abandoned', name: 'Abandoned', icon: '🚪', category: 'sad', color: 'from-gray-600 to-blue-600', gradient: 'gray', description: 'Feeling left behind', arabic: 'مَتْرُوك', surahNumber: 93, verseNumber: 3, surahName: 'Ad-Duha', quranText: 'Your Lord has not abandoned you', arabicText: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَى', reminder: 'Allah never abandons His servants.', actionItems: ['Make dua', 'Connect with Allah', 'Reach out'], dua: 'Hasbiyallahu la ilaha illa hu' },
  { id: 'worthless', name: 'Worthless', icon: '💔', category: 'sad', color: 'from-gray-700 to-gray-800', gradient: 'gray', description: 'Feeling of no value', arabic: 'بِلَا قِيمَة', surahNumber: 95, verseNumber: 4, surahName: 'At-Tin', quranText: 'We created you in the best form', arabicText: 'لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ', reminder: 'Allah created you in the best form.', actionItems: ['Remember your worth', 'Do good deeds', 'Help others'], dua: 'Allahumma inni as-aluka al-izza' },
  { id: 'melancholy', name: 'Melancholy', icon: '🌧️', category: 'sad', color: 'from-blue-400 to-indigo-400', gradient: 'blue', description: 'Deep, pensive sadness', arabic: 'كَئِيب', surahNumber: 12, verseNumber: 86, surahName: 'Yusuf', quranText: 'I only complain of my grief to Allah', arabicText: 'إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ', reminder: 'Allah understands your deepest feelings.', actionItems: ['Pour heart in dua', 'Read Quran', 'Seek company'], dua: 'Ya Allah, replace my sadness with joy' },
  { id: 'homesick', name: 'Homesick', icon: '🏠', category: 'sad', color: 'from-orange-400 to-red-400', gradient: 'orange', description: 'Longing for home', arabic: 'حَنِين', surahNumber: 28, verseNumber: 24, surahName: 'Al-Qasas', quranText: 'My Lord, I am in need of whatever good You send', arabicText: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', reminder: 'Jannah is our ultimate home.', actionItems: ['Make dua', 'Connect with loved ones', 'Create cozy space'], dua: 'Rabbana atina fid dunya hasanah' },
  { id: 'despairing', name: 'Despairing', icon: '💀', category: 'sad', color: 'from-gray-800 to-black', gradient: 'black', description: 'Complete loss of hope', arabic: 'يَائِس', surahNumber: 12, verseNumber: 87, surahName: 'Yusuf', quranText: 'Never lose hope of Allah\'s mercy', arabicText: 'لَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', reminder: 'Allah\'s mercy is infinite.', actionItems: ['Make tawbah', 'Read Quran', 'Seek help'], dua: 'Ya Allah, save me from despair' },
  { id: 'defeated', name: 'Defeated', icon: '🏳️', category: 'sad', color: 'from-gray-500 to-red-500', gradient: 'gray', description: 'Overwhelmed by challenges', arabic: 'مَنْهَزِم', surahNumber: 3, verseNumber: 160, surahName: 'Ali Imran', quranText: 'If Allah aids you, none can overcome you', arabicText: 'إِن يَنصُرْكُمُ اللَّهُ فَلَا غَالِبَ لَكُمْ', reminder: 'With Allah\'s help, you can overcome.', actionItems: ['Seek Allah\'s help', 'Take small steps', 'Don\'t give up'], dua: 'Hasbunallahu wa nimal wakeel' },

  // ========== ANXIOUS/FEARFUL EMOTIONS (12) ==========
  { id: 'anxious', name: 'Anxious', icon: '😰', category: 'anxious', color: 'from-yellow-500 to-orange-500', gradient: 'yellow', description: 'Worried or overwhelmed', arabic: 'قَلِق', surahNumber: 9, verseNumber: 40, surahName: 'At-Tawbah', quranText: 'Do not grieve; indeed Allah is with us', arabicText: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا', reminder: 'Allah is with you wherever you are.', actionItems: ['Breathe deeply', 'Make dua', 'Trust Allah'], dua: 'Hasbunallahu wa nimal wakeel' },
  { id: 'stressed', name: 'Stressed', icon: '😫', category: 'anxious', color: 'from-red-500 to-orange-500', gradient: 'red', description: 'Under pressure', arabic: 'مَضْغُوط', surahNumber: 94, verseNumber: 5, surahName: 'Ash-Sharh', quranText: 'Indeed, with hardship comes ease', arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', reminder: 'Every difficulty is followed by relief.', actionItems: ['Take a break', 'Pray', 'Talk to someone'], dua: 'Rabbi yassir wa la tuassir' },
  { id: 'fearful', name: 'Fearful', icon: '😨', category: 'anxious', color: 'from-red-600 to-orange-600', gradient: 'red', description: 'Afraid of something', arabic: 'خَائِف', surahNumber: 2, verseNumber: 38, surahName: 'Al-Baqarah', quranText: 'No fear shall be upon you, nor shall you grieve', arabicText: 'فَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ', reminder: 'Those who follow guidance have nothing to fear.', actionItems: ['Seek refuge in Allah', 'Read Ayatul Kursi', 'Make dua'], dua: 'Audhu bi kalimatillahit-tammati' },
  { id: 'overwhelmed', name: 'Overwhelmed', icon: '🌊', category: 'anxious', color: 'from-blue-500 to-cyan-500', gradient: 'blue', description: 'Too much to handle', arabic: 'مَغْمُور', surahNumber: 2, verseNumber: 286, surahName: 'Al-Baqarah', quranText: 'Allah does not burden a soul beyond its capacity', arabicText: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', reminder: 'You are stronger than you think.', actionItems: ['Prioritize tasks', 'Ask for help', 'Rest'], dua: 'Rabbana la tuhammilna ma la taqata lana bih' },
  { id: 'panicked', name: 'Panicked', icon: '😱', category: 'anxious', color: 'from-red-500 to-pink-500', gradient: 'red', description: 'Sudden intense fear', arabic: 'مُذْعُور', surahNumber: 8, verseNumber: 30, surahName: 'Al-Anfal', quranText: 'Allah is the best of planners', arabicText: 'وَاللَّهُ خَيْرُ الْمَاكِرِينَ', reminder: 'Allah is in control. Breathe.', actionItems: ['Deep breaths', 'Say Audhu billah', 'Make wudu'], dua: 'La ilaha illa anta subhanaka' },
  { id: 'insecure', name: 'Insecure', icon: '🤔', category: 'anxious', color: 'from-yellow-600 to-orange-600', gradient: 'yellow', description: 'Doubting oneself', arabic: 'غَيْرُ وَاثِق', surahNumber: 49, verseNumber: 13, surahName: 'Al-Hujurat', quranText: 'The most noble is the most righteous', arabicText: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ', reminder: 'Your worth is not defined by others.', actionItems: ['Remember Allah', 'Focus on strengths', 'Help others'], dua: 'Rabbana hablana min azwajina' },
  { id: 'restless', name: 'Restless', icon: '🌀', category: 'anxious', color: 'from-teal-500 to-cyan-500', gradient: 'teal', description: 'Unable to relax', arabic: 'قَلِق', surahNumber: 13, verseNumber: 28, surahName: 'Ar-Rad', quranText: 'In remembrance of Allah hearts find rest', arabicText: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', reminder: 'Dhikr brings tranquility.', actionItems: ['Do dhikr', 'Pray', 'Listen to Quran'], dua: 'Allahumma inni as-aluka al-afiyah' },
  { id: 'vulnerable', name: 'Vulnerable', icon: '🛡️', category: 'anxious', color: 'from-purple-500 to-pink-500', gradient: 'purple', description: 'Exposed and unprotected', arabic: 'ضَعِيف', surahNumber: 2, verseNumber: 257, surahName: 'Al-Baqarah', quranText: 'Allah is the protector of believers', arabicText: 'اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا', reminder: 'Allah is your ultimate protector.', actionItems: ['Seek protection', 'Make dua', 'Be cautious'], dua: 'Hasbiyallahu la ilaha illa hu' },
  { id: 'hesitant', name: 'Hesitant', icon: '🚶', category: 'anxious', color: 'from-blue-400 to-cyan-400', gradient: 'blue', description: 'Unsure about taking action', arabic: 'مُتَرَدِّد', surahNumber: 2, verseNumber: 216, surahName: 'Al-Baqarah', quranText: 'You may dislike a thing while it is good for you', arabicText: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ', reminder: 'Trust Allah\'s plan and take the step.', actionItems: ['Pray Istikhara', 'Seek advice', 'Take action'], dua: 'Rabbana atina fid dunya hasanah' },
  { id: 'paranoid', name: 'Paranoid', icon: '👀', category: 'anxious', color: 'from-purple-600 to-pink-600', gradient: 'purple', description: 'Suspicious or distrustful', arabic: 'مُرْتَاب', surahNumber: 49, verseNumber: 12, surahName: 'Al-Hujurat', quranText: 'Avoid much suspicion, some suspicion is sin', arabicText: 'اجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ', reminder: 'Think well of others.', actionItems: ['Make dua', 'Think positively', 'Seek clarity'], dua: 'Allahumma inni as-aluka al-amanah' },
  { id: 'dreading', name: 'Dreading', icon: '⏳', category: 'anxious', color: 'from-gray-500 to-gray-700', gradient: 'gray', description: 'Fearful anticipation', arabic: 'خَائِف', surahNumber: 21, verseNumber: 103, surahName: 'Al-Anbiya', quranText: 'The greatest terror will not grieve them', arabicText: 'لَا يَحْزُنُهُمُ الْفَزَعُ الْأَكْبَرُ', reminder: 'Allah protects you from what you fear.', actionItems: ['Make dua', 'Trust Allah', 'Take action'], dua: 'Allahumma inni as-aluka al-aman' },
  { id: 'apprehensive', name: 'Apprehensive', icon: '😬', category: 'anxious', color: 'from-orange-500 to-red-500', gradient: 'orange', description: 'Worried about the future', arabic: 'مُتَخَوِّف', surahNumber: 65, verseNumber: 3, surahName: 'At-Talaq', quranText: 'He will provide from where he does not expect', arabicText: 'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ', reminder: 'Trust Allah for your provisions.', actionItems: ['Make dua', 'Plan but trust Allah', 'Let go'], dua: 'Hasbiyallahu la ilaha illa hu' },

  // ========== GUILTY/REGRETFUL EMOTIONS (10) ==========
  { id: 'guilty', name: 'Guilty', icon: '💭', category: 'guilty', color: 'from-red-500 to-pink-500', gradient: 'red', description: 'Carrying regret or shame', arabic: 'مُذْنِب', surahNumber: 39, verseNumber: 53, surahName: 'Az-Zumar', quranText: 'Do not despair of Allah\'s mercy. Allah forgives all sins', arabicText: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا', reminder: 'Allah\'s mercy is greater than any sin.', actionItems: ['Make tawbah', 'Seek forgiveness', 'Do good deeds'], dua: 'Rabbighfir li wa tub alayya' },
  { id: 'ashamed', name: 'Ashamed', icon: '😳', category: 'guilty', color: 'from-red-600 to-pink-600', gradient: 'red', description: 'Embarrassed by actions', arabic: 'خَجِل', surahNumber: 66, verseNumber: 8, surahName: 'At-Tahrim', quranText: 'Turn to Allah in sincere repentance', arabicText: 'تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا', reminder: 'Sincere repentance wipes away past sins.', actionItems: ['Make tawbah', 'Rectify mistakes', 'Do good'], dua: 'Allahumma inni as-aluka tawbatan nasuhan' },
  { id: 'regretful', name: 'Regretful', icon: '😞', category: 'guilty', color: 'from-red-700 to-pink-700', gradient: 'red', description: 'Wishing you did differently', arabic: 'نَادِم', surahNumber: 25, verseNumber: 70, surahName: 'Al-Furqan', quranText: 'Allah will replace evil deeds with good', arabicText: 'فَأُولَٰئِكَ يُبَدِّلُ اللَّهُ سَيِّئَاتِهِمْ حَسَنَاتٍ', reminder: 'Good deeds erase bad deeds.', actionItems: ['Do good deeds', 'Help others', 'Make dua'], dua: 'Rabbana zalamna anfusana' },
  { id: 'remorseful', name: 'Remorseful', icon: '😔', category: 'guilty', color: 'from-red-500 to-rose-500', gradient: 'rose', description: 'Deep regret for wrongs', arabic: 'تَائِب', surahNumber: 20, verseNumber: 82, surahName: 'Ta-Ha', quranText: 'I am the Perpetual Forgiver of whoever repents', arabicText: 'وَإِنِّي لَغَفَّارٌ لِّمَن تَابَ', reminder: 'Allah loves those who repent.', actionItems: ['Repent sincerely', 'Change ways', 'Make amends'], dua: 'Allahumma inni as-aluka al-afwa wal-afiyah' },
  { id: 'sinful', name: 'Sinful', icon: '⚡', category: 'guilty', color: 'from-red-800 to-pink-800', gradient: 'red', description: 'Burdened by sins', arabic: 'خَاطِئ', surahNumber: 39, verseNumber: 53, surahName: 'Az-Zumar', quranText: 'Allah forgives all sins', arabicText: 'إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا', reminder: 'No sin is too great for Allah\'s forgiveness.', actionItems: ['Seek forgiveness', 'Do good', 'Make tawbah'], dua: 'Rabbi inni zalamtu nafsi' },
  { id: 'apologetic', name: 'Apologetic', icon: '🙇', category: 'guilty', color: 'from-orange-500 to-red-500', gradient: 'orange', description: 'Wanting to say sorry', arabic: 'مُعْتَذِر', surahNumber: 3, verseNumber: 135, surahName: 'Ali Imran', quranText: 'Those who commit evil seek forgiveness', arabicText: 'وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً اسْتَغْفَرُوا', reminder: 'Seek forgiveness and move forward.', actionItems: ['Apologize', 'Make amends', 'Do better'], dua: 'Allahumma inni as-aluka al-afwa' },
  { id: 'selfCritical', name: 'Self-Critical', icon: '🔍', category: 'guilty', color: 'from-gray-500 to-gray-700', gradient: 'gray', description: 'Harsh on yourself', arabic: 'نَاقِد', surahNumber: 49, verseNumber: 11, surahName: 'Al-Hujurat', quranText: 'Do not ridicule yourselves', arabicText: 'وَلَا تَلْمِزُوا أَنفُسَكُمْ', reminder: 'Be kind to yourself.', actionItems: ['Practice self-compassion', 'Forgive yourself', 'Improve'], dua: 'Allahumma inni as-aluka al-afiyah' },
  { id: 'conscienceStricken', name: 'Conscience-Stricken', icon: '⚖️', category: 'guilty', color: 'from-indigo-500 to-purple-500', gradient: 'indigo', description: 'Troubled by conscience', arabic: 'مُؤَنَّب', surahNumber: 75, verseNumber: 2, surahName: 'Al-Qiyamah', quranText: 'I swear by the self-accusing soul', arabicText: 'وَلَا أُقْسِمُ بِالنَّفْسِ اللَّوَّامَةِ', reminder: 'Your conscience is a gift.', actionItems: ['Listen to conscience', 'Make things right', 'Repent'], dua: 'Rabbana atina fid dunya hasanah' },
  { id: 'embarrassed', name: 'Embarrassed', icon: '🫣', category: 'guilty', color: 'from-pink-500 to-rose-500', gradient: 'pink', description: 'Feeling awkward', arabic: 'مُحْرَج', surahNumber: 28, verseNumber: 25, surahName: 'Al-Qasas', quranText: 'She came walking in modesty', arabicText: 'فَجَاءَتْهُ إِحْدَاهُمَا تَمْشِي عَلَى اسْتِحْيَاءٍ', reminder: 'Modesty is a virtue.', actionItems: ['Accept yourself', 'Learn', 'Move on'], dua: 'Allahumma inni as-aluka al-haya' },
  { id: 'disgraced', name: 'Disgraced', icon: '😞', category: 'guilty', color: 'from-gray-600 to-gray-800', gradient: 'gray', description: 'Feeling humiliated', arabic: 'مَخْزِيّ', surahNumber: 11, verseNumber: 18, surahName: 'Hud', quranText: 'Allah forgives and accepts repentance', arabicText: 'رَبُّنَا إِنَّكَ جَامِعُ النَّاسِ', reminder: 'Allah elevates those who repent.', actionItems: ['Seek forgiveness', 'Do good deeds', 'Help others'], dua: 'Rabbana ighfir lana' },

  // ========== CONFUSED/LOST EMOTIONS (10) ==========
  { id: 'confused', name: 'Confused', icon: '🤔', category: 'confused', color: 'from-purple-500 to-pink-500', gradient: 'purple', description: 'Seeking clarity', arabic: 'حَائِر', surahNumber: 1, verseNumber: 6, surahName: 'Al-Fatiha', quranText: 'Guide us to the straight path', arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', reminder: 'Ask Allah for guidance.', actionItems: ['Pray Istikhara', 'Seek knowledge', 'Consult others'], dua: 'Rabbish rahli sadri' },
  { id: 'lost', name: 'Lost', icon: '🧭', category: 'confused', color: 'from-blue-500 to-indigo-500', gradient: 'blue', description: 'Searching for direction', arabic: 'ضَالّ', surahNumber: 6, verseNumber: 71, surahName: 'Al-Anam', quranText: 'Shall we call upon what does not benefit us?', arabicText: 'أَنَدْعُو مِن دُونِ اللَّهِ مَا لَا يَنفَعُنَا', reminder: 'Allah\'s guidance is true guidance.', actionItems: ['Read Quran', 'Attend classes', 'Make dua'], dua: 'Ihdinas siratal mustaqim' },
  { id: 'uncertain', name: 'Uncertain', icon: '❓', category: 'confused', color: 'from-purple-400 to-indigo-400', gradient: 'purple', description: 'Unsure about decisions', arabic: 'غَيْرُ مُتَأَكِّد', surahNumber: 2, verseNumber: 216, surahName: 'Al-Baqarah', quranText: 'You may dislike a thing while it is good for you', arabicText: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ', reminder: 'Trust Allah\'s wisdom.', actionItems: ['Pray Istikhara', 'Trust Allah', 'Take action'], dua: 'Rabbana atina fid dunya hasanah' },
  { id: 'doubtful', name: 'Doubtful', icon: '🤨', category: 'confused', color: 'from-purple-600 to-indigo-600', gradient: 'purple', description: 'Questioning beliefs', arabic: 'شَاكّ', surahNumber: 49, verseNumber: 15, surahName: 'Al-Hujurat', quranText: 'Believers believe in Allah without doubt', arabicText: 'إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ آمَنُوا بِاللَّهِ ثُمَّ لَمْ يَرْتَابُوا', reminder: 'Seek knowledge to strengthen faith.', actionItems: ['Study Islam', 'Ask scholars', 'Read translation'], dua: 'Allahumma zidni imanan' },
  { id: 'indecisive', name: 'Indecisive', icon: '⚖️', category: 'confused', color: 'from-purple-500 to-blue-500', gradient: 'purple', description: 'Struggling to choose', arabic: 'مُتَرَدِّد', surahNumber: 28, verseNumber: 56, surahName: 'Al-Qasas', quranText: 'Allah guides whom He wills', arabicText: 'إِنَّ اللَّهَ يَهْدِي مَن يَشَاءُ', reminder: 'Seek guidance then decide.', actionItems: ['Pray Istikhara', 'Make list', 'Trust Allah'], dua: 'Allahumma inni as-aluka al-huda' },
  { id: 'perplexed', name: 'Perplexed', icon: '😵', category: 'confused', color: 'from-red-400 to-orange-400', gradient: 'red', description: 'Bewildered and puzzled', arabic: 'مُتَحَيِّر', surahNumber: 2, verseNumber: 260, surahName: 'Al-Baqarah', quranText: 'Show me how You give life to the dead', arabicText: 'أَرِنِي كَيْفَ تُحْيِي الْمَوْتَىٰ', reminder: 'Ask Allah for understanding.', actionItems: ['Make dua', 'Seek knowledge', 'Be patient'], dua: 'Rabbana la tuzigh quloobana' },
  { id: 'ambivalent', name: 'Ambivalent', icon: '↔️', category: 'confused', color: 'from-gray-500 to-gray-700', gradient: 'gray', description: 'Mixed feelings', arabic: 'مُتَضَارِب', surahNumber: 3, verseNumber: 7, surahName: 'Ali Imran', quranText: 'Only those firm in knowledge understand', arabicText: 'وَمَا يَعْلَمُ تَأْوِيلَهُ إِلَّا اللَّهُ', reminder: 'Seek clarity through knowledge.', actionItems: ['Research', 'Consult experts', 'Make dua'], dua: 'Rabbish rahli sadri wa yassir li amri' },
  { id: 'bewildered', name: 'Bewildered', icon: '😕', category: 'confused', color: 'from-blue-300 to-cyan-300', gradient: 'blue', description: 'Completely puzzled', arabic: 'مَبْهُوت', surahNumber: 18, verseNumber: 22, surahName: 'Al-Kahf', quranText: 'They will say they were three', arabicText: 'سَيَقُولُونَ ثَلَاثَةٌ', reminder: 'Seek truth with an open heart.', actionItems: ['Research', 'Ask for help', 'Be patient'], dua: 'Allahumma arinal haqqa haqqan' },
  { id: 'distracted', name: 'Distracted', icon: '🎪', category: 'confused', color: 'from-yellow-500 to-orange-500', gradient: 'yellow', description: 'Unable to focus', arabic: 'مُشَتَّت', surahNumber: 18, verseNumber: 46, surahName: 'Al-Kahf', quranText: 'Wealth and children are adornment', arabicText: 'الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا', reminder: 'Focus on what truly matters.', actionItems: ['Prioritize', 'Remove distractions', 'Make dua'], dua: 'Allahumma inni as-aluka al-huda' },
  { id: 'clueless', name: 'Clueless', icon: '🤷', category: 'confused', color: 'from-gray-400 to-gray-600', gradient: 'gray', description: 'No idea what to do', arabic: 'لَا أَدْرِي', surahNumber: 12, verseNumber: 86, surahName: 'Yusuf', quranText: 'I complain of my grief to Allah', arabicText: 'إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ', reminder: 'Turn to Allah when lost.', actionItems: ['Make dua', 'Seek advice', 'Take small step'], dua: 'Ya Allah, show me the way' },

  // ========== ANGER/FRUSTRATION EMOTIONS (10) ==========
  { id: 'angry', name: 'Angry', icon: '😠', category: 'angry', color: 'from-red-500 to-orange-500', gradient: 'red', description: 'Frustrated or mad', arabic: 'غَاضِب', surahNumber: 3, verseNumber: 134, surahName: 'Ali Imran', quranText: 'Who restrain anger and pardon people', arabicText: 'وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ', reminder: 'Controlling anger is true strength.', actionItems: ['Make wudu', 'Sit down', 'Say Audhu billah'], dua: 'Allahumma inni as-aluka al-hilm' },
  { id: 'frustrated', name: 'Frustrated', icon: '😤', category: 'angry', color: 'from-orange-500 to-red-500', gradient: 'orange', description: 'Annoyed by obstacles', arabic: 'مُحْبَط', surahNumber: 2, verseNumber: 153, surahName: 'Al-Baqarah', quranText: 'Seek help through patience and prayer', arabicText: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', reminder: 'Patience and prayer are powerful.', actionItems: ['Pray 2 rakats', 'Deep breaths', 'Step away'], dua: 'Hasbiyallahu la ilaha illa hu' },
  { id: 'jealous', name: 'Jealous', icon: '😒', category: 'angry', color: 'from-green-600 to-yellow-600', gradient: 'green', description: 'Envious of others', arabic: 'حَاسِد', surahNumber: 113, verseNumber: 5, surahName: 'Al-Falaq', quranText: 'From the evil of the envier', arabicText: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', reminder: 'Jealousy burns away good deeds.', actionItems: ['Make dua for them', 'Count blessings', 'Avoid comparison'], dua: 'Allahumma barik lahu' },
  { id: 'impatient', name: 'Impatient', icon: '⏰', category: 'angry', color: 'from-yellow-500 to-orange-500', gradient: 'yellow', description: 'Unable to wait', arabic: 'غَيْرُ صَابِر', surahNumber: 103, verseNumber: 3, surahName: 'Al-Asr', quranText: 'Encourage truth and patience', arabicText: 'وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', reminder: 'Patience is key to success.', actionItems: ['Make dua for patience', 'Distract yourself', 'Trust timing'], dua: 'Rabbana afrigh alayna sabran' },
  { id: 'resentful', name: 'Resentful', icon: '😤', category: 'angry', color: 'from-red-600 to-orange-600', gradient: 'red', description: 'Bitter from past hurts', arabic: 'مُحْتَقِد', surahNumber: 42, verseNumber: 40, surahName: 'Ash-Shura', quranText: 'Whoever forgives, his reward is with Allah', arabicText: 'فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُ عَلَى اللَّهِ', reminder: 'Forgiveness brings reward.', actionItems: ['Forgive', 'Let go', 'Make dua for them'], dua: 'Allahumma inni as-aluka al-afwa' },
  { id: 'irritated', name: 'Irritated', icon: '😣', category: 'angry', color: 'from-yellow-400 to-orange-400', gradient: 'yellow', description: 'Mildly annoyed', arabic: 'مُنْزَعِج', surahNumber: 3, verseNumber: 134, surahName: 'Ali Imran', quranText: 'Who restrain anger and pardon people', arabicText: 'وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ', reminder: 'Small annoyances build patience.', actionItems: ['Deep breath', 'Count to 10', 'Make wudu'], dua: 'Auzu billahi min ash-shaytan ir-rajim' },
  { id: 'vengeful', name: 'Vengeful', icon: '⚔️', category: 'angry', color: 'from-red-700 to-red-900', gradient: 'red', description: 'Wanting revenge', arabic: 'انْتِقَام', surahNumber: 42, verseNumber: 43, surahName: 'Ash-Shura', quranText: 'Whoever is patient and forgives', arabicText: 'وَلَمَن صَبَرَ وَغَفَرَ إِنَّ ذَٰلِكَ لَمِنْ عَزْمِ الْأُمُورِ', reminder: 'Forgiveness is greater than revenge.', actionItems: ['Make dua for them', 'Let go', 'Focus on yourself'], dua: 'Rabbana ighfir lana wa li ikhwanina' },
  { id: 'bitter', name: 'Bitter', icon: '🍋', category: 'angry', color: 'from-amber-700 to-orange-700', gradient: 'amber', description: 'Harboring resentment', arabic: 'مُرّ', surahNumber: 3, verseNumber: 134, surahName: 'Ali Imran', quranText: 'And those who pardon people', arabicText: 'وَالْعَافِينَ عَنِ النَّاسِ', reminder: 'Bitterness only hurts you.', actionItems: ['Practice forgiveness', 'Make dua', 'Move forward'], dua: 'Allahumma inni as-aluka al-afiyah' },
  { id: 'hostile', name: 'Hostile', icon: '🗡️', category: 'angry', color: 'from-red-800 to-red-900', gradient: 'red', description: 'Aggressive feelings', arabic: 'عَدَائِي', surahNumber: 41, verseNumber: 34, surahName: 'Fussilat', quranText: 'Repel evil with that which is better', arabicText: 'ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ', reminder: 'Respond to hostility with kindness.', actionItems: ['Walk away', 'Make wudu', 'Make dua'], dua: 'Allahumma inni as-aluka as-sabr' },
  { id: 'explosive', name: 'Explosive', icon: '💥', category: 'angry', color: 'from-orange-600 to-red-600', gradient: 'orange', description: 'Ready to burst with anger', arabic: 'مُنْفَجِر', surahNumber: 3, verseNumber: 134, surahName: 'Ali Imran', quranText: 'Allah loves the doers of good', arabicText: 'وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ', reminder: 'Control explosive anger.', actionItems: ['Step away', 'Make wudu', 'Sit', 'Breathe'], dua: 'Allahumma inni as-aluka al-hilm' },

  // ========== ADDITIONAL SPIRITUAL EMOTIONS (7) ==========
  { id: 'connected', name: 'Connected to Allah', icon: '🕌', category: 'positive', color: 'from-emerald-600 to-teal-600', gradient: 'emerald', description: 'Feeling close to your Creator', arabic: 'مُتَّصِل', surahNumber: 2, verseNumber: 186, surahName: 'Al-Baqarah', quranText: 'I am near. I answer the call of the caller', arabicText: 'أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ', reminder: 'Allah is always near.', actionItems: ['Make dua', 'Pray extra', 'Read Quran'], dua: 'Allahumma inni as-aluka al-qurb' },
  { id: 'repentant', name: 'Repentant', icon: '🕋', category: 'guilty', color: 'from-green-600 to-emerald-600', gradient: 'green', description: 'Turning back to Allah', arabic: 'تَائِب', surahNumber: 66, verseNumber: 8, surahName: 'At-Tahrim', quranText: 'Turn to Allah in sincere repentance', arabicText: 'تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا', reminder: 'Every moment is a fresh start.', actionItems: ['Make tawbah', 'Do good deeds', 'Change ways'], dua: 'Allahumma inni as-aluka tawbatan nasuhan' },
  { id: 'trusting', name: 'Trusting in Allah', icon: '🤲', category: 'positive', color: 'from-blue-500 to-indigo-500', gradient: 'blue', description: 'Complete reliance on Allah', arabic: 'مُتَوَكِّل', surahNumber: 65, verseNumber: 3, surahName: 'At-Talaq', quranText: 'Whoever relies upon Allah, He is sufficient', arabicText: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', reminder: 'Tawakkul brings peace.', actionItems: ['Do your best', 'Make dua', 'Let go of worry'], dua: 'Hasbunallahu wa nimal wakeel' },
  { id: 'yearning', name: 'Yearning for Jannah', icon: '🌹', category: 'positive', color: 'from-red-400 to-pink-500', gradient: 'red', description: 'Longing for Paradise', arabic: 'مُشْتَاق', surahNumber: 3, verseNumber: 133, surahName: 'Ali Imran', quranText: 'Race toward forgiveness and a Garden', arabicText: 'وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ', reminder: 'Yearning for Jannah motivates.', actionItems: ['Do good deeds', 'Make dua for Jannah', 'Avoid sins'], dua: 'Allahumma inni as-aluka al-jannah' },
  { id: 'awe', name: 'In Awe of Allah', icon: '🌌', category: 'positive', color: 'from-purple-600 to-indigo-600', gradient: 'purple', description: 'Overwhelmed by Allah\'s greatness', arabic: 'خَاشِع', surahNumber: 39, verseNumber: 23, surahName: 'Az-Zumar', quranText: 'Skins shiver of those who fear their Lord', arabicText: 'تَقْشَعِرُّ مِنْهُ جُلُودُ الَّذِينَ يَخْشَوْنَ رَبَّهُمْ', reminder: 'Awe brings humility.', actionItems: ['Reflect on creation', 'Read Quran', 'Pray at night'], dua: 'Subhanallah wa bihamdihi' }
];

const categories = [
  { id: 'all', name: 'All Emotions', icon: '🌿', count: EMOTIONS_DATA.length, color: 'from-gray-500 to-gray-600' },
  { id: 'positive', name: 'Joyful & Positive', icon: '😊', count: EMOTIONS_DATA.filter(e => e.category === 'positive').length, color: 'from-emerald-500 to-teal-500' },
  { id: 'sad', name: 'Sad & Heavy', icon: '💔', count: EMOTIONS_DATA.filter(e => e.category === 'sad').length, color: 'from-blue-500 to-cyan-500' },
  { id: 'anxious', name: 'Anxious & Fearful', icon: '😰', count: EMOTIONS_DATA.filter(e => e.category === 'anxious').length, color: 'from-amber-500 to-orange-500' },
  { id: 'guilty', name: 'Guilty & Regretful', icon: '💭', count: EMOTIONS_DATA.filter(e => e.category === 'guilty').length, color: 'from-red-500 to-pink-500' },
  { id: 'confused', name: 'Confused & Lost', icon: '🤔', count: EMOTIONS_DATA.filter(e => e.category === 'confused').length, color: 'from-purple-500 to-pink-500' },
  { id: 'angry', name: 'Angry & Frustrated', icon: '😠', count: EMOTIONS_DATA.filter(e => e.category === 'angry').length, color: 'from-red-600 to-orange-600' }
];

export default function EmotionMirror({ userId }) {
  const { addBookmark, addXP } = useUser();
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [quranResponse, setQuranResponse] = useState(null);
  const [tafsirData, setTafsirData] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showTafsir, setShowTafsir] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const lastReminderDate = localStorage.getItem('last_reminder_date');
    const today = new Date().toDateString();
    
    if (lastReminderDate !== today) {
      const randomEmotion = EMOTIONS_DATA[Math.floor(Math.random() * EMOTIONS_DATA.length)];
      setDailyReminder(randomEmotion);
      localStorage.setItem('last_reminder_date', today);
      localStorage.setItem('daily_reminder', JSON.stringify(randomEmotion));
    } else {
      const saved = localStorage.getItem('daily_reminder');
      if (saved) setDailyReminder(JSON.parse(saved));
    }
    
    loadFavorites();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  const loadFavorites = () => {
    const saved = localStorage.getItem(`emotion_favorites_${userId}`);
    if (saved) setFavorites(JSON.parse(saved));
  };

  const saveFavorite = (emotion) => {
    const exists = favorites.find(f => f.id === emotion.id);
    let newFavorites;
    if (exists) {
      newFavorites = favorites.filter(f => f.id !== emotion.id);
      toast.success(`Removed ${emotion.name} from favorites`);
    } else {
      newFavorites = [...favorites, emotion];
      toast.success(`Added ${emotion.name} to favorites 💖`);
    }
    setFavorites(newFavorites);
    localStorage.setItem(`emotion_favorites_${userId}`, JSON.stringify(newFavorites));
  };

  const fetchQuranVerse = async (emotion) => {
    try {
      const verseData = await getVerse(emotion.surahNumber, emotion.verseNumber);
      const tafsir = await getTafsir(emotion.surahNumber, emotion.verseNumber);
      const trans = await getTranslations(emotion.surahNumber, emotion.verseNumber);
      return {
        verseText: verseData?.data?.text || emotion.quranText,
        arabicText: verseData?.data?.arabic || emotion.arabicText,
        tafsir: tafsir,
        translations: trans || []
      };
    } catch (error) {
      return { verseText: emotion.quranText, arabicText: emotion.arabicText, tafsir: null, translations: [] };
    }
  };

  const playVerseAudio = async (surahNumber, verseNumber) => {
    try {
      if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setAudioPlaying(null); }
      const surahNum = surahNumber.toString().padStart(3, '0');
      const verseNum = verseNumber.toString().padStart(3, '0');
      const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNum}${verseNum}.mp3`;
      const audio = new Audio(audioUrl);
      audio.volume = 0.5;
      audio.oncanplaythrough = () => audio.play().catch(() => toast.error('Audio playback failed'));
      setCurrentAudio(audio);
      setAudioPlaying(`${surahNumber}:${verseNumber}`);
      audio.onended = () => { setAudioPlaying(null); setCurrentAudio(null); };
      toast.success(`Playing Surah ${surahNumber}, Verse ${verseNumber}`);
    } catch (error) {
      toast.error('Audio not available');
    }
  };

  const stopAudio = () => {
    if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setAudioPlaying(null); }
  };

  const handleEmotionSelect = async (emotion) => {
    stopAudio();
    setSelectedEmotion(emotion);
    setLoading(true);
    setShowTafsir(false);
    setShowTranslations(false);
    setShowReminder(false);
    
    try {
      const verseData = await fetchQuranVerse(emotion);
      setQuranResponse({
        surahNumber: emotion.surahNumber, verseNumber: emotion.verseNumber, surahName: emotion.surahName,
        verseText: verseData.verseText, arabicText: verseData.arabicText,
        reminder: emotion.reminder, actionItems: emotion.actionItems, dua: emotion.dua,
        color: emotion.color, gradient: emotion.gradient
      });
      setTafsirData(verseData.tafsir);
      setTranslations(verseData.translations);
      await updateStreak(userId);
      await updateActivity(userId, 'emotion_reflection', 1);
      addXP(15);
      toast.success(`✨ Allah sees your ${emotion.name} heart`, { icon: '💚' });
    } catch (error) {
      setQuranResponse({
        surahNumber: emotion.surahNumber, verseNumber: emotion.verseNumber, surahName: emotion.surahName,
        verseText: emotion.quranText, arabicText: emotion.arabicText,
        reminder: emotion.reminder, actionItems: emotion.actionItems, dua: emotion.dua,
        color: emotion.color, gradient: emotion.gradient
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmotions = () => {
    stopAudio();
    setSelectedEmotion(null);
    setQuranResponse(null);
    setTafsirData(null);
    setTranslations([]);
  };

  const handleBookmark = async () => {
    if (quranResponse && selectedEmotion) {
      await saveBookmark(userId, `${quranResponse.surahNumber}:${quranResponse.verseNumber}`, quranResponse.surahNumber, quranResponse.verseNumber, `Emotion: ${selectedEmotion.name}`);
      addBookmark(quranResponse);
      addXP(5);
      toast.success('📖 Saved to your collection!');
    }
  };

  const handleShare = () => {
    if (quranResponse && selectedEmotion) {
      const text = `🌙 Echoes of Jannah\n\nFeeling ${selectedEmotion.name}: "${quranResponse.verseText}"\n\n📖 Surah ${quranResponse.surahName}, Verse ${quranResponse.verseNumber}\n\n💭 ${selectedEmotion.reminder}`;
      if (navigator.share) navigator.share({ title: 'Echoes of Jannah', text });
      else { navigator.clipboard.writeText(text); toast.success('Copied to clipboard!'); }
    }
  };

  const filteredEmotions = EMOTIONS_DATA.filter(emotion => {
    const matchesSearch = debouncedSearch === '' || emotion.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || emotion.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = filterCategory === 'all' || emotion.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getGradientClass = (color) => {
    const gradients = { emerald: 'bg-emerald-50', rose: 'bg-pink-50', orange: 'bg-orange-50', teal: 'bg-teal-50', red: 'bg-red-50', amber: 'bg-amber-50', blue: 'bg-blue-50', yellow: 'bg-yellow-50', purple: 'bg-purple-50', green: 'bg-green-50', indigo: 'bg-indigo-50', cyan: 'bg-cyan-50', gray: 'bg-gray-50', pink: 'bg-pink-50', gold: 'bg-yellow-50', sun: 'bg-orange-50', black: 'bg-gray-50' };
    return gradients[color] || 'bg-gray-50';
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-3">
          <FiHeart className="text-emerald-500" size={14} />
          <span className="text-xs text-gray-600 font-medium">{EMOTIONS_DATA.length}+ Emotions</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Emotion Mirror</h2>
        <p className="text-gray-500 text-sm mt-2">Share what is in your heart — receive divine guidance from the Quran</p>
      </div>

      {dailyReminder && !selectedEmotion && (
        <div className={`bg-white border border-emerald-200 rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all ${getGradientClass(dailyReminder.gradient)}`} onClick={() => handleEmotionSelect(dailyReminder)}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{dailyReminder.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><span className="text-xs text-emerald-600">✨ Daily Reminder</span><span className="text-xs text-emerald-500">• Surah {dailyReminder.surahName}</span></div>
              <p className="text-sm text-gray-700 mt-1">{dailyReminder.reminder}</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-600 text-sm">Reflect</div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedEmotion && (
          <button onClick={handleBackToEmotions} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2">
            <FiArrowLeft size={16} /><span className="text-sm">Back to all emotions</span>
          </button>
        )}
      </AnimatePresence>

      {!selectedEmotion && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search emotions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><FiX size={16} /></button>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setFilterCategory(cat.id)} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1.5 transition-all ${filterCategory === cat.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <span>{cat.icon}</span><span>{cat.name}</span><span className="text-xs opacity-70">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center"><p className="text-sm text-gray-500">Showing {filteredEmotions.length} of {EMOTIONS_DATA.length} emotions</p><button onClick={() => setShowFavorites(!showFavorites)} className="text-sm text-emerald-600 flex items-center gap-1"><FiHeart size={12} />{showFavorites ? 'Hide' : `Favorites (${favorites.length})`}</button></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {(showFavorites ? favorites : filteredEmotions).map((emotion) => (
              <div key={emotion.id} className={`bg-white border border-gray-100 rounded-xl p-3 text-center group relative overflow-hidden cursor-pointer hover:border-emerald-200 hover:shadow-sm transition-all ${getGradientClass(emotion.gradient)}`}>
                <div onClick={(e) => { e.stopPropagation(); saveFavorite(emotion); }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-pointer"><FiHeart size={12} className={favorites.find(f => f.id === emotion.id) ? 'text-pink-500 fill-pink-500' : 'text-gray-400 hover:text-pink-500'} /></div>
                <div onClick={() => handleEmotionSelect(emotion)}><div className="text-4xl mb-1 group-hover:scale-110 transition-transform">{emotion.icon}</div><div className="font-medium text-gray-800 text-sm">{emotion.name}</div><div className="text-xs text-gray-500 mt-1 line-clamp-2">{emotion.description}</div><div className="text-[10px] text-emerald-400 mt-1 opacity-0 group-hover:opacity-100">{emotion.surahName} : {emotion.verseNumber}</div></div>
              </div>
            ))}
          </div>
          {filteredEmotions.length === 0 && (<div className="text-center py-12 bg-gray-50 rounded-xl"><div className="text-4xl mb-3">🔍</div><h3 className="text-lg font-medium text-gray-700">No emotions found</h3><button onClick={() => { setSearchQuery(''); setFilterCategory('all'); }} className="mt-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm">Clear Filters</button></div>)}
        </>
      )}

      <AnimatePresence>
        {selectedEmotion && quranResponse && !loading && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 relative overflow-hidden shadow-sm">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${selectedEmotion.color} rounded-full blur-3xl opacity-5`} />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3"><div className="text-5xl">{selectedEmotion.icon}</div><div><h3 className="text-xl font-semibold text-gray-800">Feeling {selectedEmotion.name}</h3><p className="text-gray-500 text-sm">{selectedEmotion.description}</p></div></div>
                <div className="flex gap-1"><button onClick={() => audioPlaying ? stopAudio() : playVerseAudio(selectedEmotion.surahNumber, selectedEmotion.verseNumber)} className="p-1.5 rounded-lg hover:bg-gray-100">{audioPlaying ? <FiX size={14} className="text-red-500" /> : <FiVolume2 size={14} className="text-emerald-600" />}</button><button onClick={() => setShowReminder(!showReminder)} className="p-1.5 rounded-lg hover:bg-gray-100"><FiBell size={14} className={showReminder ? 'text-emerald-600' : 'text-gray-400'} /></button><button onClick={() => setShowTafsir(!showTafsir)} className="p-1.5 rounded-lg hover:bg-gray-100"><FiBookOpen size={14} className={showTafsir ? 'text-emerald-600' : 'text-gray-400'} /></button><button onClick={() => setShowTranslations(!showTranslations)} className="p-1.5 rounded-lg hover:bg-gray-100"><FiInfo size={14} className={showTranslations ? 'text-emerald-600' : 'text-gray-400'} /></button><button onClick={handleBookmark} className="p-1.5 rounded-lg hover:bg-gray-100"><FiBookmark size={14} className="text-gray-400" /></button><button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-gray-100"><FiShare2 size={14} className="text-gray-400" /></button></div>
              </div>
              <div className={`p-5 rounded-xl bg-gradient-to-r ${getGradientClass(selectedEmotion.gradient)} border border-emerald-100`}>
                <p className="font-arabic text-xl md:text-3xl text-center mb-4 text-gray-800">{quranResponse.arabicText}</p>
                <p className="text-gray-700 text-base italic text-center">"{quranResponse.verseText}"</p>
                <p className="text-gray-500 text-sm text-center mt-3">Surah {quranResponse.surahName} • Verse {quranResponse.verseNumber}</p>
              </div>
              <AnimatePresence>{showReminder && (<div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100"><h4 className="font-medium text-emerald-700 text-xs flex items-center gap-2 mb-1"><FiBell size={12} />Spiritual Reminder</h4><p className="text-gray-600 text-sm">{selectedEmotion.reminder}</p><div className="mt-2"><p className="text-[10px] text-emerald-600 mb-1">Action Items:</p><ul className="text-xs text-gray-500 space-y-1">{selectedEmotion.actionItems.map((item, i) => <li key={i} className="flex items-center gap-2"><FiCheck size={9} className="text-emerald-500" /><span>{item}</span></li>)}</ul></div></div>)}</AnimatePresence>
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100"><h4 className="font-medium text-amber-700 text-xs flex items-center gap-2 mb-1"><FiCompass size={12} />Recommended Dua</h4><p className="text-gray-600 text-sm italic">"{selectedEmotion.dua}"</p></div>
              <div className="flex gap-3 mt-5"><button onClick={handleBookmark} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm"><FiBookmark size={14} />Save</button><button onClick={handleBackToEmotions} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm"><FiArrowLeft size={14} />Try Another</button></div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>{selectedEmotion && loading && (<div className="text-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-gray-500 mt-3 text-sm">Loading...</p></div>)}</AnimatePresence>
    </div>
  );
}