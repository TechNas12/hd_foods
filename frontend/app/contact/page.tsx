'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, ShieldCheck, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { siInstagram, siFacebook, siX } from 'simple-icons';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormState({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setIsSuccess(false), 5000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Heritage Shop",
      details: ["123 Spice Market, Old Delhi,", "New Delhi - 110006, India"],
      color: "text-red-600"
    },
    {
      icon: Phone,
      title: "Call Us Directly",
      details: ["+91 98765 43210", "+91 11 2345 6789"],
      color: "text-amber-600"
    },
    {
      icon: Mail,
      title: "Email Our Concierge",
      details: ["hello@hdfoods.com", "support@hdfoods.com"],
      color: "text-emerald-600"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Sat: 9:00 AM - 8:00 PM", "Sunday: Closed"],
      color: "text-stone-600"
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-red-100 selection:text-red-900">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-6"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-700 bg-red-50 px-4 py-2 rounded-full border border-red-100 shadow-sm">
              We're Here for You
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif font-black text-stone-900 mb-8 leading-tight"
          >
            Get in <span className="italic text-red-700">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-stone-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Whether you have a question about our spices, need help with an order, or just want to share your culinary success—we'd love to hear from you.
          </motion.p>
        </section>

        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative z-10 ">
          {/* Left Column: Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-7 bg-white p-10 md:p-16 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.05)] border border-red-200"
          >
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Send a Message</h2>
              <p className="text-stone-500 font-medium italic">Expected response time: Under 12 hours</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-2">Your Name</label>
                  <input
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-8 py-5 text-sm focus:outline-none focus:border-red-700 focus:bg-white transition-all font-medium placeholder:text-stone-300"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-2">Email Address</label>
                  <input
                    required
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-8 py-5 text-sm focus:outline-none focus:border-red-700 focus:bg-white transition-all font-medium placeholder:text-stone-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-2">Subject</label>
                <input
                  required
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-8 py-5 text-sm focus:outline-none focus:border-red-700 focus:bg-white transition-all font-medium placeholder:text-stone-300"
                  placeholder="What is this regarding?"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-2">Message</label>
                <textarea
                  required
                  rows={6}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-100 rounded-[2rem] px-8 py-6 text-sm focus:outline-none focus:border-red-700 focus:bg-white transition-all font-medium placeholder:text-stone-300 resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer ${isSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-red-700 text-white shadow-red-700/20 hover:bg-red-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSuccess ? (
                  <>
                    <ShieldCheck size={20} />
                    Message Sent Successfully
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Right Column: Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-5 space-y-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-10">
              {contactInfo.map((info, i) => (
                <div key={i} className="group relative">
                  <div className="flex gap-8 items-start">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 group-hover:bg-red-700 group-hover:text-white transition-all duration-500">
                      <info.icon size={24} className={info.color + " group-hover:text-white transition-colors"} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-serif text-xl font-bold text-stone-900">{info.title}</h4>
                      <div className="space-y-1">
                        {info.details.map((line, j) => (
                          <p key={j} className="text-stone-500 font-medium leading-relaxed">{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-stone-200" />

            {/* Social Connect */}
            {/* Social Connect */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 px-1">
                Connect with Us
              </h4>

              <div className="flex gap-4">
                {[siInstagram, siFacebook, siX].map((icon, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1, borderColor: "#B91C1C" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-2xl border border-stone-200 flex items-center justify-center transition-all cursor-pointer bg-white shadow-sm"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill={`#${icon.hex}`}
                    >
                      <path d={icon.path} />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Aesthetic Card */}
            <div className="bg-red-700 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-red-900/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
              <h3 className="text-2xl font-serif font-bold mb-4 relative z-10">Wholesale Inquiry?</h3>
              <p className="text-white/70 font-medium leading-relaxed mb-8 relative z-10">
                Looking for bulk authentic products for your restaurant or store?
              </p>
              <button className="px-8 py-4 bg-white text-red-700 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all relative z-10 cursor-pointer">
                Partner with Us
              </button>
            </div>
          </motion.div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
