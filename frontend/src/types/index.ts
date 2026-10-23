// ─── Service ──────────────────────────────────────────────────────────────────
export type ServiceCategory = 'muolaja' | 'diagnostika' | 'parvarish' | 'boshqa';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ServiceCategory;
  icon: string;
  iconBg: string;
  iconColor: string;
  popular?: boolean;
  duration?: string;
}

// ─── Doctor ───────────────────────────────────────────────────────────────────
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  image: string;
  available: boolean;
  price: number;
  reviewCount: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus = 'kutilmoqda' | 'tasdiqlangan' | 'bajarilmoqda' | 'bajarildi' | 'bekor_qilindi';
export type OrderType   = 'uyga_tashrif' | 'onlayn_maslahat';

export interface Order {
  id:        string;
  service:   Service;
  doctor?:   Doctor;
  date:      string;
  time:      string;
  address:   string;
  status:    OrderStatus;
  price:     number;
  createdAt: string;
  type:      OrderType;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface Address {
  id:        string;
  label:     string;
  full:      string;
  district:  string;
  city:      string;
  isDefault: boolean;
}

export interface User {
  id:              string;
  name:            string;
  phone:           string;
  avatar?:         string;
  initials:        string;
  addresses:       Address[];
  currentLocation: string;
  email?:          string;
  birthDate?:      string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootTabParamList = {
  HomeTab:     undefined;
  ServicesTab: undefined;
  BookTab:     undefined;
  OrdersTab:   undefined;
  ProfileTab:  undefined;
};

export type RootStackParamList = {
  Onboarding:      undefined;
  Auth:            undefined;
  Main:            undefined;
  ServiceDetail:   { service: Service };
  DoctorDetail:    { doctor: Doctor };
  OrderDetail:     { order: Order };
  BookOrder:       { service?: Service };
  Notifications:   undefined;
  EditProfile:     undefined;
  Addresses:       undefined;
  HelpCenter:      undefined;
};
