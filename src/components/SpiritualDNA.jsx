// src/components/SpiritualDNA.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Star, Target, Bookmark, 
  RefreshCw, Compass, BookOpen,
  Share2, Heart, Sun, Cloud, Wind, Moon,
  ChevronRight, X, Clock, Grid, List, Zap,
  Search, Shield, Award, User, Sparkles, 
  Sunrise, TrendingUp, HandHelping, Filter,
  Info, Gift, CheckCircle, Calendar, Eye,
  ChevronLeft, Bookmark as BookmarkIcon, Users,
  Trophy, Medal, Gem, Crown, CalendarDays,
  Droplets, BellRing, FlameKindling, MapPin,
  Layers, Volume2, Mic, Music, Quote,
  Feather, Globe, Lock, Unlock, Plus, Minus,
  Check, AlertCircle, HelpCircle, Loader
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

// ==================== COMPLETE PROPHETS DATA (25 PROPHETS) ====================
const PROPHETS = [
  {
    id: 1,
    name: "Adam",
    nameAr: "آدم",
    icon: "🌿",
    title: "Abu al-Bashar (Father of Humanity)",
    desc: "The first human and first prophet, created from clay and taught all names.",
    fullStory: "Allah created Adam from clay and breathed into him His spirit. He was taught the names of all things, a knowledge that even the angels did not possess. Commanded to prostrate, the angels obeyed while Iblis refused, marking the beginning of the spiritual struggle. Adam and Hawwa resided in Paradise but were eventually tested and descended to Earth. Their sincere repentance became the archetype for all humanity: that man may stumble, but the door of Divine Mercy is always open. Adam was the first to build the Kaaba, establishing the first sanctuary of monotheism on Earth.",
    miracles: ["Created from clay without parents", "Taught all names by Allah", "First to receive prophethood", "Built the first Kaaba"],
    teachings: ["Repent sincerely after sins", "Satan is humanity's enemy", "Knowledge is a gift from Allah", "Humility before Allah"],
    verses: ["And He taught Adam the names - all of them... (2:31)", "Indeed, I will make upon the earth a successive authority. (2:30)"],
    lessons: ["Sincere repentance", "Avoid arrogance", "Know your enemy (Satan)", "Seek knowledge"],
    timeline: [
      { year: "Creation", event: "Created from clay" },
      { year: "Creation", event: "Angels commanded to prostrate" },
      { year: "Creation", event: "Tested with the tree" },
      { year: "Earth", event: "Descended to Earth as Khalifah" }
    ],
    lesson: "Sincere repentance and humility before Allah opens the doors of mercy.",
    miracle: "Created from clay without parents and taught all names by Allah",
    type: "Messenger",
    era: "Beginning of Humanity",
    xpReward: 15
  },
  {
    id: 2,
    name: "Idris",
    nameAr: "إدريس",
    icon: "🌿",
    title: "The Scribe & Scholar",
    desc: "Known for his wisdom, writing, and being raised to a high station.",
    fullStory: "Prophet Idris was a descendant of Adam through his son Seth. He was the first to write with a pen and was skilled in astronomy, mathematics, and tailoring. He called people to worship Allah and follow the path of Adam. He was known for his patience, truthfulness, and deep knowledge. Allah raised him to a high station, and according to some narrations, he was taken to the fourth heaven where he resides.",
    miracles: ["First to write with pen", "Knowledge of astronomy", "Raised to high station", "Master of multiple sciences"],
    teachings: ["Value of knowledge", "Patience in da'wah", "Writing preserves wisdom", "Balance worldly and spiritual knowledge"],
    verses: ["And mention in the Book, Idris. Indeed, he was a man of truth and a prophet. And We raised him to a high station. (19:56-57)"],
    lessons: ["Knowledge is powerful", "Patience brings elevation", "Truthfulness is essential", "Teach through writing"],
    timeline: [
      { year: "~4000 BCE", event: "Born as descendant of Seth" },
      { year: "~3900 BCE", event: "Received prophethood" },
      { year: "~3800 BCE", event: "First to write with pen" },
      { year: "~3700 BCE", event: "Raised to high station" }
    ],
    lesson: "Knowledge elevates the soul. Seek wisdom and share it with others.",
    miracle: "First to write with pen and raised to a high station by Allah",
    type: "Prophet",
    era: "Early Humanity",
    xpReward: 20
  },
  {
    id: 3,
    name: "Nuh",
    nameAr: "نوح",
    icon: "🌿",
    title: "The Patient Preacher",
    desc: "Preached for 950 years and built the ark to save believers from the great flood.",
    fullStory: "Prophet Nuh preached for 950 years with patience, calling people day and night. Despite his efforts, only about 80 people believed. He built the ark by Allah's command under mockery. When the flood came, all disbelievers drowned. The ark settled on Mount Judi.",
    miracles: ["The great ark", "The flood covering Earth", "950 years of preaching", "Animals coming in pairs"],
    teachings: ["Patience in da'wah", "Trust Allah's plan", "Family guidance", "Never give up on people"],
    verses: ["And We sent Noah to his people, and he remained among them a thousand years minus fifty... (29:14)"],
    lessons: ["Never lose hope", "Obey Allah's commands", "Save your family through faith", "Patience against mockery"],
    timeline: [
      { year: "~3000 BCE", event: "Sent as prophet" },
      { year: "~2500 BCE", event: "Built the ark" },
      { year: "~2490 BCE", event: "The great flood" },
      { year: "~2480 BCE", event: "Ark rested on Mount Judi" }
    ],
    lesson: "Patience and persistence in calling to Allah, even when faced with rejection.",
    miracle: "The great ark that saved believers from the flood",
    type: "Messenger",
    era: "Ancient Times",
    xpReward: 25
  },
  {
    id: 4,
    name: "Hud",
    nameAr: "هود",
    icon: "🌿",
    title: "Prophet of 'Ad",
    desc: "Sent to the mighty people of 'Ad who built great structures and were destroyed by a fierce wind.",
    fullStory: "Prophet Hud was sent to the people of 'Ad who lived in Al-Ahqaf. They were tall, strong people who became arrogant and worshipped idols. Hud called them to worship Allah alone, but they rejected him. A fierce wind destroyed them, saving only Hud and the believers.",
    miracles: ["Survived the destroying wind", "Prophesied the punishment", "Withheld rain miracle"],
    teachings: ["Arrogance leads to destruction", "Strength is from Allah", "Worship Allah alone", "Warn before punishment"],
    verses: ["And to 'Ad [We sent] their brother Hud. He said, 'O my people, worship Allah...' (7:65)"],
    lessons: ["Don't be arrogant with power", "Heed warnings", "Material strength can't save", "True power is with Allah"],
    timeline: [
      { year: "~2500 BCE", event: "Sent to people of 'Ad" },
      { year: "~2490 BCE", event: "Preached for many years" },
      { year: "~2480 BCE", event: "Drought as warning" },
      { year: "~2470 BCE", event: "Destroying wind sent" }
    ],
    lesson: "Arrogance leads to destruction. True strength comes from faith in Allah.",
    miracle: "Survived the devastating wind that destroyed his people",
    type: "Messenger",
    era: "Ancient Arabia",
    xpReward: 20
  },
  {
    id: 5,
    name: "Salih",
    nameAr: "صالح",
    icon: "🌿",
    title: "Prophet of Thamud",
    desc: "Sent to Thamud who were given a miraculous she-camel as a sign from Allah.",
    fullStory: "Prophet Salih was sent to the people of Thamud who carved homes in mountains. Allah sent a miraculous she-camel from a rock as a sign. The disbelievers killed the camel, and a thunderous blast destroyed them.",
    miracles: ["She-camel from rock", "Camel giving abundant milk", "Precise prophecy of punishment"],
    teachings: ["Respect Allah's signs", "Share resources justly", "Don't test Allah", "Wickedness destroys"],
    verses: ["And to Thamud [We sent] their brother Salih... (7:73)"],
    lessons: ["Respect divine signs", "Justice in sharing", "Warning before punishment", "Arrogant leaders misguide"],
    timeline: [
      { year: "~2200 BCE", event: "Sent to Thamud" },
      { year: "~2195 BCE", event: "She-camel miracle" },
      { year: "~2190 BCE", event: "Camel killed by disbelievers" },
      { year: "~2187 BCE", event: "Earthquake destruction" }
    ],
    lesson: "Respect the signs of Allah and do not transgress His boundaries.",
    miracle: "A miraculous she-camel emerged from solid rock",
    type: "Messenger",
    era: "Ancient Arabia",
    xpReward: 20
  },
  {
    id: 6,
    name: "Ibrahim",
    nameAr: "إبراهيم",
    icon: "🌿",
    title: "Khalilullah (Friend of Allah)",
    desc: "Father of prophets, rebuilt the Kaaba, tested with sacrifice of his son.",
    fullStory: "Born in a society of idolaters in Babylon, Ibrahim (AS) used his intellect to realize the existence of a single Creator from a young age. He challenged his father and his people, eventually being thrown into a massive fire which Allah made cool and safe for him. He is the Father of Prophets, through whose lineage many messengers came. His life was a series of trials: leaving his family in the desert, and the command to sacrifice his son Ismail, both of which he met with absolute submission. Alongside Ismail, he rebuilt the Kaaba, establishing the rites of Hajj.",
    miracles: ["Fire becoming cool", "Zamzam water spring", "Ram from Paradise", "Reviving dead birds"],
    teachings: ["Complete submission to Allah", "Stand against falsehood", "Hospitality", "Trust Allah absolutely"],
    verses: ["And who is better in religion than one who submits himself to Allah... (4:125)", "Allah said, 'O fire, be coolness and safety upon Abraham.' (21:69)"],
    lessons: ["Complete faith", "Sacrifice for Allah", "Standing for truth alone", "Hospitality to guests"],
    timeline: [
      { year: "~2000 BCE", event: "Born in Babylon" },
      { year: "~1980 BCE", event: "Broke idols" },
      { year: "~1975 BCE", event: "Thrown into fire" },
      { year: "~1950 BCE", event: "Left Hajar in desert" },
      { year: "~1940 BCE", event: "Sacrifice test" },
      { year: "~1930 BCE", event: "Rebuilt Kaaba" }
    ],
    lesson: "Complete submission to Allah is the highest form of worship and faith.",
    miracle: "The fire became cool and safe when he was thrown into it",
    type: "Messenger",
    era: "Mesopotamia",
    xpReward: 30
  },
  {
    id: 7,
    name: "Lut",
    nameAr: "لوط",
    icon: "🌿",
    title: "The Righteous Witness",
    desc: "Nephew of Ibrahim, sent to the people of Sodom who practiced unprecedented immorality.",
    fullStory: "Prophet Lut warned the people of Sodom against immorality. Angels visited him as a test for the people. Lut left with his family at night before the cities were overturned.",
    miracles: ["Angels visiting in human form", "Blinding the mob", "Cities overturned", "Rain of stones"],
    teachings: ["Stand against immorality", "Protect the vulnerable", "Don't look back at sins", "Obedience saves"],
    verses: ["And [We sent] Lot, when he said to his people, 'Do you commit such immorality...' (7:80)"],
    lessons: ["Moral courage", "Protecting guests", "Leaving evil behind", "Don't sympathize with sin"],
    timeline: [
      { year: "~1950 BCE", event: "Migrated with Ibrahim" },
      { year: "~1940 BCE", event: "Sent to Sodom" },
      { year: "~1900 BCE", event: "Angels visited" },
      { year: "~1898 BCE", event: "Cities destroyed" }
    ],
    lesson: "Stand firm against immorality and protect the vulnerable in society.",
    miracle: "Angels visited in human form and the cities were overturned",
    type: "Messenger",
    era: "Jordan Valley",
    xpReward: 20
  },
  {
    id: 8,
    name: "Ismail",
    nameAr: "إسماعيل",
    icon: "🌿",
    title: "Dhabihullah (The Sacrificed One)",
    desc: "Son of Ibrahim, helped rebuild the Kaaba, ancestor of Prophet Muhammad ﷺ.",
    fullStory: "Left in the desert as a baby, the Zamzam spring appeared for him. He submitted to sacrifice before a ram was substituted. He helped Ibrahim build the Kaaba.",
    miracles: ["Zamzam water spring", "Ram substituted in sacrifice", "Helped build Kaaba", "Ancestor of Prophet Muhammad ﷺ"],
    teachings: ["Submission to Allah", "Patience in hardship", "Honoring parents", "Fulfilling promises"],
    verses: ["And when he reached with him [the age of] exertion, he said, 'O my son...' (37:102)"],
    lessons: ["Complete obedience", "Trust Allah in hardships", "Family blessed through faith", "Promises to Allah"],
    timeline: [
      { year: "~1955 BCE", event: "Born to Hajar" },
      { year: "~1953 BCE", event: "Zamzam spring" },
      { year: "~1940 BCE", event: "Sacrifice test" },
      { year: "~1930 BCE", event: "Rebuilt Kaaba with father" }
    ],
    lesson: "Complete obedience to Allah and honoring parents leads to great blessings.",
    miracle: "Zamzam water sprang forth in the barren desert",
    type: "Prophet",
    era: "Arabia",
    xpReward: 20
  },
  {
    id: 9,
    name: "Ishaq",
    nameAr: "إسحاق",
    icon: "🌿",
    title: "The Blessed Son",
    desc: "Son of Ibrahim and Sarah, father of Yaqub, ancestor of the Israelites.",
    fullStory: "Born miraculously to elderly parents, Ishaq continued his father's legacy of monotheism and was the father of Yaqub.",
    miracles: ["Born to elderly parents", "Twin sons including a prophet", "Continued prophetic lineage"],
    teachings: ["Nothing is impossible for Allah", "Gratitude for children", "Family legacy of faith", "Passing faith to children"],
    verses: ["And We gave him good tidings of Isaac, a prophet from among the righteous. (37:112)"],
    lessons: ["Allah's power over nature", "Patience for children", "Raising righteous children", "Legacy of faith"],
    timeline: [
      { year: "~1930 BCE", event: "Miraculous birth" },
      { year: "~1910 BCE", event: "Became prophet" },
      { year: "~1900 BCE", event: "Married Rebekah" },
      { year: "~1890 BCE", event: "Father of Yaqub" }
    ],
    lesson: "Nothing is impossible for Allah. Trust in His power and timing.",
    miracle: "Born to elderly parents who were beyond childbearing age",
    type: "Prophet",
    era: "Canaan",
    xpReward: 20
  },
  {
    id: 10,
    name: "Yaqub",
    nameAr: "يعقوب",
    icon: "🌿",
    title: "Israel (Servant of Allah)",
    desc: "Son of Ishaq, father of twelve tribes and Prophet Yusuf, known for beautiful patience.",
    fullStory: "Yaqub showed beautiful patience during the long separation from Yusuf, never losing hope in Allah's mercy.",
    miracles: ["Sight restored by Yusuf's shirt", "Father of twelve tribes", "Beautiful patience for decades"],
    teachings: ["Beautiful patience", "Never lose hope in Allah", "Forgive family", "Trust Allah's wisdom"],
    verses: ["He said, 'I only complain of my suffering and grief to Allah...' (12:86)"],
    lessons: ["Patience in grief", "Never despair of Allah", "Family reconciliation", "Sorrow only to Allah"],
    timeline: [
      { year: "~1890 BCE", event: "Born to Ishaq" },
      { year: "~1870 BCE", event: "Had twelve sons" },
      { year: "~1850 BCE", event: "Yusuf disappeared" },
      { year: "~1820 BCE", event: "Reunited with Yusuf" }
    ],
    lesson: "Beautiful patience in times of trial brings reunification and joy.",
    miracle: "His eyesight was restored by Yusuf's shirt",
    type: "Prophet",
    era: "Canaan",
    xpReward: 20
  },
  {
    id: 11,
    name: "Yusuf",
    nameAr: "يوسف",
    icon: "🌿",
    title: "The Beautiful & Wise",
    desc: "Known for his beauty, dream interpretation, and rise from slave to minister of Egypt.",
    fullStory: "Betrayed by his brothers, sold as a slave, and falsely imprisoned, Yusuf rose to be a minister of Egypt through his integrity and ability to interpret dreams.",
    miracles: ["Precise dream interpretation", "Rise from slave to minister", "Surviving false accusation"],
    teachings: ["Patience brings elevation", "Forgiveness is powerful", "Trust Allah's plan", "Maintain dignity in trials"],
    verses: ["Indeed, my Lord is Subtle in what He wills... (12:100)"],
    lessons: ["Patience through injustice", "Forgive completely", "Allah's plan unfolds beautifully", "Maintain character in prison"],
    timeline: [
      { year: "~1850 BCE", event: "Dream of stars" },
      { year: "~1848 BCE", event: "Thrown into well" },
      { year: "~1845 BCE", event: "Sold as slave" },
      { year: "~1840 BCE", event: "Falsely imprisoned" },
      { year: "~1835 BCE", event: "Interpreted king's dream" },
      { year: "~1830 BCE", event: "Reunited with family" }
    ],
    lesson: "Forgiveness and trust in Allah's plan turn trials into triumphs.",
    miracle: "Interpreting dreams with perfect accuracy",
    type: "Messenger",
    era: "Egypt",
    xpReward: 30
  },
  {
    id: 12,
    name: "Ayyub",
    nameAr: "أيوب",
    icon: "🌿",
    title: "The Epitome of Patience",
    desc: "Tested with loss of wealth, children, and health, yet remained grateful to Allah.",
    fullStory: "Prophet Ayyub lost everything but never complained. He was eventually healed and his blessings were doubled.",
    miracles: ["Patience during extreme trials", "Complete health restoration", "Spring of healing water"],
    teachings: ["Patience in hardship", "Gratitude in all states", "Complain only to Allah"],
    verses: ["Indeed, We found him patient, an excellent servant... (38:44)"],
    lessons: ["Patience brings reward", "Gratitude despite trials", "Allah tests those He loves"],
    timeline: [
      { year: "~1600 BCE", event: "Blessed with wealth" },
      { year: "~1580 BCE", event: "Severe trials begin" },
      { year: "~1570 BCE", event: "Years of patience" },
      { year: "~1560 BCE", event: "Healed and doubly blessed" }
    ],
    lesson: "Patience and gratitude during trials bring multiplied blessings.",
    miracle: "Complete healing after years of severe illness",
    type: "Prophet",
    era: "Unknown",
    xpReward: 25
  },
  {
    id: 13,
    name: "Shuaib",
    nameAr: "شعيب",
    icon: "🌿",
    title: "Khatib al-Anbiya (Orator of Prophets)",
    desc: "Sent to Madyan, known for his eloquent speech against economic fraud and corruption.",
    fullStory: "Sent to Madyan to preach against cheating in trade. He was known for his eloquent and logical arguments.",
    miracles: ["Eloquent speech and persuasion", "Earthquake punishment on disbelievers"],
    teachings: ["Fair business practices", "Honest weights and measures", "Economic justice"],
    verses: ["And to Madyan [We sent] their brother Shu'ayb... (7:85)"],
    lessons: ["Honesty in business", "Economic fairness", "Don't cheat customers"],
    timeline: [
      { year: "~1500 BCE", event: "Sent to Madyan" },
      { year: "~1490 BCE", event: "Preached against fraud" },
      { year: "~1480 BCE", event: "Disbelievers destroyed" }
    ],
    lesson: "Honesty in business and economic justice are essential to faith.",
    miracle: "Eloquent speech that powerfully conveyed Allah's message",
    type: "Messenger",
    era: "Madyan",
    xpReward: 20
  },
  {
    id: 14,
    name: "Musa",
    nameAr: "موسى",
    icon: "🌿",
    title: "Kalimullah (Spoken to by Allah)",
    desc: "Confronted Pharaoh, parted the Red Sea, received the Torah on Mount Sinai.",
    fullStory: "Prophet Musa was born during Pharaoh's decree of male infanticide. Placed in a basket on the Nile, he was found and raised by the very household he was destined to confront. After exile in Madyan, he received revelation at the Burning Bush. He returned to Egypt with his brother Harun to challenge Pharaoh and lead the Children of Israel to freedom. The parting of the Red Sea remains the most powerful sign of Divine intervention in his mission. He received the Torah on Mount Sinai and is the prophet most mentioned in the Quran.",
    miracles: ["Staff to serpent", "Radiant white hand", "Parting Red Sea", "Twelve springs from rock", "Manna and Salwa"],
    teachings: ["Justice against oppression", "Patience in leadership", "Trust Allah in danger", "Speak truth to tyrants"],
    verses: ["Indeed, I am Allah. There is no deity except Me... (20:14)"],
    lessons: ["Courage against tyranny", "Leadership requires patience", "Trust in divine help"],
    timeline: [
      { year: "~1400 BCE", event: "Born in Egypt" },
      { year: "~1390 BCE", event: "Raised in palace" },
      { year: "~1370 BCE", event: "Fled to Madyan" },
      { year: "~1350 BCE", event: "Received prophethood" },
      { year: "~1340 BCE", event: "Confronted Pharaoh" },
      { year: "~1335 BCE", event: "Exodus" }
    ],
    lesson: "Courage and trust in Allah can overcome the greatest tyrants.",
    miracle: "Parting of the Red Sea",
    type: "Messenger",
    era: "Egypt",
    xpReward: 30
  },
  {
    id: 15,
    name: "Harun",
    nameAr: "هارون",
    icon: "🌿",
    title: "The Eloquent Helper",
    desc: "Brother of Musa, known for eloquence, appointed as Musa's assistant and deputy.",
    fullStory: "Harun was appointed by Allah to support Musa due to his eloquent speech. He was a constant companion to Musa.",
    miracles: ["Eloquent speech", "Supported Musa's mission"],
    teachings: ["Support your brother in good", "Speak clearly", "Do your best to prevent evil"],
    verses: ["And We granted him out of Our mercy his brother Aaron... (19:53)"],
    lessons: ["Sibling support in faith", "Eloquence in da'wah", "Clear communication"],
    timeline: [
      { year: "~1370 BCE", event: "Born before Musa" },
      { year: "~1350 BCE", event: "Appointed as helper" },
      { year: "~1340 BCE", event: "Confronted Pharaoh" }
    ],
    lesson: "Support your brothers in faith and use your strengths to help others.",
    miracle: "Eloquent speech granted by Allah",
    type: "Prophet",
    era: "Egypt",
    xpReward: 20
  },
  {
    id: 16,
    name: "Dawud",
    nameAr: "داوود",
    icon: "🌿",
    title: "The Righteous King",
    desc: "A prophet-king who defeated Goliath, received the Psalms (Zabur), and had mountains and birds praise with him.",
    fullStory: "Prophet Dawud was a young man when he defeated the giant Goliath with a simple sling, securing victory for the Children of Israel. Known for his intense devotion, he would fast every other day and spend the night in prayer. Allah gave him a beautiful voice, and when he sang the Psalms (Zabur), the mountains and birds would join him in praise. He was also a master smith who could soften iron with his hands, creating armor to protect his soldiers. He founded a mighty kingdom that served as a model for righteous rule.",
    miracles: ["Defeating Goliath", "Iron softened for him", "Mountains and birds praising", "Beautiful voice"],
    teachings: ["Justice in judgment", "Humility despite power", "Repentance", "Balance worldly and spiritual"],
    verses: ["And We gave David the Psalms... (17:55)"],
    lessons: ["Humility in power", "Fair judgment", "Sincere repentance"],
    timeline: [
      { year: "~1040 BCE", event: "Defeated Goliath" },
      { year: "~1030 BCE", event: "Became king" },
      { year: "~1020 BCE", event: "Received Zabur" }
    ],
    lesson: "True leadership combines power with humility and justice.",
    miracle: "Iron softened in his hands like clay",
    type: "Messenger",
    era: "Israel",
    xpReward: 25
  },
  {
    id: 17,
    name: "Sulayman",
    nameAr: "سليمان",
    icon: "🌿",
    title: "The Magnificent King",
    desc: "Son of Dawud, ruled over humans, jinn, birds, and wind. Could speak to animals.",
    fullStory: "The son of Dawud, Sulayman was a prophet-king famous for his unmatched wisdom and authority. He was given power over the winds, the jinn, and the ability to understand the speech of all animals. His kingdom was unparalleled in history, featuring magnificent architecture built by jinn. Despite his wealth and power, he remained incredibly humble, realizing that everything was a gift from Allah. His journey with the Queen of Sheba (Bilqis) demonstrated his commitment to calling all nations toward the worship of the One Creator.",
    miracles: ["Speaking to animals", "Controlling wind", "Commanding jinn", "Throne transported instantly"],
    teachings: ["Gratitude for blessings", "Just leadership", "Using power wisely"],
    verses: ["And Solomon inherited David... (27:16)"],
    lessons: ["Power requires gratitude", "Leadership with justice"],
    timeline: [
      { year: "~990 BCE", event: "Born to Dawud" },
      { year: "~970 BCE", event: "Became king and prophet" },
      { year: "~960 BCE", event: "Queen of Sheba accepted Islam" }
    ],
    lesson: "With great power comes great responsibility and gratitude to Allah.",
    miracle: "Command over jinn, wind, and understanding animal speech",
    type: "Messenger",
    era: "Israel",
    xpReward: 25
  },
  {
    id: 18,
    name: "Ilyas",
    nameAr: "إلياس",
    icon: "🌿",
    title: "The Zealous Reformer",
    desc: "Sent to the people of Baalbek who worshipped the idol Ba'al.",
    fullStory: "Sent to Baalbek, Ilyas challenged the worshippers of Ba'al to return to the worship of the one true God.",
    miracles: ["Challenged idol worship", "Zealous preaching", "Raised to heaven"],
    teachings: ["Zeal for truth", "Challenge false beliefs", "Pure monotheism"],
    verses: ["And indeed, Elias was from among the messengers... (37:123)"],
    lessons: ["Zeal for Allah's religion", "Challenge false gods", "Pure tawheed"],
    timeline: [
      { year: "~860 BCE", event: "Sent to Baalbek" },
      { year: "~855 BCE", event: "Challenged Ba'al worship" }
    ],
    lesson: "Have zeal for truth and courage to challenge false beliefs.",
    miracle: "Raised to heaven",
    type: "Messenger",
    era: "Baalbek",
    xpReward: 20
  },
  {
    id: 19,
    name: "Al-Yasa",
    nameAr: "اليسع",
    icon: "🌿",
    title: "The Faithful Successor",
    desc: "Successor of Ilyas, continued his mission among the Israelites.",
    fullStory: "Al-Yasa continued the work of Ilyas, performing many miracles and guiding the Israelites back to the right path.",
    miracles: ["Healing the sick", "Purifying water"],
    teachings: ["Continue good work", "Faithful service", "Persistent da'wah"],
    verses: ["And [We guided] Elisha... (6:86)"],
    lessons: ["Carry the torch of faith", "Be a faithful successor"],
    timeline: [
      { year: "~860 BCE", event: "Chosen as successor" },
      { year: "~850 BCE", event: "Continued mission" }
    ],
    lesson: "Continue the work of the righteous after them.",
    miracle: "Healing the sick by Allah's permission",
    type: "Prophet",
    era: "Israel",
    xpReward: 20
  },
  {
    id: 20,
    name: "Dhul-Kifl",
    nameAr: "ذو الكفل",
    icon: "🌿",
    title: "The Guarantor",
    desc: "Known for his pledge to judge fairly, fast by day, pray by night, and never get angry.",
    fullStory: "He made a pledge to maintain a strict spiritual discipline and judge with absolute fairness, which he fulfilled perfectly.",
    miracles: ["Fulfilled all his pledges", "Controlled his anger perfectly"],
    teachings: ["Keep your promises", "Control anger", "Be fair in judgment"],
    verses: ["And remember Dhul-Kifl... (21:85)"],
    lessons: ["Promise-keeping", "Anger management", "Self-discipline"],
    timeline: [
      { year: "~830 BCE", event: "Made pledges" },
      { year: "~820 BCE", event: "Fulfilled all pledges" }
    ],
    lesson: "Keep your promises and control your anger.",
    miracle: "Perfectly fulfilled all his spiritual pledges",
    type: "Prophet",
    era: "Unknown",
    xpReward: 15
  },
  {
    id: 21,
    name: "Yunus",
    nameAr: "يونس",
    icon: "🌿",
    title: "Dhun-Nun (Man of the Whale)",
    desc: "Swallowed by a whale, saved through repentance and the dua of distress.",
    fullStory: "Prophet Yunus was sent to the city of Nineveh. When his people initially rejected him, he left in anger without permission from Allah. While at sea, he was thrown overboard and swallowed by a massive whale. In the darkness of the whale's belly, he called out the famous words: 'There is no god but You; Glory be to You! Indeed, I was among the wrongdoers.' Allah accepted his sincere repentance, and he was safely released. He returned to Nineveh to find that his entire people had accepted Islam—the only nation to avoid punishment through mass repentance.",
    miracles: ["Surviving inside whale", "Repentance accepted"],
    teachings: ["Never lose hope", "Repentance is powerful", "The dua of Yunus"],
    verses: ["And [mention] the man of the fish... (21:87)"],
    lessons: ["Never despair of Allah", "Repent sincerely"],
    timeline: [
      { year: "~780 BCE", event: "Sent to Nineveh" },
      { year: "~777 BCE", event: "Swallowed by whale" },
      { year: "~776 BCE", event: "Repented and released" }
    ],
    lesson: "Never despair of Allah's mercy. Sincere repentance is always accepted.",
    miracle: "Survived inside a whale for several days",
    type: "Messenger",
    era: "Nineveh",
    xpReward: 25
  },
  {
    id: 22,
    name: "Zakariya",
    nameAr: "زكريا",
    icon: "🌿",
    title: "The Guardian of Maryam",
    desc: "Guardian of Maryam, prayed for a son in old age, blessed with Yahya (John).",
    fullStory: "An elderly man who never lost hope for a child, Zakariya was blessed with Yahya after his sincere prayers.",
    miracles: ["Out-of-season fruits", "Silence as sign", "Son in old age"],
    teachings: ["Never give up on dua", "Care for orphans", "Trust Allah's timing"],
    verses: ["At that, Zechariah called upon his Lord... (3:38)"],
    lessons: ["Dua is never wasted", "Prayer brings miracles"],
    timeline: [
      { year: "~5 BCE", event: "Guardian of Maryam" },
      { year: "~3 BCE", event: "Yahya born" }
    ],
    lesson: "Never give up on dua, no matter how impossible it seems.",
    miracle: "Son born at an extremely old age",
    type: "Prophet",
    era: "Jerusalem",
    xpReward: 20
  },
  {
    id: 23,
    name: "Yahya",
    nameAr: "يحيى",
    icon: "🌿",
    title: "The Pure & Devoted",
    desc: "Son of Zakariyya, known for wisdom, purity, and devotion from childhood.",
    fullStory: "Yahya was given wisdom as a child and lived a life of extreme purity and devotion, confirming the message of Isa.",
    miracles: ["Wisdom in childhood", "Extreme piety"],
    teachings: ["Purity of heart", "Wisdom from youth", "Ascetic lifestyle"],
    verses: ["And We gave him wisdom [while yet] a boy. (19:12)"],
    lessons: ["Start righteousness young", "Devotion to Allah"],
    timeline: [
      { year: "~3 BCE", event: "Born to Zakariyya" },
      { year: "~15 CE", event: "Became prophet" }
    ],
    lesson: "Start righteousness from a young age and remain devoted to Allah.",
    miracle: "Given wisdom as a child",
    type: "Prophet",
    era: "Jerusalem",
    xpReward: 20
  },
  {
    id: 24,
    name: "Isa",
    nameAr: "عيسى",
    icon: "🌿",
    title: "Al-Masih (The Messiah)",
    desc: "Born miraculously to Maryam, performed great miracles, raised to heaven, will return.",
    fullStory: "Born miraculously to Maryam (AS) without a father, Isa spoke from the cradle to prove his mother's innocence and brought the Gospel (Injil) to the Children of Israel. He healed the blind, cured lepers, and raised the dead by Allah's permission. He was a simple, wandering prophet who focused on the heart's sincerity. When his enemies conspired against him, Allah raised him to heaven alive, where he remains until his destined return to Earth to unite believers and establish justice.",
    miracles: ["Born without father", "Speaking in cradle", "Healing blind and lepers", "Raising dead"],
    teachings: ["Worship Allah alone", "Humility", "Compassion", "Forgiveness"],
    verses: ["And [make him] a messenger to the Children of Israel... (3:49)"],
    lessons: ["Miracles are from Allah", "Compassion for all"],
    timeline: [
      { year: "~4 BCE", event: "Birth" },
      { year: "~27 CE", event: "Received prophethood" },
      { year: "~30 CE", event: "Raised to heaven" }
    ],
    lesson: "True miracles come from Allah, and compassion is a sign of true faith.",
    miracle: "Born without a father, speaking in the cradle, healing the sick",
    type: "Messenger",
    era: "Jerusalem",
    xpReward: 30
  },
  {
    id: 25,
    name: "Muhammad",
    nameAr: "محمد",
    icon: "🌿",
    title: "Khatam an-Nabiyyin (Seal of Prophets)",
    desc: "The final messenger who brought the Quran and completed the message of Islam for all humanity.",
    fullStory: "Born in the year of the Elephant in Mecca, Muhammad ﷺ was orphaned at a young age and became known as Al-Amin (The Trustworthy). At age 40, he received the first revelation in the Cave of Hira. For 23 years, he preached the message of pure monotheism, facing extreme persecution but responding with mercy. His migration (Hijrah) to Medina marked the birth of a new society based on justice. His legacy is the Quran and his Sunnah, which continue to guide billions. He is the 'Mercy to the Worlds' whose character was the Quran itself.",
    miracles: ["The Quran", "Splitting of the moon", "Isra and Mi'raj", "Water from fingers"],
    teachings: ["Complete monotheism", "Mercy to all creation", "Justice and equality", "Good character"],
    verses: ["And We have not sent you, [O Muhammad], except as a mercy to the worlds. (21:107)"],
    lessons: ["Follow the perfect example", "Mercy to all", "Stand for justice"],
    timeline: [
      { year: "570 CE", event: "Born in Mecca" },
      { year: "610 CE", event: "First revelation" },
      { year: "622 CE", event: "Hijrah" },
      { year: "632 CE", event: "Passing" }
    ],
    lesson: "Follow the example of the Prophet ﷺ in mercy, justice, and character.",
    miracle: "The Holy Quran, splitting of the moon, Isra and Mi'raj",
    type: "Messenger",
    era: "Arabia",
    xpReward: 50
  }
];

