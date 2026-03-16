export type Commune = { code: string; name: string; nameAr: string; nameFr: string };
export type Wilaya = {
  code: string;
  name: string;
  nameAr: string;
  nameFr: string;
  communes: Commune[];
};

export const WILAYAS: Wilaya[] = [
  {
    code: "01", name: "Adrar", nameAr: "أدرار", nameFr: "Adrar",
    communes: [
      { code: "01001", name: "Adrar", nameAr: "أدرار", nameFr: "Adrar" },
      { code: "01002", name: "Tamest", nameAr: "تامست", nameFr: "Tamest" },
      { code: "01003", name: "Charouine", nameAr: "شروين", nameFr: "Charouine" },
      { code: "01004", name: "Reggane", nameAr: "رقان", nameFr: "Reggane" },
      { code: "01005", name: "In Zghmir", nameAr: "إن زغمير", nameFr: "In Zghmir" },
      { code: "01006", name: "Tit", nameAr: "تيت", nameFr: "Tit" },
      { code: "01007", name: "Ksar Kaddour", nameAr: "قصر قدور", nameFr: "Ksar Kaddour" },
      { code: "01008", name: "Tsabit", nameAr: "تسابيت", nameFr: "Tsabit" },
      { code: "01009", name: "Timimoun", nameAr: "تيميمون", nameFr: "Timimoun" },
      { code: "01010", name: "Ouled Said", nameAr: "أولاد سعيد", nameFr: "Ouled Said" },
    ],
  },
  {
    code: "02", name: "Chlef", nameAr: "الشلف", nameFr: "Chlef",
    communes: [
      { code: "02001", name: "Chlef", nameAr: "الشلف", nameFr: "Chlef" },
      { code: "02002", name: "Teniet El Had", nameAr: "تنيت الحد", nameFr: "Teniet El Had" },
      { code: "02003", name: "Taougrite", nameAr: "تاوقريت", nameFr: "Taougrite" },
      { code: "02004", name: "Beni Haoua", nameAr: "بني حواء", nameFr: "Beni Haoua" },
      { code: "02005", name: "Sobha", nameAr: "الصبحة", nameFr: "Sobha" },
      { code: "02006", name: "Sendjas", nameAr: "سنجاس", nameFr: "Sendjas" },
      { code: "02007", name: "Talassa", nameAr: "طالسة", nameFr: "Talassa" },
      { code: "02008", name: "Oued Goussine", nameAr: "وادي قوسين", nameFr: "Oued Goussine" },
    ],
  },
  {
    code: "03", name: "Laghouat", nameAr: "الأغواط", nameFr: "Laghouat",
    communes: [
      { code: "03001", name: "Laghouat", nameAr: "الأغواط", nameFr: "Laghouat" },
      { code: "03002", name: "Ksar El Hirane", nameAr: "قصر الحيران", nameFr: "Ksar El Hirane" },
      { code: "03003", name: "Bennasser Ben Chohra", nameAr: "بن ناصر بن شهرة", nameFr: "Bennasser Ben Chohra" },
      { code: "03004", name: "Sidi Makhlouf", nameAr: "سيدي مخلوف", nameFr: "Sidi Makhlouf" },
      { code: "03005", name: "Hassi Delaa", nameAr: "حاسي دلاعة", nameFr: "Hassi Delaa" },
      { code: "03006", name: "Hassi R'mel", nameAr: "حاسي الرمل", nameFr: "Hassi R'mel" },
      { code: "03007", name: "Ain Madhi", nameAr: "عين ماضي", nameFr: "Ain Madhi" },
      { code: "03008", name: "Tadjmout", nameAr: "تاجموت", nameFr: "Tadjmout" },
    ],
  },
  {
    code: "04", name: "Oum El Bouaghi", nameAr: "أم البواقي", nameFr: "Oum El Bouaghi",
    communes: [
      { code: "04001", name: "Oum El Bouaghi", nameAr: "أم البواقي", nameFr: "Oum El Bouaghi" },
      { code: "04002", name: "Ain Beida", nameAr: "عين البيضاء", nameFr: "Ain Beida" },
      { code: "04003", name: "Ain M'lila", nameAr: "عين مليلة", nameFr: "Ain M'lila" },
      { code: "04004", name: "Behir Chergui", nameAr: "بحير الشرقي", nameFr: "Behir Chergui" },
      { code: "04005", name: "Ksar Sbahi", nameAr: "قصر الصباحي", nameFr: "Ksar Sbahi" },
      { code: "04006", name: "Hanchir Toumghani", nameAr: "هنشير تومغني", nameFr: "Hanchir Toumghani" },
      { code: "04007", name: "El Amiria", nameAr: "الأميرية", nameFr: "El Amiria" },
    ],
  },
  {
    code: "05", name: "Batna", nameAr: "باتنة", nameFr: "Batna",
    communes: [
      { code: "05001", name: "Batna", nameAr: "باتنة", nameFr: "Batna" },
      { code: "05002", name: "Ghassira", nameAr: "الغسيرة", nameFr: "Ghassira" },
      { code: "05003", name: "Merouana", nameAr: "مروانة", nameFr: "Merouana" },
      { code: "05004", name: "Seriana", nameAr: "سريانة", nameFr: "Seriana" },
      { code: "05005", name: "Menaa", nameAr: "منعة", nameFr: "Menaa" },
      { code: "05006", name: "El Madher", nameAr: "المادر", nameFr: "El Madher" },
      { code: "05007", name: "Tazoult", nameAr: "تازولت", nameFr: "Tazoult" },
      { code: "05008", name: "N'gaous", nameAr: "نقاوس", nameFr: "N'gaous" },
      { code: "05009", name: "Ain Touta", nameAr: "عين التوتة", nameFr: "Ain Touta" },
      { code: "05010", name: "Barika", nameAr: "بريكة", nameFr: "Barika" },
    ],
  },
  {
    code: "06", name: "Béjaïa", nameAr: "بجاية", nameFr: "Béjaïa",
    communes: [
      { code: "06001", name: "Béjaïa", nameAr: "بجاية", nameFr: "Béjaïa" },
      { code: "06002", name: "Amizour", nameAr: "أميزور", nameFr: "Amizour" },
      { code: "06003", name: "Ferraoun", nameAr: "فرعون", nameFr: "Ferraoun" },
      { code: "06004", name: "Taourirt Ighil", nameAr: "تاوريرت إغيل", nameFr: "Taourirt Ighil" },
      { code: "06005", name: "Chelata", nameAr: "شلاطة", nameFr: "Chelata" },
      { code: "06006", name: "Akbou", nameAr: "أقبو", nameFr: "Akbou" },
      { code: "06007", name: "Sidi Aich", nameAr: "سيدي عيش", nameFr: "Sidi Aich" },
      { code: "06008", name: "El Kseur", nameAr: "القصر", nameFr: "El Kseur" },
      { code: "06009", name: "Kherrata", nameAr: "خراطة", nameFr: "Kherrata" },
    ],
  },
  {
    code: "07", name: "Biskra", nameAr: "بسكرة", nameFr: "Biskra",
    communes: [
      { code: "07001", name: "Biskra", nameAr: "بسكرة", nameFr: "Biskra" },
      { code: "07002", name: "Oued Djellal", nameAr: "وادي جلال", nameFr: "Oued Djellal" },
      { code: "07003", name: "Ras El Miad", nameAr: "رأس الميعاد", nameFr: "Ras El Miad" },
      { code: "07004", name: "Sidi Khaled", nameAr: "سيدي خالد", nameFr: "Sidi Khaled" },
      { code: "07005", name: "Tolga", nameAr: "طولقة", nameFr: "Tolga" },
      { code: "07006", name: "Foughala", nameAr: "فوغالة", nameFr: "Foughala" },
      { code: "07007", name: "Ouled Djellal", nameAr: "أولاد جلال", nameFr: "Ouled Djellal" },
    ],
  },
  {
    code: "08", name: "Béchar", nameAr: "بشار", nameFr: "Béchar",
    communes: [
      { code: "08001", name: "Béchar", nameAr: "بشار", nameFr: "Béchar" },
      { code: "08002", name: "Erg Ferradj", nameAr: "عرق فراج", nameFr: "Erg Ferradj" },
      { code: "08003", name: "Lahmar", nameAr: "لحمر", nameFr: "Lahmar" },
      { code: "08004", name: "Beni Ounif", nameAr: "بني ونيف", nameFr: "Beni Ounif" },
      { code: "08005", name: "Abadla", nameAr: "العبادلة", nameFr: "Abadla" },
      { code: "08006", name: "Kenadsa", nameAr: "قنادسة", nameFr: "Kenadsa" },
    ],
  },
  {
    code: "09", name: "Blida", nameAr: "البليدة", nameFr: "Blida",
    communes: [
      { code: "09001", name: "Blida", nameAr: "البليدة", nameFr: "Blida" },
      { code: "09002", name: "Chiffa", nameAr: "الشفة", nameFr: "Chiffa" },
      { code: "09003", name: "Meftah", nameAr: "مفتاح", nameFr: "Meftah" },
      { code: "09004", name: "Bougara", nameAr: "بوقرة", nameFr: "Bougara" },
      { code: "09005", name: "Boufarik", nameAr: "بوفاريك", nameFr: "Boufarik" },
      { code: "09006", name: "Larba", nameAr: "الأربعاء", nameFr: "Larba" },
      { code: "09007", name: "Ouled Yaich", nameAr: "أولاد يعيش", nameFr: "Ouled Yaich" },
      { code: "09008", name: "Ain Romana", nameAr: "عين الرمانة", nameFr: "Ain Romana" },
    ],
  },
  {
    code: "10", name: "Bouira", nameAr: "البويرة", nameFr: "Bouira",
    communes: [
      { code: "10001", name: "Bouira", nameAr: "البويرة", nameFr: "Bouira" },
      { code: "10002", name: "Ain Bessem", nameAr: "عين بسام", nameFr: "Ain Bessem" },
      { code: "10003", name: "Ain El Hadjar", nameAr: "عين الحجر", nameFr: "Ain El Hadjar" },
      { code: "10004", name: "Bordj Okhriss", nameAr: "برج اوخريص", nameFr: "Bordj Okhriss" },
      { code: "10005", name: "Bechloul", nameAr: "بشلول", nameFr: "Bechloul" },
      { code: "10006", name: "Kadiria", nameAr: "القديرية", nameFr: "Kadiria" },
      { code: "10007", name: "Lakhdaria", nameAr: "الأخضرية", nameFr: "Lakhdaria" },
    ],
  },
  {
    code: "11", name: "Tamanrasset", nameAr: "تمنراست", nameFr: "Tamanrasset",
    communes: [
      { code: "11001", name: "Tamanrasset", nameAr: "تمنراست", nameFr: "Tamanrasset" },
      { code: "11002", name: "Abalessa", nameAr: "أبلسة", nameFr: "Abalessa" },
      { code: "11003", name: "In Ghar", nameAr: "إن غار", nameFr: "In Ghar" },
      { code: "11004", name: "In Guezzam", nameAr: "إن قزام", nameFr: "In Guezzam" },
      { code: "11005", name: "Idles", nameAr: "إيدلس", nameFr: "Idles" },
    ],
  },
  {
    code: "12", name: "Tébessa", nameAr: "تبسة", nameFr: "Tébessa",
    communes: [
      { code: "12001", name: "Tébessa", nameAr: "تبسة", nameFr: "Tébessa" },
      { code: "12002", name: "Bir El Ater", nameAr: "بئر العاتر", nameFr: "Bir El Ater" },
      { code: "12003", name: "Cheria", nameAr: "الشريعة", nameFr: "Cheria" },
      { code: "12004", name: "Ouenza", nameAr: "الونزة", nameFr: "Ouenza" },
      { code: "12005", name: "Morsott", nameAr: "مرسط", nameFr: "Morsott" },
      { code: "12006", name: "El Ogla", nameAr: "العقلة", nameFr: "El Ogla" },
      { code: "12007", name: "Negrine", nameAr: "نقرين", nameFr: "Negrine" },
    ],
  },
  {
    code: "13", name: "Tlemcen", nameAr: "تلمسان", nameFr: "Tlemcen",
    communes: [
      { code: "13001", name: "Tlemcen", nameAr: "تلمسان", nameFr: "Tlemcen" },
      { code: "13002", name: "Nedroma", nameAr: "ندرومة", nameFr: "Nedroma" },
      { code: "13003", name: "Ghazaouet", nameAr: "الغزوات", nameFr: "Ghazaouet" },
      { code: "13004", name: "Remchi", nameAr: "رمشي", nameFr: "Remchi" },
      { code: "13005", name: "Beni Saf", nameAr: "بني صاف", nameFr: "Beni Saf" },
      { code: "13006", name: "Ain Temouchent", nameAr: "عين تيموشنت", nameFr: "Ain Temouchent" },
      { code: "13007", name: "Sebdou", nameAr: "سبدو", nameFr: "Sebdou" },
      { code: "13008", name: "Maghnia", nameAr: "مغنية", nameFr: "Maghnia" },
    ],
  },
  {
    code: "14", name: "Tiaret", nameAr: "تيارت", nameFr: "Tiaret",
    communes: [
      { code: "14001", name: "Tiaret", nameAr: "تيارت", nameFr: "Tiaret" },
      { code: "14002", name: "Frenda", nameAr: "فرندة", nameFr: "Frenda" },
      { code: "14003", name: "Mahdia", nameAr: "مهدية", nameFr: "Mahdia" },
      { code: "14004", name: "Rahouia", nameAr: "رحوية", nameFr: "Rahouia" },
      { code: "14005", name: "Sougueur", nameAr: "سوقر", nameFr: "Sougueur" },
      { code: "14006", name: "Ain Deheb", nameAr: "عين الذهب", nameFr: "Ain Deheb" },
      { code: "14007", name: "Ksar Chellala", nameAr: "قصر الشلالة", nameFr: "Ksar Chellala" },
    ],
  },
  {
    code: "15", name: "Tizi Ouzou", nameAr: "تيزي وزو", nameFr: "Tizi Ouzou",
    communes: [
      { code: "15001", name: "Tizi Ouzou", nameAr: "تيزي وزو", nameFr: "Tizi Ouzou" },
      { code: "15002", name: "Ain El Hammam", nameAr: "عين الحمام", nameFr: "Ain El Hammam" },
      { code: "15003", name: "Azazga", nameAr: "عزازقة", nameFr: "Azazga" },
      { code: "15004", name: "Beni Yenni", nameAr: "بني يني", nameFr: "Beni Yenni" },
      { code: "15005", name: "Boghni", nameAr: "بوغني", nameFr: "Boghni" },
      { code: "15006", name: "Draa El Mizan", nameAr: "ذراع الميزان", nameFr: "Draa El Mizan" },
      { code: "15007", name: "Maatka", nameAr: "معاتقة", nameFr: "Maatka" },
      { code: "15008", name: "Tigzirt", nameAr: "تيقزيرت", nameFr: "Tigzirt" },
    ],
  },
  {
    code: "16", name: "Alger", nameAr: "الجزائر", nameFr: "Alger",
    communes: [
      { code: "16001", name: "Alger Centre", nameAr: "وسط الجزائر", nameFr: "Alger Centre" },
      { code: "16002", name: "Sidi M'Hamed", nameAr: "سيدي محمد", nameFr: "Sidi M'Hamed" },
      { code: "16003", name: "El Madania", nameAr: "المدنية", nameFr: "El Madania" },
      { code: "16004", name: "Belouizdad", nameAr: "بلوزداد", nameFr: "Belouizdad" },
      { code: "16005", name: "Bab El Oued", nameAr: "باب الوادي", nameFr: "Bab El Oued" },
      { code: "16006", name: "Bologhine", nameAr: "بولوغين", nameFr: "Bologhine" },
      { code: "16007", name: "Casbah", nameAr: "القصبة", nameFr: "Casbah" },
      { code: "16008", name: "Oued Koriche", nameAr: "وادي قريش", nameFr: "Oued Koriche" },
      { code: "16009", name: "Bir Mourad Rais", nameAr: "بئر مراد رايس", nameFr: "Bir Mourad Rais" },
      { code: "16010", name: "El Biar", nameAr: "البيار", nameFr: "El Biar" },
      { code: "16011", name: "Bouzareah", nameAr: "بوزريعة", nameFr: "Bouzareah" },
      { code: "16012", name: "Birkhadem", nameAr: "بئر خادم", nameFr: "Birkhadem" },
      { code: "16013", name: "El Harrach", nameAr: "الحراش", nameFr: "El Harrach" },
      { code: "16014", name: "Baraki", nameAr: "براقي", nameFr: "Baraki" },
      { code: "16015", name: "Hussein Dey", nameAr: "حسين داي", nameFr: "Hussein Dey" },
      { code: "16016", name: "Kouba", nameAr: "القبة", nameFr: "Kouba" },
      { code: "16017", name: "Bachdjerrah", nameAr: "باش جراح", nameFr: "Bachdjerrah" },
      { code: "16018", name: "Dar El Beida", nameAr: "الدار البيضاء", nameFr: "Dar El Beida" },
      { code: "16019", name: "Bab Ezzouar", nameAr: "باب الزوار", nameFr: "Bab Ezzouar" },
      { code: "16020", name: "Ben Aknoun", nameAr: "بن عكنون", nameFr: "Ben Aknoun" },
      { code: "16021", name: "Dely Ibrahim", nameAr: "دالي إبراهيم", nameFr: "Dely Ibrahim" },
      { code: "16022", name: "Hydra", nameAr: "حيدرة", nameFr: "Hydra" },
      { code: "16023", name: "Mohammadia", nameAr: "المحمدية", nameFr: "Mohammadia" },
      { code: "16024", name: "Bordj El Kiffan", nameAr: "برج الكيفان", nameFr: "Bordj El Kiffan" },
      { code: "16025", name: "El Marsa", nameAr: "المرسى", nameFr: "El Marsa" },
      { code: "16026", name: "Aïn Taya", nameAr: "عين طاية", nameFr: "Aïn Taya" },
      { code: "16027", name: "Rouiba", nameAr: "الرويبة", nameFr: "Rouiba" },
      { code: "16028", name: "Reghaia", nameAr: "الرغاية", nameFr: "Reghaia" },
    ],
  },
  {
    code: "17", name: "Djelfa", nameAr: "الجلفة", nameFr: "Djelfa",
    communes: [
      { code: "17001", name: "Djelfa", nameAr: "الجلفة", nameFr: "Djelfa" },
      { code: "17002", name: "Moudjbara", nameAr: "مجبارة", nameFr: "Moudjbara" },
      { code: "17003", name: "El Idrissia", nameAr: "الإدريسية", nameFr: "El Idrissia" },
      { code: "17004", name: "Birine", nameAr: "بيرين", nameFr: "Birine" },
      { code: "17005", name: "Ain Oussera", nameAr: "عين وسارة", nameFr: "Ain Oussera" },
      { code: "17006", name: "Messaad", nameAr: "مسعد", nameFr: "Messaad" },
      { code: "17007", name: "Selmana", nameAr: "سلمانة", nameFr: "Selmana" },
    ],
  },
  {
    code: "18", name: "Jijel", nameAr: "جيجل", nameFr: "Jijel",
    communes: [
      { code: "18001", name: "Jijel", nameAr: "جيجل", nameFr: "Jijel" },
      { code: "18002", name: "El Aouana", nameAr: "العوانة", nameFr: "El Aouana" },
      { code: "18003", name: "Ziama Mansouriah", nameAr: "زيامة منصورية", nameFr: "Ziama Mansouriah" },
      { code: "18004", name: "Taher", nameAr: "الطاهير", nameFr: "Taher" },
      { code: "18005", name: "Chekfa", nameAr: "الشقفة", nameFr: "Chekfa" },
      { code: "18006", name: "El Milia", nameAr: "الميلية", nameFr: "El Milia" },
    ],
  },
  {
    code: "19", name: "Sétif", nameAr: "سطيف", nameFr: "Sétif",
    communes: [
      { code: "19001", name: "Sétif", nameAr: "سطيف", nameFr: "Sétif" },
      { code: "19002", name: "Ain Oulmane", nameAr: "عين ولمان", nameFr: "Ain Oulmane" },
      { code: "19003", name: "Ain El Kebira", nameAr: "عين الكبيرة", nameFr: "Ain El Kebira" },
      { code: "19004", name: "Bougaa", nameAr: "بوقاعة", nameFr: "Bougaa" },
      { code: "19005", name: "El Eulma", nameAr: "العلمة", nameFr: "El Eulma" },
      { code: "19006", name: "Djemila", nameAr: "جميلة", nameFr: "Djemila" },
      { code: "19007", name: "Kherrata", nameAr: "خراطة", nameFr: "Kherrata" },
      { code: "19008", name: "Beni Aziz", nameAr: "بني عزيز", nameFr: "Beni Aziz" },
      { code: "19009", name: "Guenzet", nameAr: "قنزات", nameFr: "Guenzet" },
    ],
  },
  {
    code: "20", name: "Saïda", nameAr: "سعيدة", nameFr: "Saïda",
    communes: [
      { code: "20001", name: "Saïda", nameAr: "سعيدة", nameFr: "Saïda" },
      { code: "20002", name: "Ain El Hadjar", nameAr: "عين الحجر", nameFr: "Ain El Hadjar" },
      { code: "20003", name: "Youb", nameAr: "يوب", nameFr: "Youb" },
      { code: "20004", name: "Moulay Larbi", nameAr: "مولاي العربي", nameFr: "Moulay Larbi" },
      { code: "20005", name: "Doui Thabet", nameAr: "الدوي ثابت", nameFr: "Doui Thabet" },
    ],
  },
  {
    code: "21", name: "Skikda", nameAr: "سكيكدة", nameFr: "Skikda",
    communes: [
      { code: "21001", name: "Skikda", nameAr: "سكيكدة", nameFr: "Skikda" },
      { code: "21002", name: "Azzaba", nameAr: "عزابة", nameFr: "Azzaba" },
      { code: "21003", name: "Collo", nameAr: "القل", nameFr: "Collo" },
      { code: "21004", name: "El Harrouch", nameAr: "الحروش", nameFr: "El Harrouch" },
      { code: "21005", name: "Ain Kechra", nameAr: "عين قشرة", nameFr: "Ain Kechra" },
      { code: "21006", name: "Ramdane Djamel", nameAr: "رمضان جمال", nameFr: "Ramdane Djamel" },
      { code: "21007", name: "Tamalous", nameAr: "تمالوس", nameFr: "Tamalous" },
    ],
  },
  {
    code: "22", name: "Sidi Bel Abbès", nameAr: "سيدي بلعباس", nameFr: "Sidi Bel Abbès",
    communes: [
      { code: "22001", name: "Sidi Bel Abbès", nameAr: "سيدي بلعباس", nameFr: "Sidi Bel Abbès" },
      { code: "22002", name: "Ras El Ma", nameAr: "رأس الماء", nameFr: "Ras El Ma" },
      { code: "22003", name: "Tessala", nameAr: "تسالة", nameFr: "Tessala" },
      { code: "22004", name: "Sidi Lahcene", nameAr: "سيدي لحسن", nameFr: "Sidi Lahcene" },
      { code: "22005", name: "Telagh", nameAr: "تلاغ", nameFr: "Telagh" },
      { code: "22006", name: "Merine", nameAr: "مرين", nameFr: "Merine" },
    ],
  },
  {
    code: "23", name: "Annaba", nameAr: "عنابة", nameFr: "Annaba",
    communes: [
      { code: "23001", name: "Annaba", nameAr: "عنابة", nameFr: "Annaba" },
      { code: "23002", name: "Ain Berda", nameAr: "عين بردة", nameFr: "Ain Berda" },
      { code: "23003", name: "Chetaïbi", nameAr: "الشطايبي", nameFr: "Chetaïbi" },
      { code: "23004", name: "El Hadjar", nameAr: "الحجار", nameFr: "El Hadjar" },
      { code: "23005", name: "Seraïdi", nameAr: "سرايدي", nameFr: "Seraïdi" },
      { code: "23006", name: "Berrahal", nameAr: "برحال", nameFr: "Berrahal" },
      { code: "23007", name: "Oued El Aneb", nameAr: "وادي العنب", nameFr: "Oued El Aneb" },
      { code: "23008", name: "Tréat", nameAr: "ترعات", nameFr: "Tréat" },
      { code: "23009", name: "Chorfa", nameAr: "الشرفة", nameFr: "Chorfa" },
      { code: "23010", name: "Asfour", nameAr: "عصفور", nameFr: "Asfour" },
      { code: "23011", name: "El Bouni", nameAr: "البوني", nameFr: "El Bouni" },
      { code: "23012", name: "Eulma", nameAr: "العلمة", nameFr: "Eulma" },
    ],
  },
  {
    code: "24", name: "Guelma", nameAr: "قالمة", nameFr: "Guelma",
    communes: [
      { code: "24001", name: "Guelma", nameAr: "قالمة", nameFr: "Guelma" },
      { code: "24002", name: "Bouchegouf", nameAr: "بوشقوف", nameFr: "Bouchegouf" },
      { code: "24003", name: "Héliopolis", nameAr: "إيليوبوليس", nameFr: "Héliopolis" },
      { code: "24004", name: "Ain Makhlouf", nameAr: "عين مخلوف", nameFr: "Ain Makhlouf" },
      { code: "24005", name: "Hammam Maskhoutine", nameAr: "حمام مسخوطين", nameFr: "Hammam Maskhoutine" },
      { code: "24006", name: "Oued Zenati", nameAr: "وادي الزناتي", nameFr: "Oued Zenati" },
    ],
  },
  {
    code: "25", name: "Constantine", nameAr: "قسنطينة", nameFr: "Constantine",
    communes: [
      { code: "25001", name: "Constantine", nameAr: "قسنطينة", nameFr: "Constantine" },
      { code: "25002", name: "El Khroub", nameAr: "الخروب", nameFr: "El Khroub" },
      { code: "25003", name: "Ain Abid", nameAr: "عين عبيد", nameFr: "Ain Abid" },
      { code: "25004", name: "Beni Hamidane", nameAr: "بني حميدان", nameFr: "Beni Hamidane" },
      { code: "25005", name: "Ouled Rahmoune", nameAr: "أولاد رحمون", nameFr: "Ouled Rahmoune" },
      { code: "25006", name: "Ibn Ziad", nameAr: "ابن زياد", nameFr: "Ibn Ziad" },
      { code: "25007", name: "Hamma Bouziane", nameAr: "حامة بوزيان", nameFr: "Hamma Bouziane" },
      { code: "25008", name: "Didouche Mourad", nameAr: "ديدوش مراد", nameFr: "Didouche Mourad" },
    ],
  },
  {
    code: "26", name: "Médéa", nameAr: "المدية", nameFr: "Médéa",
    communes: [
      { code: "26001", name: "Médéa", nameAr: "المدية", nameFr: "Médéa" },
      { code: "26002", name: "Ksar El Boukhari", nameAr: "قصر البخاري", nameFr: "Ksar El Boukhari" },
      { code: "26003", name: "Berrouaghia", nameAr: "بروية", nameFr: "Berrouaghia" },
      { code: "26004", name: "Tablat", nameAr: "تابلاط", nameFr: "Tablat" },
      { code: "26005", name: "Ain Boucif", nameAr: "عين بوسيف", nameFr: "Ain Boucif" },
      { code: "26006", name: "Ouzera", nameAr: "أوزيرة", nameFr: "Ouzera" },
    ],
  },
  {
    code: "27", name: "Mostaganem", nameAr: "مستغانم", nameFr: "Mostaganem",
    communes: [
      { code: "27001", name: "Mostaganem", nameAr: "مستغانم", nameFr: "Mostaganem" },
      { code: "27002", name: "Ain Tedeles", nameAr: "عين تادلس", nameFr: "Ain Tedeles" },
      { code: "27003", name: "Mazagran", nameAr: "مزغران", nameFr: "Mazagran" },
      { code: "27004", name: "Sidi Ali", nameAr: "سيدي علي", nameFr: "Sidi Ali" },
      { code: "27005", name: "Kheir Eddine", nameAr: "خير الدين", nameFr: "Kheir Eddine" },
    ],
  },
  {
    code: "28", name: "M'Sila", nameAr: "المسيلة", nameFr: "M'Sila",
    communes: [
      { code: "28001", name: "M'Sila", nameAr: "المسيلة", nameFr: "M'Sila" },
      { code: "28002", name: "Bou Saada", nameAr: "بوسعادة", nameFr: "Bou Saada" },
      { code: "28003", name: "Ain El Melh", nameAr: "عين الملح", nameFr: "Ain El Melh" },
      { code: "28004", name: "Sidi Aissa", nameAr: "سيدي عيسى", nameFr: "Sidi Aissa" },
      { code: "28005", name: "Magra", nameAr: "مقرة", nameFr: "Magra" },
      { code: "28006", name: "Djebel Messaad", nameAr: "جبل مساد", nameFr: "Djebel Messaad" },
    ],
  },
  {
    code: "29", name: "Mascara", nameAr: "معسكر", nameFr: "Mascara",
    communes: [
      { code: "29001", name: "Mascara", nameAr: "معسكر", nameFr: "Mascara" },
      { code: "29002", name: "Tighennif", nameAr: "تيغنيف", nameFr: "Tighennif" },
      { code: "29003", name: "Bouhanifia", nameAr: "بوهنيفة", nameFr: "Bouhanifia" },
      { code: "29004", name: "El Bordj", nameAr: "البرج", nameFr: "El Bordj" },
      { code: "29005", name: "Sig", nameAr: "سيق", nameFr: "Sig" },
      { code: "29006", name: "Ain Frass", nameAr: "عين فراس", nameFr: "Ain Frass" },
    ],
  },
  {
    code: "30", name: "Ouargla", nameAr: "ورقلة", nameFr: "Ouargla",
    communes: [
      { code: "30001", name: "Ouargla", nameAr: "ورقلة", nameFr: "Ouargla" },
      { code: "30002", name: "Rouissat", nameAr: "الرويسات", nameFr: "Rouissat" },
      { code: "30003", name: "Ain Beida", nameAr: "عين بيضاء", nameFr: "Ain Beida" },
      { code: "30004", name: "Hassi Messaoud", nameAr: "حاسي مسعود", nameFr: "Hassi Messaoud" },
      { code: "30005", name: "N'goussa", nameAr: "نقوسة", nameFr: "N'goussa" },
      { code: "30006", name: "Temacine", nameAr: "تماسين", nameFr: "Temacine" },
      { code: "30007", name: "Touggourt", nameAr: "تقرت", nameFr: "Touggourt" },
    ],
  },
  {
    code: "31", name: "Oran", nameAr: "وهران", nameFr: "Oran",
    communes: [
      { code: "31001", name: "Oran", nameAr: "وهران", nameFr: "Oran" },
      { code: "31002", name: "Es Senia", nameAr: "السانية", nameFr: "Es Senia" },
      { code: "31003", name: "Bir El Djir", nameAr: "بئر الجير", nameFr: "Bir El Djir" },
      { code: "31004", name: "Ain El Turck", nameAr: "عين الترك", nameFr: "Ain El Turck" },
      { code: "31005", name: "Arzew", nameAr: "أرزيو", nameFr: "Arzew" },
      { code: "31006", name: "Bethioua", nameAr: "بطيوة", nameFr: "Bethioua" },
      { code: "31007", name: "Hassi Bounif", nameAr: "حاسي بونيف", nameFr: "Hassi Bounif" },
      { code: "31008", name: "Mers El Kebir", nameAr: "مرسى الكبير", nameFr: "Mers El Kebir" },
      { code: "31009", name: "Sidi Chahmi", nameAr: "سيدي الشحمي", nameFr: "Sidi Chahmi" },
    ],
  },
  {
    code: "32", name: "El Bayadh", nameAr: "البيض", nameFr: "El Bayadh",
    communes: [
      { code: "32001", name: "El Bayadh", nameAr: "البيض", nameFr: "El Bayadh" },
      { code: "32002", name: "Rogassa", nameAr: "روقاصة", nameFr: "Rogassa" },
      { code: "32003", name: "Stitten", nameAr: "ستيتن", nameFr: "Stitten" },
      { code: "32004", name: "El Abiodh Sidi Cheikh", nameAr: "العبيد سيدي الشيخ", nameFr: "El Abiodh Sidi Cheikh" },
      { code: "32005", name: "Brezina", nameAr: "برزينة", nameFr: "Brezina" },
    ],
  },
  {
    code: "33", name: "Illizi", nameAr: "إليزي", nameFr: "Illizi",
    communes: [
      { code: "33001", name: "Illizi", nameAr: "إليزي", nameFr: "Illizi" },
      { code: "33002", name: "Djanet", nameAr: "جانت", nameFr: "Djanet" },
      { code: "33003", name: "In Amenas", nameAr: "إن أمناس", nameFr: "In Amenas" },
      { code: "33004", name: "Bordj Omar Driss", nameAr: "برج عمر إدريس", nameFr: "Bordj Omar Driss" },
    ],
  },
  {
    code: "34", name: "Bordj Bou Arréridj", nameAr: "برج بوعريريج", nameFr: "Bordj Bou Arréridj",
    communes: [
      { code: "34001", name: "Bordj Bou Arréridj", nameAr: "برج بوعريريج", nameFr: "Bordj Bou Arréridj" },
      { code: "34002", name: "Ras El Oued", nameAr: "رأس الوادي", nameFr: "Ras El Oued" },
      { code: "34003", name: "El Main", nameAr: "المعين", nameFr: "El Main" },
      { code: "34004", name: "Bir Kasdali", nameAr: "بئر قاصد علي", nameFr: "Bir Kasdali" },
      { code: "34005", name: "Mansourah", nameAr: "المنصورة", nameFr: "Mansourah" },
      { code: "34006", name: "Medjana", nameAr: "مجانة", nameFr: "Medjana" },
    ],
  },
  {
    code: "35", name: "Boumerdès", nameAr: "بومرداس", nameFr: "Boumerdès",
    communes: [
      { code: "35001", name: "Boumerdès", nameAr: "بومرداس", nameFr: "Boumerdès" },
      { code: "35002", name: "Dellys", nameAr: "دلس", nameFr: "Dellys" },
      { code: "35003", name: "Khemis El Khechna", nameAr: "خميس الخشنة", nameFr: "Khemis El Khechna" },
      { code: "35004", name: "Boudouaou", nameAr: "بودواو", nameFr: "Boudouaou" },
      { code: "35005", name: "Thenia", nameAr: "ثنية الأحد", nameFr: "Thenia" },
      { code: "35006", name: "Bordj Menaiel", nameAr: "برج منايل", nameFr: "Bordj Menaiel" },
    ],
  },
  {
    code: "36", name: "El Tarf", nameAr: "الطارف", nameFr: "El Tarf",
    communes: [
      { code: "36001", name: "El Tarf", nameAr: "الطارف", nameFr: "El Tarf" },
      { code: "36002", name: "Ben Mehidi", nameAr: "بن مهيدي", nameFr: "Ben Mehidi" },
      { code: "36003", name: "Besbes", nameAr: "البسباس", nameFr: "Besbes" },
      { code: "36004", name: "Boutheldja", nameAr: "بوثلجة", nameFr: "Boutheldja" },
      { code: "36005", name: "Drean", nameAr: "الذرعان", nameFr: "Drean" },
      { code: "36006", name: "Ain Kerma", nameAr: "عين كرمة", nameFr: "Ain Kerma" },
      { code: "36007", name: "Chefia", nameAr: "الشافية", nameFr: "Chefia" },
    ],
  },
  {
    code: "37", name: "Tindouf", nameAr: "تندوف", nameFr: "Tindouf",
    communes: [
      { code: "37001", name: "Tindouf", nameAr: "تندوف", nameFr: "Tindouf" },
      { code: "37002", name: "Oum El Assel", nameAr: "أم العسل", nameFr: "Oum El Assel" },
    ],
  },
  {
    code: "38", name: "Tissemsilt", nameAr: "تيسمسيلت", nameFr: "Tissemsilt",
    communes: [
      { code: "38001", name: "Tissemsilt", nameAr: "تيسمسيلت", nameFr: "Tissemsilt" },
      { code: "38002", name: "Bordj Bou Naama", nameAr: "برج بونعامة", nameFr: "Bordj Bou Naama" },
      { code: "38003", name: "Theniet El Had", nameAr: "تنيت الحد", nameFr: "Theniet El Had" },
      { code: "38004", name: "Khemisti", nameAr: "خميستي", nameFr: "Khemisti" },
    ],
  },
  {
    code: "39", name: "El Oued", nameAr: "الوادي", nameFr: "El Oued",
    communes: [
      { code: "39001", name: "El Oued", nameAr: "الوادي", nameFr: "El Oued" },
      { code: "39002", name: "Robbah", nameAr: "الرباح", nameFr: "Robbah" },
      { code: "39003", name: "Oued El Alenda", nameAr: "وادي العلندة", nameFr: "Oued El Alenda" },
      { code: "39004", name: "Bayadha", nameAr: "البياضة", nameFr: "Bayadha" },
      { code: "39005", name: "Nakhla", nameAr: "النخلة", nameFr: "Nakhla" },
      { code: "39006", name: "Guemar", nameAr: "قمار", nameFr: "Guemar" },
      { code: "39007", name: "Kouinine", nameAr: "كوينين", nameFr: "Kouinine" },
    ],
  },
  {
    code: "40", name: "Khenchela", nameAr: "خنشلة", nameFr: "Khenchela",
    communes: [
      { code: "40001", name: "Khenchela", nameAr: "خنشلة", nameFr: "Khenchela" },
      { code: "40002", name: "Ain Touila", nameAr: "عين تولى", nameFr: "Ain Touila" },
      { code: "40003", name: "Kais", nameAr: "قايس", nameFr: "Kais" },
      { code: "40004", name: "Chechar", nameAr: "الشيشار", nameFr: "Chechar" },
      { code: "40005", name: "El Hamma", nameAr: "الحامة", nameFr: "El Hamma" },
      { code: "40006", name: "Bouhmama", nameAr: "بوحمامة", nameFr: "Bouhmama" },
    ],
  },
  {
    code: "41", name: "Souk Ahras", nameAr: "سوق أهراس", nameFr: "Souk Ahras",
    communes: [
      { code: "41001", name: "Souk Ahras", nameAr: "سوق أهراس", nameFr: "Souk Ahras" },
      { code: "41002", name: "Mechroha", nameAr: "مشروحة", nameFr: "Mechroha" },
      { code: "41003", name: "Merahna", nameAr: "مراهنة", nameFr: "Merahna" },
      { code: "41004", name: "Ouled Driss", nameAr: "أولاد إدريس", nameFr: "Ouled Driss" },
      { code: "41005", name: "Tiffech", nameAr: "تيفاش", nameFr: "Tiffech" },
      { code: "41006", name: "Sedrata", nameAr: "صدراتة", nameFr: "Sedrata" },
    ],
  },
  {
    code: "42", name: "Tipaza", nameAr: "تيبازة", nameFr: "Tipaza",
    communes: [
      { code: "42001", name: "Tipaza", nameAr: "تيبازة", nameFr: "Tipaza" },
      { code: "42002", name: "Ahmar El Ain", nameAr: "أحمر العين", nameFr: "Ahmar El Ain" },
      { code: "42003", name: "Bou Ismail", nameAr: "بواسماعيل", nameFr: "Bou Ismail" },
      { code: "42004", name: "Cherchell", nameAr: "شرشال", nameFr: "Cherchell" },
      { code: "42005", name: "Ain Tagourait", nameAr: "عين التاقورايت", nameFr: "Ain Tagourait" },
      { code: "42006", name: "Kolea", nameAr: "قليعة", nameFr: "Kolea" },
    ],
  },
  {
    code: "43", name: "Mila", nameAr: "ميلة", nameFr: "Mila",
    communes: [
      { code: "43001", name: "Mila", nameAr: "ميلة", nameFr: "Mila" },
      { code: "43002", name: "Grarem Gouga", nameAr: "قرارم قوقة", nameFr: "Grarem Gouga" },
      { code: "43003", name: "Ferdjioua", nameAr: "فرجيوة", nameFr: "Ferdjioua" },
      { code: "43004", name: "Chelghoum El Aid", nameAr: "شلغوم العيد", nameFr: "Chelghoum El Aid" },
      { code: "43005", name: "Ain Melila", nameAr: "عين مليلة", nameFr: "Ain Melila" },
      { code: "43006", name: "Teleghma", nameAr: "تلاغمة", nameFr: "Teleghma" },
    ],
  },
  {
    code: "44", name: "Aïn Defla", nameAr: "عين الدفلى", nameFr: "Aïn Defla",
    communes: [
      { code: "44001", name: "Aïn Defla", nameAr: "عين الدفلى", nameFr: "Aïn Defla" },
      { code: "44002", name: "Miliana", nameAr: "مليانة", nameFr: "Miliana" },
      { code: "44003", name: "Ain Torki", nameAr: "عين تركي", nameFr: "Ain Torki" },
      { code: "44004", name: "El Attaf", nameAr: "العطاف", nameFr: "El Attaf" },
      { code: "44005", name: "Khemis Miliana", nameAr: "خميس مليانة", nameFr: "Khemis Miliana" },
      { code: "44006", name: "Ain Lechiakh", nameAr: "عين لشياخ", nameFr: "Ain Lechiakh" },
    ],
  },
  {
    code: "45", name: "Naâma", nameAr: "النعامة", nameFr: "Naâma",
    communes: [
      { code: "45001", name: "Naâma", nameAr: "النعامة", nameFr: "Naâma" },
      { code: "45002", name: "Mechria", nameAr: "المشرية", nameFr: "Mechria" },
      { code: "45003", name: "Ain Sefra", nameAr: "عين الصفراء", nameFr: "Ain Sefra" },
      { code: "45004", name: "Tiout", nameAr: "تيوط", nameFr: "Tiout" },
      { code: "45005", name: "Sfissifa", nameAr: "سفيسيفة", nameFr: "Sfissifa" },
    ],
  },
  {
    code: "46", name: "Aïn Témouchent", nameAr: "عين تيموشنت", nameFr: "Aïn Témouchent",
    communes: [
      { code: "46001", name: "Aïn Témouchent", nameAr: "عين تيموشنت", nameFr: "Aïn Témouchent" },
      { code: "46002", name: "Hammam Bou Hadjar", nameAr: "حمام بوحجر", nameFr: "Hammam Bou Hadjar" },
      { code: "46003", name: "Beni Saf", nameAr: "بني صاف", nameFr: "Beni Saf" },
      { code: "46004", name: "El Amria", nameAr: "العامرية", nameFr: "El Amria" },
      { code: "46005", name: "Ain El Arbaa", nameAr: "عين الأربعاء", nameFr: "Ain El Arbaa" },
    ],
  },
  {
    code: "47", name: "Ghardaïa", nameAr: "غرداية", nameFr: "Ghardaïa",
    communes: [
      { code: "47001", name: "Ghardaïa", nameAr: "غرداية", nameFr: "Ghardaïa" },
      { code: "47002", name: "Zelfana", nameAr: "زلفانة", nameFr: "Zelfana" },
      { code: "47003", name: "Berriane", nameAr: "بريان", nameFr: "Berriane" },
      { code: "47004", name: "Guerrara", nameAr: "قرارة", nameFr: "Guerrara" },
      { code: "47005", name: "Metlili", nameAr: "متليلي", nameFr: "Metlili" },
      { code: "47006", name: "El Guerrara", nameAr: "القرارة", nameFr: "El Guerrara" },
      { code: "47007", name: "Daia Ben Dahoua", nameAr: "ضاية بن ضحوة", nameFr: "Daia Ben Dahoua" },
    ],
  },
  {
    code: "48", name: "Relizane", nameAr: "غليزان", nameFr: "Relizane",
    communes: [
      { code: "48001", name: "Relizane", nameAr: "غليزان", nameFr: "Relizane" },
      { code: "48002", name: "Mazouna", nameAr: "مازونة", nameFr: "Mazouna" },
      { code: "48003", name: "Ain Tarek", nameAr: "عين طارق", nameFr: "Ain Tarek" },
      { code: "48004", name: "Oued Rhiou", nameAr: "وادي رهيو", nameFr: "Oued Rhiou" },
      { code: "48005", name: "Sidi M'Hamed Ben Ali", nameAr: "سيدي محمد بن علي", nameFr: "Sidi M'Hamed Ben Ali" },
    ],
  },
  {
    code: "49", name: "Timimoun", nameAr: "تيميمون", nameFr: "Timimoun",
    communes: [
      { code: "49001", name: "Timimoun", nameAr: "تيميمون", nameFr: "Timimoun" },
      { code: "49002", name: "Aougrout", nameAr: "أوقروت", nameFr: "Aougrout" },
      { code: "49003", name: "Charouine", nameAr: "شروين", nameFr: "Charouine" },
    ],
  },
  {
    code: "50", name: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار", nameFr: "Bordj Badji Mokhtar",
    communes: [
      { code: "50001", name: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار", nameFr: "Bordj Badji Mokhtar" },
      { code: "50002", name: "Timiaouine", nameAr: "تيميياوين", nameFr: "Timiaouine" },
    ],
  },
  {
    code: "51", name: "Ouled Djellal", nameAr: "أولاد جلال", nameFr: "Ouled Djellal",
    communes: [
      { code: "51001", name: "Ouled Djellal", nameAr: "أولاد جلال", nameFr: "Ouled Djellal" },
      { code: "51002", name: "Ras El Miad", nameAr: "رأس الميعاد", nameFr: "Ras El Miad" },
      { code: "51003", name: "Sidi Khaled", nameAr: "سيدي خالد", nameFr: "Sidi Khaled" },
    ],
  },
  {
    code: "52", name: "Béni Abbès", nameAr: "بني عباس", nameFr: "Béni Abbès",
    communes: [
      { code: "52001", name: "Béni Abbès", nameAr: "بني عباس", nameFr: "Béni Abbès" },
      { code: "52002", name: "El Ouata", nameAr: "الواطة", nameFr: "El Ouata" },
    ],
  },
  {
    code: "53", name: "In Salah", nameAr: "عين صالح", nameFr: "In Salah",
    communes: [
      { code: "53001", name: "In Salah", nameAr: "عين صالح", nameFr: "In Salah" },
      { code: "53002", name: "In Ghar", nameAr: "إن غار", nameFr: "In Ghar" },
      { code: "53003", name: "Foggaret Ezzaouia", nameAr: "فقارة الزواية", nameFr: "Foggaret Ezzaouia" },
    ],
  },
  {
    code: "54", name: "In Guezzam", nameAr: "إن قزام", nameFr: "In Guezzam",
    communes: [
      { code: "54001", name: "In Guezzam", nameAr: "إن قزام", nameFr: "In Guezzam" },
      { code: "54002", name: "Tin Zaouatine", nameAr: "تين زواتين", nameFr: "Tin Zaouatine" },
    ],
  },
  {
    code: "55", name: "Touggourt", nameAr: "تقرت", nameFr: "Touggourt",
    communes: [
      { code: "55001", name: "Touggourt", nameAr: "تقرت", nameFr: "Touggourt" },
      { code: "55002", name: "Temacine", nameAr: "تماسين", nameFr: "Temacine" },
      { code: "55003", name: "Blidet Amor", nameAr: "بليدة العامر", nameFr: "Blidet Amor" },
    ],
  },
  {
    code: "56", name: "Djanet", nameAr: "جانت", nameFr: "Djanet",
    communes: [
      { code: "56001", name: "Djanet", nameAr: "جانت", nameFr: "Djanet" },
      { code: "56002", name: "Bordj El Haouès", nameAr: "برج الحواس", nameFr: "Bordj El Haouès" },
    ],
  },
  {
    code: "57", name: "El M'Ghair", nameAr: "المغير", nameFr: "El M'Ghair",
    communes: [
      { code: "57001", name: "El M'Ghair", nameAr: "المغير", nameFr: "El M'Ghair" },
      { code: "57002", name: "Djamaa", nameAr: "جامعة", nameFr: "Djamaa" },
      { code: "57003", name: "Still", nameAr: "ستيل", nameFr: "Still" },
    ],
  },
  {
    code: "58", name: "El Meniaa", nameAr: "المنيعة", nameFr: "El Meniaa",
    communes: [
      { code: "58001", name: "El Meniaa", nameAr: "المنيعة", nameFr: "El Meniaa" },
      { code: "58002", name: "Hassi Gara", nameAr: "حاسي قارة", nameFr: "Hassi Gara" },
    ],
  },
];

export function getWilayaName(w: Wilaya, lang: string): string {
  if (lang === "ar") return `${w.code} - ${w.nameAr}`;
  if (lang === "fr") return `${w.code} - ${w.nameFr}`;
  return `${w.code} - ${w.name}`;
}

export function getCommuneName(c: Commune, lang: string): string {
  if (lang === "ar") return c.nameAr;
  if (lang === "fr") return c.nameFr;
  return c.name;
}
