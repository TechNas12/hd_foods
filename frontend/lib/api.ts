'use client';

import { apiFetch, getToken } from './api-client';
import type {
  Product, ProductSummary, ProductImage, User, Address, Order,
  OrderSummary, Review, EnquiryTicket, EnquiryTicketSummary, Category,
} from './types';


// ─────────────────────────────────────────────
// Products (Public)
// ─────────────────────────────────────────────
export async function fetchProducts(params?: {
  category_id?: number;
  category_slug?: string;
  search?: string;
  skip?: number;
  limit?: number;
  is_featured?: boolean;
}): Promise<ProductSummary[]> {
  const searchParams = new URLSearchParams();
  if (params?.category_id) searchParams.set('category_id', params.category_id.toString());
  if (params?.category_slug) searchParams.set('category_slug', params.category_slug);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.skip) searchParams.set('skip', params.skip.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.is_featured !== undefined) searchParams.set('is_featured', params.is_featured.toString());

  const query = searchParams.toString();
  return apiFetch<ProductSummary[]>(`/products/${query ? `?${query}` : ''}`);
}

export async function fetchProductById(id: number): Promise<Product> {
  return apiFetch<Product>(`/products/id/${id}`);
}

export async function fetchProduct(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${slug}`);
}


// ─────────────────────────────────────────────
// Categories (Public)
// ─────────────────────────────────────────────────────
export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories/');
}


// ─────────────────────────────────────────────
// Auth / User (Protected)
// ─────────────────────────────────────────────
export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string; // Fixed: string, not str
  phone?: string;
}): Promise<User> {
  return apiFetch<User>('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchProfile(): Promise<User> {
  return apiFetch<User>('/users/me', {}, true);
}

export async function updateProfile(payload: {
  full_name?: string;
  phone?: string;
}): Promise<User> {
  return apiFetch<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, true);
}


// ─────────────────────────────────────────────
// Addresses (Protected)
// ─────────────────────────────────────────────
export async function fetchAddresses(): Promise<Address[]> {
  return apiFetch<Address[]>('/addresses/', {}, true);
}

export async function addAddress(payload: {
  label: string;
  building_name?: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}): Promise<Address> {
  return apiFetch<Address>('/addresses/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function updateAddress(addressId: number, payload: {
  label?: string;
  building_name?: string;
  address_line1?: string;
  address_line2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  is_default?: boolean;
}): Promise<Address> {
  return apiFetch<Address>(`/addresses/${addressId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, true);
}

export async function deleteAddress(addressId: number): Promise<void> {
  return apiFetch<void>(`/addresses/${addressId}`, {
    method: 'DELETE',
  }, true);
}

export async function setDefaultAddress(addressId: number): Promise<Address> {
  return apiFetch<Address>(`/addresses/${addressId}/set-default`, {
    method: 'PATCH',
  }, true);
}