// ==================== PRAYERS DATA ====================
const PRAYERS = [
  {
    id: 1,
    name: "Fajr",
    nameAr: "الفجر",
    time: "Before Dawn",
    icon: <Sunrise className="text-amber-500" />,
    rakat: 2,
    description: "The dawn prayer that brings light to the soul and sets the spiritual tone for the day.",
    benefits: ["Protection throughout the day", "Blessings in sustenance", "Light on the Day of Judgment", "Witnessed by angels of night and day"],
    recommendedSurahs: ["Al-Fatiha", "Al-Kafirun", "Al-Ikhlas", "Al-Falaq", "An-Nas"],
    hadith: "Whoever prays Fajr is under the protection of Allah. — Sahih Muslim",
    spiritualSignificance: "The angels of the night and the angels of the day gather for Fajr prayer."
  },
  {
    id: 2,
    name: "Dhuhr",
    nameAr: "الظهر",
    time: "After Noon",
    icon: <Sun className="text-orange-500" />,
    rakat: 4,
    description: "The midday prayer that provides a spiritual break amidst daily worldly activities.",
    benefits: ["Forgiveness of sins", "Increase in provision", "Balance between worldly and spiritual life"],
    recommendedSurahs: ["Al-Fatiha", "Al-Asr", "An-Nasr", "Al-Ikhlas"],
    hadith: "The gates of heaven are opened during Dhuhr, and good deeds are raised. — At-Tirmidhi",
    spiritualSignificance: "A moment to pause and realign with Allah amidst daily hustle."
  },
  {
    id: 3,
    name: "Asr",
    nameAr: "العصر",
    time: "Late Afternoon",
    icon: <Cloud className="text-blue-400" />,
    rakat: 4,
    description: "The afternoon prayer that serves as a witness to the day's deeds.",
    benefits: ["Protection from losing one's purpose", "Strengthened faith", "Reminder of life's brevity"],
    recommendedSurahs: ["Al-Fatiha", "Al-Asr", "Al-Fatiha", "Al-Ikhlas"],
    hadith: "Whoever misses Asr prayer, it is as if he lost his family and wealth. — Sahih Bukhari",
    spiritualSignificance: "Allah swears by the time of Asr in Surah Al-Asr."
  },
  {
    id: 4,
    name: "Maghrib",
    nameAr: "المغرب",
    time: "After Sunset",
    icon: <Moon className="text-indigo-500" />,
    rakat: 3,
    description: "The evening prayer that marks the end of the day and beginning of night's reflection.",
    benefits: ["Protection from Shaytan", "Sins forgiven between Maghrib and Isha", "Blessings in the night"],
    recommendedSurahs: ["Al-Fatiha", "Al-Ikhlas", "Al-Falaq", "An-Nas"],
    hadith: "My ummah will remain upon the fitrah as long as they hasten to break the fast and delay the pre-dawn meal, and as long as they pray Maghrib when the sun sets. — Ahmad",
    spiritualSignificance: "The time when Allah accepts duas and forgives sins."
  },
  {
    id: 5,
    name: "Isha",
    nameAr: "العشاء",
    time: "Night",
    icon: <Moon className="text-indigo-700" />,
    rakat: 4,
    description: "The night prayer that concludes the daily prayers and prepares the soul for rest.",
    benefits: ["Reward of praying half the night", "Protection until Fajr", "Spiritual cleansing"],
    recommendedSurahs: ["Al-Fatiha", "Al-Mulk", "As-Sajdah", "Al-Ikhlas"],
    hadith: "If people knew the reward in Isha and Fajr prayers, they would come to them even if crawling. — Sahih Bukhari",
    spiritualSignificance: "Praying Isha in congregation is like praying half the night."
  }
];

