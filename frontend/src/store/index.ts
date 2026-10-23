import { create } from 'zustand';
import { Order, User, Service, Address } from '../types';
import { CURRENT_USER } from '../data';
import { api, setAccessToken } from '../api/client';

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
  services: Service[];
  doctors: import('../types').Doctor[];
  token: string | null;
  apiError: string | null;
  selectedService: Service | null;
  isOnboarded: boolean;

  // user actions
  setUser: (user: User) => void;
  authenticate: (mode: 'login' | 'register', fields: { name?: string; phone: string; password: string }) => Promise<void>;
  loadCatalog: () => Promise<void>;
  loadAccount: () => Promise<void>;
  createOrderRequest: (input: { serviceId: string; appointmentAt: string; address: string; type: Order['type'] }) => Promise<Order>;
  updateUserField: (field: keyof User, value: string) => void;
  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // order actions
  addOrder: (order: Order) => void;
  cancelOrder: (id: string) => Promise<void>;

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
  orders: [],
  notifications: INITIAL_NOTIFICATIONS,
  services: [],
  doctors: [],
  token: null,
  apiError: null,
  selectedService: null,
  isOnboarded: false,

  setUser: (user) => set({ user }),

  authenticate: async (mode, fields) => {
    set({ apiError: null });
    try {
      const result = mode === 'register'
        ? await api.register({ name: fields.name || '', phone: fields.phone, password: fields.password })
        : await api.login({ phone: fields.phone, password: fields.password });
      setAccessToken(result.token);
      set({ token: result.token, user: { ...result.user, addresses: [], currentLocation: '' }, isOnboarded: true });
      await Promise.all([get().loadAccount(), get().loadCatalog()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Server bilan bog‘lanib bo‘lmadi.';
      set({ apiError: message });
      throw error;
    }
  },

  loadCatalog: async () => {
    try {
      const [services, doctors] = await Promise.all([api.services(), api.doctors()]);
      set({ services, doctors, apiError: null });
    } catch (error) {
      set({ apiError: error instanceof Error ? error.message : 'Katalogni yuklab bo‘lmadi.' });
    }
  },

  loadAccount: async () => {
    const [profile, orders] = await Promise.all([api.me(), api.orders()]);
    set({ user: profile, orders, apiError: null });
  },

  createOrderRequest: async (input) => {
    const order = await api.createOrder(input);
    set((state) => ({ orders: [order, ...state.orders], apiError: null }));
    return order;
  },

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

  cancelOrder: async (id) => {
    const updated = await api.cancelOrder(id);
    set((s) => ({ orders: s.orders.map((o) => o.id === id ? updated : o) }));
  },

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