// ─────────────────────────────────────────────
// Orders (Protected)
// ─────────────────────────────────────────────
export async function placeOrder(payload: {
  address_id: number;
  payment_method: string;
  items: Array<{
    product_id: number;
    variant_id?: number;
    quantity: number;
  }>;
}): Promise<Order> {
  return apiFetch<Order>('/orders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function fetchMyOrders(): Promise<OrderSummary[]> {
  return apiFetch<OrderSummary[]>('/orders/my', {}, true);
}

export async function fetchMyOrder(orderId: number): Promise<Order> {
  return apiFetch<Order>(`/orders/my/${orderId}`, {}, true);
}


// ─────────────────────────────────────────────
// Reviews (Public read, Protected write)
// ─────────────────────────────────────────────
export async function fetchProductReviews(productId: number): Promise<Review[]> {
  return apiFetch<Review[]>(`/support/reviews/product/${productId}`);
}

export async function createReview(payload: {
  product_id: number;
  rating: number;
  comment?: string;
}): Promise<Review> {
  return apiFetch<Review>('/support/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}


// ─────────────────────────────────────────────
// Support Tickets (Protected)
// ─────────────────────────────────────────────
export async function createTicket(payload: {
  subject: string;
  message: string;
  order_id?: number;
}): Promise<EnquiryTicket> {
  return apiFetch<EnquiryTicket>('/support/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function fetchMyTickets(): Promise<EnquiryTicketSummary[]> {
  return apiFetch<EnquiryTicketSummary[]>('/support/tickets/my', {}, true);
}


// ─────────────────────────────────────────────
// Admin — Products
// ─────────────────────────────────────────────
export async function adminCreateProduct(payload: {
  name: string;
  slug?: string;
  category_id?: number;
  subtitle?: string;
  description?: string;
  base_price: number;
  original_price?: number;
  is_featured?: boolean;
  variants?: Array<{ name: string; price_override?: number; stock_quantity?: number }>;
  images?: Array<{ image_url: string; storage_path: string; is_hero?: boolean; variant_id?: number }>;
}): Promise<Product> {
  return apiFetch<Product>('/products/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function adminUpdateProduct(productId: number, payload: {
  name?: string;
  category_id?: number;
  subtitle?: string;
  description?: string;
  base_price?: number;
  original_price?: number;
  is_active?: boolean;
  is_featured?: boolean;
  variants?: Array<{ id?: number; name: string; price_override?: number; stock_quantity?: number }>;
}): Promise<Product> {
  return apiFetch<Product>(`/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, true);
}

export async function adminDeleteProduct(productId: number): Promise<void> {
  return apiFetch<void>(`/products/${productId}`, {
    method: 'DELETE',
  }, true);
}

export async function adminAddProductImage(productId: number, payload: {
  storage_path: string;
  image_url: string;
  is_hero?: boolean;
  sort_order?: number;
}): Promise<ProductImage> {
  return apiFetch<ProductImage>(`/products/${productId}/images`, {
    method: 'POST',
    body: JSON.stringify({ ...payload, product_id: productId }),
  }, true);
}

export async function adminDeleteProductImage(imageId: string): Promise<void> {
  return apiFetch<void>(`/products/images/${imageId}`, {
    method: 'DELETE',
  }, true);
}

export async function adminUpdateProductImage(imageId: string, payload: {
  is_hero?: boolean;
  sort_order?: number;
}): Promise<ProductImage> {
  return apiFetch<ProductImage>(`/products/images/${imageId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, true);
}


// ─────────────────────────────────────────────
// Admin — Categories
// ─────────────────────────────────────────────
export async function adminCreateCategory(payload: {
  name: string;
  slug?: string;
  description?: string;
}): Promise<Category> {
  return apiFetch<Category>('/categories/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function adminUpdateCategory(categoryId: number, payload: {
  name?: string;
  slug?: string;
  description?: string;
}): Promise<Category> {
  return apiFetch<Category>(`/categories/${categoryId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, true);
}

export async function adminDeleteCategory(catId: number): Promise<void> {
  return apiFetch<void>(`/categories/${catId}`, {
    method: 'DELETE',
  }, true);
}


// ─────────────────────────────────────────────
// Admin — Orders
// ─────────────────────────────────────────────
export async function adminFetchOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders/', {}, true);
}

export async function adminUpdateOrderStatus(
  orderId: number,
  status: string,
): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, true);
}

export async function adminUpdatePaymentStatus(
  orderId: number,
  paymentStatus: string,
): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/payment`, {
    method: 'PATCH',
    body: JSON.stringify({ payment_status: paymentStatus }),
  }, true);
}


// ─────────────────────────────────────────────
// Admin — Tickets
// ─────────────────────────────────────────────
export async function adminFetchTickets(): Promise<EnquiryTicketSummary[]> {
  return apiFetch<EnquiryTicketSummary[]>('/support/tickets', {}, true);
}

export async function adminUpdateTicketStatus(
  ticketId: number,
  status: string,
): Promise<EnquiryTicket> {
  return apiFetch<EnquiryTicket>(`/support/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, true);
}


// ─────────────────────────────────────────────
// Admin — Users
// ─────────────────────────────────────────────
export async function adminFetchUsers(): Promise<User[]> {
  return apiFetch<User[]>('/users/', {}, true);
}

export async function adminCreateUser(payload: {
  full_name: string;
  email: string;
  phone?: string;
  password?: string;
  is_admin?: boolean;
}): Promise<User> {
  return apiFetch<User>('/users/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
}

export async function adminUpdateUser(
  userId: number,
  payload: {
    full_name?: string;
    email?: string;
    phone?: string;
    password?: string;
    is_admin?: boolean;
  },
): Promise<User> {
  return apiFetch<User>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, true);
}

export async function adminDeleteUser(userId: number): Promise<void> {
  await apiFetch(`/users/${userId}`, {
    method: 'DELETE',
  }, true);
}