// ==================== ISLAMIC EVENTS DATA ====================
const ISLAMIC_EVENTS = [
  {
    id: 1,
    name: "Ramadan",
    nameAr: "رمضان",
    icon: <Moon className="text-emerald-500" />,
    month: "9th Month of Islamic Calendar",
    duration: "29-30 Days",
    description: "The month of Quran, fasting, and spiritual renewal. The doors of Paradise are opened, and the doors of Hell are closed.",
    practices: ["Fasting from dawn to sunset", "Increased Quran recitation", "Night prayers (Taraweeh)", "Charity and Zakat", "Seeking Laylatul Qadr"],
    virtues: ["Sins forgiven", "Doors of Paradise opened", "Duas accepted", "Night of Decree better than 1000 months"],
    hadith: "When Ramadan begins, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained. — Sahih Bukhari",
    xpReward: 50
  },
  {
    id: 2,
    name: "Eid al-Fitr",
    nameAr: "عيد الفطر",
    icon: <Gift className="text-amber-500" />,
    month: "1st of Shawwal",
    duration: "1 Day",
    description: "The Festival of Breaking Fast, celebrating the completion of Ramadan with gratitude and joy.",
    practices: ["Eid prayer", "Zakat al-Fitr", "Wearing best clothes", "Visiting family", "Exchanging gifts"],
    virtues: ["Day of forgiveness", "Celebration of obedience", "Community bonding", "Gratitude to Allah"],
    hadith: "The day of Eid al-Fitr is a day of joy, a day of eating and drinking, and a day of remembering Allah. — Ahmad",
    xpReward: 30
  },
  {
    id: 3,
    name: "Eid al-Adha",
    nameAr: "عيد الأضحى",
    icon: <Target className="text-amber-600" />,
    month: "10th-13th of Dhul-Hijjah",
    duration: "4 Days",
    description: "The Festival of Sacrifice, commemorating Prophet Ibrahim's willingness to sacrifice his son.",
    practices: ["Eid prayer", "Animal sacrifice (Qurbani)", "Distributing meat to poor", "Visiting family", "Saying Takbeer"],
    virtues: ["Remembrance of Ibrahim's sacrifice", "Charity and sharing", "Pilgrimage connections"],
    hadith: "The greatest day in the sight of Allah is the Day of Sacrifice. — Abu Dawud",
    xpReward: 40
  },
  {
    id: 4,
    name: "Day of Arafah",
    nameAr: "يوم عرفة",
    icon: <Compass className="text-purple-500" />,
    month: "9th of Dhul-Hijjah",
    duration: "1 Day",
    description: "The most significant day of Hajj, when pilgrims stand on Mount Arafah. Fasting expiates sins of two years.",
    practices: ["Fasting (for non-pilgrims)", "Making abundant dua", "Seeking forgiveness", "Dhikr and Takbeer"],
    virtues: ["Best day in Allah's sight", "Sins of two years forgiven", "Duas accepted", "Satan humiliated"],
    hadith: "There is no day on which Allah frees more people from the Fire than the Day of Arafah. — Sahih Muslim",
    xpReward: 45
  },
  {
    id: 5,
    name: "Ashura",
    nameAr: "عاشوراء",
    icon: <Droplets className="text-blue-500" />,
    month: "10th of Muharram",
    duration: "1 Day",
    description: "The day Musa (Moses) and the Israelites were saved from Pharaoh. Fasting expiates sins of the previous year.",
    practices: ["Fasting (9th and 10th or 10th and 11th)", "Charity to family", "Remembrance of Allah"],
    virtues: ["Sins of past year forgiven", "Following prophetic tradition", "Day of salvation"],
    hadith: "Fasting the day of Ashura, I hope Allah will expiate the sins of the previous year. — Sahih Muslim",
    xpReward: 35
  },
  {
    id: 6,
    name: "Islamic New Year",
    nameAr: "رأس السنة الهجرية",
    icon: <Calendar className="text-emerald-600" />,
    month: "1st of Muharram",
    duration: "1 Day",
    description: "Marks the beginning of the Islamic lunar calendar, commemorating the Hijrah of Prophet Muhammad ﷺ.",
    practices: ["Reflecting on Hijrah", "Making resolutions", "Increased good deeds", "Studying Seerah"],
    virtues: ["New beginnings", "Sacrifice for faith", "Establishing Islamic community"],
    hadith: "The Hijrah is a migration from evil to good, from falsehood to truth. — Prophet Muhammad ﷺ",
    xpReward: 20
  },
  {
    id: 7,
    name: "Laylatul Qadr",
    nameAr: "ليلة القدر",
    icon: <Star className="text-yellow-500" />,
    month: "Last 10 nights of Ramadan (odd nights)",
    duration: "1 Night",
    description: "The Night of Decree, better than 1000 months. The Quran was revealed this night.",
    practices: ["Night prayer (Qiyam)", "Making abundant dua", "Seeking forgiveness", "Reading Quran"],
    virtues: ["Worship better than 1000 months", "Sins forgiven", "Angels descend", "Destiny decreed"],
    hadith: "Whoever prays on Laylatul Qadr with faith and hope for reward, his past sins will be forgiven. — Sahih Bukhari",
    xpReward: 100
  },
  {
    id: 8,
    name: "Mawlid al-Nabi",
    nameAr: "المولد النبوي",
    icon: <Heart className="text-emerald-700" />,
    month: "12th of Rabi' al-Awwal",
    duration: "1 Day",
    description: "The birth anniversary of Prophet Muhammad ﷺ, celebrated with love and remembrance.",
    practices: ["Reading Seerah", "Sending Salawat", "Giving charity", "Gatherings of Dhikr"],
    virtues: ["Expressing love for Prophet", "Learning about his life", "Inspiring to follow Sunnah"],
    hadith: "None of you truly believes until I am more beloved to him than his father, his child, and all people. — Sahih Bukhari",
    xpReward: 30
  },
  {
    id: 9,
    name: "Hajj",
    nameAr: "الحج",
    icon: <Compass className="text-teal-600" />,
    month: "8th-13th of Dhul-Hijjah",
    duration: "5-6 Days",
    description: "The pilgrimage to Mecca, one of the Five Pillars of Islam, obligatory once in a lifetime.",
    practices: ["Ihram", "Tawaf", "Sa'ee", "Standing at Arafah", "Stoning the Jamarat", "Sacrifice"],
    virtues: ["Sins forgiven like a newborn", "Paradise guaranteed", "Unity of Ummah"],
    hadith: "An accepted Hajj has no reward but Paradise. — Sahih Bukhari",
    xpReward: 100
  },
  {
    id: 10,
    name: "First 10 Days of Dhul-Hijjah",
    nameAr: "العشر الأوائل من ذي الحجة",
    icon: <CalendarDays className="text-orange-500" />,
    month: "1st-10th of Dhul-Hijjah",
    duration: "10 Days",
    description: "The best days of the year for good deeds, encompassing Hajj, Arafah, and Eid al-Adha.",
    practices: ["Increased Dhikr", "Fasting (especially 9th)", "Charity", "Repentance", "Sacrifice"],
    virtues: ["Best days in Allah's sight", "Deeds most beloved to Allah", "Takbeer and Tahleel"],
    hadith: "There are no days in which righteous deeds are more beloved to Allah than these ten days. — Sahih Bukhari",
    xpReward: 60
  }
];

