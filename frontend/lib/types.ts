// ─────────────────────────────────────────────
// TypeScript interfaces matching backend Pydantic schemas
// ─────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProductImage {
  id: string;
  product_id: number;
  variant_id?: number | null;
  storage_path: string;
  image_url: string;
  is_hero: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  price_override: number | null;
  stock_quantity: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category_id: number | null;
  category_rel?: Category | null;
  subtitle: string | null;
  description: string | null;
  base_price: number;
  original_price: number | null;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  is_featured: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  category_id: number | null;
  category_rel?: Category | null;
  subtitle: string | null;
  base_price: number;
  original_price: number | null;
  rating: number;
  is_featured: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  member_since: string;
  is_admin: boolean;
  is_superuser: boolean;
  addresses: Address[];
}

export interface UserSummary {
  id: number;
  full_name: string;
  email: string;
  is_superuser?: boolean;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  building_name: string | null;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  lat: number | null;
  lng: number | null;
  maps_url: string | null;
}

export interface AddressWithUser extends Address {
  user?: UserSummary;
}

export interface AddressDistanceItem {
  id: number;
  label: string;
  address_line1: string;
  city: string | null;
  pincode: string | null;
  lat: number | null;
  lng: number | null;
  maps_url: string | null;
  distance_km: number | null;
}

export interface UserDistance {
  user_id: number;
  full_name: string;
  email: string;
  addresses: AddressDistanceItem[];
  avg_distance_km: number | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: number;
  variant: ProductVariant | null;
  product: ProductSummary | null;
}

export interface Order {
  id: number;
  user_id: number | null;
  address_id: number | null;
  status: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  updated_at: string | null;
  items: OrderItem[];
  user: UserSummary | null;
  address: Address | null;
  distance_km: number | null;
}

export interface OrderSummary {
  id: number;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  item_count: number | null;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number | null;
  rating: number;
  comment: string | null;
  user: UserSummary | null;
  created_at: string;
}

export interface EnquiryTicket {
  id: number;
  user_id: number | null;
  order_id: number | null;
  subject: string;
  message: string;
  status: string;
  user: UserSummary | null;
  created_at: string;
}

export interface EnquiryTicketSummary {
  id: number;
  subject: string;
  status: string;
  order_id: number | null;
  created_at: string;
}

export interface StoreSettings {
  id: number;
  warehouse_address: string | null;
  warehouse_lat: number | null;
  warehouse_lng: number | null;
  free_delivery_km: number;
  tier1_delivery_km: number;
  tier1_delivery_fee: number;
  updated_at: string;
}
