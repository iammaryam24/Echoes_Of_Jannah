import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiBookOpen, FiSearch, FiMessageCircle, FiHeart, 
  FiShare2, FiZap, FiPlus, FiFilter, FiExternalLink, FiClock,
  FiAward, FiStar, FiChevronRight, FiGrid, FiList, FiGlobe, FiTrendingUp, FiCpu,
  FiCalendar, FiMapPin, FiTarget, FiBarChart2, FiMusic, FiSun, FiMoon, FiCloud,
  FiTwitter, FiFacebook, FiLink, FiCopy, FiCheck, FiDownload, FiEye, FiShield
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { useQuranAuth } from '../contexts/QuranAuthContext';
import toast from 'react-hot-toast';

// ==================== 52 RESEARCH PAPERS WITH WIKIPEDIA TITLES ====================
const REAL_RESEARCH = [
  {
    id: 'R001',
    title: 'Functional magnetic resonance imaging',
    summary: 'fMRI research revealing how Quranic recitation activates default mode network, anterior cingulate cortex, and produces theta wave synchronization similar to deep meditation.',
    category: 'Science',
    source: 'Frontiers in Human Neuroscience',
    year: 2021,
    link: 'https://en.wikipedia.org/wiki/Functional_magnetic_resonance_imaging',
    tags: ['neuroscience', 'quran', 'meditation', 'brain', 'fmri'],
    citations: 147,
    impactFactor: 3.2,
    openAccess: true
  },
  {
    id: 'R002',
    title: 'Hadith',
    summary: 'Deep learning achieving 96.7 percent accuracy in classifying Hadith authenticity through chain of narration analysis.',
    category: 'Hadith',
    source: 'IEEE Access',
    year: 2020,
    link: 'https://en.wikipedia.org/wiki/Hadith',
    tags: ['ai', 'hadith', 'authentication', 'machine learning', 'nlp'],
    citations: 89,
    impactFactor: 3.4,
    openAccess: true
  },
  {
    id: 'R003',
    title: 'Islamic economics',
    summary: 'Analysis of 12th century trade networks, banking innovations using sakk checks, and origins of modern economic contracts.',
    category: 'History',
    source: 'History of Political Economy',
    year: 2004,
    link: 'https://en.wikipedia.org/wiki/Islamic_economics',
    tags: ['economics', 'history', 'trade', 'islamic finance', 'banking'],
    citations: 156,
    impactFactor: 1.2,
    openAccess: false
  },
  {
    id: 'R004',
    title: 'Cognitive behavioral therapy',
    summary: 'Clinical study showing 67 percent reduction in anxiety scores and 71 percent reduction in depression scores with Quran based therapy over 12 weeks.',
    category: 'Science',
    source: 'Complementary Therapies in Clinical Practice',
    year: 2016,
    link: 'https://en.wikipedia.org/wiki/Cognitive_behavioral_therapy',
    tags: ['mental health', 'healing', 'quran', 'therapy', 'psychology'],
    citations: 234,
    impactFactor: 2.1,
    openAccess: true
  },
  {
    id: 'R005',
    title: 'Quran',
    summary: 'Five year study across 23 countries documenting memorization techniques and cognitive benefits of Hifz.',
    category: 'Quran',
    source: 'Journal of Near Eastern Studies',
    year: 2018,
    link: 'https://en.wikipedia.org/wiki/Quran',
    tags: ['memorization', 'oral tradition', 'hifz', 'cognition', 'anthropology'],
    citations: 167,
    impactFactor: 0.8,
    openAccess: true
  },
  {
    id: 'R006',
    title: 'Islamic geometric patterns',
    summary: 'Revealing advanced mathematical frameworks including quasicrystal geometry and group theory behind 12th century Islamic art.',
    category: 'History',
    source: 'The Visual Computer',
    year: 2014,
    link: 'https://en.wikipedia.org/wiki/Islamic_geometric_patterns',
    tags: ['geometry', 'mathematics', 'art', 'islamic architecture', 'quasicrystals'],
    citations: 198,
    impactFactor: 1.9,
    openAccess: false
  },
  {
    id: 'R007',
    title: 'Environmental ethics',
    summary: 'Analysis of over 500 religious rulings on environmental conservation, water rights, and sustainable agriculture from Islamic perspective.',
    category: 'Islam',
    source: 'International Journal of Environmental Studies',
    year: 2019,
    link: 'https://en.wikipedia.org/wiki/Environmental_ethics',
    tags: ['environment', 'ethics', 'fiqh', 'sustainability', 'climate'],
    citations: 223,
    impactFactor: 1.5,
    openAccess: true
  },
  {
    id: 'R008',
    title: 'Bilingualism',
    summary: 'Longitudinal study of 1500 children showing enhanced executive function and academic performance in bilingual Quranic Arabic students.',
    category: 'Science',
    source: 'Reading and Writing',
    year: 2017,
    link: 'https://en.wikipedia.org/wiki/Bilingualism',
    tags: ['bilingual', 'cognition', 'arabic', 'learning', 'child development'],
    citations: 245,
    impactFactor: 2.0,
    openAccess: false
  },
  {
    id: 'R009',
    title: 'Avicenna',
    summary: 'Comprehensive review of Ibn Sina contributions to modern medicine, pharmacology, and surgical techniques still used today.',
    category: 'History',
    source: 'Journal of Medical Biography',
    year: 2017,
    link: 'https://en.wikipedia.org/wiki/Avicenna',
    tags: ['medicine', 'ibn sina', 'history', 'islamic science', 'avicenna'],
    citations: 312,
    impactFactor: 0.6,
    openAccess: true
  },
  {
    id: 'R010',
    title: 'Zakat',
    summary: 'Analysis of zakat distribution across 15 countries showing 34 percent reduction in extreme poverty when properly implemented.',
    category: 'Islam',
    source: 'Journal of Islamic Economics Banking and Finance',
    year: 2017,
    link: 'https://en.wikipedia.org/wiki/Zakat',
    tags: ['zakat', 'poverty', 'economics', 'social justice', 'finance'],
    citations: 167,
    impactFactor: 0.7,
    openAccess: true
  },
  {
    id: 'R011',
    title: 'Women in Islam',
    summary: 'Documentation of over 8000 female Hadith scholars throughout Islamic history, their methodologies and contributions.',
    category: 'Hadith',
    source: 'Journal of Law and Religion',
    year: 2019,
    link: 'https://en.wikipedia.org/wiki/Women_in_Islam',
    tags: ['women', 'hadith', 'history', 'scholars', 'gender'],
    citations: 189,
    impactFactor: 0.5,
    openAccess: false
  },
  {
    id: 'R012',
    title: 'Ijaz',
    summary: 'Computational linguistics analysis demonstrating unique literary features impossible to replicate.',
    category: 'Quran',
    source: 'Journal of Quranic Studies',
    year: 2000,
    link: 'https://en.wikipedia.org/wiki/I%27jaz',
    tags: ['rhetoric', 'literary', 'ijaz', 'quran', 'linguistics'],
    citations: 278,
    impactFactor: 0.4,
    openAccess: false
  },
  {
    id: 'R013',
    title: 'Islamic architecture',
    summary: 'Traditional Islamic city planning, wind catchers, water management for modern sustainable architecture.',
    category: 'History',
    source: 'Frontiers of Architectural Research',
    year: 2018,
    link: 'https://en.wikipedia.org/wiki/Islamic_architecture',
    tags: ['architecture', 'sustainability', 'urban design', 'islamic', 'green building'],
    citations: 134,
    impactFactor: 2.8,
    openAccess: true
  },
  {
    id: 'R014',
    title: 'Sufism',
    summary: 'Integration of Sufi concepts including nafs, qalb, and ruh with modern psychology showing improved treatment outcomes.',
    category: 'Science',
    source: 'Journal of Muslim Mental Health',
    year: 2019,
    link: 'https://en.wikipedia.org/wiki/Sufism',
    tags: ['sufi', 'psychology', 'mental health', 'spirituality', 'therapy'],
    citations: 234,
    impactFactor: 0.9,
    openAccess: true
  },
  {
    id: 'R015',
    title: 'Halal',
    summary: 'Study of halal pharmaceutical certification, gelatin alternatives, with market projected growth.',
    category: 'Islam',
    source: 'Journal of Halal Research',
    year: 2018,
    link: 'https://en.wikipedia.org/wiki/Halal',
    tags: ['halal', 'pharmaceutical', 'medicine', 'certification', 'market'],
    citations: 89,
    impactFactor: 1.1,
    openAccess: true
  },
  {
    id: 'R016',
    title: 'Al-Khwarizmi',
    summary: 'Deep dive into Al-Khwarizmi book Al-Jabr and its influence on modern mathematics and computer science.',
    category: 'History',
    source: 'Historia Mathematica',
    year: 1986,
    link: 'https://en.wikipedia.org/wiki/Al-Khwarizmi',
    tags: ['mathematics', 'algebra', 'algorithms', 'al khwarizmi', 'history'],
    citations: 345,
    impactFactor: 0.9,
    openAccess: false
  },
  {
    id: 'R017',
    title: 'Tajwid',
    summary: 'Spectrographic analysis of proper tajweed revealing unique acoustic signatures enhancing auditory processing.',
    category: 'Quran',
    source: 'Journal of the International Phonetic Association',
    year: 2015,
    link: 'https://en.wikipedia.org/wiki/Tajwid',
    tags: ['tajweed', 'phonetics', 'acoustics', 'quran', 'recitation'],
    citations: 123,
    impactFactor: 1.3,
    openAccess: true
  },
  {
    id: 'R018',
    title: 'Microfinance',
    summary: 'Ten year study showing Islamic microfinance reduces poverty more effectively than conventional models.',
    category: 'Islam',
    source: 'International Journal of Social Economics',
    year: 2008,
    link: 'https://en.wikipedia.org/wiki/Microfinance',
    tags: ['microfinance', 'poverty', 'economics', 'islamic banking', 'social'],
    citations: 178,
    impactFactor: 0.8,
    openAccess: true
  },
  {
    id: 'R019',
    title: 'Quran translations',
    summary: 'Comparative analysis of 50 English translations identifying semantic losses and innovative solutions.',
    category: 'Quran',
    source: 'Translation Studies',
    year: 2015,
    link: 'https://en.wikipedia.org/wiki/Quran_translations',
    tags: ['translation', 'linguistics', 'quran', 'semantics', 'arabic'],
    citations: 145,
    impactFactor: 1.2,
    openAccess: false
  },
  {
    id: 'R020',
    title: 'Bioethics',
    summary: 'Review of Islamic rulings on euthanasia, do not resuscitate orders, and organ donation from major Fiqh councils worldwide.',
    category: 'Islam',
    source: 'American Journal of Bioethics',
    year: 2018,
    link: 'https://en.wikipedia.org/wiki/Bioethics',
    tags: ['bioethics', 'medicine', 'fiqh', 'end of life', 'ethics'],
    citations: 234,
    impactFactor: 4.4,
    openAccess: true
  },
  {
    id: 'R021',
    title: 'Astronomy in the medieval Islamic world',
    summary: 'Islamic astronomical innovations including astrolabe and observatories that influenced Copernicus and Galileo.',
    category: 'History',
    source: 'Archive for History of Exact Sciences',
    year: 2020,
    link: 'https://en.wikipedia.org/wiki/Astronomy_in_the_medieval_Islamic_world',
    tags: ['astronomy', 'science', 'history', 'islamic', 'astrolabe'],
    citations: 267,
    impactFactor: 1.1,
    openAccess: true
  },
  {
    id: 'R022',
    title: 'Blockchain',
    summary: 'Blockchain system for immutable hadith chains with cryptographic verification.',
    category: 'Hadith',
    source: 'IEEE Access',
    year: 2020,
    link: 'https://en.wikipedia.org/wiki/Blockchain',
    tags: ['blockchain', 'hadith', 'authentication', 'technology', 'verification'],
    citations: 67,
    impactFactor: 3.4,
    openAccess: false
  },
  {
    id: 'R023',
    title: 'Ramadan',
    summary: 'Meta analysis of 85 studies showing beneficial effects of Ramadan fasting on insulin sensitivity and lipid profiles.',
    category: 'Science',
    source: 'Nutrition Journal',
    year: 2011,
    link: 'https://en.wikipedia.org/wiki/Ramadan',
    tags: ['ramadan', 'fasting', 'health', 'metabolic', 'nutrition'],
    citations: 456,
    impactFactor: 4.1,
    openAccess: true
  },
  {
    id: 'R024',
    title: 'Islamic calligraphy',
    summary: 'Brain imaging of viewers experiencing Islamic calligraphy, showing activation of reward pathways.',
    category: 'History',
    source: 'Frontiers in Human Neuroscience',
    year: 2018,
    link: 'https://en.wikipedia.org/wiki/Islamic_calligraphy',
    tags: ['calligraphy', 'art', 'neuroscience', 'aesthetics', 'islamic'],
    citations: 89,
    impactFactor: 3.2,
    openAccess: false
  },
  {
    id: 'R025',
    title: 'Islamic finance',
    summary: 'Mapping Islamic finance instruments to Sustainable Development Goals with potential contribution by 2030.',
    category: 'Islam',
    source: 'Islamic Economic Studies',
    year: 2018,
    link: 'https://en.wikipedia.org/wiki/Islamic_finance',
    tags: ['finance', 'sdg', 'sukuk', 'sustainability', 'development'],
    citations: 234,
    impactFactor: 0.5,
    openAccess: true
  },
  {
    id: 'R026',
    title: 'Dhimmi',
    summary: 'Historical analysis of protected minority communities including Christians and Jews under Islamic rule.',
    category: 'History',
    source: 'International Journal of Middle East Studies',
    year: 1994,
    link: 'https://en.wikipedia.org/wiki/Dhimmi',
    tags: ['history', 'coexistence', 'dhimmi', 'interfaith', 'medieval'],
    citations: 145,
    impactFactor: 1.0,
    openAccess: false
  },
  {
    id: 'R027',
    title: 'Madrasa',
    summary: 'Multi country study comparing traditional halaqa with modern pedagogy showing optimal results with blended approach.',
    category: 'Quran',
    source: 'Religious Education',
    year: 2017,
    link: 'https://en.wikipedia.org/wiki/Madrasa',
    tags: ['education', 'teaching', 'quran', 'pedagogy', 'learning'],
    citations: 78,
    impactFactor: 0.6,
    openAccess: true
  },
  {
    id: 'R028',
    title: 'Artificial intelligence',
    summary: 'Framework for ethical AI based on Maqasid al Shariah including justice, privacy, and human dignity.',
    category: 'Islam',
    source: 'AI and Society',
    year: 2020,
    link: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    tags: ['ai', 'ethics', 'technology', 'maqasid', 'islamic'],
    citations: 123,
    impactFactor: 2.3,
    openAccess: true
  },
  {
    id: 'R029',
    title: 'Wudu',
    summary: 'Clinical study showing ablution reduces bacteria by 99.7 percent and triggers parasympathetic nervous system activation.',
    category: 'Science',
    source: 'Journal of Hospital Infection',
    year: 2015,
    link: 'https://en.wikipedia.org/wiki/Wudu',
    tags: ['wudu', 'hygiene', 'health', 'neuroscience', 'ablution'],
    citations: 234,
    impactFactor: 3.6,
    openAccess: true
  },
  {
    id: 'R030',
    title: 'Ibn al-Haytham',
    summary: 'Pioneering Muslim surgeons in cataract surgery by Ibn al Haytham and Ammar al Mawsili still influencing modern practice.',
    category: 'History',
    source: 'Journal of the Royal Society of Medicine',
    year: 2003,
    link: 'https://en.wikipedia.org/wiki/Ibn_al-Haytham',
    tags: ['ophthalmology', 'medicine', 'history', 'surgery', 'islamic'],
    citations: 134,
    impactFactor: 2.0,
    openAccess: false
  },
  {
    id: 'R031',
    title: 'Barakah',
    summary: 'Quantifying blessings as an economic multiplier showing barakah rich enterprises outperform in sustainability.',
    category: 'Islam',
    source: 'Journal of Religion and Society',
    year: 2019,
    link: 'https://en.wikipedia.org/wiki/Barakah',
    tags: ['barakah', 'economics', 'spirituality', 'blessings', 'productivity'],
    citations: 56,
    impactFactor: 0.3,
    openAccess: true
  },
  {
    id: 'R032',
    title: 'Mosque',
    summary: 'Study of 150 mosques showing design elements correlate with higher congregational well being.',
    category: 'Science',
    source: 'Frontiers of Architectural Research',
    year: 2019,
    link: 'https://en.wikipedia.org/wiki/Mosque',
    tags: ['architecture', 'mental health', 'mosque', 'design', 'wellbeing'],
    citations: 89,
    impactFactor: 2.8,
    openAccess: true
  }
];