// ==================== SPIRITUAL DNA TRAITS ====================
const BASE_TRAITS = [
  { name: 'Grateful', icon: '🙏', value: 85, color: 'bg-emerald-500' },
  { name: 'Patient', icon: '🌿', value: 60, color: 'bg-teal-500' },
  { name: 'Hopeful', icon: '🌅', value: 75, color: 'bg-amber-500' },
  { name: 'Mindful', icon: '📿', value: 65, color: 'bg-cyan-500' },
  { name: 'Compassionate', icon: '🤗', value: 70, color: 'bg-rose-500' },
  { name: 'Trusting', icon: '🤝', value: 80, color: 'bg-indigo-500' }
];

// ==================== INTERESTS DATA ====================
const INTERESTS = [
  { 
    title: 'Spiritual Archetype', 
    value: 'The Silent Seeker', 
    desc: 'You process wisdom in quiet moments. Your strength lies in observation and internal reflection.',
    icon: <Sparkles className="text-amber-500" />,
    color: 'bg-amber-50 text-amber-700 border-amber-100'
  },
  { 
    title: 'Peak Alignment', 
    value: 'Fajr Resonance', 
    desc: 'Your spiritual frequency peaks during the dawn hours. Most reflections are recorded then.',
    icon: <Sunrise className="text-emerald-500" />,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  },
  { 
    title: 'Dominant Theme', 
    value: 'Divine Mercy', 
    desc: 'You are naturally drawn to verses describing Rahma. It forms the majority of your bookmarked content.',
    icon: <Heart className="text-rose-500" />,
    color: 'bg-rose-50 text-rose-700 border-rose-100'
  },
  { 
    title: 'Quranic Resonance', 
    value: 'Surah Al-Waqi\'a', 
    desc: 'You have a deep connection with this Surah. Frequent interaction detected in your reading patterns.',
    icon: <Star className="text-cyan-500" />,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-100'
  },
  { 
    title: 'Growth Pattern', 
    value: 'Gratitude Surge', 
    desc: 'A notable increase in gratitude markers observed recently. Spiritual expansion in progress.',
    icon: <TrendingUp className="text-indigo-500" />,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  }
];

