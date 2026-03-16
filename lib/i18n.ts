export type Language = "ar" | "fr" | "en";

export type Translations = {
  appName: string;
  slogan: string;
  available247: string;
  welcomeTo: string;
  heroSub: string;
  clients: string;
  services: string;
  response: string;
  ourServices: string;
  servicesSubtitle: string;
  residentialMoving: string;
  residentialDesc: string;
  officeMoving: string;
  officeDesc: string;
  furnitureAssembly: string;
  furnitureDesc: string;
  whyChooseUs: string;
  secure: string;
  fast: string;
  proTeam: string;
  fairPrice: string;
  freeQuote: string;
  requestEstimate: string;
  fullName: string;
  phone: string;
  pickupAddress: string;
  deliveryAddress: string;
  requestQuote: string;
  newRequest: string;
  requestSent: string;
  requestSentDesc: string;
  dataConfidential: string;
  nameRequired: string;
  phoneRequired: string;
  phoneInvalid: string;
  pickupRequired: string;
  deliveryRequired: string;
  login: string;
  signup: string;
  logout: string;
  email: string;
  password: string;
  confirmPassword: string;
  passwordMismatch: string;
  forgotPassword: string;
  noAccount: string;
  hasAccount: string;
  chooseRole: string;
  client: string;
  clientDesc: string;
  partner: string;
  partnerDesc: string;
  beAPartner: string;
  truckInfo: string;
  truckType: string;
  licensePlate: string;
  registerTruck: string;
  truckTypeRequired: string;
  licensePlateRequired: string;
  welcomeClient: string;
  welcomePartner: string;
  myOrders: string;
  bookNow: string;
  noOrders: string;
  orderStatus: string;
  pending: string;
  inProgress: string;
  completed: string;
  adminPanel: string;
  allOrders: string;
  allUsers: string;
  allPartners: string;
  totalOrders: string;
  totalUsers: string;
  totalPartners: string;
  language: string;
  chooseLanguage: string;
  arabic: string;
  french: string;
  english: string;
  restartRequired: string;
  allRightsReserved: string;
  algeria: string;
  loading: string;
  error: string;
  retry: string;
  requiredField: string;
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMinLength: string;
  authError: string;
  profileSetup: string;
  continueText: string;
  noOrdersDesc: string;
  viewAllOrders: string;
  orders: string;
  users: string;
  partners: string;
  status: string;
  date: string;
  action: string;
  approve: string;
  name: string;
  role: string;
  address: string;
  truckDetails: string;
  active: string;
  inactive: string;
  home: string;
  settings: string;
  availableOrders: string;
  noAvailableOrders: string;
  noAvailableOrdersDesc: string;
  acceptOrder: string;
  accepting: string;
  orderAccepted: string;
  statusSearching: string;
  statusAccepted: string;
  statusArrived: string;
  statusInTransit: string;
  kmAway: string;
  dzd: string;
  cash: string;
  card: string;
  mobilePayment: string;
  pendingApproval: string;
  pendingApprovalDesc: string;
  locationPermDenied: string;
  myActiveOrders: string;
  noActiveOrders: string;
  markArrived: string;
  startDelivery: string;
  markComplete: string;
  estimatedPrice: string;
  paymentMethod: string;
  pullToRefresh: string;
  autoRefresh: string;
  entityType: string;
  entityTypeRequired: string;
  company: string;
  freelance: string;
  workersProvided: string;
  numberOfWorkers: string;
  numberOfWorkersRequired: string;
  numberOfWorkersInvalid: string;
  serviceSpecialization: string;
  serviceSpecRequired: string;
  furnitureAssemblyService: string;
  transportOnly: string;
  coverageScope: string;
  coverageScopeRequired: string;
  local: string;
  national: string;
  localDesc: string;
  nationalDesc: string;
  partnerSetupTitle: string;
  partnerSetupSub: string;
  registerPartner: string;
  yes: string;
  no: string;
  wilayaPickup: string;
  wilayaDelivery: string;
  wilayaPickupPlaceholder: string;
  wilayaDeliveryPlaceholder: string;
  wilayaRequired: string;
  communeRequired: string;
  truckTypeNeeded: string;
  truckTypeNeededRequired: string;
  workerRequirement: string;
  needWorkers: string;
  numberOfWorkersNeeded: string;
  servicePreference: string;
  assemblyNeeded: string;
  assemblyNotNeeded: string;
  serviceDetails: string;
  locationDetails: string;
  selfiePhoto: string;
  drivingLicensePhoto: string;
  vehiclePhoto: string;
  tapToUpload: string;
  changePhoto: string;
  uploadingPhoto: string;
  photoRequired: string;
  verificationPhotos: string;
  verificationPhotosDesc: string;
  reject: string;
  approved: string;
  rejected: string;
  pendingPartners: string;
  loginRequired: string;
  loginOrSignupPrompt: string;
  goToLogin: string;
  goToSignup: string;
};