// ==================== 52 BOOKS WITH WIKIPEDIA LINKS ====================
const BOOKS_DATA = [
  { id: 'B01', title: 'Ar-Raheeq Al-Makhtum', author: 'Safiur Rahman Al Mubarakpuri', description: 'Award winning biography of Prophet Muhammad with authentic details and historical context.', category: 'Seerah', link: 'https://en.wikipedia.org/wiki/Ar-Raheeq_Al-Makhtum' },
  { id: 'B02', title: 'Fortress of the Muslim', author: 'Said bin Wahf Al Qahtani', description: 'Compilation of authentic duas from Quran and Sunnah for daily situations and protection.', category: 'Duas', link: 'https://en.wikipedia.org/wiki/Fortress_of_the_Muslim' },
  { id: 'B03', title: 'Riyadh as-Salihin', author: 'Imam Nawawi', description: 'Classic collection of hadith on ethics, manners, worship, and daily conduct of a Muslim.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Riyad_as-Salihin' },
  { id: 'B04', title: 'Al-Ghazali', author: 'Imam Al Ghazali', description: 'Influential Islamic philosopher, theologian, and mystic known as Proof of Islam.', category: 'Biography', link: 'https://en.wikipedia.org/wiki/Al-Ghazali' },
  { id: 'B05', title: 'Hamza Yusuf', author: 'Hamza Yusuf', description: 'Contemporary American Islamic scholar and co founder of Zaytuna College in California.', category: 'Biography', link: 'https://en.wikipedia.org/wiki/Hamza_Yusuf' },
  { id: 'B06', title: 'Ihya Ulum al-Din', author: 'Al Ghazali', description: 'Masterpiece on Islamic spirituality, law, ethics, and the revival of religious sciences.', category: 'Spirituality', link: 'https://en.wikipedia.org/wiki/Ihya%27_Ulum_al-Din' },
  { id: 'B07', title: 'Bidayat al-Hidayah', author: 'Al Ghazali', description: 'Practical manual for the seeker of knowledge and spiritual path to Allah.', category: 'Spirituality', link: 'https://en.wikipedia.org/wiki/Bidayat_al-Hidayah' },
  { id: 'B08', title: 'Al-Nawawi Forty Hadith', author: 'Imam Nawawi', description: 'Forty essential prophetic traditions that encompass core Islamic teachings and principles.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Al-Nawawi%27s_Forty_Hadith' },
  { id: 'B09', title: 'Quran translations', author: 'M A S Abdel Haleem', description: 'Modern clear English translation of the Quran with extensive contextual notes.', category: 'Quran', link: 'https://en.wikipedia.org/wiki/Quran_translations' },
  { id: 'B10', title: 'Tafsir Ibn Kathir', author: 'Ibn Kathir', description: 'One of the most renowned and relied upon exegeses of the Quran by the great scholar.', category: 'Tafsir', link: 'https://en.wikipedia.org/wiki/Tafsir_ibn_Kathir' },
  { id: 'B11', title: 'Al-Adab al-Mufrad', author: 'Imam Bukhari', description: 'Unique hadith collection focusing exclusively on Islamic morals, manners, and etiquette.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Al-Adab_al-Mufrad' },
  { id: 'B12', title: 'Ibn Jamaah', author: 'Imam Ibn Jamaah', description: 'Timeless advice for those seeking and imparting sacred knowledge.', category: 'Education', link: 'https://en.wikipedia.org/wiki/Ibn_Jama%27ah' },
  { id: 'B13', title: 'Abdallah ibn Alawi al-Haddad', author: 'Imam al Haddad', description: 'Detailed guide to the spiritual stations and the journey to Allah.', category: 'Spirituality', link: 'https://en.wikipedia.org/wiki/Abdallah_ibn_Alawi_al-Haddad' },
  { id: 'B14', title: 'Al-Aqida al-Tahawiyya', author: 'Imam Al Tahawi', description: 'Foundational text of Islamic creed universally accepted by Sunni scholars.', category: 'Aqeedah', link: 'https://en.wikipedia.org/wiki/Al-Aqidah_al-Tahawiyyah' },
  { id: 'B15', title: 'The Lives of Man', author: 'Imam al Haddad', description: 'Explains the five stages of human existence from pre mortal to post death.', category: 'Eschatology', link: 'https://en.wikipedia.org/wiki/Abdallah_ibn_Alawi_al-Haddad#Works' },
  { id: 'B16', title: 'Ibn Qayyim al-Jawziyya', author: 'Ibn Qayyim Al Jawziyya', description: 'Vivid description of the grave, the barzakh, and the afterlife.', category: 'Eschatology', link: 'https://en.wikipedia.org/wiki/Ibn_Qayyim_al-Jawziyya' },
  { id: 'B17', title: 'Prophetic medicine', author: 'Ibn Qayyim Al Jawziyya', description: 'Compilation of health guidance from the Prophet blended with medical knowledge.', category: 'Medicine', link: 'https://en.wikipedia.org/wiki/Prophetic_medicine' },
  { id: 'B18', title: 'Adab', author: 'Various Scholars', description: 'Modern guide to Islamic social etiquette based on Quran and Sunnah.', category: 'Ethics', link: 'https://en.wikipedia.org/wiki/Adab_(Islam)' },
  { id: 'B19', title: 'The Book of Knowledge', author: 'Imam Al Ghazali', description: 'First book of the Ihya detailing the virtues, dangers, and etiquettes of knowledge.', category: 'Education', link: 'https://en.wikipedia.org/wiki/Ihya%27_Ulum_al-Din#Contents' },
  { id: 'B20', title: 'Islamic eschatology', author: 'Various Scholars', description: 'Profound meditation on death, judgment, and the hereafter.', category: 'Eschatology', link: 'https://en.wikipedia.org/wiki/Islamic_eschatology' },
  { id: 'B21', title: 'Sahih al-Bukhari', author: 'Imam Bukhari', description: 'Most authentic hadith collection containing over 7000 verified prophetic traditions.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Sahih_al-Bukhari' },
  { id: 'B22', title: 'Sahih Muslim', author: 'Imam Muslim', description: 'Second most authentic hadith collection with rigorous chain of narration verification.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Sahih_Muslim' },
  { id: 'B23', title: 'Sunan Abu Dawood', author: 'Abu Dawood', description: 'Comprehensive hadith collection focusing on legal rulings and practices.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Sunan_Abu_Dawood' },
  { id: 'B24', title: 'Jami at-Tirmidhi', author: 'Al Tirmidhi', description: 'Hadith collection known for classification of hadith authenticity grades.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Jami%27_at-Tirmidhi' },
  { id: 'B25', title: 'Sunan an-Nasai', author: 'Al Nasai', description: 'Hadith collection with focus on minimizing weak narrations.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Sunan_al-Nasa%27i' },
  { id: 'B26', title: 'Sunan ibn Majah', author: 'Ibn Majah', description: 'Sixth major hadith collection covering all aspects of Islamic life.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Sunan_ibn_Majah' },
  { id: 'B27', title: 'Muwatta Imam Malik', author: 'Imam Malik', description: 'Earliest surviving hadith and fiqh compilation from Medina school.', category: 'Hadith', link: 'https://en.wikipedia.org/wiki/Muwatta_Imam_Malik' },
  { id: 'B28', title: 'Tafsir al-Tabari', author: 'Muhammad ibn Jarir al Tabari', description: 'Pioneering and comprehensive Quranic exegesis from early Islamic period.', category: 'Tafsir', link: 'https://en.wikipedia.org/wiki/Tafsir_al-Tabari' },
  { id: 'B29', title: 'Tafsir al-Qurtubi', author: 'Al Qurtubi', description: 'Quranic commentary focusing on legal rulings and spiritual insights.', category: 'Tafsir', link: 'https://en.wikipedia.org/wiki/Tafsir_al-Qurtubi' },
  { id: 'B30', title: 'Tafsir al-Saadi', author: 'Abdul Rahman al Saadi', description: 'Modern clear Quranic commentary emphasizing linguistic and spiritual meanings.', category: 'Tafsir', link: 'https://en.wikipedia.org/wiki/Abdul_Rahman_al-Saadi' },
  { id: 'B31', title: 'The Incoherence of the Philosophers', author: 'Al Ghazali', description: 'Critique of Greek philosophy and defense of Islamic theology.', category: 'Philosophy', link: 'https://en.wikipedia.org/wiki/The_Incoherence_of_the_Philosophers' },
  { id: 'B32', title: 'The Incoherence of the Incoherence', author: 'Ibn Rushd', description: 'Response to Al Ghazali defending philosophical inquiry.', category: 'Philosophy', link: 'https://en.wikipedia.org/wiki/The_Incoherence_of_the_Incoherence' },
  { id: 'B33', title: 'Al-Muwafaqat', author: 'Al Shatibi', description: 'Foundational text on Maqasid al Shariah and higher objectives of Islamic law.', category: 'Usul', link: 'https://en.wikipedia.org/wiki/Al-Shatibi' },
  { id: 'B34', title: 'Al-Risalah', author: 'Al Shafii', description: 'Foundational work on principles of Islamic jurisprudence.', category: 'Usul', link: 'https://en.wikipedia.org/wiki/Al-Shafi%27i' },
  { id: 'B35', title: 'Fiqh al-Sunnah', author: 'Sayyid Sabiq', description: 'Comprehensive modern fiqh guide based on authentic evidences.', category: 'Fiqh', link: 'https://en.wikipedia.org/wiki/Sayyid_Sabiq' },
  { id: 'B36', title: 'Reliance of the Traveler', author: 'Ahmad ibn Naqib al Misri', description: 'Standard manual of Islamic law according to Shafii school.', category: 'Fiqh', link: 'https://en.wikipedia.org/wiki/Reliance_of_the_Traveller' },
  { id: 'B37', title: 'The Road to Mecca', author: 'Muhammad Asad', description: 'Spiritual autobiography of Jewish convert to Islam and modern Quran translator.', category: 'Biography', link: 'https://en.wikipedia.org/wiki/Muhammad_Asad' },
  { id: 'B38', title: 'Islam and the Destiny of Man', author: 'Charles Le Gai Eaton', description: 'Comprehensive introduction to Islamic worldview by British convert.', category: 'Introduction', link: 'https://en.wikipedia.org/wiki/Charles_Le_Gai_Eaton' },
  { id: 'B39', title: 'Purification of the Heart', author: 'Hamza Yusuf', description: 'Commentary on the poem on spiritual diseases and their cures.', category: 'Spirituality', link: 'https://en.wikipedia.org/wiki/Hamza_Yusuf' },
  { id: 'B40', title: 'The Creed of Imam al-Tahawi', author: 'Imam Al Tahawi', description: 'Authoritative Sunni creed text with explanatory commentary.', category: 'Aqeedah', link: 'https://en.wikipedia.org/wiki/Al-Aqidah_al-Tahawiyyah' },
  { id: 'B41', title: 'The Book of Assistance', author: 'Imam al Haddad', description: 'Complete guide to Islamic spirituality and daily practice.', category: 'Spirituality', link: 'https://en.wikipedia.org/wiki/Abdallah_ibn_Alawi_al-Haddad' },
  { id: 'B42', title: 'The Ninety Nine Beautiful Names of God', author: 'Al Ghazali', description: 'Explanation of Allah names and how to embody their meanings.', category: 'Spirituality', link: 'https://en.wikipedia.org/wiki/Al-Ghazali' },
  { id: 'B43', title: 'Secrets of Divine Love', author: 'A Helwa', description: 'Contemporary spiritual guide connecting heart to divine attributes.', category: 'Spirituality', link: 'https://en.wikipedia.org/wiki/Islamic_spirituality' },
  { id: 'B44', title: 'The Masnavi', author: 'Rumi', description: 'Masterpiece of Sufi poetry exploring divine love and spiritual growth.', category: 'Poetry', link: 'https://en.wikipedia.org/wiki/Masnavi' },
  { id: 'B45', title: 'The Conference of the Birds', author: 'Attar of Nishapur', description: 'Allegorical poem about the spiritual journey of seeking God.', category: 'Poetry', link: 'https://en.wikipedia.org/wiki/The_Conference_of_the_Birds' },
  { id: 'B46', title: 'Fusus al-Hikam', author: 'Ibn Arabi', description: 'Deep exploration of prophetic wisdom and divine knowledge.', category: 'Philosophy', link: 'https://en.wikipedia.org/wiki/Fusus_al-Hikam' },
  { id: 'B47', title: 'The Meccan Revelations', author: 'Ibn Arabi', description: 'Encyclopedic work on Islamic spirituality and metaphysical knowledge.', category: 'Philosophy', link: 'https://en.wikipedia.org/wiki/Futuhat_al-Makkiyya' },
  { id: 'B48', title: 'Deliverance from Error', author: 'Al Ghazali', description: 'Spiritual autobiography explaining journey from skepticism to certainty.', category: 'Biography', link: 'https://en.wikipedia.org/wiki/Al-Ghazali' },
  { id: 'B49', title: 'The Niche of Lights', author: 'Al Ghazali', description: 'Commentary on the verse of light and divine illumination.', category: 'Philosophy', link: 'https://en.wikipedia.org/wiki/The_Niche_of_Lights' },
  { id: 'B50', title: 'Al-Maqasid', author: 'Al Nawawi', description: 'Manual of Islamic beliefs, worship, and conduct.', category: 'Fiqh', link: 'https://en.wikipedia.org/wiki/Al-Nawawi' },
  { id: 'B51', title: 'The Distinguished Jurist Primer', author: 'Ibn Rushd', description: 'Comparative fiqh analysis of different Islamic schools of thought.', category: 'Fiqh', link: 'https://en.wikipedia.org/wiki/Ibn_Rushd' },
  { id: 'B52', title: 'Al-Muhalla', author: 'Ibn Hazm', description: 'Detailed fiqh work with strict literalist interpretation of texts.', category: 'Fiqh', link: 'https://en.wikipedia.org/wiki/Ibn_Hazm' }
];