// ==================== CONSTANTS ====================
const XP_PER_LEVEL = 100;
const MAX_LEVEL = 50;

// ==================== HELPERS ====================
const calculateLevel = (xp) => Math.min(MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL) + 1);
const calculateXPProgress = (xp) => (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
const getLevelTitle = (level) => {
  if (level >= 50) return 'Wali';
  if (level >= 40) return 'Arif';
  if (level >= 30) return 'Salik';
  if (level >= 20) return 'Murid';
  if (level >= 10) return 'Talib';
  if (level >= 5) return 'Seeker';
  return 'Beginner';
};

// ==================== SUB-COMPONENTS ====================
const ProphetCard = ({ prophet, onClick, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay: index * 0.05 }}
    onClick={() => onClick(prophet)} 
    className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer relative overflow-hidden"
  >
    <div className="relative z-10 flex items-center gap-6 text-left">
      <div className="w-20 h-20 rounded-2xl bg-emerald-950 text-white flex items-center justify-center text-3xl shadow-lg group-hover:rotate-12 transition-all duration-500 border-2 border-emerald-800 shrink-0">
        {prophet.icon}
      </div>
      <div className="space-y-1 min-w-0">
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{prophet.title}</span>
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors uppercase italic tracking-tight">Prophet {prophet.name}</h3>
        <p className="text-sm text-gray-400 font-mono">{prophet.nameAr}</p>
      </div>
    </div>
    <p className="text-gray-500 text-base mt-6 leading-relaxed font-serif italic line-clamp-2">{prophet.desc}</p>
    <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
      <span>View Archive</span> <ChevronRight size={14} />
    </div>
  </motion.div>
);