const ar: Translations = {
  appName: "يو موف عنابة",
  slogan: "نقل ذكي ومتصل",
  available247: "متاح 7 أيام / 7",
  welcomeTo: "مرحباً بكم في",
  heroSub: "شريكك الموثوق لجميع عمليات النقل في عنابة وضواحيها.",
  clients: "عملاء",
  services: "خدمات",
  response: "استجابة",
  ourServices: "خدماتنا",
  servicesSubtitle: "حلول متكاملة لانتقالك",
  residentialMoving: "نقل\nسكني",
  residentialDesc: "نقل آمن لممتلكاتك الشخصية بعناية ودقة.",
  officeMoving: "نقل\nمكاتب",
  officeDesc: "حلول احترافية لنقل الشركات والمكاتب.",
  furnitureAssembly: "تركيب\nأثاث",
  furnitureDesc: "تجميع خبير لجميع أنواع الأثاث بسرعة وكفاءة.",
  whyChooseUs: "لماذا تختارنا؟",
  secure: "آمن",
  fast: "سريع",
  proTeam: "فريق محترف",
  fairPrice: "سعر عادل",
  freeQuote: "عرض سعر مجاني",
  requestEstimate: "اطلب تقديرك",
  fullName: "الاسم الكامل",
  phone: "رقم الهاتف",
  pickupAddress: "عنوان الانطلاق",
  deliveryAddress: "عنوان الوصول",
  requestQuote: "طلب عرض سعر مجاني",
  newRequest: "طلب جديد",
  requestSent: "تم إرسال الطلب!",
  requestSentDesc: "تم استلام طلب عرض السعر الخاص بك. سيتصل بك فريقنا في أقرب وقت.",
  dataConfidential: "بياناتك سرية وآمنة",
  nameRequired: "الاسم مطلوب",
  phoneRequired: "رقم الهاتف مطلوب",
  phoneInvalid: "رقم غير صالح",
  pickupRequired: "عنوان الانطلاق مطلوب",
  deliveryRequired: "عنوان الوصول مطلوب",
  login: "تسجيل الدخول",
  signup: "إنشاء حساب",
  logout: "تسجيل الخروج",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  confirmPassword: "تأكيد كلمة المرور",
  passwordMismatch: "كلمتا المرور غير متطابقتين",
  forgotPassword: "نسيت كلمة المرور؟",
  noAccount: "ليس لديك حساب؟",
  hasAccount: "لديك حساب بالفعل؟",
  chooseRole: "اختر دورك",
  client: "عميل",
  clientDesc: "أبحث عن خدمات نقل",
  partner: "شريك",
  partnerDesc: "لدي شاحنة وأريد العمل",
  beAPartner: "كن شريكاً",
  truckInfo: "معلومات الشاحنة",
  truckType: "نوع الشاحنة",
  licensePlate: "لوحة الترخيص",
  registerTruck: "تسجيل الشاحنة",
  truckTypeRequired: "نوع الشاحنة مطلوب",
  licensePlateRequired: "لوحة الترخيص مطلوبة",
  welcomeClient: "مرحباً بك، عميلنا العزيز",
  welcomePartner: "مرحباً بك، شريكنا",
  myOrders: "طلباتي",
  bookNow: "احجز الآن",
  noOrders: "لا توجد طلبات بعد",
  orderStatus: "حالة الطلب",
  pending: "قيد الانتظار",
  inProgress: "جاري التنفيذ",
  completed: "مكتمل",
  adminPanel: "لوحة الإدارة",
  allOrders: "جميع الطلبات",
  allUsers: "جميع المستخدمين",
  allPartners: "جميع الشركاء",
  totalOrders: "إجمالي الطلبات",
  totalUsers: "إجمالي المستخدمين",
  totalPartners: "إجمالي الشركاء",
  language: "اللغة",
  chooseLanguage: "اختر اللغة",
  arabic: "العربية",
  french: "الفرنسية",
  english: "الإنجليزية",
  restartRequired: "أعد تشغيل التطبيق لتطبيق اللغة الجديدة",
  allRightsReserved: "جميع الحقوق محفوظة",
  algeria: "عنابة، الجزائر",
  loading: "جاري التحميل...",
  error: "حدث خطأ",
  retry: "إعادة المحاولة",
  requiredField: "هذا الحقل مطلوب",
  emailRequired: "البريد الإلكتروني مطلوب",
  emailInvalid: "بريد إلكتروني غير صالح",
  passwordRequired: "كلمة المرور مطلوبة",
  passwordMinLength: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
  authError: "خطأ في المصادقة",
  profileSetup: "إعداد الملف الشخصي",
  continueText: "متابعة",
  noOrdersDesc: "لم تقم بأي طلب حتى الآن. احجز الآن!",
  viewAllOrders: "عرض جميع الطلبات",
  orders: "الطلبات",
  users: "المستخدمون",
  partners: "الشركاء",
  status: "الحالة",
  date: "التاريخ",
  action: "الإجراء",
  approve: "قبول",
  name: "الاسم",
  role: "الدور",
  address: "العنوان",
  truckDetails: "تفاصيل الشاحنة",
  active: "نشط",
  inactive: "غير نشط",
  home: "الرئيسية",
  settings: "الإعدادات",
  availableOrders: "الطلبات المتاحة",
  noAvailableOrders: "لا توجد طلبات متاحة",
  noAvailableOrdersDesc: "لا توجد طلبات بالقرب منك الآن. ستُحدَّث القائمة تلقائياً.",
  acceptOrder: "قبول الطلب",
  accepting: "جاري القبول...",
  orderAccepted: "تم قبول الطلب!",
  statusSearching: "يبحث عن سائق",
  statusAccepted: "مقبول",
  statusArrived: "في موقع الاستلام",
  statusInTransit: "جاري النقل",
  kmAway: "كم",
  dzd: "د.ج",
  cash: "نقداً",
  card: "بطاقة",
  mobilePayment: "دفع هاتفي",
  pendingApproval: "الحساب قيد المراجعة",
  pendingApprovalDesc: "حسابك كشريك قيد المراجعة من قبل الإدارة. ستتمكن من رؤية الطلبات بمجرد الموافقة.",
  locationPermDenied: "يُرجى السماح بالوصول إلى موقعك لرؤية الطلبات الأقرب إليك.",
  myActiveOrders: "طلباتي النشطة",
  noActiveOrders: "لا توجد طلبات نشطة حالياً",
  markArrived: "وصلت لموقع الاستلام",
  startDelivery: "بدء التوصيل",
  markComplete: "إتمام التسليم",
  estimatedPrice: "السعر التقديري",
  paymentMethod: "طريقة الدفع",
  pullToRefresh: "اسحب للتحديث",
  autoRefresh: "تحديث تلقائي كل 20 ثانية",
  entityType: "نوع الكيان",
  entityTypeRequired: "نوع الكيان مطلوب",
  company: "شركة",
  freelance: "ناقل حر",
  workersProvided: "توفير عمال",
  numberOfWorkers: "عدد العمال",
  numberOfWorkersRequired: "عدد العمال مطلوب",
  numberOfWorkersInvalid: "أدخل رقماً صحيحاً (1-50)",
  serviceSpecialization: "تخصص الخدمة",
  serviceSpecRequired: "تخصص الخدمة مطلوب",
  furnitureAssemblyService: "نقل + تفكيك وتركيب الأثاث",
  transportOnly: "نقل فقط",
  coverageScope: "نطاق التغطية",
  coverageScopeRequired: "نطاق التغطية مطلوب",
  local: "محلي - داخل الولاية",
  national: "وطني - بين الولايات",
  localDesc: "داخل الولاية فقط",
  nationalDesc: "بين الولايات",
  partnerSetupTitle: "إعداد ملف الشريك",
  partnerSetupSub: "أكمل بيانات نشاطك للانضمام إلى شبكة شركائنا",
  registerPartner: "تسجيل كشريك",
  yes: "نعم",
  no: "لا",
  wilayaPickup: "موقع الانطلاق (الولاية / البلدية)",
  wilayaDelivery: "موقع الوصول (الولاية / البلدية)",
  wilayaPickupPlaceholder: "اختر الولاية والبلدية",
  wilayaDeliveryPlaceholder: "اختر الولاية والبلدية",
  wilayaRequired: "الولاية مطلوبة",
  communeRequired: "البلدية مطلوبة",
  truckTypeNeeded: "نوع الشاحنة المطلوبة",
  truckTypeNeededRequired: "نوع الشاحنة مطلوب",
  workerRequirement: "هل تحتاج عمالاً للنقل؟",
  needWorkers: "عدد العمال المطلوبين",
  numberOfWorkersNeeded: "عدد العمال",
  servicePreference: "هل تحتاج خدمة تفكيك وتركيب؟",
  assemblyNeeded: "نعم - مع تفكيك وتركيب",
  assemblyNotNeeded: "لا - نقل فقط",
  serviceDetails: "تفاصيل الخدمة",
  locationDetails: "تفاصيل الموقع",
  selfiePhoto: "صورة شخصية (سيلفي)",
  drivingLicensePhoto: "صورة رخصة القيادة",
  vehiclePhoto: "صورة المركبة (من الأمام مع اللوحة)",
  tapToUpload: "اضغط لرفع الصورة",
  changePhoto: "تغيير الصورة",
  uploadingPhoto: "جاري الرفع...",
  photoRequired: "الصورة مطلوبة",
  verificationPhotos: "صور التحقق",
  verificationPhotosDesc: "ارفع الصور المطلوبة للتحقق من هويتك وهوية مركبتك",
  reject: "رفض",
  approved: "مُعتمد",
  rejected: "مرفوض",
  pendingPartners: "الشركاء قيد المراجعة",
  loginRequired: "يجب تسجيل الدخول",
  loginOrSignupPrompt: "يجب تسجيل الدخول أو إنشاء حساب لإرسال طلب تقدير السعر.",
  goToLogin: "تسجيل الدخول",
  goToSignup: "إنشاء حساب",
};

