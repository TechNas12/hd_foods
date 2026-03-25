'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, Navigation, Search, Home, Briefcase, MoreHorizontal } from 'lucide-react';
import { addAddress, updateAddress } from '@/lib/api';
import { loadGoogleMaps } from '@/lib/google-maps';
import type { Address } from '@/lib/types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  address?: Address | null;
}

const DEFAULT_CENTER = { lat: 19.9975, lng: 73.7898 }; // Nashik, India

export default function AddressModal({ isOpen, onClose, onSuccess, address }: AddressModalProps) {
  const [formData, setFormData] = useState({
    label: '',
    building_name: '',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomLabel, setShowCustomLabel] = useState(false);

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

  // Initialize data from address prop
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label,
        building_name: address.building_name || '',
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        landmark: address.landmark || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: address.is_default,
        lat: address.lat || DEFAULT_CENTER.lat,
        lng: address.lng || DEFAULT_CENTER.lng,
      });
      setSearchTerm(address.address_line1);
      const isQuickLabel = ['Home', 'Work'].includes(address.label);
      setShowCustomLabel(!isQuickLabel);
    } else {
      setFormData({
        label: '',
        building_name: '',
        address_line1: '',
        address_line2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
        lat: DEFAULT_CENTER.lat,
        lng: DEFAULT_CENTER.lng,
      });
      setSearchTerm('');
      setShowCustomLabel(false);
    }
  }, [address, isOpen]);

  const updateAddressFromCoords = useCallback(async (lat: number, lng: number) => {
    if (!googleInstances.current.geocoder) return;

    try {
      const response = await googleInstances.current.geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        const result = response.results[0];
        const components = result.address_components;

        let city = '';
        let state = '';
        let pincode = '';
        let addressLine1 = result.formatted_address;

        components.forEach((c) => {
          if (c.types.includes('locality')) city = c.long_name;
          if (c.types.includes('administrative_area_level_1')) state = c.long_name;
          if (c.types.includes('postal_code')) pincode = c.long_name;
        });

        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
          address_line1: addressLine1,
          city,
          state,
          pincode,
        }));
        setSearchTerm(addressLine1);
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    const initMaps = async () => {
      try {
        const libs = await loadGoogleMaps();
        if (!libs) return;
        
        const { maps, places, geocoding } = libs;
        const center = { lat: formData.lat, lng: formData.lng };

        // Initialize Map
        const map = new maps.Map(mapRef.current!, {
          center,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
        });

        // Initialize Marker
        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        // Initialize Geocoder
        const geocoder = new geocoding.Geocoder();

        // Initialize Autocomplete
        const autocomplete = new places.Autocomplete(searchInputRef.current!, {
          fields: ['address_components', 'geometry', 'formatted_address'],
          componentRestrictions: { country: 'in' },
        });

        googleInstances.current = { map, marker, geocoder, autocomplete };

        // Marker drag event
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            updateAddressFromCoords(pos.lat(), pos.lng());
          }
        });

        // Autocomplete selection event
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            map.setCenter({ lat, lng });
            marker.setPosition({ lat, lng });

            const components = place.address_components || [];
            let city = '';
            let state = '';
            let pincode = '';

            components.forEach((c) => {
              if (c.types.includes('locality')) city = c.long_name;
              if (c.types.includes('administrative_area_level_1')) state = c.long_name;
              if (c.types.includes('postal_code')) pincode = c.long_name;
            });

            setFormData((prev) => ({
              ...prev,
              lat,
              lng,
              address_line1: place.formatted_address || '',
              city,
              state,
              pincode,
            }));
            setSearchTerm(place.formatted_address || '');
          }
        });
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError('Failed to load Google Maps. Please check your internet or API key.');
      }
    };

    initMaps();
  }, [isOpen]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (googleInstances.current.map && googleInstances.current.marker) {
          googleInstances.current.map.setCenter({ lat, lng });
          googleInstances.current.marker.setPosition({ lat, lng });
          updateAddressFromCoords(lat, lng);
        }
        setIsLocating(false);
      },
      (err) => {
        setError('Location access denied or failed');
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (address) {
        await updateAddress(address.id, formData);
      } else {
        await addAddress(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
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
              
              {/* Search Overlay */}
              <div className="absolute top-6 left-6 right-6 z-10">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-red-600 transition-colors">
                    <Search size={18} />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for your location..."
                    className="w-full bg-white/95 backdrop-blur-xl border-2 border-transparent focus:border-red-600/20 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium shadow-2xl shadow-stone-900/10 focus:outline-none transition-all"
                  />
                  <button
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                  </button>
                </div>
              </div>

              {/* Marker Hint */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-stone-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  Drag marker to refine location
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 flex flex-col overflow-y-auto custom-scrollbar p-8 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <h2 className="text-2xl font-serif font-black text-stone-900">
                    {address ? 'Edit Address' : 'Add New Address'}
                  </h2>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl text-stone-400 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Labels */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Address Label</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: 'Home', icon: Home },
                      { id: 'Work', icon: Briefcase },
                      { id: 'Other', icon: MoreHorizontal },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => {
                          if (btn.id === 'Other') {
                            setShowCustomLabel(true);
                            setFormData({ ...formData, label: '' });
                          } else {
                            setShowCustomLabel(false);
                            setFormData({ ...formData, label: btn.id });
                          }
                        }}
                        className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                          (formData.label === btn.id && !showCustomLabel) || (btn.id === 'Other' && showCustomLabel)
                            ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                            : 'bg-white text-stone-900 border-stone-100 hover:border-red-600/30'
                        }`}
                      >
                        <btn.icon size={16} />
                        {btn.id}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {showCustomLabel && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <input
                          required
                          value={formData.label}
                          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                          placeholder="e.g. Grandma's House"
                          className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 mt-3 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Building/Flat Details</label>
                    <input
                      required
                      value={formData.building_name}
                      onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                      placeholder="e.g. 102, Royal Residency"
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Area/Street (Auto-filled)</label>
                    <input
                      required
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                      placeholder="Street name..."
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Landmark (Optional)</label>
                    <input
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      placeholder="Near City Mall"
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Apartment/Plot (Optional)</label>
                    <input
                      value={formData.address_line2}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                      placeholder="Building B, Floor 4"
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">City</label>
                    <input
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">State</label>
                    <input
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Pincode</label>
                    <input
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-y border-stone-100 px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Loader2 size={18} className={`${isLocating ? 'animate-spin' : 'hidden'}`} />
                      <Navigation size={18} className={`${isLocating ? 'hidden' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-stone-900">Coordinates Saved</h4>
                      <p className="text-[10px] text-stone-400 font-medium">{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
                    />
                    <label htmlFor="is_default" className="text-xs font-black uppercase tracking-widest text-stone-700 cursor-pointer">
                      Default
                    </label>
                  </div>
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
                  className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-red-600/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      {address ? 'Update Profile Address' : 'Save Delivery Address'}
                    </>
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