// Prophet Modal Component
const ProphetModal = ({ prophet, onClose, onIntegrate }) => {
  const [activeTab, setActiveTab] = useState('story');
  const [isIntegrating, setIsIntegrating] = useState(false);

  if (!prophet) return null;

  const tabs = [
    { id: 'story', label: 'Story', icon: BookOpen, color: 'emerald' },
    { id: 'miracles', label: 'Miracles', icon: Star, color: 'amber' },
    { id: 'teachings', label: 'Teachings', icon: Compass, color: 'blue' },
    { id: 'timeline', label: 'Timeline', icon: Clock, color: 'purple' }
  ];

  const getTabColor = (tabColor) => {
    const colors = {
      emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      amber: 'border-amber-200 bg-amber-50 text-amber-700',
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700'
    };
    return colors[tabColor] || colors.emerald;
  };

  const handleIntegrate = async () => {
    setIsIntegrating(true);
    await onIntegrate(prophet);
    setIsIntegrating(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xl" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 30 }} 
        className="bg-white max-w-4xl w-full rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="relative bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-8">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all z-10">
            <X size={20} />
          </button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-6xl border-2 border-white/20 shadow-xl">
              {prophet.icon}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-[11px] font-black uppercase tracking-wider">
                  {prophet.type}
                </span>
                <span className="px-3 py-1 bg-emerald-500/30 rounded-full text-[11px] font-black uppercase tracking-wider">
                  +{prophet.xpReward} XP
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                Prophet {prophet.name}
              </h2>
              <p className="text-3xl font-arabic text-emerald-200 mt-1">{prophet.nameAr}</p>
              <p className="text-base text-emerald-200/80 mt-2">{prophet.title}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-100 sticky top-0 z-10 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-[11px] font-black uppercase tracking-wider whitespace-nowrap ${
                activeTab === tab.id
                  ? `bg-white shadow-md border ${getTabColor(tab.color)}`
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {activeTab === 'story' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                  <BookOpen size={16} /> Full Story
                </h3>
                <div className="bg-emerald-50/30 rounded-2xl p-6 border border-emerald-100">
                  <p className="text-gray-700 text-base leading-relaxed">
                    {prophet.fullStory || prophet.desc}
                  </p>
                </div>
              </div>

              {prophet.verses && prophet.verses.length > 0 && (
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
                    <BookOpen size={16} /> Quranic References
                  </h3>
                  <div className="space-y-2">
                    {prophet.verses.map((verse, idx) => (
                      <div key={idx} className="bg-amber-50/30 rounded-xl p-4 border border-amber-100">
                        <p className="text-amber-800 text-base italic">"{verse}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prophet.lessons && prophet.lessons.length > 0 && (
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-3">Key Lessons</h3>
                  <div className="flex flex-wrap gap-2">
                    {prophet.lessons.map((lesson, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-purple-50 rounded-full text-sm text-purple-700 border border-purple-100 font-medium">
                        {lesson}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'miracles' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 mb-4 flex items-center gap-2">
                <Star size={16} /> Divine Miracles
              </h3>
              <div className="grid gap-3">
                {prophet.miracles?.map((miracle, idx) => (
                  <div key={idx} className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <Star size={16} />
                    </div>
                    <p className="text-amber-900 text-base font-medium flex-1">{miracle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'teachings' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2">
                <Compass size={16} /> Wisdom Teachings
              </h3>
              <div className="grid gap-3">
                {prophet.teachings?.map((teaching, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      💡
                    </div>
                    <p className="text-blue-900 text-base font-medium flex-1">{teaching}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-purple-600 mb-4 flex items-center gap-2">
                <Clock size={16} /> Life Timeline
              </h3>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-200">
                {prophet.timeline?.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-purple-500" />
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                      <span className="text-sm font-bold text-purple-600">{event.year}</span>
                      <p className="text-gray-700 text-base mt-1">{event.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <Zap size={18} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1">Soul Integration Lesson</h4>
                <p className="text-base font-bold text-emerald-900 leading-relaxed">{prophet.lesson}</p>
                <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                  <Sparkles size={14} /> +{prophet.xpReward} XP upon integration
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleIntegrate}
            disabled={isIntegrating}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-wider text-base hover:bg-emerald-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isIntegrating ? (
              <><RefreshCw className="animate-spin" size={18} /> Integrating Wisdom...</>
            ) : (
              <>✨ Integrate Wisdom (+{prophet.xpReward} XP) ✨</>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Peace and blessings of Allah be upon Prophet {prophet.name}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// Prayer Modal Component
const PrayerModal = ({ prayer, onClose }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xl" 
      onClick={onClose} 
    />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 30 }} 
      animate={{ scale: 1, opacity: 1, y: 0 }} 
      exit={{ scale: 0.9, opacity: 0, y: 30 }} 
      className="bg-white max-w-2xl w-full rounded-[2rem] shadow-2xl relative overflow-hidden"
    >
      <div className={`relative p-8 text-white ${prayer.name === 'Fajr' ? 'bg-gradient-to-br from-amber-600 to-orange-700' : 
        prayer.name === 'Dhuhr' ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
        prayer.name === 'Asr' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
        prayer.name === 'Maghrib' ? 'bg-gradient-to-br from-indigo-600 to-purple-700' :
        'bg-gradient-to-br from-indigo-800 to-purple-900'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
          <X size={20} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
            {prayer.icon}
          </div>
          <div>
            <h2 className="text-4xl font-black">{prayer.name}</h2>
            <p className="text-3xl font-arabic opacity-90">{prayer.nameAr}</p>
            <p className="text-base opacity-80 mt-1">{prayer.time} • {prayer.rakat} Rak'at</p>
          </div>
        </div>
      </div>
      
      <div className="p-8 space-y-6">
        <p className="text-gray-600 text-base leading-relaxed">{prayer.description}</p>
        
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-3">Spiritual Benefits</h3>
          <div className="flex flex-wrap gap-2">
            {prayer.benefits.map((benefit, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-emerald-50 rounded-full text-sm text-emerald-700">
                {benefit}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-3">Recommended Surahs</h3>
          <div className="flex flex-wrap gap-2">
            {prayer.recommendedSurahs.map((surah, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-amber-50 rounded-full text-sm text-amber-700">
                {surah}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-2">Prophetic Saying</h3>
          <p className="text-gray-600 text-base italic">"{prayer.hadith}"</p>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-purple-600 mb-2">Spiritual Significance</h3>
          <p className="text-purple-800 text-base">{prayer.spiritualSignificance}</p>
        </div>
      </div>
    </motion.div>
  </div>
);

// Event Modal Component
const EventModal = ({ event, onClose, onIntegrate, isIntegrating }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xl" 
      onClick={onClose} 
    />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 30 }} 
      animate={{ scale: 1, opacity: 1, y: 0 }} 
      exit={{ scale: 0.9, opacity: 0, y: 30 }} 
      className="bg-white max-w-2xl w-full rounded-[2rem] shadow-2xl relative overflow-hidden"
    >
      <div className="relative bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-8">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
          <X size={20} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
            {event.icon}
          </div>
          <div>
            <h2 className="text-4xl font-black">{event.name}</h2>
            <p className="text-3xl font-arabic opacity-90">{event.nameAr}</p>
            <p className="text-base opacity-80 mt-1">{event.month}</p>
          </div>
        </div>
      </div>
      
      <div className="p-8 space-y-6">
        <p className="text-gray-600 text-base leading-relaxed">{event.description}</p>
        
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-3">Practices</h3>
          <div className="flex flex-wrap gap-2">
            {event.practices.map((practice, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-emerald-50 rounded-full text-sm text-emerald-700">
                {practice}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 mb-3">Virtues</h3>
          <div className="flex flex-wrap gap-2">
            {event.virtues.map((virtue, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-amber-50 rounded-full text-sm text-amber-700">
                {virtue}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-2">Prophetic Saying</h3>
          <p className="text-gray-600 text-base italic">"{event.hadith}"</p>
        </div>
        
        <button 
          onClick={() => onIntegrate(event)}
          disabled={isIntegrating}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-wider text-base hover:bg-emerald-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isIntegrating ? (
            <><RefreshCw className="animate-spin" size={18} /> Participating...</>
          ) : (
            <>✨ Participate & Earn +{event.xpReward} XP ✨</>
          )}
        </button>
      </div>
    </motion.div>
  </div>
);

// ==================== MAIN COMPONENT ====================
export default function SpiritualDNA() {
  const { 
    userData, 
    addProphetIntegrateXP, 
    addTraitsRefreshXP, 
    xp, 
    level, 
    levelTitle, 
    xpProgress,
    xpToNextLevel,
    patienceLevel 
  } = useUser();
  
  const [activeSection, setActiveSection] = useState('dna');
  const [loading, setLoading] = useState(false);
  const [selectedProphet, setSelectedProphet] = useState(null);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [integratingEvent, setIntegratingEvent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEra, setSelectedEra] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [levelUpMessage, setLevelUpMessage] = useState(null);

  const allProphets = PROPHETS;

  // Get unique eras and types for filters
  const eras = ['All', ...new Set(allProphets.map(p => p.era).filter(Boolean))];
  const types = ['All', ...new Set(allProphets.map(p => p.type).filter(Boolean))];

  // Filter prophets
  const filteredProphets = allProphets.filter(prophet => {
    const matchesSearch = searchTerm === '' || 
      prophet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prophet.nameAr.includes(searchTerm) ||
      (prophet.title && prophet.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEra = selectedEra === 'All' || prophet.era === selectedEra;
    const matchesType = selectedType === 'All' || prophet.type === selectedType;
    return matchesSearch && matchesEra && matchesType;
  });

  // Calculate traits with dynamic patience value from userData
  const traits = BASE_TRAITS.map(trait => {
    if (trait.name === 'Patient') {
      return { ...trait, value: Math.min(100, (patienceLevel || 1) * 10 + 30) };
    }
    return trait;
  });

  const handleIntegrateWisdom = async (prophet) => {
    try {
      const result = await addProphetIntegrateXP();
      
      if (result?.leveledUp) {
        setLevelUpMessage({
          oldLevel: result.level - 1,
          newLevel: result.newLevel,
          title: result.newTitle
        });
        toast.success(
          `🎉 LEVEL UP! You've reached ${result.newTitle} Level ${result.newLevel}! 🎉`,
          { 
            icon: '🏆', 
            duration: 5000,
            style: {
              borderRadius: '2rem',
              background: 'linear-gradient(135deg, #064e3b, #047857)',
              color: '#d1fae5',
              fontWeight: 'bold'
            }
          }
        );
        
        setTimeout(() => setLevelUpMessage(null), 5000);
      } else {
        toast.success(`✨ Wisdom of Prophet ${prophet.name} integrated! +${prophet.xpReward} XP`, {
          icon: '🧬',
          style: {
            borderRadius: '2rem',
            background: '#064e3b',
            color: '#d1fae5',
            fontWeight: 'bold'
          }
        });
      }
      setSelectedProphet(null);
    } catch (error) {
      toast.error('Failed to integrate wisdom. Please try again.');
    }
  };

  const handleIntegrateEvent = async (event) => {
    setIntegratingEvent(event.id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`✨ You've participated in ${event.name}! +${event.xpReward} XP ✨`, {
      icon: '🕌',
      style: {
        borderRadius: '2rem',
        background: '#064e3b',
        color: '#d1fae5',
        fontWeight: 'bold'
      }
    });
    setSelectedEvent(null);
    setIntegratingEvent(null);
  };

  const handleRefreshTraits = async () => {
    try {
      const result = await addTraitsRefreshXP();
      
      if (result?.leveledUp) {
        setLevelUpMessage({
          oldLevel: result.level - 1,
          newLevel: result.newLevel,
          title: result.newTitle
        });
        toast.success(
          `🎉 LEVEL UP! You've reached ${result.newTitle} Level ${result.newLevel}! 🎉`,
          { 
            icon: '🏆', 
            duration: 5000,
            style: {
              borderRadius: '2rem',
              background: 'linear-gradient(135deg, #064e3b, #047857)',
              color: '#d1fae5',
              fontWeight: 'bold'
            }
          }
        );
        setTimeout(() => setLevelUpMessage(null), 5000);
      } else {
        toast.success('🔄 Spiritual traits refreshed! +5 XP', {
          icon: '✨',
          style: {
            borderRadius: '2rem',
            background: '#064e3b',
            color: '#d1fae5',
            fontWeight: 'bold'
          }
        });
      }
    } catch (error) {
      toast.error('Failed to refresh traits.');
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <RefreshCw className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4">
      {/* Level Up Notification */}
      <AnimatePresence>
        {levelUpMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 text-base"
          >
            <Trophy className="text-yellow-300" size={24} />
            <span className="font-bold">LEVEL UP!</span>
            <span>{levelUpMessage.oldLevel} → {levelUpMessage.newLevel}</span>
            <span className="text-emerald-200">{levelUpMessage.title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="text-center py-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] shadow-sm border border-emerald-100 mb-8"
        >
          <Activity size={14} /> Spiritual Profile Matrix
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-4">
          SPIRITUAL<span className="text-emerald-500 font-serif italic ml-3">DNA</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-xl mx-auto font-light tracking-tight mb-6">
          A multidimensional map of your soul's resonance and spiritual evolution.
        </p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3 rounded-full border border-emerald-100 shadow-sm"
        >
          <Award className="text-emerald-600" size={18} />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">
            Level {level} • {levelTitle}
          </span>
          <span className="text-sm text-gray-400">{xp} XP</span>
        </motion.div>
      </section>

      {/* Level Progress Bar */}
      <motion.div 
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"
      >
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${xpProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
        />
      </motion.div>
      <div className="text-center">
        <p className="text-sm text-gray-400">{xpToNextLevel} XP to next level</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center p-1.5 bg-gray-50 border border-gray-100 rounded-full w-full max-w-3xl mx-auto shadow-sm mb-12 gap-1">
        <button 
          onClick={() => setActiveSection('dna')}
          className={`flex-1 px-4 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'dna' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-400 hover:text-emerald-500'}`}
        >
          Soul Blueprint
        </button>
        <button 
          onClick={() => setActiveSection('prophets')}
          className={`flex-1 px-4 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'prophets' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-400 hover:text-emerald-500'}`}
        >
          Prophets
        </button>
        <button 
          onClick={() => setActiveSection('prayers')}
          className={`flex-1 px-4 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'prayers' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-400 hover:text-emerald-500'}`}
        >
          Prayers
        </button>
        <button 
          onClick={() => setActiveSection('events')}
          className={`flex-1 px-4 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'events' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-400 hover:text-emerald-500'}`}
        >
          Events
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* DNA Section */}
        {activeSection === 'dna' && (
          <motion.div 
            key="dna" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center group transition-all">
                <div className="relative w-56 h-56 mb-8 group-hover:scale-105 transition-transform duration-700">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="100" fill="none" stroke="#f8fafc" strokeWidth="20" />
                    <circle 
                      cx="112" cy="112" r="100" 
                      fill="none" 
                      stroke="url(#spiritual-gradient)" 
                      strokeWidth="20" 
                      strokeDasharray="628" 
                      strokeDashoffset={628 * (1 - xpProgress / 100)} 
                      strokeLinecap="round" 
                    />
                    <defs>
                      <linearGradient id="spiritual-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter">{Math.round(xpProgress)}%</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2">Level Progress</span>
                    <span className="text-sm text-gray-400 mt-1">{xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-gray-900 uppercase italic">{levelTitle} Level {level}</h3>
                  <p className="text-gray-400 text-base max-w-xs font-light">Next level: {xpToNextLevel} XP needed</p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <Shield className="text-emerald-500" size={24}/> Spiritual Traits
                  </h3>
                  <button 
                    onClick={handleRefreshTraits}
                    className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95"
                  >
                    Refresh (+5 XP)
                  </button>
                </div>
                <div className="space-y-8">
                  {traits.map((t, i) => (
                    <motion.div 
                      key={t.name} 
                      initial={{ x: -10, opacity: 0 }} 
                      animate={{ x: 0, opacity: 1 }} 
                      transition={{ delay: i * 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-widest text-gray-900">
                        <span className="flex items-center gap-3 text-base">
                          <span className="text-xl">{t.icon}</span> {t.name}
                        </span>
                        <span className="text-emerald-600 italic text-base">{t.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${t.value}%` }} 
                          className={`h-full ${t.color} rounded-full`} 
                          transition={{ duration: 1.5, ease: "circOut" }} 
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <p className="text-3xl font-black text-emerald-600">{xp}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total XP</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <p className="text-3xl font-black text-emerald-600">{level}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Level</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <p className="text-3xl font-black text-emerald-600">{patienceLevel || 1}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patience Level</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <p className="text-3xl font-black text-emerald-600">{xpToNextLevel}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To Next Level</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Prophets Section */}
        {activeSection === 'prophets' && (
          <motion.div 
            key="prophets" 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -30 }}
            className="space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[3rem] p-10 text-center border border-emerald-100"
            >
              <div className="text-6xl mb-4">📖</div>
              <h2 className="text-4xl font-black text-gray-900 mb-3">Stories of the Prophets</h2>
              <p className="text-gray-600 text-base max-w-xl mx-auto">Discover the inspiring lives of all 25 prophets mentioned in the Quran. Peace be upon them all.</p>
              <p className="text-emerald-600 text-sm mt-3 font-bold">✨ Each story gives +15-30 XP</p>
            </motion.div>

            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search prophets by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedEra}
                  onChange={(e) => setSelectedEra(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 focus:outline-none focus:border-emerald-300 cursor-pointer"
                >
                  {eras.map(era => (
                    <option key={era} value={era}>{era}</option>
                  ))}
                </select>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 focus:outline-none focus:border-emerald-300 cursor-pointer"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}>
                    <Grid size={18} />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}>
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 -mt-4">Showing {filteredProphets.length} of {allProphets.length} prophets</p>

            <motion.div 
              layout
              className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}
            >
              <AnimatePresence>
                {filteredProphets.map((prophet, i) => (
                  <ProphetCard key={prophet.id} prophet={prophet} onClick={setSelectedProphet} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProphets.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-gray-400 text-xl font-light">No prophets found matching your filters</p>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 rounded-[3rem] p-8 text-center border border-gray-100"
            >
              <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Featured Quranic Verse</p>
              <p className="text-gray-600 text-base italic max-w-2xl mx-auto leading-relaxed">
                "And each [story] We relate to you from the news of the messengers is that by which We make firm your heart. And there has come to you in this the truth and an instruction and a reminder for the believers."
              </p>
              <p className="text-gray-400 text-sm mt-3 font-mono">Surah Hud, 11:120</p>
            </motion.div>
          </motion.div>
        )}

        {/* Prayers Section */}
        {activeSection === 'prayers' && (
          <motion.div 
            key="prayers" 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -30 }}
            className="space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[3rem] p-10 text-center border border-blue-100"
            >
              <div className="text-6xl mb-4">🕌</div>
              <h2 className="text-4xl font-black text-gray-900 mb-3">The Five Daily Prayers</h2>
              <p className="text-gray-600 text-base max-w-xl mx-auto">The foundation of Islam and the spiritual anchor of a believer's day.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRAYERS.map((prayer, idx) => (
                <motion.div
                  key={prayer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedPrayer(prayer)}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                      prayer.name === 'Fajr' ? 'bg-amber-100' :
                      prayer.name === 'Dhuhr' ? 'bg-orange-100' :
                      prayer.name === 'Asr' ? 'bg-blue-100' :
                      prayer.name === 'Maghrib' ? 'bg-indigo-100' :
                      'bg-purple-100'
                    } group-hover:scale-110 transition-transform`}>
                      {prayer.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">{prayer.name}</h3>
                      <p className="text-base text-gray-500">{prayer.time}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-base line-clamp-2">{prayer.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-emerald-600 font-bold">{prayer.rakat} Rak'at</span>
                    <span className="text-gray-400 group-hover:text-emerald-500 transition-colors">Learn More →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Islamic Events Section */}
        {activeSection === 'events' && (
          <motion.div 
            key="events" 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -30 }}
            className="space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[3rem] p-10 text-center border border-emerald-100"
            >
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-4xl font-black text-gray-900 mb-3">Islamic Events & Occasions</h2>
              <p className="text-gray-600 text-base max-w-xl mx-auto">Special days and months in the Islamic calendar filled with blessings and rewards.</p>
              <p className="text-emerald-600 text-sm mt-3 font-bold">✨ Participate to earn up to 100 XP</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ISLAMIC_EVENTS.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {event.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-500">{event.month}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-base line-clamp-2">{event.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-emerald-600 text-sm font-bold">+{event.xpReward} XP</span>
                    <span className="text-gray-400 text-sm group-hover:text-emerald-500 transition-colors">Learn More →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {selectedProphet && (
          <ProphetModal 
            prophet={selectedProphet} 
            onClose={() => setSelectedProphet(null)} 
            onIntegrate={handleIntegrateWisdom}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPrayer && (
          <PrayerModal 
            prayer={selectedPrayer} 
            onClose={() => setSelectedPrayer(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEvent && (
          <EventModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
            onIntegrate={handleIntegrateEvent}
            isIntegrating={integratingEvent === selectedEvent.id}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1fae5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a7f3d0;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .font-arabic {
          font-family: 'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif;
        }
      `}</style>
    </div>
  );
}