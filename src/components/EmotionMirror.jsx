import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Share2, Heart, Sparkles, Sunrise, Feather, Flame, 
  Mountain, Compass, Sun, Moon, Cloud, LayoutGrid, Zap, 
  ChevronRight, ArrowLeft, HandHeart, CloudRain, Award, Frown, 
  Brain, Anchor, Coffee, Leaf, Info, AlertCircle, Eye, Smile, 
  Hammer, Star, Shield, CheckCircle2, Meh, Wind
} from "lucide-react";

// ======================= DATA =======================
const EMOTIONS = [
  {
    id: "grateful",
    name: "Grateful",
    arabic: "شَاكِر",
    category: "positive",
    Icon: HandHeart,
    gradient: "from-emerald-500 to-teal-500",
    description: "Recognizing the gifts of Allah in every breath.",
    reflection: "Gratitude turns what we have into enough — and opens the door to more.",
    consolingNote: "My dear friend, your heart is in a beautiful state. Gratitude is the key to abundance. Even when things feel small, remember that the One who gave you the breath to speak 'Alhamdulillah' has already given you a miracle today.",
    actionStep: "Write down three micro-blessings that happened in the last hour, even if it's just the taste of water or a cool breeze.",
    verses: [
      { surahNumber: 14, verseNumber: 7, surahName: "Ibrahim", arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ", translation: "If you are grateful, I will surely increase you." },
      { surahNumber: 2, verseNumber: 152, surahName: "Al-Baqarah", arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي", translation: "So remember Me; I will remember you. And be grateful to Me." },
      { surahNumber: 31, verseNumber: 12, surahName: "Luqman", arabic: "وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ", translation: "And whoever is grateful is grateful for [the benefit of] himself." },
      { surahNumber: 16, verseNumber: 18, surahName: "An-Nahl", arabic: "وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا", translation: "And if you should count the favors of Allah, you could not enumerate them." },
      { surahNumber: 55, verseNumber: 13, surahName: "Ar-Rahman", arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", translation: "So which of the favors of your Lord would you deny?" }
    ]
  },
  {
    id: "sad",
    name: "Sad",
    arabic: "حَزِين",
    category: "difficult",
    Icon: CloudRain,
    gradient: "from-blue-600 to-slate-700",
    description: "A weight under the ribs that has no name.",
    reflection: "Allah is closer to a sorrowful heart than the lips that say 'I am fine.'",
    consolingNote: "It is okay to let the tears flow. Even the Prophet (PBUH) had a Year of Sorrow. Your sadness is not a sign of weak faith; it is a sign of a human heart. Allah hears the silent scream within your tears.",
    actionStep: "Perform two Rakat of prayer and talk to Allah in your own language. Tell Him exactly why it hurts.",
    verses: [
      { surahNumber: 12, verseNumber: 86, surahName: "Yusuf", arabic: "إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ", translation: "I only complain of my suffering and my grief to Allah." },
      { surahNumber: 9, verseNumber: 40, surahName: "At-Tawbah", arabic: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا", translation: "Do not grieve; indeed, Allah is with us." },
      { surahNumber: 93, verseNumber: 3, surahName: "Ad-Duha", arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", translation: "Your Lord has not taken leave of you, nor has He detested [you]." },
      { surahNumber: 94, verseNumber: 5, surahName: "Ash-Sharh", arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship will be ease." }
    ]
  },
  {
    id: "hopeful_future",
    name: "Hopeful for Future",
    arabic: "رَجَاءُ الْمُسْتَقْبَلِ",
    category: "positive",
    Icon: Sunrise,
    gradient: "from-yellow-400 to-orange-500",
    description: "The first light of a new day.",
    reflection: "Despair is the only sin Allah forbids in the face of His mercy.",
    consolingNote: "Even if your past is heavy, your future is yet to be written.",
    actionStep: "Visualize your highest aspiration and make a sincere Dua for it.",
    verses: [
      { surahNumber: 39, verseNumber: 53, surahName: "Az-Zumar", arabic: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", translation: "Do not despair of the mercy of Allah." },
      { surahNumber: 94, verseNumber: 5, surahName: "Ash-Sharh", arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship will be ease." }
    ]
  },
  {
    id: "angry_frustrated",
    name: "Angry & Frustrated",
    arabic: "غَاضِب",
    category: "difficult",
    Icon: Flame,
    gradient: "from-red-600 to-orange-800",
    description: "A fire that wants to consume the peace.",
    reflection: "True strength is the ability to restrain oneself when the fire burns.",
    consolingNote: "Anger is like a wild horse. If you don't break it, it will break you.",
    actionStep: "Perform Wudu with cold water.",
    verses: [
      { surahNumber: 3, verseNumber: 134, surahName: "Aali Imran", arabic: "وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ", translation: "Who restrain anger and who pardon the people." },
      { surahNumber: 42, verseNumber: 37, surahName: "Ash-Shura", arabic: "وَإِذَا مَا غَضِبُوا هُمْ يَغْفِرُونَ", translation: "And when they are angry, they forgive." }
    ]
  },
  {
    id: "weary_tired",
    name: "Weary & Tired",
    arabic: "مُتْعَب",
    category: "difficult",
    Icon: Cloud,
    gradient: "from-slate-500 to-slate-700",
    description: "Exhausted from carrying a mountain on your back.",
    reflection: "Rest is also an act of reliance.",
    consolingNote: "Lall it down. Allah is not asking you to be everything.",
    actionStep: "Switch off all screens and lie down in a dark room.",
    verses: [
      { surahNumber: 2, verseNumber: 286, surahName: "Al-Baqarah", arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation: "Allah does not charge a soul except with that within its capacity." },
      { surahNumber: 78, verseNumber: 9, surahName: "An-Naba", arabic: "وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا", translation: "And made your sleep [a means for] rest." }
    ]
  },
  {
    id: "humble_soul",
    name: "Humble Soul",
    arabic: "مُتَوَاضِع",
    category: "spiritual",
    Icon: Feather,
    gradient: "from-emerald-400 to-stone-500",
    description: "Smaller in your own eyes, lighter in your chest.",
    reflection: "The earth is firm precisely because it lies low.",
    consolingNote: "Humility is the secret of the greats.",
    actionStep: "Sit on the floor for ten minutes and reflect on being made of earth.",
    verses: [
      { surahNumber: 25, verseNumber: 63, surahName: "Al-Furqan", arabic: "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا", translation: "And the servants of the Most Merciful are those who walk upon the earth in humility." },
      { surahNumber: 17, verseNumber: 37, surahName: "Al-Isra", arabic: "وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا", translation: "And do not walk upon the earth exultantly." }
    ]
  },
  {
    id: "victorious_spirit",
    name: "Victorious Spirit",
    arabic: "مُنْتَصِر",
    category: "transformative",
    Icon: Award,
    gradient: "from-yellow-500 to-amber-700",
    description: "The clean light of an honest win.",
    reflection: "Victory comes from Allah. Receive it without arrogance.",
    consolingNote: "Success is a test just as trial is.",
    actionStep: "Perform a Sajdah of Shukr (Prostration of Gratitude).",
    verses: [
      { surahNumber: 61, verseNumber: 13, surahName: "As-Saff", arabic: "نَصْرٌ مِّنَ اللَّهِ وَفَتْحٌ قَرِيبٌ", translation: "[Helping] victory from Allah and an imminent conquest..." },
      { surahNumber: 110, verseNumber: 1, surahName: "An-Nasr", arabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", translation: "When the victory of Allah has come and the conquest." }
    ]
  },
  {
    id: "patient_heart",
    name: "Patient Heart",
    arabic: "صَابِر",
    category: "calm",
    Icon: Mountain,
    gradient: "from-emerald-700 to-emerald-950",
    description: "The beautiful endurance of the soul.",
    reflection: "Patience is not the ability to wait, but how you act while waiting.",
    consolingNote: "You are in a state that Allah loves. Sabr is a light that never goes out.",
    actionStep: "Pause for 60 seconds before reacting to any difficulty today.",
    verses: [
      { surahNumber: 2, verseNumber: 153, surahName: "Al-Baqarah", arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Indeed, Allah is with the patient." },
      { surahNumber: 39, verseNumber: 10, surahName: "Az-Zumar", arabic: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ", translation: "Indeed, the patient will be given their reward without account." }
    ]
  },
  {
    id: "confused_mind",
    name: "Confused Mind",
    arabic: "حَائِر",
    category: "difficult",
    Icon: Compass,
    gradient: "from-slate-400 to-indigo-500",
    description: "Static in the mind, unsure of the next step.",
    reflection: "Clarity is a gift that follows the prayer of guidance.",
    consolingNote: "It's natural to feel lost when the path ahead is misty.",
    actionStep: "Pray two cycles of optional prayer (Nafilah) and ask for clarity.",
    verses: [
      { surahNumber: 6, verseNumber: 71, surahName: "Al-An'am", arabic: "كَالَّذِي اسْتَهْوَتْهُ الشَّيَاطِينُ فِي الْأَرْضِ حَيْرَانَ", translation: "...like one whom the devils have enticed on earth [into] confusion, being bewildered..." },
      { surahNumber: 1, verseNumber: 6, surahName: "Al-Fatihah", arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path." }
    ]
  },
  {
    id: "disappointed_life",
    name: "Disappointed",
    arabic: "خَائِب",
    category: "difficult",
    Icon: Frown,
    gradient: "from-stone-400 to-slate-600",
    description: "The bitter taste of expectations unmet.",
    reflection: "Your plan faded so that His plan could bloom.",
    consolingNote: "Disappointment is often the bridge to a better destination.",
    actionStep: "List three things you are still grateful for despite the loss.",
    verses: [
      { surahNumber: 2, verseNumber: 216, surahName: "Al-Baqarah", arabic: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ", translation: "But perhaps you hate a thing and it is good for you..." },
      { surahNumber: 57, verseNumber: 23, surahName: "Al-Hadid", arabic: "لِّكَيْلَا تَأْسَوْا عَلَىٰ مَا فَاتَكُمْ", translation: "In order that you not despair over what has eluded you..." }
    ]
  },
  {
    id: "inspired_action",
    name: "Inspired",
    arabic: "مُلْهَم",
    category: "transformative",
    Icon: Sparkles,
    gradient: "from-amber-400 to-yellow-600",
    description: "A sudden warmth, a call to create or act.",
    reflection: "Every pull toward what is good is itself a mercy. Follow it.",
    consolingNote: "This inspiration you feel is a breath from the Divine.",
    actionStep: "Take one concrete action toward this inspired thought in the next ten minutes.",
    verses: [
      { surahNumber: 91, verseNumber: 8, surahName: "Ash-Shams", arabic: "فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا", translation: "And inspired it [the soul] with discernment of its wickedness and its righteousness." },
      { surahNumber: 20, verseNumber: 114, surahName: "Ta-Ha", arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا", translation: "And say, 'My Lord, increase me in knowledge.'" }
    ]
  },
  {
    id: "forgiving_heart",
    name: "Forgiving",
    arabic: "عَافِي",
    category: "transformative",
    Icon: Heart,
    gradient: "from-rose-400 to-pink-500",
    description: "Releasing the burden of resentment.",
    reflection: "Forgiveness is the attribute of the strong.",
    consolingNote: "Choosing peace over pride is the highest form of victory.",
    actionStep: "Sustain a sincere prayer for someone who has wronged you.",
    verses: [
      { surahNumber: 42, verseNumber: 40, surahName: "Ash-Shura", arabic: "فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُ عَلَى اللَّهِ", translation: "And whoever pardons and makes reconciliation - his reward is [due] from Allah." },
      { surahNumber: 24, verseNumber: 22, surahName: "An-Nur", arabic: "وَلْيَعْفُوا وَلْيَصْفَحُوا", translation: "And let them pardon and overlook." }
    ]
  },
  {
    id: "compassionate",
    name: "Compassionate",
    arabic: "رَحِيم",
    category: "positive",
    Icon: Heart,
    gradient: "from-emerald-300 to-teal-400",
    description: "Feeling the pain of others and wishing for their ease.",
    reflection: "Be merciful to those on earth, and the One in the heavens will be merciful to you.",
    consolingNote: "Your soft heart is a reflection of Divine Mercy.",
    actionStep: "Help someone today without them asking.",
    verses: [
      { surahNumber: 90, verseNumber: 17, surahName: "Al-Balad", arabic: "وَتَوَاصَوْا بِالصَّبْرِ وَتَوَاصَوْا بِالْمَرْحَمَةِ", translation: "And advised each other to patience and advised each other to compassion." },
      { surahNumber: 48, verseNumber: 29, surahName: "Al-Fath", arabic: "رُحَمَاءُ بَيْنَهُمْ", translation: "Compassionate among themselves." }
    ]
  },
  {
    id: "mindful_presence",
    name: "Mindful",
    arabic: "ذَاكِر",
    category: "spiritual",
    Icon: Brain,
    gradient: "from-blue-400 to-cyan-500",
    description: "Fully present in the remembrance of the Divine.",
    reflection: "The present moment is the only place you can meet your Lord.",
    consolingNote: "Your awareness is a bridge to the Eternal.",
    actionStep: "Spend 5 minutes focusing solely on your breath and the name of Allah.",
    verses: [
      { surahNumber: 33, verseNumber: 41, surahName: "Al-Ahzab", arabic: "اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا", translation: "Remember Allah with much remembrance." },
      { surahNumber: 13, verseNumber: 28, surahName: "Ar-Ra'd", arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", translation: "Unquestionably, by the remembrance of Allah hearts are assured." }
    ]
  },
  {
    id: "trusting_plan",
    name: "Trusting",
    arabic: "مُتَوَكِّل",
    category: "transformative",
    Icon: Anchor,
    gradient: "from-blue-600 to-teal-700",
    description: "Surrendering to the wisdom of the Decree.",
    reflection: "He knows, while you know not.",
    consolingNote: "Your safety is in His hands, not your plans.",
    actionStep: "Say 'Tawakaltu 'ala Allah' with full conviction for every task today.",
    verses: [
      { surahNumber: 65, verseNumber: 3, surahName: "At-Talaq", arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "And whoever relies upon Allah - then He is sufficient for him." },
      { surahNumber: 3, verseNumber: 159, surahName: "Aali Imran", arabic: "إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ", translation: "Indeed, Allah loves those who rely [upon Him]." }
    ]
  },
  {
    id: "in_awe",
    name: "In Awe",
    arabic: "خَاشِع",
    category: "spiritual",
    Icon: Sparkles,
    gradient: "from-yellow-200 to-amber-400",
    description: "Overwhelmed by the majesty of creation.",
    reflection: "Awe is the beginning of wisdom.",
    consolingNote: "The stars, the oceans, and the heartbeat — all are signs for you.",
    actionStep: "Look at the sky for 3 minutes and reflect on the One who held it up.",
    verses: [
      { surahNumber: 3, verseNumber: 191, surahName: "Aali Imran", arabic: "رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا", translation: "Our Lord, You did not create this aimlessly; exalted are You." },
      { surahNumber: 59, verseNumber: 21, surahName: "Al-Hashr", arabic: "لَوْ أَنزَلْنَا هَٰذَا الْقُرْآنَ عَلَىٰ جَبَلٍ لَّرأَيْتَهُ خَاشِعًا", translation: "If We had sent down this Qur'an upon a mountain, you would have seen it humbled..." }
    ]
  },
  {
    id: "determined_soul",
    name: "Determined",
    arabic: "عَازِم",
    category: "transformative",
    Icon: Zap,
    gradient: "from-emerald-600 to-green-900",
    description: "Set on a path of righteousness.",
    reflection: "Consistency is the mother of all virtues.",
    consolingNote: "Your resolve is a gift from the One who inspires success.",
    actionStep: "Commit to one small good habit and do not miss it for a week.",
    verses: [
      { surahNumber: 3, verseNumber: 159, surahName: "Aali Imran", arabic: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ", translation: "And when you have decided, then rely upon Allah." },
      { surahNumber: 20, verseNumber: 115, surahName: "Ta-Ha", arabic: "وَلَمْ نَجِدْ لَهُ عَزْمًا", translation: "...and We did not find in him determination. [A reminder to keep our resolve]" }
    ]
  },
  {
    id: "content_heart",
    name: "Content",
    arabic: "رَاضِي",
    category: "calm",
    Icon: Meh,
    gradient: "from-emerald-200 to-teal-400",
    description: "At home with what has been written.",
    reflection: "True richness is the richness of the soul.",
    consolingNote: "You have found the treasure that kings envy.",
    actionStep: "Recite 'Raditu billahi Rabban' three times with conviction.",
    verses: [
      { surahNumber: 98, verseNumber: 8, surahName: "Al-Bayyinah", arabic: "رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ", translation: "Allah being pleased with them and they with Him." },
      { surahNumber: 89, verseNumber: 28, surahName: "Al-Fajr", arabic: "ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً", translation: "Return to your Lord, well-pleased and pleasing [to Him]." }
    ]
  },
  {
    id: "hopeful_wait",
    name: "Waiting Patiently",
    arabic: "مُنْتَظِرٌ بِصَبْرٍ",
    category: "calm",
    Icon: Mountain,
    gradient: "from-blue-200 to-indigo-400",
    description: "Knowing that the shift is coming.",
    reflection: "The flower doesn't bloom faster if you shout at it.",
    consolingNote: "Your wait is not empty; it is a time of growth hidden from the eye.",
    actionStep: "Focus on the growth happening inside you while you wait for the outside to change.",
    verses: [
      { surahNumber: 94, verseNumber: 5, surahName: "Ash-Sharh", arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship will be ease." },
      { surahNumber: 2, verseNumber: 153, surahName: "Al-Baqarah", arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Indeed, Allah is with the patient." }
    ]
  },
  {
    id: "blessed_day",
    name: "Feeling Blessed",
    arabic: "مُبَارَك",
    category: "positive",
    Icon: Star,
    gradient: "from-yellow-100 to-amber-300",
    description: "Aware of the abundance of life.",
    reflection: "Blessings are not what you have, but how you perceive them.",
    consolingNote: "Every breath is a gift you didn't pay for.",
    actionStep: "Say 'Alhamdulillah' for three things you usually take for granted.",
    verses: [
      { surahNumber: 14, verseNumber: 34, surahName: "Ibrahim", arabic: "وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا", translation: "And if you should count the favor of Allah, you could not enumerate them." },
      { surahNumber: 55, verseNumber: 13, surahName: "Ar-Rahman", arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", translation: "So which of the favors of your Lord would you deny?" }
    ]
  },
  {
    id: "seeking_purity",
    name: "Seeking Purity",
    arabic: "طَاهِر",
    category: "spiritual",
    Icon: Feather,
    gradient: "from-white to-emerald-100",
    description: "Wanting to wash away the dust of the world.",
    reflection: "Purity starts in the intent before it reaches the limbs.",
    consolingNote: "Your desire for purity is the first sign of it.",
    actionStep: "Perform a mindful Wudu, feeling the water wash away your burdens.",
    verses: [
      { surahNumber: 9, verseNumber: 108, surahName: "At-Tawbah", arabic: "وَاللَّهُ يُحِبُّ الْمُطَّهِّرِينَ", translation: "And Allah loves those who purify themselves." },
      { surahNumber: 2, verseNumber: 222, surahName: "Al-Baqarah", arabic: "وَيُحِبُّ الْمُتَطَهِّرِينَ", translation: "...and loves those who purify themselves." }
    ]
  },
  {
    id: "broken_hearted",
    name: "Broken Hearted",
    arabic: "مَكْسُورُ الْقَلْبِ",
    category: "difficult",
    Icon: Frown,
    gradient: "from-slate-700 to-stone-900",
    description: "The fragments of your heart feeling beyond repair.",
    reflection: "Allah is closest to the broken-hearted.",
    consolingNote: "He breaks the heart to let the light in.",
    actionStep: "Cry if you must. He hears the sound of every tear hitting the ground.",
    verses: [
      { surahNumber: 2, verseNumber: 156, surahName: "Al-Baqarah", arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ", translation: "Indeed we belong to Allah, and indeed to Him we will return." },
      { surahNumber: 93, verseNumber: 3, surahName: "Ad-Duha", arabic: "مَا وَدَّكَ رَبُّكَ وَمَا قَلَىٰ", translation: "Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you]." }
    ]
  },
  {
    id: "serene_spirit",
    name: "Serene Spirit",
    arabic: "سَاكِن",
    category: "calm",
    Icon: Feather,
    gradient: "from-emerald-50 to-emerald-200",
    description: "The quiet joy of existence.",
    reflection: "Serenity is the fruit of surrender.",
    consolingNote: "You are finally breathing with the rhythm of the universe.",
    actionStep: "Sit in silence and appreciate the quiet around you.",
    verses: [
      { surahNumber: 48, verseNumber: 4, surahName: "Al-Fath", arabic: "هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ", translation: "It is He who sent down tranquility into the hearts of the believers." },
      { surahNumber: 13, verseNumber: 28, surahName: "Ar-Ra'd", arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", translation: "Unquestionably, by the remembrance of Allah hearts are assured." }
    ]
  },
  {
    id: "longing",
    name: "Longing",
    arabic: "شَوْق",
    category: "spiritual",
    Icon: Heart,
    gradient: "from-purple-300 to-indigo-500",
    description: "A pull toward something infinite.",
    reflection: "If you didn't belong to the Home of Peace, you wouldn't feel homesick.",
    consolingNote: "Your longing is the compass pointing you Home.",
    actionStep: "Read about the descriptions of Paradise to soothe your soul's homesickness.",
    verses: [
      { surahNumber: 89, verseNumber: 28, surahName: "Al-Fajr", arabic: "ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً", translation: "Return to your Lord, well-pleased and pleasing [to Him]." },
      { surahNumber: 50, verseNumber: 35, surahName: "Qaf", arabic: "لَهُم مَّا يَشَاءُونَ فِيهَا وَلَدَيْنَا مَزِيدٌ", translation: "They will have whatever they wish therein, and with Us is more." }
    ]
  },
  {
    id: "optimistic",
    name: "Optimistic",
    arabic: "مُتَفَائِل",
    category: "positive",
    Icon: Sunrise,
    gradient: "from-orange-300 to-yellow-500",
    description: "Choosing to see the light in every situation.",
    reflection: "Optimism is a form of worship — it is good expectations of your Lord.",
    consolingNote: "Your hope is a beacon for others.",
    actionStep: "Tell someone else a piece of good news today.",
    verses: [
      { surahNumber: 94, verseNumber: 6, surahName: "Ash-Sharh", arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship will be ease." },
      { surahNumber: 2, verseNumber: 214, surahName: "Al-Baqarah", arabic: "أَلَا إِنَّ نَصْرَ اللَّهِ قَرِيبٌ", translation: "Unquestionably, the help of Allah is near." }
    ]
  },
  {
    id: "steadfast",
    name: "Steadfast",
    arabic: "مُسْتَقِيم",
    category: "transformative",
    Icon: Mountain,
    gradient: "from-emerald-800 to-teal-950",
    description: "Standing your ground when the wind blows hard.",
    reflection: "Righteousness is to stay the course even when you are tired.",
    consolingNote: "The One who created the mountains is reinforcing your heart.",
    actionStep: "Recite 'Ihdina Sirat al-Mustaqim' with focused intention.",
    verses: [
      { surahNumber: 11, verseNumber: 112, surahName: "Hud", arabic: "فَاسْتَقِمْ كَمَا أُمِرْتَ", translation: "So remain on a right course as you have been commanded." },
      { surahNumber: 41, verseNumber: 30, surahName: "Fussilat", arabic: "ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ", translation: "...and then remained on a right course - the angels will descend upon them..." }
    ]
  },
  {
    id: "awed_by_nature",
    name: "Awed by Nature",
    arabic: "مُنْبَهِرٌ بِالطَّبِيعَةِ",
    category: "positive",
    Icon: Leaf,
    gradient: "from-green-200 to-emerald-400",
    description: "Seeing the fingerprints of the Creator in every leaf.",
    reflection: "The whole world is a mosque if you know how to pray.",
    consolingNote: "Nature is the first Scripture.",
    actionStep: "Plant something small — a seed, a flower — and watch the miracle of growth.",
    verses: [
      { surahNumber: 3, verseNumber: 190, surahName: "Aali Imran", arabic: "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ... لَآيَاتٍ لِّأُولِي الْأَلْبَابِ", translation: "Indeed, in the creation of the heavens and the earth... are signs for those of understanding." },
      { surahNumber: 88, verseNumber: 17, surahName: "Al-Ghashiyah", arabic: "أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ", translation: "Then do they not look at the camels - how they are created?" }
    ]
  },
  {
    id: "repentant_tear",
    name: "Repentant Tear",
    arabic: "دَمْعَةُ التَّوْبَةِ",
    category: "spiritual",
    Icon: Brain,
    gradient: "from-blue-200 to-teal-300",
    description: "The cool moisture of returning home.",
    reflection: "One tear born of regret can extinguish a fire that could burn a city.",
    consolingNote: "Your tears are precious in the sight of the Most Merciful.",
    actionStep: "Do not wipe away your next tear of repentance immediately; let it be a witness for you.",
    verses: [
      { surahNumber: 17, verseNumber: 109, surahName: "Al-Isra", arabic: "وَيَخِرُّونَ لِلْأَذْقَانِ يَبْكُونَ وَيَزِيدُهُمْ خُشُوعًا", translation: "And they fall upon their faces weeping, and it increases them in humble submission." },
      { surahNumber: 4, verseNumber: 110, surahName: "An-Nisa", arabic: "ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا", translation: "...then seeks forgiveness of Allah will find Allah Forgiving and Merciful." }
    ]
  },
  {
    id: "joyful_faith",
    name: "Joyful Faith",
    arabic: "حَلَاوَةُ الْإِيمَانِ",
    category: "positive",
    Icon: Sparkles,
    gradient: "from-yellow-400 to-emerald-300",
    description: "Tasting the sweetness that the world cannot give.",
    reflection: "Faith is a flavor that the heart alone can know.",
    consolingNote: "You have found the nectar of life.",
    actionStep: "Re-read your favorite Ayah and savor the feeling it brings.",
    verses: [
      { surahNumber: 10, verseNumber: 58, surahName: "Yunus", arabic: "بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا", translation: "In the bounty of Allah and in His mercy - in that let them rejoice." },
      { surahNumber: 13, verseNumber: 28, surahName: "Ar-Ra'd", arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", translation: "Unquestionably, by the remembrance of Allah hearts are assured." }
    ]
  },
  {
    id: "longing_for_allah",
    name: "Longing for Allah",
    arabic: "شَوْقٌ إِلَى اللَّهِ",
    category: "spiritual",
    Icon: Heart,
    gradient: "from-indigo-400 to-purple-600",
    description: "The heart's true northern star.",
    reflection: "What can a seeker find if they find Him? Everything.",
    consolingNote: "Your search is being witnessed by the One you seek.",
    actionStep: "Spend the last third of the night in Tahajjud, speaking to Him as your closest friend.",
    verses: [
      { surahNumber: 2, verseNumber: 186, surahName: "Al-Baqarah", arabic: "فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ", translation: "...indeed I am near. I respond to the invocation of the supplicant when he calls upon Me." },
      { surahNumber: 2, verseNumber: 152, surahName: "Al-Baqarah", arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", translation: "So remember Me; I will remember you." }
    ]
  },
  {
    id: "protected_by_faith",
    name: "Protected by Faith",
    arabic: "فِي حِمَى اللَّهِ",
    category: "calm",
    Icon: Shield,
    gradient: "from-emerald-600 to-teal-800",
    description: "Safe inside the fortress of trust.",
    reflection: "The King of the Heavens is your Guardian.",
    consolingNote: "Let the world shout; your Shield is silent and unbreakable.",
    actionStep: "Recite the three Quls (Ikhlas, Falaq, Nas) and blow over your hands and body.",
    verses: [
      { surahNumber: 86, verseNumber: 4, surahName: "At-Tariq", arabic: "إِن كُلُّ نَفْسٍ لَّمَّا عَلَيْهَا حَافِظٌ", translation: "There is no soul but that it has over it a protector." },
      { surahNumber: 12, verseNumber: 64, surahName: "Yusuf", arabic: "فَاللَّهُ خَيْرٌ حَافِظًا", translation: "But Allah is the best guardian." }
    ]
  },
  {
    id: "hopeful_repentant",
    name: "Hopeful Repentant",
    arabic: "تَائِبٌ مُؤَمِّلٌ",
    category: "transformative",
    Icon: Zap,
    gradient: "from-teal-300 to-emerald-500",
    description: "Turning back with the expectation of mercy.",
    reflection: "Mercy is the ocean, your sin is a drop.",
    consolingNote: "The drop is being swallowed by the ocean right now.",
    actionStep: "Make a fresh start today. Do one thing differently that pleases Him.",
    verses: [
      { surahNumber: 39, verseNumber: 53, surahName: "Az-Zumar", arabic: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", translation: "Do not despair of the mercy of Allah." },
      { surahNumber: 4, verseNumber: 110, surahName: "An-Nisa", arabic: "يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا", translation: "...will find Allah Forgiving and Merciful." }
    ]
  },
  {
    id: "content_with_today",
    name: "Content with Today",
    arabic: "الرِّضَا بِالْقَدَرِ",
    category: "calm",
    Icon: Sun,
    gradient: "from-yellow-300 to-emerald-200",
    description: "Stopping the clock of worry for the joy of 'now'.",
    reflection: "This day is enough.",
    consolingNote: "You are being fed, you are being heard, you are being loved — today.",
    actionStep: "Focus on your next meal or chore with total presence and gratitude.",
    verses: [
      { surahNumber: 2, verseNumber: 286, surahName: "Al-Baqarah", arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation: "Allah does not charge a soul except with that within its capacity." },
      { surahNumber: 10, verseNumber: 58, surahName: "Yunus", arabic: "بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا", translation: "In the bounty of Allah and in His mercy - in that let them rejoice." }
    ]
  },
  {
    id: "mindful_prayer",
    name: "Mindful in Prayer",
    arabic: "خُشُوع",
    category: "spiritual",
    Icon: Coffee,
    gradient: "from-blue-100 to-indigo-300",
    description: "The world fading away in the conversation with Allah.",
    reflection: "Prayer is the Mi'raj (ascension) of the believer.",
    consolingNote: "You were standing in front of the King, and He was listening.",
    actionStep: "Delay your next movement in prayer by just three seconds to feel the stillness.",
    verses: [
      { surahNumber: 23, verseNumber: 2, surahName: "Al-Mu'minun", arabic: "الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ", translation: "They who are during their prayer humbly submissive." },
      { surahNumber: 2, verseNumber: 45, surahName: "Al-Baqarah", arabic: "وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ", translation: "And indeed, it is difficult except for the humbly submissive." }
    ]
  },
  {
    id: "anxious",
    name: "Anxious",
    arabic: "قَلِق",
    category: "difficult",
    Icon: Wind,
    gradient: "from-amber-600 to-orange-700",
    description: "A racing mind chasing a moving horizon.",
    reflection: "Tomorrow is in Allah's hand — you were never asked to carry it.",
    consolingNote: "Your mind is trying to solve problems that haven't happened yet. Breathe. The One who took care of you yesterday will take care of you today and tomorrow. You are not meant to handle the whole future in one breath.",
    actionStep: "Deep breathing for 5 minutes while reciting 'Hasbunallahu wa ni'mal wakeel' (Allah is sufficient for us, and He is the best Disposer of affairs).",
    verses: [
      { surahNumber: 3, verseNumber: 173, surahName: "Aali Imran", arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", translation: "Sufficient for us is Allah, and [He is] the best Disposer of affairs." },
      { surahNumber: 13, verseNumber: 28, surahName: "Ar-Ra'd", arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", translation: "Unquestionably, by the remembrance of Allah hearts are assured." },
      { surahNumber: 65, verseNumber: 3, surahName: "At-Talaq", arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "And whoever relies upon Allah — then He is sufficient for him." },
      { surahNumber: 2, verseNumber: 286, surahName: "Al-Baqarah", arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation: "Allah does not charge a soul except with that within its capacity." },
      { surahNumber: 20, verseNumber: 46, surahName: "Ta-Ha", arabic: "قَالَ لَا تَخَافَا ۖ إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ", translation: "[Allah] said: 'Fear not. Indeed, I am with you both; I hear and I see.'" },
      { surahNumber: 2, verseNumber: 153, surahName: "Al-Baqarah", arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", translation: "O you who have believed, seek help through patience and prayer." },
      { surahNumber: 94, verseNumber: 6, surahName: "Ash-Sharh", arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship will be ease." },
      { surahNumber: 8, verseNumber: 11, surahName: "Al-Anfal", arabic: "إِذْ يُغَشِّيكُمُ النُّعَاسَ أَمَنَةً مِّنْهُ", translation: "[Remember] when He overwhelmed you with drowsiness [giving] security from Him." },
      { surahNumber: 48, verseNumber: 4, surahName: "Al-Fath", arabic: "هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ", translation: "It is He who sent down tranquility into the hearts of the believers." },
      { surahNumber: 10, verseNumber: 62, surahName: "Yunus", arabic: "أَلَا إِنَّ أَوْلِيَاءَ اللَّهِ لَا خَوْفٌ عَلَيْهِمْ", translation: "Unquestionably, for the allies of Allah there will be no fear concerning them." }
    ]
  },
  {
    id: "lonely",
    name: "Lonely",
    arabic: "وَحِيد",
    category: "difficult",
    Icon: Moon,
    gradient: "from-indigo-900 to-purple-900",
    description: "The silence that feels too loud.",
    reflection: "You are never alone when the Creator of the stars is watching over you.",
    consolingNote: "Even when people around you don't understand, or when there is no one around, the One who shaped your heart is closer than your jugular vein. He is listening to your thoughts and your pulse.",
    actionStep: "Go for a walk in nature and notice how every leaf and bird is in conversation with its Creator. You are part of this grand symphony.",
    verses: [
      { surahNumber: 50, verseNumber: 16, surahName: "Qaf", arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", translation: "And We are closer to him than [his] jugular vein." },
      { surahNumber: 2, verseNumber: 186, surahName: "Al-Baqarah", arabic: "وَإِذَا سَأَلَكَ عِبَادِي عنِّي فَإِنِّي قَرِيبٌ", translation: "And when My servants ask you concerning Me - indeed I am near." },
      { surahNumber: 57, verseNumber: 4, surahName: "Al-Hadid", arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", translation: "And He is with you wherever you are." },
      { surahNumber: 9, verseNumber: 40, surahName: "At-Tawbah", arabic: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا", translation: "Do not grieve; indeed, Allah is with us." },
      { surahNumber: 20, verseNumber: 46, surahName: "Ta-Ha", arabic: "إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ", translation: "Indeed, I am with you both; I hear and I see." },
      { surahNumber: 3, verseNumber: 160, surahName: "Aali Imran", arabic: "إِن يَنصُرْكُمُ اللَّهُ فَلَا غَالِبَ لَكُمْ", translation: "If Allah should aid you, no one can overcome you." },
      { surahNumber: 2, verseNumber: 257, surahName: "Al-Baqarah", arabic: "اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا", translation: "Allah is the ally of those who believe." },
      { surahNumber: 11, verseNumber: 123, surahName: "Hud", arabic: "فَاعْبُدْهُ وَتَوَكَّلْ عَلَيْهِ", translation: "So worship Him and rely upon Him." },
      { surahNumber: 19, verseNumber: 1, surahName: "Maryam", arabic: "كاف هاء ياء عين صاد", translation: "Kaf, Ha, Ya, 'Ayn, Sad. [Mystical letters reminding of divine presence]" },
      { surahNumber: 93, verseNumber: 3, surahName: "Ad-Duha", arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", translation: "Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you]." }
    ]
  },
  {
    id: "guilty",
    name: "Guilty",
    arabic: "آثِم",
    category: "spiritual",
    Icon: Leaf,
    gradient: "from-teal-600 to-emerald-800",
    description: "The honesty of regret.",
    reflection: "Your sins are not greater than His mercy. The door is always open.",
    consolingNote: "Guilt is a gift when it leads to return. It means your heart is still alive. Don't let Shaytan turn your guilt into despair. Allah loves to forgive; He only waits for you to ask.",
    actionStep: "Pray two Rakat of Repentance (Salat al-Tawbah) and feel the weight being lifted from your shoulders as you whisper 'Istighfar'.",
    verses: [
      { surahNumber: 39, verseNumber: 53, surahName: "Az-Zumar", arabic: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا", translation: "Do not despair of the mercy of Allah. Indeed, Allah forgives all sins." },
      { surahNumber: 4, verseNumber: 110, surahName: "An-Nisa", arabic: "ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا", translation: "...then seeks forgiveness of Allah will find Allah Forgiving and Merciful." },
      { surahNumber: 2, verseNumber: 222, surahName: "Al-Baqarah", arabic: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ", translation: "Indeed, Allah loves those who are constantly repentant." },
      { surahNumber: 25, verseNumber: 70, surahName: "Al-Furqan", arabic: "يُبَدِّلُ اللَّهُ سَيِّئَاتِهِمْ حَسَنَاتٍ", translation: "Allah will replace their evil deeds with good." },
      { surahNumber: 20, verseNumber: 82, surahName: "Ta-Ha", arabic: "وَإِنِّي لَغَفَّارٌ لِّمَنْ تَابَ وَآمَنَ", translation: "And indeed, I am the Perpetual Forgiver of whoever repents and believes." },
      { surahNumber: 11, verseNumber: 114, surahName: "Hud", arabic: "إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ", translation: "Indeed, good deeds do away with evil deeds." },
      { surahNumber: 3, verseNumber: 135, surahName: "Aali Imran", arabic: "وَمَن يَغْفِرُ الذُّنُوبَ إِلَّا اللَّهُ", translation: "And who can forgive sins except Allah?" },
      { surahNumber: 3, verseNumber: 31, surahName: "Aali Imran", arabic: "يُحْبِبْكُمُ اللَّهُ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ", translation: "Allah will love you and forgive you your sins." },
      { surahNumber: 2, verseNumber: 160, surahName: "Al-Baqarah", arabic: "إِلَّا الَّذِينَ تَابُوا وَأَصْلَحُوا", translation: "Except for those who repent and correct themselves." },
      { surahNumber: 42, verseNumber: 25, surahName: "Ash-Shura", arabic: "وَهُوَ الَّذِي يَقْبَلُ التَّوْبَةَ عَنْ عِبَادِهِ", translation: "And it is He who accepts repentance from His servants." }
    ]
  }
];

// ======================= FILTERS =======================
const FILTERS = [
  { id: "all", label: "All Frequencies", icon: LayoutGrid },
  { id: "positive", label: "Joy & Light", icon: Sparkles },
  { id: "calm", label: "Peace & Rest", icon: Feather },
  { id: "difficult", label: "Healing Pain", icon: Cloud },
  { id: "spiritual", label: "Soul Return", icon: Heart },
  { id: "transformative", label: "Growth", icon: Zap },
];

export default function EmotionMirror() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EMOTIONS.filter((e) => {
      if (filter !== "all" && e.category !== filter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.arabic && e.arabic.includes(q))
      );
    });
  }, [query, filter]);

  const handleSelect = (e) => {
    setSelected(e);
  };

  const handleClose = () => {
    setSelected(null);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#fcfdfc] font-sans grain relative overflow-hidden">
      {/* HEADER SECTION - Changes based on state like QuranBrowser */}
      <header className="flex-shrink-0 bg-white/70 backdrop-blur-xl border-b border-emerald-100 px-6 py-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-30 shadow-sm">
        <div className="flex items-center gap-6">
          {!selected ? (
            <div className="space-y-1">
              <div className="flex items-center gap-4 text-emerald-950">
               
              </div>
            </div>
          ) : (
            <button 
              onClick={handleClose}
              className="group flex items-center gap-4 py-2 px-3 hover:bg-emerald-50 rounded-2xl text-emerald-950 transition-all duration-300 border-2 border-emerald-100"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <ArrowLeft size={20} className="text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="block font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800/40">Return to</span>
                <span className="block font-black text-sm tracking-tight">THE GRID</span>
              </div>
            </button>
          )}
        </div>

        {!selected && (
          <div className="flex-1 max-w-2xl flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Identify frequency..."
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-full py-3.5 pl-14 pr-10 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-emerald-950"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {selected && (
          <div className="flex items-center gap-3">
             <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${selected.gradient} text-white text-[10px] font-black uppercase tracking-widest shadow-md`}>
                {selected.category}
             </div>
             <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100">
                <Share2 size={18} />
             </button>
          </div>
        )}
      </header>

      {/* MAIN LIFECYCLE - Transitions between screens like QuranBrowser */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div 
              key="list-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-6 py-12 md:px-12 max-w-7xl mx-auto space-y-12"
            >
              <section className="text-center space-y-4">
                 <h2 className="text-3xl md:text-8xl font-black text-emerald-950 tracking-tighter leading-tight drop-shadow-sm">
                   How does your <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 italic font-serif pr-2">heart feel?</span>
                 </h2>
                 <p className="text-sm md:text-base text-emerald-900/60 max-w-xl mx-auto leading-relaxed">
                   Connect your emotional frequency with timeless wisdom.
                 </p>
                 
                 <div className="flex flex-wrap gap-2 justify-center pt-6">
                  {FILTERS.map(f => (
                    <button 
                      key={f.id}
                      onClick={() => {
                        setFilter(f.id);
                        setQuery("");
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap shadow-sm border ${
                        filter === f.id 
                          ? 'bg-emerald-950 text-white border-emerald-950' 
                          : 'bg-white text-emerald-800/70 border-emerald-100 hover:border-emerald-300'
                      }`}
                    >
                      <f.icon size={12} />
                      {f.label}
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                {filtered.map((e, idx) => (
                  <motion.button
                    key={e.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => handleSelect(e)}
                    className="group text-left bg-white p-8 rounded-3xl border border-emerald-100/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all flex flex-col h-full relative overflow-hidden active:scale-95"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${e.gradient} mb-6 flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                      <e.Icon size={28} />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{e.category}</p>
                      <h3 className="font-black text-xl text-emerald-950 tracking-tight group-hover:text-emerald-600 transition-colors">{e.name}</h3>
                      <p className="text-sm text-emerald-900/50 line-clamp-2 mt-2 leading-relaxed">{e.description}</p>
                    </div>

                    <div className="mt-8 flex items-end justify-between">
                      <p className="text-emerald-600/40 font-arabic text-2xl leading-none">{e.arabic}</p>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="detail-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col"
            >
              {/* Immersive Hero Section */}
              <div className={`relative h-[60vh] bg-gradient-to-br ${selected.gradient} flex flex-col items-center justify-center overflow-hidden shrink-0`}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 text-center text-white px-6"
                >
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-3xl rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ring-1 ring-white/30">
                    <selected.Icon size={48} className="text-white" />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 drop-shadow-xl">{selected.name}</h2>
                  <p className="text-2xl md:text-3xl font-arabic opacity-60 mb-10 leading-none">{selected.arabic}</p>
                </motion.div>
                
                {/* Background Decor */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
                  <selected.Icon size={800} strokeWidth={0.1} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12" />
                </div>
              </div>

              {/* Data Content */}
              <div className="bg-white px-6 py-16 md:px-12 md:py-24 max-w-7xl mx-auto w-full space-y-24 md:space-y-32">
                
                {/* Interpretation */}
                <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">
                   <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <span className="w-12 h-0.5 bg-emerald-600" />
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Internal Insight</p>
                      </div>
                      <h3 className="text-2xl md:text-4xl font-black text-emerald-950 leading-tight tracking-tight">
                        {selected.description}
                      </h3>
                      <p className="text-lg md:text-2xl font-serif italic text-emerald-900/50 leading-relaxed border-l-4 border-emerald-100 pl-6">
                        "{selected.reflection}"
                      </p>
                   </div>
                   
                   <div className="bg-emerald-50 p-8 md:p-12 rounded-3xl space-y-6 shadow-sm border border-emerald-100">
                      <div className="flex items-center gap-4">
                        <Heart size={24} className="text-emerald-600" />
                        <h4 className="text-sm font-black uppercase text-emerald-950 tracking-wider">A Consoling Note</h4>
                      </div>
                      <p className="text-emerald-900 leading-relaxed font-medium italic">
                        {selected.consolingNote}
                      </p>
                      <div className="pt-6 border-t border-emerald-200/50">
                         <div className="flex items-center gap-3 mb-2">
                           <Zap size={16} className="text-emerald-600" />
                           <p className="text-[10px] font-black uppercase text-emerald-950 tracking-widest">Action Step</p>
                         </div>
                         <p className="text-sm font-bold text-emerald-950 bg-white p-4 rounded-xl shadow-sm">
                           {selected.actionStep}
                         </p>
                      </div>
                   </div>
                </div>

                {/* Verses Section */}
                <div className="space-y-12">
                   <div className="flex items-center gap-6 justify-center overflow-hidden">
                      <div className="h-px w-full bg-emerald-50" />
                      <h4 className="text-xs font-black uppercase text-emerald-300 tracking-[1em] whitespace-nowrap">Celestial Anchors</h4>
                      <div className="h-px w-full bg-emerald-50" />
                   </div>

                   <div className="grid gap-8">
                      {selected.verses.map((v, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="bg-white p-8 md:p-12 rounded-3xl border border-emerald-100 shadow-sm transition-all hover:shadow-lg text-center space-y-8"
                        >
                           <p className="font-quran text-3xl md:text-5xl leading-relaxed text-emerald-950 font-bold">
                             {v.arabic}
                           </p>
                           <div className="max-w-3xl mx-auto space-y-6">
                             <p className="text-lg md:text-2xl font-serif text-emerald-900 leading-relaxed italic">
                               "{v.translation}"
                             </p>
                             <div className="flex items-center justify-center gap-4 pt-4">
                                <div className="px-5 py-2 bg-emerald-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                   {v.surahName}
                                </div>
                                <span className="text-emerald-300 font-black tracking-widest text-sm">
                                   {v.surahNumber}:{v.verseNumber}
                                </span>
                             </div>
                           </div>
                        </motion.div>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;900&display=swap');
        
        .font-quran {
          font-family: "Amiri", serif;
        }
        .font-sans {
          font-family: "Inter", sans-serif;
        }
        .grain {
          position: relative;
        }
        .grain::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.03;
          pointer-events: none;
          z-index: 100;
          background-image: url("https://grainy-gradients.vercel.app/noise.svg");
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fcfdfc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8e5;
          border-radius: 10px;
        }
        .font-arabic {
          font-family: 'Amiri', serif;
        }
      `}</style>
    </div>
  );
}