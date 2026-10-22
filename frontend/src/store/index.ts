import { create } from 'zustand';
import { Order, User, Service, Address } from '../types';
import { ORDERS, CURRENT_USER } from '../data';

interface Notification {
  id: string;
  icon: string;
  color: string;
  bg: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: 'checkmark-circle', color: '#00C896', bg: '#E6FAF5', title: "Buyurtma tasdiqlandi",  body: "Tomchilatma buyurtmangiz tasdiqlandi. Hamshira 30 daqiqada keladi.", time: '5 daq oldin',  read: false },
  { id: '2', icon: 'person',           color: '#3B82F6', bg: '#EBF5FF', title: "Hamshira yo'lda",       body: "Dilnoza Rahimova sizning manzilingizga yo'l oldi.",                 time: '20 daq oldin', read: false },
  { id: '3', icon: 'star',             color: '#F59E0B', bg: '#FEF3C7', title: "Baholang",              body: "Kechagi xizmatni baholashni unutmang!",                            time: 'Kecha',        read: true  },
  { id: '4', icon: 'gift',             color: '#EC4899', bg: '#FFF0F9', title: "Yangi chegirma!",       body: "Kelgusi buyurtmangizga 15% chegirma. Muddati: 3 kun.",             time: '2 kun oldin',  read: true  },
];

interface AppState {
  user: User;
  orders: Order[];
  notifications: Notification[];
  selectedService: Service | null;
  isOnboarded: boolean;

  // user actions
  setUser: (user: User) => void;
  updateUserField: (field: keyof User, value: string) => void;
  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // order actions
  addOrder: (order: Order) => void;
  cancelOrder: (id: string) => void;

  // notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // misc
  setSelectedService: (s: Service | null) => void;
  setOnboarded: () => void;

  // computed
  unreadCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: CURRENT_USER,
  orders: ORDERS,
  notifications: INITIAL_NOTIFICATIONS,
  selectedService: null,
  isOnboarded: false,

  setUser: (user) => set({ user }),

  updateUserField: (field, value) =>
    set((s) => ({ user: { ...s.user, [field]: value } })),

  addAddress: (address) =>
    set((s) => ({ user: { ...s.user, addresses: [...s.user.addresses, address] } })),

  updateAddress: (address) =>
    set((s) => ({
      user: {
        ...s.user,
        addresses: s.user.addresses.map((a) => (a.id === address.id ? address : a)),
      },
    })),

  deleteAddress: (id) =>
    set((s) => ({
      user: { ...s.user, addresses: s.user.addresses.filter((a) => a.id !== id) },
    })),

  setDefaultAddress: (id) =>
    set((s) => ({
      user: {
        ...s.user,
        addresses: s.user.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      },
    })),

  addOrder: (order) =>
    set((s) => ({ orders: [order, ...s.orders] })),

  cancelOrder: (id) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status: 'bekor_qilindi' as const } : o
      ),
    })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  setSelectedService: (s) => set({ selectedService: s }),

  setOnboarded: () => set({ isOnboarded: true }),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
