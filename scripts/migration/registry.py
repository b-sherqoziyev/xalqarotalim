"""Eski sayt sahifalari -> yangi kontent obyektlari xaritasi (qo'lda tekshirilgan)."""

LOCALES = ['uz', 'uz-cyrl', 'ru', 'en', 'tr']
LEGACY_LANG = {'uzl': 'uz', 'uzk': 'uz-cyrl', 'ru': 'ru', 'en': 'en', 'tr': 'tr'}

COUNTRIES = [
    # id, name per locale
    ('turkey',   {'uz': 'Turkiya', 'uz-cyrl': 'Туркия', 'ru': 'Турция', 'en': 'Turkey', 'tr': 'Türkiye'}),
    ('uk',       {'uz': 'Buyuk Britaniya', 'uz-cyrl': 'Буюк Британия', 'ru': 'Великобритания', 'en': 'United Kingdom', 'tr': 'Birleşik Krallık'}),
    ('germany',  {'uz': 'Germaniya', 'uz-cyrl': 'Германия', 'ru': 'Германия', 'en': 'Germany', 'tr': 'Almanya'}),
    ('italy',    {'uz': 'Italiya', 'uz-cyrl': 'Италия', 'ru': 'Италия', 'en': 'Italy', 'tr': 'İtalya'}),
    ('czechia',  {'uz': 'Chexiya', 'uz-cyrl': 'Чехия', 'ru': 'Чехия', 'en': 'Czech Republic', 'tr': 'Çekya'}),
    ('latvia',   {'uz': 'Latviya', 'uz-cyrl': 'Латвия', 'ru': 'Латвия', 'en': 'Latvia', 'tr': 'Letonya'}),
    ('poland',   {'uz': 'Polsha', 'uz-cyrl': 'Польша', 'ru': 'Польша', 'en': 'Poland', 'tr': 'Polonya'}),
    ('hungary',  {'uz': 'Vengriya', 'uz-cyrl': 'Венгрия', 'ru': 'Венгрия', 'en': 'Hungary', 'tr': 'Macaristan'}),
    ('slovakia', {'uz': 'Slovakiya', 'uz-cyrl': 'Словакия', 'ru': 'Словакия', 'en': 'Slovakia', 'tr': 'Slovakya'}),
]