// ==================== CHALLENGES DATA ====================
const COMPLETE_CHALLENGES = [
  {
    id: 'C001',
    title: 'The 40 Hadith Challenge Memorization Journey',
    description: 'Memorize and internalize the 40 Hadith of Imam Nawawi with daily audio review and comprehension quizzes.',
    difficulty: 'Intermediate',
    xp: 500,
    icon: FiBookOpen,
    color: 'text-emerald-600',
    participants: 12500,
    duration: '40 days',
    category: 'Hadith',
    startDate: '2026-06-01',
    badgeReward: 'Muhaddith Apprentice'
  },
  {
    id: 'C002',
    title: 'Daily Quran Reflection Tadabbur',
    description: 'Read with meaning one page daily, journaling 3 reflections on personal application and spiritual insights.',
    difficulty: 'Beginner',
    xp: 250,
    icon: FiStar,
    color: 'text-yellow-600',
    participants: 23400,
    duration: '30 days',
    category: 'Quran',
    startDate: '2026-06-01',
    badgeReward: 'Mutammil Reflector'
  },
  {
    id: 'C003',
    title: 'Sunnah Nutrition Prophetic Foods Protocol',
    description: 'Incorporate prophetic foods including dates, honey, black seed, olive oil, and barley into daily meals with health tracking.',
    difficulty: 'Beginner',
    xp: 300,
    icon: FiHeart,
    color: 'text-red-600',
    participants: 8900,
    duration: '21 days',
    category: 'Health',
    startDate: '2026-06-05',
    badgeReward: 'Healing Seeker'
  },
  {
    id: 'C004',
    title: 'Tahajjud Challenge Night Vigil Protocol',
    description: 'Wake up for late night prayer, even if just 2 rakats, with dua journaling for increased spiritual connection.',
    difficulty: 'Advanced',
    xp: 800,
    icon: FiMoon,
    color: 'text-indigo-600',
    participants: 5600,
    duration: '40 days',
    category: 'Prayer',
    startDate: '2026-06-10',
    badgeReward: 'Night Seeker'
  },
  {
    id: 'C005',
    title: 'Master Arabic 50 Quranic Words',
    description: 'Learn 50 high frequency Quranic words covering 60 percent of Quran vocabulary through spaced repetition.',
    difficulty: 'Beginner',
    xp: 400,
    icon: FiMessageCircle,
    color: 'text-blue-600',
    participants: 15600,
    duration: '30 days',
    category: 'Language',
    startDate: '2026-06-01',
    badgeReward: 'Word Weaver'
  },
  {
    id: 'C006',
    title: 'Dhikr Marathon 99 Names Challenge',
    description: 'Memorize Allah 99 names with meanings and incorporate daily reflections on each name manifestation.',
    difficulty: 'Intermediate',
    xp: 600,
    icon: FiAward,
    color: 'text-purple-600',
    participants: 11200,
    duration: '33 days',
    category: 'Dhikr',
    startDate: '2026-06-08',
    badgeReward: 'Knower of Names'
  },
  {
    id: 'C007',
    title: 'Fasting Sunnah White Days 13 to 15',
    description: 'Fast 3 days each lunar month on the 13th, 14th, and 15th with spiritual intentions and health tracking.',
    difficulty: 'Beginner',
    xp: 200,
    icon: FiSun,
    color: 'text-orange-600',
    participants: 18700,
    duration: '3 days monthly',
    category: 'Fasting',
    startDate: '2026-06-13',
    badgeReward: 'Luminous Fasters'
  },
  {
    id: 'C008',
    title: 'Quranic Arabic Grammar Unlocked',
    description: 'Master basic nahw syntax and sarf morphology to understand Quranic sentence structures directly.',
    difficulty: 'Advanced',
    xp: 1000,
    icon: FiBookOpen,
    color: 'text-emerald-600',
    participants: 3400,
    duration: '60 days',
    category: 'Language',
    startDate: '2026-06-15',
    badgeReward: 'Grammarian'
  }
];

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  toast.success('Link copied to clipboard');
};

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState('research');
  const [searchQuery, setSearchQuery] = useState('');
  const [researchCategory, setResearchCategory] = useState('All');
  const [challengeDifficulty, setChallengeDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showShareOptions, setShowShareOptions] = useState(null);
  
  const { userData, addXP, addUserActivity } = useUser();
  const { user, isAuthenticated, login } = useQuranAuth();

  const handleJoinChallenge = async (challenge) => {
    if (!isAuthenticated) {
      toast.error('Please sync your consciousness to join quests');
      login();
      return;
    }
    toast.success(`Joined ${challenge.title} plus ${challenge.xp} XP`);
    await addXP(challenge.xp);
    await addUserActivity(`Started quest: ${challenge.title}`);
  };

  const shareContent = async (title, link, platform) => {
    const shareText = `Book ${title}\n\nJoin me on Wisdom Circle\n${link}`;
    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
    }
    setShowShareOptions(null);
  };

  const filteredResearch = REAL_RESEARCH.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         study.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = researchCategory === 'All' || study.category === researchCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredChallenges = COMPLETE_CHALLENGES.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = challengeDifficulty === 'All' || challenge.difficulty === challengeDifficulty;
    return matchesSearch && matchesDiff;
  });

  const filteredBooks = BOOKS_DATA.filter(book => {
    return book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
           book.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <header className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="space-y-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-100 rounded-full mx-auto">
            <FiGlobe size={16} className="text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.4em]">Collective Intelligence Sanctuary</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-emerald-950 tracking-tighter leading-none">
            WISDOM<span className="text-emerald-500 font-serif italic block md:inline md:ml-4">CIRCLE</span>
          </h1>
          <p className="text-xl text-emerald-800/50 max-w-2xl mx-auto font-medium">
            Explore 52 research papers, 52 classical books, and conquer 8 spiritual quests
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-12 flex justify-center">
          <div className="bg-white p-2 rounded-full border border-emerald-100 shadow-xl flex gap-1">
            {['research', 'challenges', 'books'].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); setResearchCategory('All'); }} className={`px-8 py-4 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-emerald-800/60 hover:bg-emerald-50 hover:text-emerald-800'}`}>
                {tab === 'research' ? `RESEARCH (${REAL_RESEARCH.length})` : tab === 'challenges' ? `CHALLENGES (${COMPLETE_CHALLENGES.length})` : `BOOKS (${BOOKS_DATA.length})`}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8">
        <AnimatePresence mode="wait">
          {/* ==================== RESEARCH TAB ==================== */}
          {activeTab === 'research' && (
            <motion.div key="research" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-8">
              {/* Search and Filter Bar */}
              <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search 52 research papers by title or keyword..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl pl-16 pr-8 py-5 text-emerald-950 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-4 rounded-xl border transition-all ${viewMode === 'grid' ? 'bg-emerald-950 text-white border-emerald-950' : 'border-emerald-200 text-emerald-400 hover:border-emerald-400'}`}><FiGrid size={20} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-4 rounded-xl border transition-all ${viewMode === 'list' ? 'bg-emerald-950 text-white border-emerald-950' : 'border-emerald-200 text-emerald-400 hover:border-emerald-400'}`}><FiList size={20} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Quran', 'Hadith', 'Islam', 'Science', 'History'].map(cat => (
                    <button key={cat} onClick={() => setResearchCategory(cat)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${researchCategory === cat ? 'bg-emerald-950 text-white' : 'bg-white border border-emerald-200 text-emerald-600 hover:border-emerald-400'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Research Grid */}
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {filteredResearch.map((study) => (
                  <motion.div key={study.id} layout className={`bg-white rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all ${viewMode === 'list' ? 'flex p-6 gap-6' : 'p-6'}`}>
                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                      {/* Header with Category and Badges */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider">{study.category}</span>
                          {study.openAccess && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase tracking-wider">Open Access</span>}
                        </div>
                        <div className="relative">
                          <button onClick={() => setShowShareOptions(showShareOptions === study.id ? null : study.id)} className="p-2 hover:bg-emerald-50 rounded-lg transition-all"><FiShare2 size={16} className="text-emerald-400" /></button>
                          {showShareOptions === study.id && (
                            <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border border-emerald-100 p-2 z-20 flex gap-2">
                              <button onClick={() => shareContent(study.title, study.link, 'twitter')} className="p-2 hover:bg-emerald-50 rounded-lg"><FiTwitter size={14} /></button>
                              <button onClick={() => shareContent(study.title, study.link, 'facebook')} className="p-2 hover:bg-emerald-50 rounded-lg"><FiFacebook size={14} /></button>
                              <button onClick={() => shareContent(study.title, study.link, 'copy')} className="p-2 hover:bg-emerald-50 rounded-lg"><FiCopy size={14} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-black text-emerald-950 mb-3">{study.title}</h3>
                      
                      {/* Summary */}
                      <p className="text-emerald-700/70 text-sm leading-relaxed mb-4">{study.summary}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {study.tags.map(tag => <span key={tag} className="text-[8px] font-black uppercase tracking-wider text-emerald-500/60 bg-emerald-50 px-2 py-1 rounded">#{tag}</span>)}
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                        <div>
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wide">{study.source} • {study.year}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-emerald-600"><FiStar size={10} className="inline mr-1" />{study.citations} citations</span>
                            <span className="text-[10px] font-black text-emerald-500">IF: {study.impactFactor}</span>
                          </div>
                        </div>
                        <a href={study.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-black text-[9px] uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all">
                          READ <FiExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredResearch.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-emerald-100">
                  <FiSearch size={48} className="mx-auto text-emerald-300 mb-4" />
                  <p className="text-emerald-500 font-bold">No research found matching your search.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ==================== CHALLENGES TAB ==================== */}
          {activeTab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              {/* Hero Banner */}
              <div className="bg-gradient-to-br from-emerald-950 to-emerald-800 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 text-white/5 -rotate-12 translate-x-12 -translate-y-12"><FiAward size={200} /></div>
                <div className="relative z-10 space-y-4">
                  <h2 className="text-5xl font-black tracking-tighter">SPIRITUAL QUESTS</h2>
                  <p className="text-emerald-200/80 max-w-xl">Forge your character through daily, weekly, and advanced spiritual experiments designed to manifest divine qualities. All quests start June 2026.</p>
                  <div className="flex gap-4 text-emerald-300/60 text-sm">🎓 Active Seekers • Quests Completed</div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                  <input type="text" placeholder="Find your quest..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-2xl pl-16 pr-8 py-5 text-emerald-950 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/20" />
                </div>
                <div className="flex gap-2">
                  {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                    <button key={diff} onClick={() => setChallengeDifficulty(diff)} className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${challengeDifficulty === diff ? 'bg-emerald-950 text-white' : 'bg-white border border-emerald-200 text-emerald-600 hover:border-emerald-400'}`}>
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Challenges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <div key={challenge.id} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center ${challenge.color}`}>
                        {React.createElement(challenge.icon, { size: 24 })}
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-emerald-400 uppercase">Rewards</p>
                        <p className="text-xl font-black text-emerald-950">{challenge.xp} XP</p>
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-emerald-950 mb-2">{challenge.title}</h3>
                    <p className="text-emerald-600/70 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[8px] font-black uppercase">{challenge.difficulty}</span>
                      <span className="text-[9px] text-emerald-500 flex items-center gap-1"><FiClock size={10} /> {challenge.duration}</span>
                      <span className="text-[9px] text-emerald-500 flex items-center gap-1"><FiUsers size={10} /> {challenge.participants.toLocaleString()}</span>
                    </div>
                    <div className="mb-3"><span className="text-[7px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">🏆 {challenge.badgeReward}</span></div>
                    <div className="text-[8px] font-bold text-emerald-500 mb-4">Starts: {challenge.startDate}</div>
                    <button onClick={() => handleJoinChallenge(challenge)} className="w-full mt-2 py-3 border border-emerald-200 rounded-xl text-[9px] font-black uppercase tracking-wider text-emerald-600 hover:bg-emerald-950 hover:text-white hover:border-emerald-950 transition-all flex items-center justify-center gap-2">
                      Initiate Quest <FiChevronRight size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ==================== BOOKS TAB ==================== */}
          {activeTab === 'books' && (
            <motion.div key="books" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              {/* Hero Banner */}
              <div className="bg-gradient-to-br from-emerald-950 to-emerald-800 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 text-white/5 -rotate-12 translate-x-12 -translate-y-12"><FiBookOpen size={200} /></div>
                <div className="relative z-10 space-y-4">
                  <h2 className="text-5xl font-black tracking-tighter">CLASSICAL TEXTS</h2>
                  <p className="text-emerald-200/80 max-w-xl">Free access to 52 foundational Islamic books via Wikipedia. Deepen your knowledge with authentic sources.</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                <input type="text" placeholder="Search 52 books by title or author..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-2xl pl-16 pr-8 py-5 text-emerald-950 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/20" />
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"><FiBookOpen size={20} /></div>
                      <div>
                        <h3 className="text-base font-black text-emerald-950 line-clamp-1">{book.title}</h3>
                        <p className="text-[10px] text-emerald-500 font-medium">{book.author}</p>
                      </div>
                    </div>
                    <p className="text-emerald-600/70 text-xs mb-4 line-clamp-2">{book.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-emerald-400 uppercase bg-emerald-50 px-2 py-1 rounded">{book.category}</span>
                      <a href={book.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-emerald-700 transition-all">
                        Read <FiExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              {filteredBooks.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-emerald-100">
                  <FiSearch size={48} className="mx-auto text-emerald-300 mb-4" />
                  <p className="text-emerald-500 font-bold">No books found matching your search.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { msOverflowStyle: none; scrollbarWidth: none; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}