export interface HadithItem {
  id: string;
  number: number;
  title: string;
  narrator: string;
  text: string;
  explanation: string;
  category: string;
  source: string;
  grade: string;
}

export interface HadithBookSection {
  id: string;
  number: number;
  title: string;
  englishTitle?: string;
  hadithFirst: number;
  hadithLast: number;
  count: number;
}

export interface HadithBookEntry {
  hadithnumber: number;
  arabicnumber?: number;
  text: string;
  sectionNumber: number;
  sectionTitle: string;
  grade: string;
  referenceHadith?: number;
}

export interface HadithBookCollection {
  id: string;
  slug: string;
  edition: string;
  title: string;
  fullTitle: string;
  author: string;
  deathHijri: string;
  totalSections: number;
  totalHadiths: number;
  gradeSummary: string;
  description: string;
  collectionGroup: "الكتب الستة (الأصول الستة)" | "الموطأ والجوامع المختارة";
  fallbackSections: HadithBookSection[];
  fallbackHadiths: HadithBookEntry[];
}

const EXACT_SECTION_TRANSLATIONS: Record<string, string> = {
  revelation: "كتاب بدء الوحي",
  belief: "كتاب الإيمان",
  faith: "كتاب الإيمان",
  "the book of faith": "كتاب الإيمان",
  knowledge: "كتاب العلم",
  "the book of knowledge": "كتاب العلم",
  "ablutions (wudu')": "كتاب الوضوء",
  purification: "كتاب الطهارة",
  "purification (kitab al-taharah)": "كتاب الطهارة",
  "the book of purification": "كتاب الطهارة",
  "the book of purification and its sunnah": "كتاب الطهارة وسننها",
  "bathing (ghusl)": "كتاب الغسل",
  "menstrual periods": "كتاب الحيض",
  "the book of menstruation": "كتاب الحيض",
  "the book of menstruation and istihadah": "كتاب الحيض والاستحاضة",
  "rubbing hands and feet with dust (tayammum)": "كتاب التيمم",
  "the book of tayammum": "كتاب التيمم",
  "prayers (salat)": "كتاب الصلاة",
  "prayer (kitab al-salat)": "كتاب الصلاة",
  "the book of prayers": "كتاب الصلاة",
  "the book of prayer": "كتاب الصلاة",
  "the book on salat (prayer)": "كتاب الصلاة",
  "times of the prayers": "كتاب مواقيت الصلاة",
  "the times of prayer": "كتاب وقوت الصلاة",
  "the book of the times (of prayer)": "كتاب المواقيت",
  "call to prayers (adhan)": "كتاب الأذان",
  "the book of the adhan (call to prayer)": "كتاب الأذان",
  "friday prayer": "كتاب الجمعة",
  "the book of jumu'ah (friday prayer)": "كتاب الجمعة",
  "the book on the two eids": "كتاب العيدين",
  "the two festivals (eids)": "كتاب العيدين",
  "the book of the two 'eids": "كتاب صلاة العيدين",
  "fear prayer": "كتاب صلاة الخوف",
  "witr prayer": "كتاب الوتر",
  "the book on witr": "كتاب الوتر",
  "invoking allah for rain (istisqaa)": "كتاب الاستسقاء",
  "the book of prayer for rain (al-istisqa')": "كتاب الاستسقاء",
  eclipses: "كتاب الكسوف",
  "the book of eclipses": "كتاب الكسوف",
  "prostration during recital of qur'an": "كتاب سجود القرآن",
  "shortening the prayers (at-taqseer)": "كتاب تقصير الصلاة",
  "prayer at night (tahajjud)": "كتاب التهجد وقيام الليل",
  "virtues of prayer at masjid makkah and madinah": "كتاب فضل الصلاة في مسجد مكة والمدينة",
  "actions while praying": "كتاب العمل في الصلاة",
  "forgetfulness in prayer": "كتاب السهو في الصلاة",
  "funerals (al-janaa'iz)": "كتاب الجنائز",
  "the book of funerals": "كتاب الجنائز",
  "the book on Jana'iz (funerals)": "كتاب الجنائز",
  "funerals (kitab al-jana'iz)": "كتاب الجنائز",
  "obligatory charity tax (zakat)": "كتاب الزكاة",
  "zakat (kitab al-zakat)": "كتاب الزكاة",
  "the book of zakat": "كتاب الزكاة",
  "the book of zakah": "كتاب الزكاة",
  "the book on zakat": "كتاب الزكاة",
  "hajj (pilgrimage)": "كتاب الحج",
  "the book of pilgrimage": "كتاب المناسك والحج",
  "the book of hajj": "كتاب المناسك والحج",
  "the book on hajj": "كتاب الحج",
  "`umrah (minor pilgrimage)": "كتاب العمرة",
  "pilgrims prevented from completing the pilgrimage": "كتاب المحصر وجزاء الصيد",
  "penalty of hunting while on pilgrimage": "كتاب جزاء الصيد",
  "virtues of madinah": "كتاب فضائل المدينة",
  fasting: "كتاب الصوم",
  "the book of fasting": "كتاب الصيام",
  "the book on fasting": "كتاب الصوم",
  "fasting (kitab al-siyam)": "كتاب الصيام",
  "praying at night in ramadan (taraweeh)": "كتاب صلاة التراويح",
  "virtues of the night of qadr": "كتاب فضل ليلة القدر",
  "retiring to a mosque for remembrance of allah (i'tikaf)": "كتاب الاعتكاف",
  "sales and trade": "كتاب البيوع",
  "the book of commercial transactions": "كتاب البيوع والتجارات",
  "the book on business": "كتاب البيوع",
  "sales in which a price is paid for goods to be delivered later (as-salam)": "كتاب السلم",
  "shuf'a": "كتاب الشفعة",
  hiring: "كتاب الإجارة",
  "transferance of a debt from one person to another (al-hawala)": "كتاب الحوالات",
  "kafalah": "كتاب الكفالة",
  "representation, authorization, business by proxy": "كتاب الوكالة",
  agriculture: "كتاب المزارعة والحرث",
  "distribution of water": "كتاب المساقاة والشرب",
  "loans, payment of loans, freezing of property, bankruptcy": "كتاب الاستقراض وأداء الديون والحجر والتفليس",
  "khusoomaat": "كتاب الخصومات",
  "lost things picked up by someone (luqatah)": "كتاب اللقطة",
  oppressions: "كتاب المظالم والغصب",
  partnership: "كتاب الشركة",
  "mortgaging": "كتاب الرهن",
  "manumission of slaves": "كتاب العتق",
  "mukaatab": "كتاب المكاتب",
  "gifts": "كتاب الهبة وفضلها",
  witnesses: "كتاب الشهادات",
  peacemaking: "كتاب الصلح",
  conditions: "كتاب الشروط",
  "wills and testaments (wasaayaa)": "كتاب الوصايا",
  "the book of wills": "كتاب الوصايا",
  "fighting for the cause of allah (jihaad)": "كتاب الجهاد والسير",
  "the book of jihad and expeditions": "كتاب الجهاد والسير",
  "jihad (kitab al-jihad)": "كتاب الجهاد",
  "one-fifth of booty to the cause of allah (khumus)": "كتاب فرض الخمس",
  "jizyah and stoppage of war": "كتاب الجزية والموادعة",
  "beginning of creation": "كتاب بدء الخلق",
  prophets: "كتاب أحاديث الأنبياء",
  "virtues and merits of the prophet (pbuh) and his companions": "كتاب المناقب",
  "companions of the prophet": "كتاب فضائل أصحاب النبي ﷺ",
  "merits of the helpers in madinah (ansaar)": "كتاب مناقب الأنصار",
  "military expeditions led by the prophet (pbuh) (al-maghaazi)": "كتاب المغازي",
  "prophetic commentary on the qur'an (tafseer of the prophet (pbuh))": "كتاب التفسير",
  "the book of commentary": "كتاب تفسير القرآن",
  "virtues of the qur'an": "كتاب فضائل القرآن",
  "wedlock, marriage (nikaah)": "كتاب النكاح",
  "the book of marriage": "كتاب النكاح",
  "marriage (kitab al-nikah)": "كتاب النكاح",
  divorce: "كتاب الطلاق",
  "the book of divorce": "كتاب الطلاق",
  "supporting the family": "كتاب النفقات",
  "food, meals": "كتاب الأطعمة",
  "the book of food": "كتاب الأطعمة",
  "sacrifice on occasion of birth (`aqiqa)": "كتاب العقيقة",
  "hunting, slaughtering": "كتاب الذبائح والصيد",
  "al-adha festival sacrifice (adaahi)": "كتاب الأضاحي",
  drinks: "كتاب الأشربة",
  "the book of drinks": "كتاب الأشربة",
  patients: "كتاب المرضى",
  medicine: "كتاب الطب",
  "the book of medicine": "كتاب الطب",
  dress: "كتاب اللباس",
  "the book of clothing": "كتاب اللباس والزينة",
  "good manners and form (al-adab)": "كتاب الأدب",
  "general behavior (kitab al-adab)": "كتاب الأدب",
  "the book of manners": "كتاب الأدب والبر والصلة",
  "asking permission": "كتاب الاستئذان",
  invocations: "كتاب الدعوات",
  "the book of supplications": "كتاب الدعوات والأذكار",
  "to make the heart tender (ar-riqaq)": "كتاب الرقاق",
  "divine will (al-qadar)": "كتاب القدر",
  "the book of destiny": "كتاب القدر",
  "oaths and vows": "كتاب الأيمان والنذور",
  "expiation for unfulfilled oaths": "كتاب كفارات الأيمان",
  "laws of inheritance (al-faraa'id)": "كتاب الفرائض والمواريث",
  "limits and punishments set by allah (hudood)": "كتاب الحدود",
  "blood money (ad-diyaat)": "كتاب الديات",
  "apostates": "كتاب استتابة المرتدين",
  "saying something under compulsion (ikraah)": "كتاب الإكراه",
  tricks: "كتاب الحيل",
  "interpretation of dreams": "كتاب تعبير الرؤيا",
  "afflictions and the end of the world": "كتاب الفتن وأشراط الساعة",
  judgments: "كتاب الأحكام والقضاء",
  "judgments (ahkaam)": "كتاب الأحكام",
  wishes: "كتاب التمني",
  "accepting information given by a truthful person": "كتاب أخبار الآحاد",
  "holding fast to the qur'an and sunnah": "كتاب الاعتصام بالكتاب والسنة",
  "oneness, uniqueness of allah (tawheed)": "كتاب التوحيد",
  "the book of the sunnah": "كتاب السنة واتباعها",
  "forty hadith of an-nawawi": "متن الأربعين النووية الكاملة",
  "forty hadith qudsi": "متن الأحاديث القدسية الكاملة",
};