# legacy number -> (id, country, city, native name)
UNIVERSITIES = {
    '2024_8':  ('altinbas', 'turkey', 'İstanbul', 'İstanbul Altınbaş Üniversitesi'),
    '2024_11': ('istanbul-arel', 'turkey', 'İstanbul', 'İstanbul Arel Üniversitesi'),
    '2024_2':  ('beykent', 'turkey', 'İstanbul', 'İstanbul Beykent Üniversitesi'),
    '2024_28': ('beykoz', 'turkey', 'İstanbul', 'İstanbul Beykoz Üniversitesi'),
    '2024_14': ('fatih-sultan-mehmet-vakif', 'turkey', 'İstanbul', 'İstanbul Fatih Sultan Mehmet Vakıf Üniversitesi'),
    '2024_9':  ('istanbul-kent', 'turkey', 'İstanbul', 'İstanbul Kent Üniversitesi'),
    '2024_15': ('nigde-omer-halisdemir', 'turkey', 'Niğde', 'Niğde Ömer Halisdemir Üniversitesi'),
    '2024_22': ('istanbul-okan', 'turkey', 'İstanbul', 'İstanbul Okan Üniversitesi'),
    '2024_10': ('izmir-demokrasi', 'turkey', 'İzmir', 'İzmir Demokrasi Üniversitesi'),
    '2024_21': ('erzincan-binali-yildirim', 'turkey', 'Erzincan', 'Erzincan Binali Yıldırım Üniversitesi'),
    '2024_26': ('anadolu', 'turkey', 'Eskişehir', 'Anadolu Üniversitesi'),
    '2024_16': ('bandirma-onyedi-eylul', 'turkey', 'Balıkesir', 'Bandırma Onyedi Eylül Üniversitesi'),
    '2024_17': ('bolu-abant-izzet-baysal', 'turkey', 'Bolu', 'Bolu Abant İzzet Baysal Üniversitesi'),
    '2024_25': ('eskisehir-osmangazi', 'turkey', 'Eskişehir', 'Eskişehir Osmangazi Üniversitesi'),
    '2024_13': ('karabuk', 'turkey', 'Karabük', 'Karabük Üniversitesi'),
    '2024_23': ('nevsehir-haci-bektas-veli', 'turkey', 'Nevşehir', 'Nevşehir Hacı Bektaş Veli Üniversitesi'),
    '2024_12': ('yalova', 'turkey', 'Yalova', 'Yalova Üniversitesi'),
    '2024_24': ('yozgat-bozok', 'turkey', 'Yozgat', 'Yozgat Bozok Üniversitesi'),
    '2024_4':  ('greenwich', 'uk', 'London', 'University of Greenwich'),
    '2024_34': ('west-london', 'uk', 'London', 'University of West London'),
    '2024_42': ('freiburg', 'germany', 'Freiburg', 'Albert-Ludwigs-Universität Freiburg'),
    '2024_43': ('heidelberg', 'germany', 'Heidelberg', 'Ruprecht-Karls-Universität Heidelberg'),
    '2024_44': ('humboldt-berlin', 'germany', 'Berlin', 'Humboldt-Universität zu Berlin'),
    '2024_45': ('hamburg', 'germany', 'Hamburg', 'Universität Hamburg'),
    '2024_35': ('turin', 'italy', 'Torino', 'Università degli Studi di Torino'),
    '2024_37': ('sapienza', 'italy', 'Roma', 'Sapienza Università di Roma'),
    '2024_48': ('politecnico-milano', 'italy', 'Milano', 'Politecnico di Milano'),
    '2024_49': ('padova', 'italy', 'Padova', 'Università degli Studi di Padova'),
    '2024_7':  ('vse-prague', 'czechia', 'Praha', 'Vysoká škola ekonomická v Praze'),
    '2024_6':  ('charles-university', 'czechia', 'Praha', 'Univerzita Karlova'),
    '2024_38': ('cvut', 'czechia', 'Praha', 'České vysoké učení technické v Praze'),
    '2024_3':  ('rtu', 'latvia', 'Rīga', 'Rīgas Tehniskā universitāte'),
    '2024_36': ('eka', 'latvia', 'Rīga', 'EKA Universitāte'),
    '2024_46': ('rsu', 'latvia', 'Rīga', 'Rīgas Stradiņa universitāte'),
    '2024_47': ('tsi', 'latvia', 'Rīga', 'Transporta un sakaru institūts'),
    '2024_50': ('vistula', 'poland', 'Warszawa', 'Akademia Finansów i Biznesu Vistula'),
    '2024_51': ('wincenty-pol', 'poland', 'Lublin', 'Akademia Nauk Stosowanych Wincentego Pola w Lublinie'),
    '2024_52': ('wsb-merito', 'poland', 'Dąbrowa Górnicza', 'Uniwersytet WSB Merito'),
    '2024_53': ('lodz', 'poland', 'Łódź', 'Uniwersytet Łódzki'),
    '2024_5':  ('bme', 'hungary', 'Budapest', 'Budapesti Műszaki és Gazdaságtudományi Egyetem'),
    '2024_39': ('debrecen', 'hungary', 'Debrecen', 'Debreceni Egyetem'),
    '2024_40': ('ludovika', 'hungary', 'Budapest', 'Nemzeti Közszolgálati Egyetem (Ludovika)'),
    '2024_41': ('obuda', 'hungary', 'Budapest', 'Óbudai Egyetem'),
    '2024_54': ('comenius', 'slovakia', 'Bratislava', 'Univerzita Komenského v Bratislave'),
    '2024_55': ('matej-bel', 'slovakia', 'Banská Bystrica', 'Univerzita Mateja Bela v Banskej Bystrici'),
    '2024_56': ('euba', 'slovakia', 'Bratislava', 'Ekonomická univerzita v Bratislave'),
    '2024_57': ('stu', 'slovakia', 'Bratislava', 'Slovenská technická univerzita v Bratislave'),
}

SCHOLARSHIPS = {
    '2024_1':  ('turkiye-burslari', 'turkey'),
    '2024_18': ('turkey-religious-grants', 'turkey'),
    '2024_19': ('grant-application', 'turkey'),
}

NEWS = {
    '2024_33': 'turkey-grants-2024-2025-continue',
    '2024_32': 'consulting-benefits',
    '2024_31': 'study-in-turkey-2024-2025',
    '2024_30': 'higher-education-in-turkey',
    '2024_29': 'masters-and-phd-in-turkey',
    '2024_27': 'for-those-who-want-to-study-abroad',
    '2024_20': 'turkey-state-grants-2024-2025',
    'announcements': 'turkey-scholarships-announcement',
}

# legacy service/test pages built from an unfinished Flexbe template (placeholders only)
TEMPLATE_PAGES = {'/01/', '/02/', '/03/', '/04/', '/11/', '/12/', '/page_96364/'}
