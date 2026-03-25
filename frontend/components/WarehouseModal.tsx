'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, Navigation, Search, Store } from 'lucide-react';
import { adminUpdateSettings } from '@/lib/api';
import { loadGoogleMaps } from '@/lib/google-maps';
import type { StoreSettings } from '@/lib/types';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  settings: StoreSettings | null;
}

const DEFAULT_CENTER = { lat: 19.9975, lng: 73.7898 };

export default function WarehouseModal({ isOpen, onClose, onSuccess, settings }: WarehouseModalProps) {
  const [formData, setFormData] = useState({
    warehouse_address: '',
    warehouse_lat: DEFAULT_CENTER.lat,
    warehouse_lng: DEFAULT_CENTER.lng,
    free_delivery_km: 3.0,
    tier1_delivery_km: 6.0,
    tier1_delivery_fee: 80.00,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const googleInstances = useRef<{
    map: google.maps.Map | null;
    marker: google.maps.Marker | null;
    autocomplete: google.maps.places.Autocomplete | null;
    geocoder: google.maps.Geocoder | null;
  }>({
    map: null,
    marker: null,
    autocomplete: null,
    geocoder: null,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        warehouse_address: settings.warehouse_address || '',
        warehouse_lat: settings.warehouse_lat || DEFAULT_CENTER.lat,
        warehouse_lng: settings.warehouse_lng || DEFAULT_CENTER.lng,
        free_delivery_km: settings.free_delivery_km,
        tier1_delivery_km: settings.tier1_delivery_km,
        tier1_delivery_fee: settings.tier1_delivery_fee,
      });
      setSearchTerm(settings.warehouse_address || '');
    }
  }, [settings, isOpen]);

  const updateAddressFromCoords = useCallback(async (lat: number, lng: number) => {
    if (!googleInstances.current.geocoder) return;
    try {
      const response = await googleInstances.current.geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setFormData((prev) => ({ ...prev, lat, lng, warehouse_address: address }));
        setSearchTerm(address);
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    const initMaps = async () => {
      try {
        const libs = await loadGoogleMaps();
        if (!libs) return;
        
        const { maps, places, geocoding } = libs;
        const center = { lat: formData.warehouse_lat, lng: formData.warehouse_lng };

        const map = new maps.Map(mapRef.current!, {
          center,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
        });

        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        const geocoder = new geocoding.Geocoder();
        const autocomplete = new places.Autocomplete(searchInputRef.current!, {
          fields: ['geometry', 'formatted_address'],
          componentRestrictions: { country: 'in' },
        });

        googleInstances.current = { map, marker, geocoder, autocomplete };

        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            setFormData(prev => ({ ...prev, warehouse_lat: pos.lat(), warehouse_lng: pos.lng() }));
            updateAddressFromCoords(pos.lat(), pos.lng());
          }
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            map.setCenter({ lat, lng });
            marker.setPosition({ lat, lng });
            setFormData((prev) => ({
              ...prev,
              warehouse_lat: lat,
              warehouse_lng: lng,
              warehouse_address: place.formatted_address || '',
            }));
            setSearchTerm(place.formatted_address || '');
          }
        });
      } catch (err) {
        setError('Failed to load Google Maps.');
      }
    };
    initMaps();
  }, [isOpen]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (googleInstances.current.map && googleInstances.current.marker) {
          googleInstances.current.map.setCenter({ lat, lng });
          googleInstances.current.marker.setPosition({ lat, lng });
          setFormData(prev => ({ ...prev, warehouse_lat: lat, warehouse_lng: lng }));
          updateAddressFromCoords(lat, lng);
        }
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await adminUpdateSettings(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply store settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-stone-200"
          >
            {/* Left Side: Map & Search */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-stone-100">
              <div ref={mapRef} className="absolute inset-0 w-full h-full" />
              <div className="absolute top-6 left-6 right-6 z-10">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400">
                    <Search size={18} />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for warehouse location..."
                    className="w-full bg-white/95 backdrop-blur-xl border-2 border-transparent focus:border-red-600/20 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium shadow-2xl focus:outline-none transition-all"
                  />
                  <button
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                  >
                    {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Settings Form */}
            <div className="w-full md:w-1/2 flex flex-col overflow-y-auto custom-scrollbar p-8 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center">
                    <Store size={24} />
                  </div>
                  <h2 className="text-2xl font-serif font-black text-stone-900">
                    Warehouse & Shipping
                  </h2>
                </div>
                <button onClick={onClose} className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl text-stone-400 transition-all cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Warehouse Address String</label>
                  <input
                    required
                    value={formData.warehouse_address}
                    onChange={(e) => setFormData({ ...formData, warehouse_address: e.target.value })}
                    placeholder="e.g. 101, Industrial Estate, Nashik"
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Lat</label>
                    <input
                      disabled
                      value={formData.warehouse_lat.toFixed(6)}
                      className="w-full bg-stone-100 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-medium text-stone-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Lng</label>
                    <input
                      disabled
                      value={formData.warehouse_lng.toFixed(6)}
                      className="w-full bg-stone-100 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-medium text-stone-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 pb-2 border-t border-stone-100">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Distance-based Shipping Rules</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Free Radius (km)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={formData.free_delivery_km}
                      onChange={(e) => setFormData({ ...formData, free_delivery_km: parseFloat(e.target.value) })}
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Tier 1 Radius (km)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={formData.tier1_delivery_km}
                      onChange={(e) => setFormData({ ...formData, tier1_delivery_km: parseFloat(e.target.value) })}
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Tier 1 Flat Fee (₹)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.tier1_delivery_fee}
                    onChange={(e) => setFormData({ ...formData, tier1_delivery_fee: parseFloat(e.target.value) })}
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium font-mono"
                  />
                  <p className="text-[10px] font-medium text-stone-400 pt-1">Beyond Tier 1 Radius, shipping state will appear as "Will be communicated"</p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 mt-4 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-red-600/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    'Apply Global Settings'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