const KEYWORD_SECTION_TRANSLATIONS: Array<[RegExp, string]> = [
  [/revelation/i, "كتاب بدء الوحي"],
  [/faith|belief|iman/i, "كتاب الإيمان"],
  [/knowledge/i, "كتاب العلم"],
  [/purification|taharah|ablution|wudu/i, "كتاب الطهارة والوضوء"],
  [/ghusl|bathing/i, "كتاب الغسل"],
  [/menstrua|hayd|istihadah/i, "كتاب الحيض"],
  [/tayammum/i, "كتاب التيمم"],
  [/adhan|call to prayer/i, "كتاب الأذان"],
  [/mosque|masjid/i, "كتاب المساجد ومواضع الصلاة"],
  [/friday|jumu/i, "كتاب الجمعة"],
  [/eid|festival/i, "كتاب صلاة العيدين"],
  [/eclipse|kusuf/i, "كتاب الكسوف"],
  [/rain|istisqa/i, "كتاب الاستسقاء"],
  [/witr/i, "كتاب الوتر"],
  [/tahajjud|night prayer|qiyam/i, "كتاب قيام الليل والتهجد"],
  [/prayer|salat|salah/i, "كتاب الصلاة"],
  [/funeral|jana'iz|janaa'iz|burial/i, "كتاب الجنائز"],
  [/zakat|zakah|charity|alms/i, "كتاب الزكاة والصدقات"],
  [/fasting|siyam|sawm|ramadan/i, "كتاب الصيام"],
  [/i'tikaf|retiring to a mosque/i, "كتاب الاعتكاف"],
  [/hajj|pilgrimage|manasik|umrah/i, "كتاب الحج والمناسك"],
  [/sacrifice|udhiyah|adaahi|aqiqa/i, "كتاب الأضاحي والعقيقة"],
  [/hunting|slaughter|game/i, "كتاب الصيد والذبائح"],
  [/marriage|nikah|wedlock/i, "كتاب النكاح"],
  [/divorce|talaq/i, "كتاب الطلاق"],
  [/suckling|breastfeeding|rada/i, "كتاب الرضاع"],
  [/will|testament|wasaya|bequest/i, "كتاب الوصايا"],
  [/inheritance|fara'id|shares/i, "كتاب الفرائض والمواريث"],
  [/sale|trade|business|commercial|buy|transaction/i, "كتاب البيوع والمعاملات"],
  [/loan|debt|mortgage|bankruptcy/i, "كتاب الديون والرهن"],
  [/oath|vow|nadhr/i, "كتاب الأيمان والنذور"],
  [/qasamah|blood money|diyat|retaliation/i, "كتاب الديات والقصاص"],
  [/hudud|hudood|punishment/i, "كتاب الحدود"],
  [/judg|qada|ahkam|ruling|office of the judge/i, "كتاب الأقضية والأحكام"],
  [/witness|testimony/i, "كتاب الشهادات"],
  [/jihad|expedition|maghazi|booty|spoils/i, "كتاب الجهاد والسير والمغازي"],
  [/food|meal|eat/i, "كتاب الأطعمة"],
  [/drink|beverage/i, "كتاب الأشربة"],
  [/clothing|dress|garment|adornment/i, "كتاب اللباس والزينة"],
  [/medicine|medical|patient|sick|healing/i, "كتاب الطب والمرضى"],
  [/dream|vision/i, "كتاب الرؤيا والتعبير"],
  [/manner|adab|etiquette|greeting|salutation|permission/i, "كتاب الأدب والاستئذان"],
  [/supplication|invocation|dua|dhikr|remembrance|repentance|tawbah/i, "كتاب الذكر والدعاء والتوبة"],
  [/heart|riqaq|zuhd|asceticism|piety|softening/i, "كتاب الزهد والرقائق"],
  [/fitan|affliction|turmoil|tribulation|hour|end of the world/i, "كتاب الفتن وأشراط الساعة"],
  [/paradise|hell|resurrection|hereafter/i, "كتاب صفة الجنة والنار والبعث"],
  [/destiny|qadar|decree/i, "كتاب القدر"],
  [/qur'an|quran|tafseer|commentary/i, "كتاب فضائل القرآن وتفسيره"],
  [/prophet|companion|merit|virtue|manaqib/i, "كتاب المناقب وفضائل الصحابة"],
  [/tawheed|oneness|sunnah/i, "كتاب التوحيد والسنة"],
];

export function translateHadithSectionTitle(
  rawTitle?: string,
  sectionNumber?: number | string
): string {
  const num = sectionNumber ? Number(sectionNumber) : undefined;
  if (!rawTitle || !rawTitle.trim()) {
    return num ? `الكتاب / الباب رقم ${num}` : "باب عام";
  }

  const trimmed = rawTitle.trim();
  // If already contains Arabic letters, return as-is
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();
  if (EXACT_SECTION_TRANSLATIONS[lower]) {
    return EXACT_SECTION_TRANSLATIONS[lower];
  }

  for (const [regex, arabicTitle] of KEYWORD_SECTION_TRANSLATIONS) {
    if (regex.test(trimmed)) {
      return arabicTitle;
    }
  }

  return num ? `الباب ${num} — ${trimmed}` : trimmed;
}

export function translateHadithGrade(rawGrade?: string): string {
  if (!rawGrade || !rawGrade.trim()) return "صحيح / معتمد في أصل الكتاب";
  const g = rawGrade.trim();
  if (/[\u0600-\u06FF]/.test(g)) return g;

  const lower = g.toLowerCase();
  if (lower === "sahih" || lower.includes("sahih - agreed upon")) return "صحيح";
  if (lower.includes("hasan sahih")) return "حسن صحيح";
  if (lower.includes("sahih lighairihi")) return "صحيح لغيره";
  if (lower.includes("hasan lighairihi")) return "حسن لغيره";
  if (lower.includes("isnaad sahih") || lower.includes("isnad sahih")) return "إسناده صحيح";
  if (lower.includes("isnaad hasan") || lower.includes("isnad hasan")) return "إسناده حسن";
  if (lower === "hasan") return "حسن";
  if (lower.includes("daif") || lower.includes("da'if") || lower.includes("weak")) return "ضعيف";
  if (lower.includes("maudu") || lower.includes("fabricated")) return "موضوع";
  if (lower.includes("sahih")) return "صحيح";
  if (lower.includes("hasan")) return "حسن";
  return g;
}

export const HADITH_BOOKS: HadithBookCollection[] = [
  {
    id: "book-bukhari",
    slug: "sahih-al-bukhari",
    edition: "ara-bukhari",
    title: "صحيح البخاري",
    fullTitle: "الجامع المسند الصحيح المختصر من أمور رسول الله ﷺ وسننه وأيامه",
    author: "الإمام محمد بن إسماعيل البخاري",
    deathHijri: "٢٥٦ هـ",
    totalSections: 97,
    totalHadiths: 7563,
    gradeSummary: "صحيح (أصح الكتب بعد كتاب الله)",
    description:
      "أصح كتب السنة النبوية المشرفة على الإطلاق، جمع فيه الإمام البخاري الأحاديث الصحيحة المسندة المتصلة إلى رسول الله ﷺ ورتّبها على الأبواب الفقهية والحديثية في 97 كتاباً.",
    collectionGroup: "الكتب الستة (الأصول الستة)",
    fallbackSections: [
      { id: "1", number: 1, title: "كتاب بدء الوحي", hadithFirst: 1, hadithLast: 7, count: 7 },
      { id: "2", number: 2, title: "كتاب الإيمان", hadithFirst: 8, hadithLast: 58, count: 51 },
      { id: "3", number: 3, title: "كتاب العلم", hadithFirst: 59, hadithLast: 134, count: 76 },
      { id: "4", number: 4, title: "كتاب الوضوء", hadithFirst: 135, hadithLast: 247, count: 113 },
    ],
    fallbackHadiths: [
      {
        hadithnumber: 1,
        arabicnumber: 1,
        sectionNumber: 1,
        sectionTitle: "كتاب بدء الوحي",
        grade: "صحيح",
        text: "حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ، قَالَ: حَدَّثَنَا سُفْيَانُ، قَالَ: حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ الأَنْصَارِيُّ، قَالَ: أَخْبَرَنِي مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ، أَنَّهُ سَمِعَ عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ، يَقُولُ: سَمِعْتُ عُمَرَ بْنَ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ عَلَى الْمِنْبَرِ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ».",
      },
      {
        hadithnumber: 2,
        arabicnumber: 2,
        sectionNumber: 1,
        sectionTitle: "كتاب بدء الوحي",
        grade: "صحيح",
        text: "حَدَّثَنَا عَبْدُ اللَّهِ بْنُ يُوسُفَ، قَالَ: أَخْبَرَنَا مَالِكٌ، عَنْ هِشَامِ بْنِ عُرْوَةَ، عَنْ أَبِيهِ، عَنْ عَائِشَةَ أُمِّ الْمُؤْمِنِينَ رَضِيَ اللَّهُ عَنْهَا أَنَّ الْحَارِثَ بْنَ هِشَامٍ رَضِيَ اللَّهُ عَنْهُ سَأَلَ رَسُولَ اللَّهِ ﷺ فَقَالَ: يَا رَسُولَ اللَّهِ، كَيْفَ يَأْتِيكَ الْوَحْيُ؟ فَقَالَ رَسُولُ اللَّهِ ﷺ: «أَحْيَانًا يَأْتِينِي مِثْلَ صَلْصَلَةِ الْجَرَسِ وَهُوَ أَشَدُّهُ عَلَيَّ فَيُفْصَمُ عَنِّي وَقَدْ وَعَيْتُ عَنْهُ مَا قَالَ، وَأَحْيَانًا يَتَمَثَّلُ لِيَ الْمَلَكُ رَجُلًا فَيُكَلِّمُنِي فَأَعِي مَا يَقُولُ».",
      },
      {
        hadithnumber: 8,
        arabicnumber: 8,
        sectionNumber: 2,
        sectionTitle: "كتاب الإيمان",
        grade: "صحيح",
        text: "حَدَّثَنَا عُبَيْدُ اللَّهِ بْنُ مُوسَى، قَالَ: أَخْبَرَنَا حَنْظَلَةُ بْنُ أَبِي سُفْيَانَ، عَنْ عِكْرِمَةَ بْنِ خَالِدٍ، عَنِ ابْنِ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ».",
      },
      {
        hadithnumber: 9,
        arabicnumber: 9,
        sectionNumber: 2,
        sectionTitle: "كتاب الإيمان",
        grade: "صحيح",
        text: "حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مُحَمَّدٍ، قَالَ: حَدَّثَنَا أَبُو عَامِرٍ الْعَقَدِيُّ، قَالَ: حَدَّثَنَا سُلَيْمَانُ بْنُ بِلاَلٍ، عَنْ عَبْدِ اللَّهِ بْنِ دِينَارٍ، عَنْ أَبِي صَالِحٍ، عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ ﷺ قَالَ: «الإِيمَانُ بِضْعٌ وَسِتُّونَ شُعْبَةً، وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ».",
      },
      {
        hadithnumber: 10,
        arabicnumber: 10,
        sectionNumber: 2,
        sectionTitle: "كتاب الإيمان",
        grade: "صحيح",
        text: "حَدَّثَنَا آدَمُ بْنُ أَبِي إِيَاسٍ، قَالَ: حَدَّثَنَا شُعْبَةُ، عَنْ عَبْدِ اللَّهِ بْنِ أَبِي السَّفَرِ وَإِسْمَاعِيلَ بْنِ أَبِي خَالِدٍ، عَنِ الشَّعْبِيِّ، عَنْ عَبْدِ اللَّهِ بْنِ عَمْرٍو رَضِيَ اللَّهُ عَنْهُمَا، عَنِ النَّبِيِّ ﷺ قَالَ: «الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ».",
      },
      {
        hadithnumber: 59,
        arabicnumber: 59,
        sectionNumber: 3,
        sectionTitle: "كتاب العلم",
        grade: "صحيح",
        text: "حَدَّثَنَا مُحَمَّدُ بْنُ سِنَانٍ، قَالَ: حَدَّثَنَا فُلَيْحٌ، عَنْ هِلاَلِ بْنِ عَلِيٍّ، عَنْ عَطَاءِ بْنِ يَسَارٍ، عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «إِذَا ضُيِّعَتِ الأَمَانَةُ فَانْتَظِرِ السَّاعَةَ». قَالَ: كَيْفَ إِضَاعَتُهَا يَا رَسُولَ اللَّهِ؟ قَالَ: «إِذَا وُسِّدَ الأَمْرُ إِلَى غَيْرِ أَهْلِهِ فَانْتَظِرِ السَّاعَةَ».",
      },
    ],
  },
  {
    id: "book-muslim",
    slug: "sahih-muslim",
    edition: "ara-muslim",
    title: "صحيح مسلم",
    fullTitle: "المسند الصحيح المختصر بنقل العدل عن العدل إلى رسول الله ﷺ",
    author: "الإمام مسلم بن الحجاج القشيري النيسابوري",
    deathHijri: "٢٦١ هـ",
    totalSections: 56,
    totalHadiths: 7563,
    gradeSummary: "صحيح (ثاني الصحيحين المتفق على صحتهما)",
    description:
      "ثاني أصح الكتب بعد صحيح البخاري، تميّز بجمع طرق الحديث الواحد ورواياته في موضع واحد وحسن الترتيب وضبط الألفاظ في 56 كتاباً جامعاً.",
    collectionGroup: "الكتب الستة (الأصول الستة)",
    fallbackSections: [
      { id: "1", number: 1, title: "كتاب الإيمان", hadithFirst: 1, hadithLast: 433, count: 433 },
      { id: "2", number: 2, title: "كتاب الطهارة", hadithFirst: 434, hadithLast: 678, count: 245 },
      { id: "3", number: 3, title: "كتاب الحيض", hadithFirst: 679, hadithLast: 836, count: 158 },
      { id: "4", number: 4, title: "كتاب الصلاة", hadithFirst: 837, hadithLast: 1160, count: 324 },
    ],
    fallbackHadiths: [
      {
        hadithnumber: 1,
        arabicnumber: 1,
        sectionNumber: 1,
        sectionTitle: "كتاب الإيمان",
        grade: "صحيح",
        text: "حَدَّثَنِي أَبُو خَيْثَمَةَ زُهَيْرُ بْنُ حَرْبٍ، حَدَّثَنَا وَكِيعٌ، عَنْ كَهْمَسٍ، عَنْ عَبْدِ اللَّهِ بْنِ بُرَيْدَةَ، عَنْ يَحْيَى بْنِ يَعْمَرَ... عَنْ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: بَيْنَمَا نَحْنُ عِنْدَ رَسُولِ اللَّهِ ﷺ ذَاتَ يَوْمٍ إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ شَدِيدُ سَوَادِ الشَّعَرِ، فَقَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الإِسْلاَمِ... قَالَ: «الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلاَةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلاً».",
      },
      {
        hadithnumber: 150,
        arabicnumber: 55,
        sectionNumber: 1,
        sectionTitle: "كتاب الإيمان",
        grade: "صحيح",
        text: "حَدَّثَنَا مُحَمَّدُ بْنُ عَبَّادٍ الْمَكِّيُّ، حَدَّثَنَا سُفْيَانُ، قَالَ: قُلْتُ لِسُهَيْلٍ: إِنَّ عَمْرًا حَدَّثَنَا عَنِ الْقَعْقَاعِ، عَنْ أَبِيكَ، عَنْ تَمِيمٍ الدَّارِيِّ أَنَّ النَّبِيَّ ﷺ قَالَ: «الدِّينُ النَّصِيحَةُ» قُلْنَا: لِمَنْ؟ قَالَ: «لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ».",
      },
      {
        hadithnumber: 434,
        arabicnumber: 223,
        sectionNumber: 2,
        sectionTitle: "كتاب الطهارة",
        grade: "صحيح",
        text: "حَدَّثَنَا إِسْحَاقُ بْنُ مَنْصُورٍ، حَدَّثَنَا حَبَّانُ بْنُ هِلاَلٍ، حَدَّثَنَا أَبَانُ، حَدَّثَنَا يَحْيَى، أَنَّ زَيْدًا حَدَّثَهُ أَنَّ أَبَا سَلاَّمٍ حَدَّثَهُ عَنْ أَبِي مَالِكٍ الأَشْعَرِيِّ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآَنِ -أَوْ تَمْلأُ- مَا بَيْنَ السَّمَاوَاتِ وَالأَرْضِ، وَالصَّلاَةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ».",
      },
    ],
  },
  {
    id: "book-abudawud",
    slug: "sunan-abi-dawud",
    edition: "ara-abudawud",
    title: "سنن أبي داود",
    fullTitle: "كتاب السنن للإمام أبي داود السجستاني",
    author: "الإمام سليمان بن الأشعث السجستاني (أبو داود)",
    deathHijri: "٢٧٥ هـ",
    totalSections: 43,
    totalHadiths: 5274,
    gradeSummary: "السنن المعتمدة مع بيان درجة كل حديث",
    description:
      "أحد الكتب الستة الأصول، اعتنى فيه الإمام أبو داود بجمع أحاديث الأحكام الفقهية والسنن العملية في الطهارة والصلاة والزكاة والمعاملات والآداب.",
    collectionGroup: "الكتب الستة (الأصول الستة)",
    fallbackSections: [
      { id: "1", number: 1, title: "كتاب الطهارة", hadithFirst: 1, hadithLast: 390, count: 390 },
      { id: "2", number: 2, title: "كتاب الصلاة", hadithFirst: 391, hadithLast: 1160, count: 770 },
      { id: "3", number: 3, title: "كتاب صلاة الاستسقاء", hadithFirst: 1161, hadithLast: 1197, count: 37 },
    ],
    fallbackHadiths: [
      {
        hadithnumber: 1,
        arabicnumber: 1,
        sectionNumber: 1,
        sectionTitle: "كتاب الطهارة",
        grade: "صحيح",
        text: "حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مَسْلَمَةَ بْنِ قَعْنَبٍ القَعْنَبِيُّ، حَدَّثَنَا عَبْدُ الْعَزِيزِ بْنُ مُحَمَّدٍ، عَنْ مُحَمَّدِ بْنِ عَمْرٍو، عَنْ أَبِي سَلَمَةَ، عَنِ الْمُغِيرَةِ بْنِ شُعْبَةَ: «أَنَّ النَّبِيَّ ﷺ كَانَ إِذَا ذَهَبَ الْمَذْهَبَ أَبْعَدَ».",
      },
      {
        hadithnumber: 101,
        arabicnumber: 101,
        sectionNumber: 1,
        sectionTitle: "كتاب الطهارة",
        grade: "صحيح",
        text: "حَدَّثَنَا قُتَيْبَةُ بْنُ سَعِيدٍ، حَدَّثَنَا اللَّيْثُ، عَنْ يَزِيدَ بْنِ أَبِي حَبِيبٍ... عَنْ أَبِي هُرَيْرَةَ أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «لاَ تُقْبَلُ صَلاَةُ أَحَدِكُمْ إِذَا أَحْدَثَ حَتَّى يَتَوَضَّأَ».",
      },
    ],
  },
  {
    id: "book-tirmidhi",
    slug: "jami-at-tirmidhi",
    edition: "ara-tirmidhi",
    title: "جامع الترمذي",
    fullTitle: "الجامع المختصر من السنن عن رسول الله ﷺ ومعرفة الصحيح والمعلول وما عليه العمل",
    author: "الإمام أبو عيسى محمد بن عيسى الترمذي",
    deathHijri: "٢٧٩ هـ",
    totalSections: 49,
    totalHadiths: 3998,
    gradeSummary: "جامع للسنن والآداب والتفسير والمناقب مع بيان درجة الحديث",
    description:
      "كتاب جامع لأبواب الفقه والعقائد والآداب والرقائق والتفسير والمناقب، تميّز بذكر مذاهب الصحابة والفقهاء وبيان درجة كل حديث عقب روايته.",
    collectionGroup: "الكتب الستة (الأصول الستة)",
    fallbackSections: [
      { id: "1", number: 1, title: "كتاب الطهارة", hadithFirst: 1, hadithLast: 148, count: 148 },
      { id: "2", number: 2, title: "كتاب الصلاة", hadithFirst: 149, hadithLast: 451, count: 303 },
      { id: "3", number: 3, title: "كتاب الوتر", hadithFirst: 452, hadithLast: 487, count: 36 },
    ],
    fallbackHadiths: [
      {
        hadithnumber: 1,
        arabicnumber: 1,
        sectionNumber: 1,
        sectionTitle: "كتاب الطهارة",
        grade: "صحيح",
        text: "حَدَّثَنَا قُتَيْبَةُ بْنُ سَعِيدٍ، وَهَنَّادٌ، وَمَحْمُودُ بْنُ غَيْلاَنَ، قَالُوا: حَدَّثَنَا وَكِيعٌ، عَنْ سُفْيَانَ، عَنْ عَبْدِ اللَّهِ بْنِ مُحَمَّدِ بْنِ عَقِيلٍ، عَنْ مُحَمَّدِ بْنِ الحَنَفِيَّةِ، عَنْ عَلِيٍّ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ ﷺ قَالَ: «مِفْتَاحُ الصَّلاَةِ الطُّهُورُ، وَتَحْرِيمُهَا التَّكْبِيرُ، وَتَحْلِيلُهَا التَّسْلِيمُ».",
      },
      {
        hadithnumber: 1987,
        arabicnumber: 1987,
        sectionNumber: 27,
        sectionTitle: "كتاب البر والصلة",
        grade: "حسن صحيح",
        text: "حَدَّثَنَا مَحْمُودُ بْنُ غَيْلاَنَ، حَدَّثَنَا أَبُو أَحْمَدَ الزُّبَيْرِيُّ، حَدَّثَنَا سُفْيَانُ، عَنْ حَبِيبِ بْنِ أَبِي ثَابِتٍ، عَنْ مَيْمُونِ بْنِ أَبِي شَبِيبٍ، عَنْ أَبِي ذَرٍّ قَالَ: قَالَ لِي رَسُولُ اللَّهِ ﷺ: «اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ».",
      },
    ],
  },
  {
    id: "book-nasai",
    slug: "sunan-an-nasai",
    edition: "ara-nasai",
    title: "سنن النسائي",
    fullTitle: "المجتبى من السنن الكبرى للإمام النسائي",
    author: "الإمام أبو عبد الرحمن أحمد بن شعيب النسائي",
    deathHijri: "٣٠٣ هـ",
    totalSections: 51,
    totalHadiths: 5765,
    gradeSummary: "أقوى الكتب الأربعة شرطاً وأقلّها ضعيفاً",
    description:
      "كتاب المجتبى من السنن الكبرى، يُعدّ من أشدّ كتب السنن الأربعة تحرّياً في شروط الرجال والأسانيد وحسن التبويب الفقهي الدقيق في 51 كتاباً.",
    collectionGroup: "الكتب الستة (الأصول الستة)",
    fallbackSections: [
      { id: "1", number: 1, title: "كتاب الطهارة", hadithFirst: 1, hadithLast: 324, count: 324 },
      { id: "2", number: 2, title: "كتاب المياه", hadithFirst: 325, hadithLast: 347, count: 23 },
      { id: "3", number: 3, title: "كتاب الحيض والاستحاضة", hadithFirst: 348, hadithLast: 395, count: 48 },
    ],
    fallbackHadiths: [
      {
        hadithnumber: 1,
        arabicnumber: 1,
        sectionNumber: 1,
        sectionTitle: "كتاب الطهارة",
        grade: "صحيح",
        text: "أَخْبَرَنَا قُتَيْبَةُ بْنُ سَعِيدٍ، قَالَ: حَدَّثَنَا سُفْيَانُ، عَنِ الزُّهْرِيِّ، عَنْ أَبِي سَلَمَةَ، عَنْ أَبِي هُرَيْرَةَ أَنَّ النَّبِيَّ ﷺ قَالَ: «إِذَا اسْتَيْقَظَ أَحَدُكُمْ مِنْ نَوْمِهِ فَلاَ يَغْمِسْ يَدَهُ فِي وَضُوئِهِ حَتَّى يَغْسِلَهَا ثَلاَثًا؛ فَإِنَّ أَحَدَكُمْ لاَ يَدْرِي أَيْنَ بَاتَتْ يَدُهُ».",
      },
    ],
  },
  {
    id: "book-ibnmajah",
    slug: "sunan-ibn-majah",
    edition: "ara-ibnmajah",
    title: "سنن ابن ماجه",
    fullTitle: "كتاب السنن للإمام الحافظ ابن ماجه القزويني",
    author: "الإمام أبو عبد الله محمد بن يزيد بن ماجه القزويني",
    deathHijri: "٢٧٣ هـ",
    totalSections: 37,
    totalHadiths: 4343,
    gradeSummary: "سادس الكتب الستة مع بيان درجة كل حديث",
    description:
      "سادس الأصول الستة في الحديث الشريف، امتاز بحسن الترتيب والاختصار واستيعاب أبواب السنة والعبادات والمعاملات والزهد في 37 كتاباً.",
    collectionGroup: "الكتب الستة (الأصول الستة)",
    fallbackSections: [
      { id: "1", number: 1, title: "مقدمة الكتاب في اتباع السنة", hadithFirst: 1, hadithLast: 266, count: 266 },
      { id: "2", number: 2, title: "كتاب الطهارة وسننها", hadithFirst: 267, hadithLast: 666, count: 400 },
      { id: "3", number: 3, title: "كتاب الصلاة", hadithFirst: 667, hadithLast: 705, count: 39 },
    ],
    fallbackHadiths: [
      {
        hadithnumber: 1,
        arabicnumber: 1,
        sectionNumber: 1,
        sectionTitle: "مقدمة الكتاب في اتباع السنة",
        grade: "صحيح",
        text: "حَدَّثَنَا أَبُو بَكْرِ بْنُ أَبِي شَيْبَةَ، قَالَ: حَدَّثَنَا شَرِيكٌ، عَنِ الأَعْمَشِ، عَنْ أَبِي صَالِحٍ، عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَا أَمَرْتُكُمْ بِهِ فَخُذُوهُ، وَمَا نَهَيْتُكُمْ عَنْهُ فَانْتَهُوا».",
      },
    ],
  },
  {
    id: "book-malik",
    slug: "muwatta-malik",
    edition: "ara-malik",
    title: "موطأ الإمام مالك",
    fullTitle: "الموطأ لإمام دار الهجرة مالك بن أنس الأصبحي",
    author: "الإمام مالك بن أنس إمام دار الهجرة",
    deathHijri: "١٧٩ هـ",
    totalSections: 61,
    totalHadiths: 1858,
    gradeSummary: "من أقدم وأجلّ دواوين الحديث والفقه الإسلامي",
    description:
      "من أوائل وأعظم ما صُنّف في الحديث الشريف والفقه الإسلامي في المدينة المنورة، يضمّ الأحاديث النبوية المرفوعة وآثار الصحابة والتابعين في 61 كتاباً.",
    collectionGroup: "الموطأ والجوامع المختارة",
    fallbackSections: [
      { id: "1", number: 1, title: "كتاب وقوت الصلاة", hadithFirst: 1, hadithLast: 31, count: 31 },
      { id: "2", number: 2, title: "كتاب الطهارة", hadithFirst: 32, hadithLast: 145, count: 114 },
      { id: "3", number: 3, title: "كتاب الصلاة", hadithFirst: 146, hadithLast: 221, count: 76 },
    ],
    fallbackHadiths: [
      {
        hadithnumber: 9,
        arabicnumber: 9,
        sectionNumber: 1,
        sectionTitle: "كتاب وقوت الصلاة",
        grade: "صحيح",
        text: "وَحَدَّثَنِي عَنْ مَالِكٍ، عَنْ زَيْدِ بْنِ أَسْلَمَ، عَنْ عَطَاءِ بْنِ يَسَارٍ، وَعَنْ بُسْرِ بْنِ سَعِيدٍ، وَعَنِ الأَعْرَجِ، يُحَدِّثُونَهُ عَنْ أَبِي هُرَيْرَةَ، أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ أَدْرَكَ رَكْعَةً مِنَ الصُّبْحِ قَبْلَ أَنْ تَطْلُعَ الشَّمْسُ فَقَدْ أَدْرَكَ الصُّبْحَ، وَمَنْ أَدْرَكَ رَكْعَةً مِنَ الْعَصْرِ قَبْلَ أَنْ تَغْرُبَ الشَّمْسُ فَقَدْ أَدْرَكَ الْعَصْرَ».",
      },
    ],
  },
  {
    id: "book-nawawi",
    slug: "al-arbaun-an-nawawiyyah",
    edition: "ara-nawawi",
    title: "الأربعون النووية",
    fullTitle: "متن الأربعين النووية في الأحاديث الصحيحة النبوية (٤٢ حديثاً)",
    author: "الإمام محيي الدين يحيى بن شرف النووي",
    deathHijri: "٦٧٦ هـ",
    totalSections: 1,
    totalHadiths: 42,
    gradeSummary: "أحاديث جامعة لأصول الدين وقواعد الإسلام",
    description:
      "المتن المبارك الذي جمع فيه الإمام النووي 42 حديثاً من جوامع كلم النبي ﷺ، كل حديث منها قاعدة عظيمة من قواعد الإسلام في العقيدة والعبادة والأخلاق.",
    collectionGroup: "الموطأ والجوامع المختارة",
    fallbackSections: [
      { id: "1", number: 1, title: "متن الأربعين النووية الكاملة", hadithFirst: 1, hadithLast: 42, count: 42 },
    ],
    fallbackHadiths: [
      {
        hadithnumber: 1,
        arabicnumber: 1,
        sectionNumber: 1,
        sectionTitle: "متن الأربعين النووية الكاملة",
        grade: "صحيح (متفق عليه)",
        text: "عَنْ أَمِيرِ الْمُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ» رَوَاهُ إِمَامَا الْمُحَدِّثِينَ البُخَارِيُّ وَمُسْلِمٌ.",
      },
      {
        hadithnumber: 2,
        arabicnumber: 2,
        sectionNumber: 1,
        sectionTitle: "متن الأربعين النووية الكاملة",
        grade: "صحيح (رواه مسلم)",
        text: "عَنْ عُمَرَ رَضِيَ اللَّهُ عَنْهُ أَيْضًا قَالَ: بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ رَسُولِ اللَّهِ ﷺ ذَاتَ يَوْمٍ إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ شَدِيدُ سَوَادِ الشَّعْرِ... فَقَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الإِسْلاَمِ، فَقَالَ رَسُولُ اللَّهِ ﷺ: «الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلاَةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلاً».",
      },
      {
        hadithnumber: 3,
        arabicnumber: 3,
        sectionNumber: 1,
        sectionTitle: "متن الأربعين النووية الكاملة",
        grade: "صحيح (متفق عليه)",
        text: "عَنْ أَبِي عَبْدِ الرَّحْمَنِ عَبْدِ اللَّهِ بْنِ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ» رَوَاهُ الْبُخَارِيُّ وَمُسْلِمٌ.",
      },
    ],
  },
  {
    id: "book-qudsi",
    slug: "al-ahadith-al-qudsiyyah",
    edition: "ara-qudsi",
    title: "الأحاديث القدسية",
    fullTitle: "مجموعة الأربعين القدسية فيما يرويه النبي ﷺ عن ربه عز وجل",
    author: "مختارة من الصحيحين والسنن المعتمدة",
    deathHijri: "مجموعة محققة",
    totalSections: 1,
    totalHadiths: 40,
    gradeSummary: "أحاديث قدسية جليلة في التوحيد والرحمة والرجاء",
    description:
      "مجموعة كاملة تضمّ 40 حديثاً قدسياً شريفاً يرويها النبي ﷺ عن ربه تبارك وتعالى في سعة رحمة الله وحسن الظن به والتقرب إليه وتحريم الظلم.",
    collectionGroup: "الموطأ والجوامع المختارة",
    fallbackSections: [
      { id: "1", number: 1, title: "متن الأحاديث القدسية الكاملة", hadithFirst: 1, hadithLast: 40, count: 40 },
    ],
    fallbackHadiths: [
      {
        hadithnumber: 1,
        arabicnumber: 1,
        sectionNumber: 1,
        sectionTitle: "متن الأحاديث القدسية الكاملة",
        grade: "صحيح (متفق عليه)",
        text: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، عَنِ النَّبِيِّ ﷺ قَالَ: «لَمَّا قَضَى اللَّهُ الْخَلْقَ كَتَبَ فِي كِتَابِهِ فَهُوَ عِنْدَهُ فَوْقَ الْعَرْشِ: إِنَّ رَحْمَتِي غَلَبَتْ غَضَبِي» رَوَاهُ الْبُخَارِيُّ وَمُسْلِمٌ.",
      },
      {
        hadithnumber: 15,
        arabicnumber: 15,
        sectionNumber: 1,
        sectionTitle: "متن الأحاديث القدسية الكاملة",
        grade: "صحيح (متفق عليه)",
        text: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ النَّبِيُّ ﷺ: «يَقُولُ اللَّهُ تَعَالَى: أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي، فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي، وَإِنْ ذَكَرَنِي فِي مَلَإٍ ذَكَرْتُهُ فِي مَلَإٍ خَيْرٍ مِنْهُمْ، وَإِنْ تَقَرَّبَ إِلَيَّ شِبْرًا تَقَرَّبْتُ إِلَيْهِ ذِرَاعًا».",
      },
    ],
  },
];

export function getHadithBookBySlugOrCategory(query?: string): HadithBookCollection | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return HADITH_BOOKS.find(
    (b) =>
      b.slug.toLowerCase() === q ||
      b.title === query.trim() ||
      b.edition.toLowerCase() === q ||
      b.id.toLowerCase() === q
  );
}

export const DEFAULT_HADITHS: HadithItem[] = [
  // 1. جوامع الكلم والأربعون النووية (6 أحاديث)
  {
    id: "hadith-1",
    number: 1,
    title: "الأعمال بالنيات",
    narrator: "عمر بن الخطاب رضي الله عنه",
    text: "«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ».",
    explanation:
      "قاعدة عظيمة من قواعد الإسلام ومدار قبول الأعمال، يبيّن فيها النبي ﷺ أن صحة العمل وعظيم أجره مرتبطان بإخلاص النية لله وحده، وأن العادات تتحول إلى عبادات بالنية الصالحة.",
    category: "جوامع الكلم والأربعون النووية",
    source: "متفق عليه (رواه البخاري ومسلم) • الحديث الأول من الأربعين النووية",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-2",
    number: 2,
    title: "بني الإسلام على خمس",
    narrator: "عبد الله بن عمر رضي الله عنهما",
    text: "«بُنِيَ الإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالحَجِّ، وَصَوْمِ رَمَضَانَ».",
    explanation:
      "يوضّح الحديث أركان الإسلام الخمسة العظام التي يقوم عليها بناء الدين، وأولها التوحيد والرسالة، ثم الصلاة التي هي عمود الدين، فالزكاة والصيام والحج لمن استطاع إليه سبيلاً.",
    category: "جوامع الكلم والأربعون النووية",
    source: "متفق عليه (رواه البخاري ومسلم) • الأربعون النووية",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-3",
    number: 3,
    title: "ردّ البدع والمحدثات في الدين",
    narrator: "أم المؤمنين عائشة رضي الله عنها",
    text: "«مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ». وَفِي رِوَايَةٍ لِمُسْلِمٍ: «مَنْ عَمِلَ عَمَلًا لَيْسَ عَلَيْهِ أَمْرُنَا فَهُوَ رَدٌّ».",
    explanation:
      "كما أن حديث «الأعمال بالنيات» ميزان الباطن والإخلاص، فإن هذا الحديث هو ميزان الظاهر والمتابعة للنبي ﷺ؛ فلا يُقبل العمل إلا بشرطين: الإخلاص لله، وموافقة السنة النبوية.",
    category: "جوامع الكلم والأربعون النووية",
    source: "متفق عليه (رواه البخاري ومسلم) • الأربعون النووية",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-4",
    number: 4,
    title: "الحلال بيّن والحرام بيّن وصلاح القلب",
    narrator: "النعمان بن بشير رضي الله عنهما",
    text: "«إِنَّ الحَلَالَ بَيِّنٌ، وَإِنَّ الحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا مُشْتَبِهَاتٌ لَا يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ، وَمَنْ وَقَعَ فِي الشُّبُهَاتِ وَقَعَ فِي الحَرَامِ... أَلَا وَإِنَّ فِي الجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الجَسَدُ كُلُّهُ؛ أَلَا وَهِيَ القَلْبُ».",
    explanation:
      "يرشد الحديث إلى الورع بترك المشتبهات صيانةً للدين والعرض، ويؤكد أن صلاح الجوارح والأعمال تَبَعٌ لصلاح القلب وطهارته بالإيمان والتقوى.",
    category: "جوامع الكلم والأربعون النووية",
    source: "متفق عليه (رواه البخاري ومسلم) • الأربعون النووية",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-5",
    number: 5,
    title: "الدين النصيحة",
    narrator: "تميم بن أوس الداري رضي الله عنه",
    text: "«الدِّينُ النَّصِيحَةُ» قُلْنَا: لِمَنْ؟ قَالَ: «لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ المُسْلِمِينَ وَعَامَّتِهِمْ».",
    explanation:
      "النصيحة كلمة جامعة لإرادة الخير للمنصوح له؛ فنصيحة الله بتوحيده وطاعته، ولكتابه بتلاوته والعمل به، ولرسوله باتباعه ومحبته، وللمسلمين بإرشادهم ومعاونتهم على البر والتقوى.",
    category: "جوامع الكلم والأربعون النووية",
    source: "رواه مسلم • الأربعون النووية",
    grade: "صحيح",
  },
  {
    id: "hadith-6",
    number: 6,
    title: "التكليف بما يُستطاع واجتناب المنهيات",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ؛ فَإِنَّمَا أَهْلَكَ الَّذِينَ مِنْ قَبْلِكُمْ كَثْرَةُ مَسَائِلِهِمْ وَاخْتِلَافُهُمْ عَلَى أَنْبِيَائِهِمْ».",
    explanation:
      "يبين هذا الحديث يسر الشريعة الإسلامية ورفع الحرج، فالمنهيات تُترك بالكليّة، والمأمورات يُؤتى منها قدر الاستطاعة، مع الحث على التسليم والعمل بدلاً من الجدل والتعمق المذموم.",
    category: "جوامع الكلم والأربعون النووية",
    source: "متفق عليه (رواه البخاري ومسلم) • الأربعون النووية",
    grade: "صحيح (متفق عليه)",
  },

  // 2. العقيدة والإيمان (6 أحاديث)
  {
    id: "hadith-7",
    number: 7,
    title: "احفظ الله يحفظك والتوكل على الله",
    narrator: "عبد الله بن عباس رضي الله عنهما",
    text: "«يَا غُلَامُ، إِنِّي أُعَلِّمُكَ كَلِمَاتٍ: احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ، إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ، وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ، وَاعْلَمْ أَنَّ الأُمَّةَ لَوِ اجْتَمَعَتْ عَلَى أَنْ يَنْفَعُوكَ بِشَيْءٍ لَمْ يَنْفَعُوكَ إِلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ لَكَ، وَلَوِ اجْتَمَعُوا عَلَى أَنْ يَضُرُّوكَ بِشَيْءٍ لَمْ يَضُرُّوكَ إِلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ عَلَيْكَ، رُفِعَتِ الأَقْلَامُ وَجَفَّتِ الصُّحُفُ».",
    explanation:
      "وصية نبوية عظيمة ترسّخ التوحيد الخالص والاعتماد على الله وحده في السؤال والاستعانة، وتملأ قلب المؤمن طمأنينة وشجاعة ورضاً بقضاء الله وقدره.",
    category: "العقيدة والإيمان",
    source: "رواه الترمذي وقال: حديث حسن صحيح • الأربعون النووية",
    grade: "حسن صحيح",
  },
  {
    id: "hadith-8",
    number: 8,
    title: "قل آمنت بالله ثم استقم",
    narrator: "سفيان بن عبد الله الثقفي رضي الله عنه",
    text: "قُلْتُ: يَا رَسُولَ اللَّهِ، قُلْ لِي فِي الإِسْلَامِ قَوْلًا لَا أَسْأَلُ عَنْهُ أَحَدًا غَيْرَكَ؛ قَالَ: «قُلْ: آمَنْتُ بِاللَّهِ، ثُمَّ اسْتَقِمْ».",
    explanation:
      "جمع النبي ﷺ في هاتين الكلمتين معاني الدين كله: تحقيق الإيمان بالقلب واللسان، ثم الثبات والاستقامة على طاعة الله واجتناب معاصيه حتى الممات.",
    category: "العقيدة والإيمان",
    source: "رواه مسلم • الأربعون النووية",
    grade: "صحيح",
  },
  {
    id: "hadith-9",
    number: 9,
    title: "ثلاث من كنّ فيه وجد حلاوة الإيمان",
    narrator: "أنس بن مالك رضي الله عنه",
    text: "«ثَلَاثٌ مَنْ كُنَّ فِيهِ وَجَدَ حَلَاوَةَ الإِيمَانِ: أَنْ يَكُونَ اللَّهُ وَرَسُولُهُ أَحَبَّ إِلَيْهِ مِمَّا سِوَاهُمَا، وَأَنْ يُحِبَّ المَرْءَ لَا يُحِبُّهُ إِلَّا لِلَّهِ، وَأَنْ يَكْرَهَ أَنْ يَعُودَ فِي الكُفْرِ كَمَا يَكْرَهُ أَنْ يُقْذَفَ فِي النَّارِ».",
    explanation:
      "للإيمان لذة وطمأنينة في القلب يتذوقها من قدّم محبة الله ورسوله ﷺ على كل محبوب، وأخلص مودته لإخوانه في الله، وثبت على دينه.",
    category: "العقيدة والإيمان",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-10",
    number: 10,
    title: "عجباً لأمر المؤمن بين الصبر والشكر",
    narrator: "صهيب بن سنان الرومي رضي الله عنه",
    text: "«عَجَبًا لِأَمْرِ المُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ: إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ».",
    explanation:
      "المؤمن في ربح دائم في جميع أحواله؛ ففي النعمة والرخاء ينال أجر الشاكرين، وفي البلاء والشدة ينال أجر الصابرين المحتسبين.",
    category: "العقيدة والإيمان",
    source: "رواه مسلم",
    grade: "صحيح",
  },
  {
    id: "hadith-11",
    number: 11,
    title: "حسن الظن بالله والتقرب إليه",
    narrator: "أبو هريرة رضي الله عنه",
    text: "قَالَ اللَّهُ تَعَالَى: «أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي، فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي، وَإِنْ ذَكَرَنِي فِي مَلَإٍ ذَكَرْتُهُ فِي مَلَإٍ خَيْرٍ مِنْهُمْ، وَإِنْ تَقَرَّبَ إِلَيَّ شِبْرًا تَقَرَّبْتُ إِلَيْهِ ذِرَاعًا، وَإِنْ تَقَرَّبَ إِلَيَّ ذِرَاعًا تَقَرَّبْتُ إِلَيْهِ بَاعًا، وَإِنْ أَتَانِي يَمْشِي أَتَيْتُهُ هَرْوَلَةً».",
    explanation:
      "حديث قدسي عظيم يبعث الرجاء وحسن الظن بالله، ويبيّن سعة فضل الله وكرمه ومضاعفته للثواب لمن أقبل عليه بالذكر والطاعة.",
    category: "العقيدة والإيمان",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-12",
    number: 12,
    title: "المؤمن القوي خير وأحب إلى الله",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«المُؤْمِنُ القَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ المُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ، احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ، وَإِنْ أَصَابَكَ شَيْءٌ فَلَا تَقُلْ: لَوْ أَنِّي فَعَلْتُ كَانَ كَذَا وَكَذَا، وَلَكِنْ قُلْ: قَدَرُ اللَّهِ وَمَا شَاءَ فَعَلَ؛ فَإِنَّ (لَوْ) تَفْتَحُ عَمَلَ الشَّيْطَانِ».",
    explanation:
      "يجمع الحديث بين الأخذ بالأسباب النافعة بهمة عالية، والاستعانة بالله، والتسليم لقضاء الله بعد بذل الجهد دون تحسّر أو جزع.",
    category: "العقيدة والإيمان",
    source: "رواه مسلم",
    grade: "صحيح",
  },

  // 3. الأخلاق والآداب الإسلامية (6 أحاديث)
  {
    id: "hadith-13",
    number: 13,
    title: "تقوى الله وحسن الخلق",
    narrator: "أبو ذر الغفاري ومعاذ بن جبل رضي الله عنهما",
    text: "«اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ».",
    explanation:
      "جمعت هذه الوصية النبوية حقوق الله وحقوق العباد: تقوى الله في السر والعلن، ومبادرة الذنب بالتوبة والعمل الصالح الماحي للخطايا، ومعاملة الناس ببشاشة ولين وإحسان.",
    category: "الأخلاق والآداب الإسلامية",
    source: "رواه الترمذي وقال: حديث حسن صحيح • الأربعون النووية",
    grade: "حسن صحيح",
  },
  {
    id: "hadith-14",
    number: 14,
    title: "الوصية بترك الغضب",
    narrator: "أبو هريرة رضي الله عنه",
    text: "أَنَّ رَجُلًا قَالَ لِلنَّبِيِّ ﷺ: أَوْصِنِي، قَالَ: «لَا تَغْضَبْ» فَرَدَّدَ مِرَارًا، قَالَ: «لَا تَغْضَبْ».",
    explanation:
      "يرشد النبي ﷺ إلى ضبط النفس والحلم عند الغضب، وتجنب أسبابه، لأن الغضب مفتاح لكثير من الشرور في الأقوال والأفعال والخصومات.",
    category: "الأخلاق والآداب الإسلامية",
    source: "رواه البخاري • الأربعون النووية",
    grade: "صحيح",
  },
  {
    id: "hadith-15",
    number: 15,
    title: "البرّ حسن الخلق",
    narrator: "النواس بن سمعان الأنصاري رضي الله عنه",
    text: "«البِرُّ حُسْنُ الخُلُقِ، وَالإِثْمُ مَا حَاكَ فِي نَفْسِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ».",
    explanation:
      "أعظم خصال البر جماعها حسن الخلق مع الله ومع الخلق، وعلامة الإثم لصاحب الفطرة السليمة ما تردّد في الصدر وأقلق الضمير وكره الإنسان أن يراه عليه الناس.",
    category: "الأخلاق والآداب الإسلامية",
    source: "رواه مسلم • الأربعون النووية",
    grade: "صحيح",
  },
  {
    id: "hadith-16",
    number: 16,
    title: "الكلمة الطيبة وإكرام الضيف والجار",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ».",
    explanation:
      "من ثمار الإيمان الصادق حفظ اللسان فلا ينطق إلا بخير أو يصمت عن الشر، والإحسان إلى الجار وكف الأذى عنه، وبشاشة الوجه وإكرام الضيف.",
    category: "الأخلاق والآداب الإسلامية",
    source: "متفق عليه (رواه البخاري ومسلم) • الأربعون النووية",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-17",
    number: 17,
    title: "الصدق يهدي إلى البر والجنة",
    narrator: "عبد الله بن مسعود رضي الله عنه",
    text: "«عَلَيْكُمْ بِالصِّدْقِ، فَإِنَّ الصِّدْقَ يَهْدِي إِلَى البِرِّ، وَإِنَّ البِرَّ يَهْدِي إِلَى الجَنَّةِ، وَمَا يَزَالُ الرَّجُلُ يَصْدُقُ وَيَتَحَرَّى الصِّدْقَ حَتَّى يُكْتَبَ عِنْدَ اللَّهِ صِدِّيقًا، وَإِيَّاكُمْ وَالكَذِبَ، فَإِنَّ الكَذِبَ يَهْدِي إِلَى الفُجُورِ، وَإِنَّ الفُجُورَ يَهْدِي إِلَى النَّارِ».",
    explanation:
      "الصدق في الأقوال والأفعال والنيات طريق موصل إلى كل عمل صالح وإلى نيل منزلة الصديقية والجنة، بينما الكذب بريد الفجور والهلاك.",
    category: "الأخلاق والآداب الإسلامية",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-18",
    number: 18,
    title: "الرفق ما كان في شيء إلا زانه",
    narrator: "أم المؤمنين عائشة رضي الله عنها",
    text: "«إِنَّ الرِّفْقَ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ، وَلَا يُنْزَعُ مِنْ شَيْءٍ إِلَّا شَانَهُ».",
    explanation:
      "الرفق واللين والتيسير في الدعوة والتعليم والمعاملة يجمّل الأمور ويبارك في ثمارها، أما العنف والغلظة فيفسدان المقاصد وينفّران القلوب.",
    category: "الأخلاق والآداب الإسلامية",
    source: "رواه مسلم",
    grade: "صحيح",
  },

  // 4. العبادات وفضائل الأعمال (6 أحاديث)
  {
    id: "hadith-19",
    number: 19,
    title: "الطهور شطر الإيمان وفضل الذكر والصلاة والصدقة",
    narrator: "أبو مالك الأشعري رضي الله عنه",
    text: "«الطُّهُورُ شَطْرُ الإِيمَانِ، وَالحَمْدُ لِلَّهِ تَمْلَأُ المِيزَانَ، وَسُبْحَانَ اللَّهِ وَالحَمْدُ لِلَّهِ تَمْلَآنِ -أَوْ تَمْلَأُ- مَا بَيْنَ السَّمَاوَاتِ وَالأَرْضِ، وَالصَّلَاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ، كُلُّ النَّاسِ يَغْدُو فَبَايِعٌ نَفْسَهُ فَمُعْتِقُهَا أَوْ مُوبِقُهَا».",
    explanation:
      "حديث جامع لأبواب الخير العظام: الطهارة الحسية والمعنوية، وعظيم أجر التحميد والتسبيح في الميزان، ونور الصلاة وبرهان الصدقة، والعمل بالقرآن الكريم.",
    category: "العبادات وفضائل الأعمال",
    source: "رواه مسلم • الأربعون النووية",
    grade: "صحيح",
  },
  {
    id: "hadith-20",
    number: 20,
    title: "خيركم من تعلّم القرآن وعلّمه",
    narrator: "عثمان بن عفان رضي الله عنه",
    text: "«خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ».",
    explanation:
      "بيان شرف أهل القرآن الذين يجمعون بين تعلّم تلاوته وتدبر معانيه والعمل به، وتعليمه للناس ابتغاء وجه الله تعالى.",
    category: "العبادات وفضائل الأعمال",
    source: "رواه البخاري",
    grade: "صحيح",
  },
  {
    id: "hadith-21",
    number: 21,
    title: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي المِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ».",
    explanation:
      "ختم الإمام البخاري صحيحه بهذا الحديث العظيم ترغيباً في المداومة على تسبيح الله وحمده وتعظيمه لسهولة النطق به وعظيم ثقله في ميزان الحسنات.",
    category: "العبادات وفضائل الأعمال",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-22",
    number: 22,
    title: "أحب الأعمال إلى الله أدومها وإن قلّ",
    narrator: "أم المؤمنين عائشة رضي الله عنها",
    text: "«يَا أَيُّهَا النَّاسُ خُذُوا مِنَ الأَعْمَالِ مَا تُطِيقُونَ، فَإِنَّ اللَّهَ لَا يَمَلُّ حَتَّى تَمَلُّوا، وَإِنَّ أَحَبَّ الأَعْمَالِ إِلَى اللَّهِ مَا دَامَ وَإِنْ قَلَّ».",
    explanation:
      "القليل الدائم من الطاعات والذكر والورد اليومي خير وأحب إلى الله من الكثير المنقطع، لأنه يديم صلة العبد بربه بغير انقطاع ولا سآمة.",
    category: "العبادات وفضائل الأعمال",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-23",
    number: 23,
    title: "انقطاع عمل الإنسان إلا من ثلاث (الصدقة الجارية والعلم والولد الصالح)",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ».",
    explanation:
      "يحث الحديث على ترك أثر مبارك يجري ثوابه للعبد بعد وفاته: وقف أو صدقة مستمرة النفع، أو نشر علم نافع، أو تربية ذرية صالحة تدعو لوالديها.",
    category: "العبادات وفضائل الأعمال",
    source: "رواه مسلم",
    grade: "صحيح",
  },
  {
    id: "hadith-24",
    number: 24,
    title: "سبعة يظلّهم الله في ظلّه يوم القيامة",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«سَبْعَةٌ يُظِلُّهُمُ اللَّهُ فِي ظِلِّهِ يَوْمَ لَا ظِلَّ إِلَّا ظِلُّهُ: الإِمَامُ العَادِلُ، وَشَابٌّ نَشَأَ فِي عِبَادَةِ رَبِّهِ، وَرَجُلٌ قَلْبُهُ مُعَلَّقٌ فِي المَسَاجِدِ، وَرَجُلَانِ تَحَابَّا فِي اللَّهِ اجْتَمَعَا عَلَيْهِ وَتَفَرَّقَا عَلَيْهِ، وَرَجُلٌ طَلَبَتْهُ امْرَأَةٌ ذَاتُ مَنْصِبٍ وَجَمَالٍ فَقَالَ: إِنِّي أَخَافُ اللَّهَ، وَرَجُلٌ تَصَدَّقَ بِصَدَقَةٍ فَأَخْفَاهَا حَتَّى لَا تَعْلَمَ شِمَالُهُ مَا تُنْفِقُ يَمِينُهُ، وَرَجُلٌ ذَكَرَ اللَّهَ خَالِيًا فَفَاضَتْ عَيْنَاهُ».",
    explanation:
      "يبشّر الحديث بكرامة عظيمة يوم القيامة لأهل العدل، والشباب المستقيمين على الطاعة، والمحبين للمساجد، والمتحابين في الله، وأهل العفة، والمخلصين في الصدقة والذكر.",
    category: "العبادات وفضائل الأعمال",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },

  // 5. الرقائق والزهد والورع (6 أحاديث)
  {
    id: "hadith-25",
    number: 25,
    title: "من حسن إسلام المرء تركه ما لا يعنيه",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«مِنْ حُسْنِ إِسْلَامِ المَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ».",
    explanation:
      "أصل عظيم في حفظ الوقت واللسان والقلب، فالمؤمن الموفّق يشتغل بما ينفعه في دينه ودنياه، ويعرض عن فضول الكلام والتدخل فيما لا شأن له به.",
    category: "الرقائق والزهد والورع",
    source: "رواه الترمذي وابن ماجه • الأربعون النووية",
    grade: "حسن",
  },
  {
    id: "hadith-26",
    number: 26,
    title: "ازهد في الدنيا يحبّك الله",
    narrator: "سهل بن سعد الساعدي رضي الله عنه",
    text: "جَاءَ رَجُلٌ إِلَى النَّبِيِّ ﷺ فَقَالَ: يَا رَسُولَ اللَّهِ، دُلَّنِي عَلَى عَمَلٍ إِذَا عَمِلْتُهُ أَحَبَّنِي اللَّهُ وَأَحَبَّنِي النَّاسُ؛ فَقَالَ: «ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبَّكَ النَّاسُ».",
    explanation:
      "الزهد الحقيقي هو خلوّ القلب من التعلق بالدنيا مع جعلها في اليد لخدمة الآخرة، والاستغناء عما في أيدي الناس بالعفة والقناعة مما يورث محبة الله وتقدير الخلق.",
    category: "الرقائق والزهد والورع",
    source: "رواه ابن ماجه وغيره • الأربعون النووية",
    grade: "حسن",
  },
  {
    id: "hadith-27",
    number: 27,
    title: "كن في الدنيا كأنك غريب أو عابر سبيل",
    narrator: "عبد الله بن عمر رضي الله عنهما",
    text: "أَخَذَ رَسُولُ اللَّهِ ﷺ بِمَنْكِبِي فَقَالَ: «كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ». وَكَانَ ابْنُ عُمَرَ يَقُولُ: «إِذَا أَمْسَيْتَ فَلَا تَنْتَظِرِ الصَّبَاحَ، وَإِذَا أَصْبَحْتَ فَلَا تَنْتَظِرِ المَسَاءَ، وَخُذْ مِنْ صِحَّتِكَ لِمَرَضِكَ، وَمِنْ حَيَاتِكَ لِمَوْتِكَ».",
    explanation:
      "يوقظ الحديث القلب لاغتنام الأعمار والأوقات وعدم التسويف، والتزود بالعمل الصالح في حال الصحة والعافية قبل حلول العوارض والأجل.",
    category: "الرقائق والزهد والورع",
    source: "رواه البخاري • الأربعون النووية",
    grade: "صحيح",
  },
  {
    id: "hadith-28",
    number: 28,
    title: "نعمتان مغبون فيهما كثير من الناس: الصحة والفراغ",
    narrator: "عبد الله بن عباس رضي الله عنهما",
    text: "«نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالفَرَاغُ».",
    explanation:
      "الصحة في البدن والفراغ في الوقت رأس مال المؤمن، ومن ضيّعهما دون طاعة أو عمل نافع فقد خسر غنيمة عظيمة لا تُعوّض.",
    category: "الرقائق والزهد والورع",
    source: "رواه البخاري",
    grade: "صحيح",
  },
  {
    id: "hadith-29",
    number: 29,
    title: "الغنى غنى النفس",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«لَيْسَ الغِنَى عَنْ كَثْرَةِ العَرَضِ، وَلَكِنَّ الغِنَى غِنَى النَّفْسِ».",
    explanation:
      "الغنى الحقيقي ليس بكثرة الأموال والمتاع مع الحرص والطمع، بل هو رضا القلب وقناعته بما قسم الله له وطمأنينته.",
    category: "الرقائق والزهد والورع",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-30",
    number: 30,
    title: "إن الله لا ينظر إلى صوركم وأموالكم ولكن ينظر إلى قلوبكم وأعمالكم",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ».",
    explanation:
      "ميزان التفاضل عند الله سبحانه هو نقاء القلب وتقواه وإخلاصه، وصلاح العمل، لا المظاهر الدنيوية أو الأموال والمناصب.",
    category: "الرقائق والزهد والورع",
    source: "رواه مسلم",
    grade: "صحيح",
  },

  // 6. الأسرة والمعاملات والتكافل (6 أحاديث)
  {
    id: "hadith-31",
    number: 31,
    title: "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه",
    narrator: "أنس بن مالك رضي الله عنه",
    text: "«لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ».",
    explanation:
      "من كمال الإيمان سلامة الصدر من الحسد والغل، ومحبة الخير والنفع لجميع المسلمين كما يحبه المرء لنفسه.",
    category: "الأسرة والمعاملات والتكافل",
    source: "متفق عليه (رواه البخاري ومسلم) • الأربعون النووية",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-32",
    number: 32,
    title: "من نفّس عن مؤمن كربة والله في عون العبد",
    narrator: "أبو هريرة رضي الله عنه",
    text: "«مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ القِيَامَةِ، وَمَنْ يَسَّرَ عَلَى مُعْسِرٍ يَسَّرَ اللَّهُ عَلَيْهِ فِي الدُّنْيَا وَالآخِرَةِ، وَمَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ فِي الدُّنْيَا وَالآخِرَةِ، وَاللَّهُ فِي عَوْنِ العَبْدِ مَا كَانَ العَبْدُ فِي عَوْنِ أَخِيهِ».",
    explanation:
      "الجزاء من جنس العمل؛ فمن فرّج عن الناس همومهم ويسّر على المعسرين وستر عوراتهم وأعانهم، تولّى الله عونه وستره وتفريج كرباته في الدنيا والآخرة.",
    category: "الأسرة والمعاملات والتكافل",
    source: "رواه مسلم • الأربعون النووية",
    grade: "صحيح",
  },
  {
    id: "hadith-33",
    number: 33,
    title: "المسلم من سلم المسلمون من لسانه ويده",
    narrator: "عبد الله بن عمرو بن العاص رضي الله عنهما",
    text: "«المُسْلِمُ مَنْ سَلِمَ المُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ».",
    explanation:
      "المسلم الكامل هو من أمن الناس جانبه فلم يؤذهم بلسانه (بغيبة أو شتم أو سخرية) ولا بيده، وهجر المعاصي والذنوب.",
    category: "الأسرة والمعاملات والتكافل",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-34",
    number: 34,
    title: "مَثَل المؤمنين في توادّهم وتراحمهم وتعاطفهم",
    narrator: "النعمان بن بشير رضي الله عنهما",
    text: "«مَثَلُ المُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الجَسَدِ؛ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الجَسَدِ بِالسَّهَرِ وَالحُمَّى».",
    explanation:
      "تصوير بليغ لوحدة الأمة الإسلامية وتكافلها، حيث يشعر المؤمن بآلام إخوانه وحاجاتهم ويسعى في مواساتهم ونصرتهم.",
    category: "الأسرة والمعاملات والتكافل",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-35",
    number: 35,
    title: "عظيم حق الوالدين وأحق الناس بحسن الصحبة",
    narrator: "أبو هريرة رضي الله عنه",
    text: "جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ ﷺ فَقَالَ: يَا رَسُولَ اللَّهِ، مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: «أُمُّكَ» قَالَ: ثُمَّ مَنْ؟ قَالَ: «ثُمَّ أُمُّكَ» قَالَ: ثُمَّ مَنْ؟ قَالَ: «ثُمَّ أُمُّكَ» قَالَ: ثُمَّ مَنْ؟ قَالَ: «ثُمَّ أَبُوكَ».",
    explanation:
      "بيان عظيم منزلة بر الوالدين في الإسلام، وتخصيص الأم بثلاث مراتب لعظم ما تحمّلته من مشقة الحمل والولادة والإرضاع والتربية، يليها حق الأب.",
    category: "الأسرة والمعاملات والتكافل",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
  {
    id: "hadith-36",
    number: 36,
    title: "فضل صلة الرحم والبركة في الرزق والعمر",
    narrator: "أنس بن مالك رضي الله عنه",
    text: "«مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ، وَيُنْسَأَ لَهُ فِي أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ».",
    explanation:
      "صلة الأقارب والأرحام بالزيارة والتفقد والإحسان سبب عظيم لبسط الرزق وحلول البركة في العمر والذكر الحسن.",
    category: "الأسرة والمعاملات والتكافل",
    source: "متفق عليه (رواه البخاري ومسلم)",
    grade: "صحيح (متفق عليه)",
  },
];