const fr: Translations = {
  appName: "UMOVE ANNABA",
  slogan: "Déménagement Intelligent et Connecté",
  available247: "Disponible 7j/7",
  welcomeTo: "Bienvenue chez",
  heroSub: "Votre partenaire de confiance pour tous vos déménagements à Annaba et alentours.",
  clients: "Clients",
  services: "Services",
  response: "Réponse",
  ourServices: "NOS SERVICES",
  servicesSubtitle: "Solutions complètes pour votre déménagement",
  residentialMoving: "Déménagement\nRésidentiel",
  residentialDesc: "Transport sécurisé de vos biens personnels avec soin et précision.",
  officeMoving: "Déménagement\nBureaux",
  officeDesc: "Solutions professionnelles pour le déménagement d'entreprises et bureaux.",
  furnitureAssembly: "Montage de\nMeubles",
  furnitureDesc: "Assemblage expert de tous types de meubles rapidement et efficacement.",
  whyChooseUs: "Pourquoi nous choisir ?",
  secure: "Sécurisé",
  fast: "Rapide",
  proTeam: "Équipe pro",
  fairPrice: "Prix juste",
  freeQuote: "DEVIS GRATUIT",
  requestEstimate: "Demandez votre estimation",
  fullName: "Nom complet",
  phone: "Téléphone",
  pickupAddress: "Adresse de départ",
  deliveryAddress: "Adresse d'arrivée",
  requestQuote: "Demander un Devis Gratuit",
  newRequest: "Nouvelle Demande",
  requestSent: "Demande Envoyée !",
  requestSentDesc: "Votre demande de devis a été reçue. Notre équipe vous contactera dans les plus brefs délais.",
  dataConfidential: "Vos données sont confidentielles et sécurisées",
  nameRequired: "Le nom est requis",
  phoneRequired: "Le téléphone est requis",
  phoneInvalid: "Numéro invalide",
  pickupRequired: "L'adresse de départ est requise",
  deliveryRequired: "L'adresse d'arrivée est requise",
  login: "Se connecter",
  signup: "Créer un compte",
  logout: "Déconnexion",
  email: "Email",
  password: "Mot de passe",
  confirmPassword: "Confirmer le mot de passe",
  passwordMismatch: "Les mots de passe ne correspondent pas",
  forgotPassword: "Mot de passe oublié ?",
  noAccount: "Pas de compte ?",
  hasAccount: "Déjà un compte ?",
  chooseRole: "Choisissez votre rôle",
  client: "Client",
  clientDesc: "Je cherche des services de déménagement",
  partner: "Partenaire",
  partnerDesc: "J'ai un camion et je veux travailler",
  beAPartner: "Devenir Partenaire",
  truckInfo: "Informations du camion",
  truckType: "Type de camion",
  licensePlate: "Plaque d'immatriculation",
  registerTruck: "Enregistrer le camion",
  truckTypeRequired: "Le type de camion est requis",
  licensePlateRequired: "La plaque est requise",
  welcomeClient: "Bienvenue, cher client",
  welcomePartner: "Bienvenue, partenaire",
  myOrders: "Mes commandes",
  bookNow: "Réserver maintenant",
  noOrders: "Pas encore de commandes",
  orderStatus: "Statut",
  pending: "En attente",
  inProgress: "En cours",
  completed: "Terminé",
  adminPanel: "Panneau Admin",
  allOrders: "Toutes les commandes",
  allUsers: "Tous les utilisateurs",
  allPartners: "Tous les partenaires",
  totalOrders: "Total commandes",
  totalUsers: "Total utilisateurs",
  totalPartners: "Total partenaires",
  language: "Langue",
  chooseLanguage: "Choisir la langue",
  arabic: "Arabe",
  french: "Français",
  english: "Anglais",
  restartRequired: "Redémarrez l'app pour appliquer la langue",
  allRightsReserved: "Tous droits réservés",
  algeria: "Annaba, Algérie",
  loading: "Chargement...",
  error: "Une erreur est survenue",
  retry: "Réessayer",
  requiredField: "Ce champ est requis",
  emailRequired: "L'email est requis",
  emailInvalid: "Email invalide",
  passwordRequired: "Le mot de passe est requis",
  passwordMinLength: "Le mot de passe doit avoir au moins 6 caractères",
  authError: "Erreur d'authentification",
  profileSetup: "Configuration du profil",
  continueText: "Continuer",
  noOrdersDesc: "Vous n'avez pas encore de commandes. Réservez maintenant !",
  viewAllOrders: "Voir toutes les commandes",
  orders: "Commandes",
  users: "Utilisateurs",
  partners: "Partenaires",
  status: "Statut",
  date: "Date",
  action: "Action",
  approve: "Approuver",
  name: "Nom",
  role: "Rôle",
  address: "Adresse",
  truckDetails: "Détails du camion",
  active: "Actif",
  inactive: "Inactif",
  home: "Accueil",
  settings: "Paramètres",
  availableOrders: "Commandes disponibles",
  noAvailableOrders: "Aucune commande disponible",
  noAvailableOrdersDesc: "Aucune commande près de vous pour l'instant. La liste se met à jour automatiquement.",
  acceptOrder: "Accepter la commande",
  accepting: "Acceptation...",
  orderAccepted: "Commande acceptée !",
  statusSearching: "Recherche chauffeur",
  statusAccepted: "Acceptée",
  statusArrived: "Sur place",
  statusInTransit: "En transit",
  kmAway: "km",
  dzd: "DA",
  cash: "Espèces",
  card: "Carte",
  mobilePayment: "Paiement mobile",
  pendingApproval: "Compte en attente",
  pendingApprovalDesc: "Votre compte partenaire est en cours de vérification par l'administration. Vous verrez les commandes dès approbation.",
  locationPermDenied: "Autorisez l'accès à votre position pour voir les commandes les plus proches.",
  myActiveOrders: "Mes commandes actives",
  noActiveOrders: "Aucune commande active en ce moment",
  markArrived: "Je suis arrivé",
  startDelivery: "Démarrer la livraison",
  markComplete: "Livraison terminée",
  estimatedPrice: "Prix estimé",
  paymentMethod: "Moyen de paiement",
  pullToRefresh: "Tirer pour actualiser",
  autoRefresh: "Mise à jour toutes les 20 secondes",
  entityType: "Type d'entité",
  entityTypeRequired: "Le type d'entité est requis",
  company: "Société",
  freelance: "Transporteur indépendant",
  workersProvided: "Personnel fourni",
  numberOfWorkers: "Nombre de travailleurs",
  numberOfWorkersRequired: "Le nombre de travailleurs est requis",
  numberOfWorkersInvalid: "Entrez un nombre valide (1-50)",
  serviceSpecialization: "Spécialisation du service",
  serviceSpecRequired: "La spécialisation est requise",
  furnitureAssemblyService: "Transport + Démontage & Montage",
  transportOnly: "Transport uniquement",
  coverageScope: "Zone de couverture",
  coverageScopeRequired: "La zone de couverture est requise",
  local: "Local - Dans la wilaya",
  national: "National - Inter-wilayas",
  localDesc: "Dans la wilaya uniquement",
  nationalDesc: "Entre les wilayas",
  partnerSetupTitle: "Configuration du profil",
  partnerSetupSub: "Complétez vos informations pour rejoindre notre réseau",
  registerPartner: "S'inscrire comme partenaire",
  yes: "Oui",
  no: "Non",
  wilayaPickup: "Lieu de départ (Wilaya / Commune)",
  wilayaDelivery: "Lieu d'arrivée (Wilaya / Commune)",
  wilayaPickupPlaceholder: "Choisir wilaya et commune",
  wilayaDeliveryPlaceholder: "Choisir wilaya et commune",
  wilayaRequired: "La wilaya est requise",
  communeRequired: "La commune est requise",
  truckTypeNeeded: "Type de camion requis",
  truckTypeNeededRequired: "Le type de camion est requis",
  workerRequirement: "Avez-vous besoin de personnel ?",
  needWorkers: "Nombre de travailleurs nécessaires",
  numberOfWorkersNeeded: "Nombre de travailleurs",
  servicePreference: "Besoin de montage/démontage ?",
  assemblyNeeded: "Oui - avec montage/démontage",
  assemblyNotNeeded: "Non - transport uniquement",
  serviceDetails: "Détails du service",
  locationDetails: "Détails de l'emplacement",
  selfiePhoto: "Photo Selfie / Visage",
  drivingLicensePhoto: "Photo du Permis de Conduire",
  vehiclePhoto: "Photo du Véhicule (face avant + plaque)",
  tapToUpload: "Appuyer pour télécharger",
  changePhoto: "Changer la photo",
  uploadingPhoto: "Téléchargement...",
  photoRequired: "Photo requise",
  verificationPhotos: "Photos de vérification",
  verificationPhotosDesc: "Téléchargez les photos requises pour vérifier votre identité et votre véhicule",
  reject: "Refuser",
  approved: "Approuvé",
  rejected: "Refusé",
  pendingPartners: "Partenaires en attente",
  loginRequired: "Connexion requise",
  loginOrSignupPrompt: "Vous devez être connecté pour envoyer une demande de devis.",
  goToLogin: "Se connecter",
  goToSignup: "Créer un compte",
};

