export interface Address {
  id: number;
  label: string;
  isDefault: boolean;
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  estimatedDelivery?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  initials: string;
  memberSince: string;
}

export const mockUser: UserProfile = {
  name: "Rahul Sharma",
  email: "rahul.sharma@email.com",
  phone: "+91 98765 43210",
  initials: "RS",
  memberSince: "March 2023"
};

export const mockAddresses: Address[] = [
  {
    id: 1,
    label: "Home",
    isDefault: true,
    fullName: "Rahul Sharma",
    street: "Flat 402, Heritage Residency, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    phone: "+91 98765 43210"
  },
  {
    id: 2,
    label: "Office",
    isDefault: false,
    fullName: "Rahul Sharma",
    street: "Building 7, Tech Park SEZ, Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560066",
    phone: "+91 98765 43211"
  }
];

export const mockOrders: Order[] = [
  {
    id: "HD-2024-882",
    date: "March 15, 2024",
    status: "Delivered",
    total: 847,
    items: [
      { name: "Authentic Garam Masala", quantity: 2, price: 199 },
      { name: "Methi Thepla (Pack of 10)", quantity: 3, price: 149 }
    ]
  },
  {
    id: "HD-2024-915",
    date: "March 19, 2024",
    status: "Shipped",
    total: 348,
    items: [
      { name: "Kitchen King Masala", quantity: 1, price: 199 },
      { name: "Turmeric Powder (200g)", quantity: 1, price: 149 }
    ],
    estimatedDelivery: "March 22, 2024"
  },
  {
    id: "HD-2024-921",
    date: "March 21, 2024",
    status: "Processing",
    total: 129,
    items: [
      { name: "Chai Masala", quantity: 1, price: 129 }
    ]
  }
];