const en: Translations = {
  appName: "UMOVE ANNABA",
  slogan: "Smart and Connected Moving",
  available247: "Available 24/7",
  welcomeTo: "Welcome to",
  heroSub: "Your trusted partner for all relocations in Annaba and surroundings.",
  clients: "Clients",
  services: "Services",
  response: "Response",
  ourServices: "OUR SERVICES",
  servicesSubtitle: "Complete solutions for your move",
  residentialMoving: "Residential\nMoving",
  residentialDesc: "Safe transport of your personal belongings with care and precision.",
  officeMoving: "Office\nMoving",
  officeDesc: "Professional solutions for corporate and office relocations.",
  furnitureAssembly: "Furniture\nAssembly",
  furnitureDesc: "Expert assembly of all types of furniture quickly and efficiently.",
  whyChooseUs: "Why choose us?",
  secure: "Secure",
  fast: "Fast",
  proTeam: "Pro Team",
  fairPrice: "Fair Price",
  freeQuote: "FREE QUOTE",
  requestEstimate: "Request your estimate",
  fullName: "Full Name",
  phone: "Phone",
  pickupAddress: "Pickup Address",
  deliveryAddress: "Delivery Address",
  requestQuote: "Request a Free Quote",
  newRequest: "New Request",
  requestSent: "Request Sent!",
  requestSentDesc: "Your quote request has been received. Our team will contact you shortly.",
  dataConfidential: "Your data is confidential and secure",
  nameRequired: "Name is required",
  phoneRequired: "Phone is required",
  phoneInvalid: "Invalid number",
  pickupRequired: "Pickup address is required",
  deliveryRequired: "Delivery address is required",
  login: "Sign In",
  signup: "Create Account",
  logout: "Sign Out",
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm Password",
  passwordMismatch: "Passwords do not match",
  forgotPassword: "Forgot password?",
  noAccount: "Don't have an account?",
  hasAccount: "Already have an account?",
  chooseRole: "Choose your role",
  client: "Client",
  clientDesc: "I'm looking for moving services",
  partner: "Partner",
  partnerDesc: "I have a truck and want to work",
  beAPartner: "Become a Partner",
  truckInfo: "Truck Information",
  truckType: "Truck Type",
  licensePlate: "License Plate",
  registerTruck: "Register Truck",
  truckTypeRequired: "Truck type is required",
  licensePlateRequired: "License plate is required",
  welcomeClient: "Welcome, dear client",
  welcomePartner: "Welcome, partner",
  myOrders: "My Orders",
  bookNow: "Book Now",
  noOrders: "No orders yet",
  orderStatus: "Status",
  pending: "Pending",
  inProgress: "In Progress",
  completed: "Completed",
  adminPanel: "Admin Panel",
  allOrders: "All Orders",
  allUsers: "All Users",
  allPartners: "All Partners",
  totalOrders: "Total Orders",
  totalUsers: "Total Users",
  totalPartners: "Total Partners",
  language: "Language",
  chooseLanguage: "Choose Language",
  arabic: "Arabic",
  french: "French",
  english: "English",
  restartRequired: "Restart the app to apply the new language",
  allRightsReserved: "All rights reserved",
  algeria: "Annaba, Algeria",
  loading: "Loading...",
  error: "An error occurred",
  retry: "Retry",
  requiredField: "This field is required",
  emailRequired: "Email is required",
  emailInvalid: "Invalid email",
  passwordRequired: "Password is required",
  passwordMinLength: "Password must be at least 6 characters",
  authError: "Authentication error",
  profileSetup: "Profile Setup",
  continueText: "Continue",
  noOrdersDesc: "You have no orders yet. Book now!",
  viewAllOrders: "View all orders",
  orders: "Orders",
  users: "Users",
  partners: "Partners",
  status: "Status",
  date: "Date",
  action: "Action",
  approve: "Approve",
  name: "Name",
  role: "Role",
  address: "Address",
  truckDetails: "Truck Details",
  active: "Active",
  inactive: "Inactive",
  home: "Home",
  settings: "Settings",
  availableOrders: "Available Orders",
  noAvailableOrders: "No available orders",
  noAvailableOrdersDesc: "No orders near you right now. The list updates automatically.",
  acceptOrder: "Accept Order",
  accepting: "Accepting...",
  orderAccepted: "Order Accepted!",
  statusSearching: "Searching for driver",
  statusAccepted: "Accepted",
  statusArrived: "Arrived at pickup",
  statusInTransit: "In Transit",
  kmAway: "km",
  dzd: "DZD",
  cash: "Cash",
  card: "Card",
  mobilePayment: "Mobile Payment",
  pendingApproval: "Account Pending Approval",
  pendingApprovalDesc: "Your partner account is under review by the administration. You will see orders once approved.",
  locationPermDenied: "Allow location access to see orders closest to you.",
  myActiveOrders: "My Active Orders",
  noActiveOrders: "No active orders right now",
  markArrived: "Mark as Arrived",
  startDelivery: "Start Delivery",
  markComplete: "Complete Delivery",
  estimatedPrice: "Estimated Price",
  paymentMethod: "Payment Method",
  pullToRefresh: "Pull to refresh",
  autoRefresh: "Auto-refreshes every 20 seconds",
  entityType: "Entity Type",
  entityTypeRequired: "Entity type is required",
  company: "Company",
  freelance: "Freelance Carrier",
  workersProvided: "Workers Provided",
  numberOfWorkers: "Number of Workers",
  numberOfWorkersRequired: "Number of workers is required",
  numberOfWorkersInvalid: "Enter a valid number (1-50)",
  serviceSpecialization: "Service Specialization",
  serviceSpecRequired: "Service specialization is required",
  furnitureAssemblyService: "Transport + Furniture Disassembly & Assembly",
  transportOnly: "Transport Only",
  coverageScope: "Coverage Scope",
  coverageScopeRequired: "Coverage scope is required",
  local: "Local - Within Wilaya",
  national: "National - Inter-Wilaya",
  localDesc: "Within the wilaya only",
  nationalDesc: "Between wilayas",
  partnerSetupTitle: "Partner Profile Setup",
  partnerSetupSub: "Complete your business details to join our partner network",
  registerPartner: "Register as Partner",
  yes: "Yes",
  no: "No",
  wilayaPickup: "Pickup Location (Wilaya / Commune)",
  wilayaDelivery: "Delivery Location (Wilaya / Commune)",
  wilayaPickupPlaceholder: "Select wilaya and commune",
  wilayaDeliveryPlaceholder: "Select wilaya and commune",
  wilayaRequired: "Wilaya is required",
  communeRequired: "Commune is required",
  truckTypeNeeded: "Truck Type Needed",
  truckTypeNeededRequired: "Truck type is required",
  workerRequirement: "Do you need workers?",
  needWorkers: "Number of workers needed",
  numberOfWorkersNeeded: "Number of workers",
  servicePreference: "Assembly/Disassembly needed?",
  assemblyNeeded: "Yes - with assembly/disassembly",
  assemblyNotNeeded: "No - transport only",
  serviceDetails: "Service Details",
  locationDetails: "Location Details",
  selfiePhoto: "Selfie / Face Photo",
  drivingLicensePhoto: "Driving License Photo",
  vehiclePhoto: "Vehicle Photo (front view + plate)",
  tapToUpload: "Tap to Upload",
  changePhoto: "Change Photo",
  uploadingPhoto: "Uploading...",
  photoRequired: "Photo is required",
  verificationPhotos: "Verification Photos",
  verificationPhotosDesc: "Upload required photos to verify your identity and vehicle",
  reject: "Reject",
  approved: "Approved",
  rejected: "Rejected",
  pendingPartners: "Pending Partners",
  loginRequired: "Login Required",
  loginOrSignupPrompt: "You must be logged in to submit a quote request.",
  goToLogin: "Sign In",
  goToSignup: "Create Account",
};

export const translations: Record<Language, Translations> = { ar, fr, en };

export const languageLabels: Record<Language, string> = {
  ar: "العربية",
  fr: "Français",
  en: "English",
};
