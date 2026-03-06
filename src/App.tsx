import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  GraduationCap,
  Heart,
  Gem,
  Lock
} from 'lucide-react';

// --- Types & Constants ---

type Service = {
  id: string;
  category: string;
  title: string;
  price: number;
  description: string;
  icon?: React.ReactNode;
};

type AddOn = {
  id: string;
  category: string;
  title: string;
  price: number;
  note?: string;
};

const CATEGORIES = {
  REGULER: 'Reguler Makeup',
  WEDDING: 'Wedding Makeup'
};

const DEFAULT_SERVICES: Service[] = [
  // Kategori 1: Reguler Makeup
  { 
    id: 'reg_a_makeup', 
    category: CATEGORIES.REGULER, 
    title: 'Paket A: Graduation / Party (Makeup Only)', 
    price: 650000, 
    description: 'Graduation, Bridesmaid, Party, Photoshoot, Makeup On Stage, Sister of Bride/Groom' 
  },
  { 
    id: 'reg_a_full', 
    category: CATEGORIES.REGULER, 
    title: 'Paket A: Graduation / Party (Makeup + Hairdo)', 
    price: 900000, 
    description: 'Include Hairdo. Graduation, Bridesmaid, Party, etc.' 
  },
  { 
    id: 'reg_b_makeup', 
    category: CATEGORIES.REGULER, 
    title: 'Paket B: Pre-Wedding / Engagement (Makeup Only)', 
    price: 800000, 
    description: 'Pre-Wedding, Engagement, Midodareni, Mother of Bride/Groom' 
  },
  { 
    id: 'reg_b_full', 
    category: CATEGORIES.REGULER, 
    title: 'Paket B: Pre-Wedding / Engagement (Makeup + Hairdo)', 
    price: 1100000, 
    description: 'Include Hairdo. Pre-Wedding, Engagement, etc.' 
  },

  // Kategori 2: Wedding Makeup
  { 
    id: 'wed_a_makeup', 
    category: CATEGORIES.WEDDING, 
    title: 'Paket A: Akad / Pemberkatan (Makeup Only)', 
    price: 2500000, 
    description: '1x Makeup. Holy Matrimony.' 
  },
  { 
    id: 'wed_a_full', 
    category: CATEGORIES.WEDDING, 
    title: 'Paket A: Akad / Pemberkatan (Makeup + Hairdo/Hijabdo)', 
    price: 3000000, 
    description: '1x Makeup + Hairdo/Hijabdo. Holy Matrimony.' 
  },
  { 
    id: 'wed_b_makeup', 
    category: CATEGORIES.WEDDING, 
    title: 'Paket B: Akad / Pemberkatan (Makeup + Retouch)', 
    price: 3000000, 
    description: 'Makeup + Retouch. Holy Matrimony.' 
  },
  { 
    id: 'wed_b_full', 
    category: CATEGORIES.WEDDING, 
    title: 'Paket B: Akad / Pemberkatan (Complete)', 
    price: 4000000, 
    description: 'Makeup + Retouch + Hairdo/Hijabdo. Holy Matrimony.' 
  },
];

const DEFAULT_ADD_ONS: AddOn[] = [
  { id: 'add_reg_hijab', category: CATEGORIES.REGULER, title: 'Hijabdo', price: 100000 },
  { id: 'add_reg_acc', category: CATEGORIES.REGULER, title: 'Accessories', price: 50000, note: 'Start from Rp 50.000' },
  { id: 'add_wed_test', category: CATEGORIES.WEDDING, title: 'Test Makeup', price: 1000000 },
  { id: 'add_wed_acc', category: CATEGORIES.WEDDING, title: 'Accessories', price: 50000, note: 'Start from Rp 50.000' },
];

const TIME_SLOTS = ['04:00', '06:00', '08:00', '10:00', '14:00'];

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbybOUbAaMVR9G17OHhjDCW0C5Frj7ukQ0uodDtmhE3aEeJEfUOXk8G3Zvkzr4YD5Vk/exec';
const WA_NUMBER = '6287785705770';

// --- Components ---

export default function App() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [addOns, setAddOns] = useState<AddOn[]>(DEFAULT_ADD_ONS);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: '',
    selectedAddOns: [] as string[],
    date: '',
    time: '',
    name: '',
    whatsapp: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load prices from localStorage on mount
  React.useEffect(() => {
    const storedPrices = localStorage.getItem('CLA_SERVICES_PRICES');
    if (storedPrices) {
      try {
        const parsed = JSON.parse(storedPrices);
        
        // Merge stored prices for Services
        const mergedServices = DEFAULT_SERVICES.map(defaultSvc => {
          const storedSvc = parsed.find((s: any) => s.id === defaultSvc.id);
          return storedSvc ? { ...defaultSvc, price: storedSvc.price } : defaultSvc;
        });
        setServices(mergedServices);

        // Merge stored prices for Add-ons
        const mergedAddOns = DEFAULT_ADD_ONS.map(defaultAddOn => {
          const storedAddOn = parsed.find((s: any) => s.id === defaultAddOn.id);
          return storedAddOn ? { ...defaultAddOn, price: storedAddOn.price } : defaultAddOn;
        });
        setAddOns(mergedAddOns);
        
      } catch (e) {
        console.error('Failed to parse stored prices', e);
      }
    }
  }, []);

  const selectedService = services.find(s => s.id === formData.serviceId);
  const selectedAddOnItems = addOns.filter(a => formData.selectedAddOns.includes(a.id));
  
  const calculateTotal = () => {
    let total = selectedService ? selectedService.price : 0;
    selectedAddOnItems.forEach(addon => total += addon.price);
    return total;
  };

  const handleNext = () => {
    if (step === 1 && !formData.serviceId) return alert('Silakan pilih layanan utama terlebih dahulu.');
    if (step === 2 && (!formData.date || !formData.time)) return alert('Silakan pilih tanggal dan jam.');
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const toggleAddOn = (id: string) => {
    setFormData(prev => {
      const current = prev.selectedAddOns;
      if (current.includes(id)) {
        return { ...prev, selectedAddOns: current.filter(item => item !== id) };
      } else {
        return { ...prev, selectedAddOns: [...current, id] };
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.whatsapp || !formData.address) {
      return alert('Mohon lengkapi data diri Anda.');
    }

    setIsLoading(true);

    try {
      const totalHarga = calculateTotal();
      const addOnNames = selectedAddOnItems.map(a => a.title).join(', ');
      const fullLayanan = `${selectedService?.title}${addOnNames ? ` + ${addOnNames}` : ''}`;

      // Prepare data for Google Apps Script
      const dataParams = new URLSearchParams();
      dataParams.append('nama', formData.name);
      dataParams.append('wa', formData.whatsapp);
      dataParams.append('layanan', fullLayanan);
      dataParams.append('harga', totalHarga.toString());
      dataParams.append('tanggal', formData.date);
      dataParams.append('jam', formData.time);
      dataParams.append('alamat', formData.address);

      // Send to Google Apps Script
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: dataParams
      });

      // Simulate a short delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsLoading(false);
      setShowSuccess(true);

      // Redirect to WhatsApp
      setTimeout(() => {
        const message = `Halo Admin C.L.A. Pro Makeup Artist, saya sudah booking via web:%0A%0A` +
          `• Layanan Utama: ${selectedService?.title}%0A` +
          (selectedAddOnItems.length > 0 ? `• Add-ons: ${addOnNames}%0A` : '') +
          `• Total Estimasi: Rp ${totalHarga.toLocaleString('id-ID')}%0A` +
          `• Tanggal: ${formData.date}%0A` +
          `• Jam: ${formData.time}%0A` +
          `• Nama: ${formData.name}%0A` +
          `• Alamat: ${formData.address}`;
        
        window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setIsLoading(false);
      alert('Terjadi kesalahan. Silakan coba lagi atau hubungi admin via WhatsApp.');
    }
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-[#A67B5B] selection:text-white">
      {/* Header */}
      <header className="py-8 px-6 text-center border-b border-stone-200 bg-white/50 backdrop-blur-md sticky top-0 z-10 relative shadow-sm">
        <a 
          href="/admin.html" 
          className="absolute top-2 right-4 p-2 text-stone-400 hover:text-[#A67B5B] transition-colors rounded-full hover:bg-stone-100 z-20"
          title="Login Admin"
        >
          <Lock className="w-5 h-5" />
        </a>
        <div className="flex justify-center mb-6">
          <img 
            src="https://i.postimg.cc/2jbhFrzY/logo-png.jpg" 
            alt="C.L.A. Pro Makeup Artist Logo" 
            className="h-32 w-auto object-contain rounded-xl shadow-lg" 
          />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#5D4037] tracking-wider">
          C.L.A. Pro Makeup Artist
        </h1>
        <p className="text-[#8D6E63] text-sm mt-2 tracking-widest uppercase font-medium">
          Beauty & Elegance
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 pb-24">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-serif text-center mb-4 text-[#5D4037] italic">Pilih Layanan</h2>
              
              {/* Category 1: Reguler */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl text-[#8D6E63] border-b border-[#E6D5C3] pb-2">Kategori 1: Reguler Makeup</h3>
                <div className="grid gap-4">
                  {services.filter(s => s.category === CATEGORIES.REGULER).map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setFormData({ ...formData, serviceId: service.id })}
                      className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 group ${
                        formData.serviceId === service.id
                          ? 'bg-[#E6D5C3] border-[#D7C4B0] shadow-md'
                          : 'bg-white border-stone-200 hover:border-[#D7C4B0] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className={`font-serif font-semibold text-lg ${formData.serviceId === service.id ? 'text-[#3E2723]' : 'text-stone-700'}`}>{service.title}</h4>
                          <p className={`text-sm mt-1 ${formData.serviceId === service.id ? 'text-[#5D4037]' : 'text-stone-500'}`}>{service.description}</p>
                        </div>
                        <div className="text-right min-w-fit">
                          <p className={`font-bold ${formData.serviceId === service.id ? 'text-[#3E2723]' : 'text-[#A67B5B]'}`}>{formatPrice(service.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add-ons Reguler */}
                <div className="bg-white/50 p-4 rounded-lg border border-stone-100">
                  <h4 className="text-sm font-bold text-[#8D6E63] mb-3 uppercase tracking-wide">Adds On Reguler</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addOns.filter(a => a.category === CATEGORIES.REGULER).map((addon) => (
                      <div 
                        key={addon.id}
                        onClick={() => toggleAddOn(addon.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.selectedAddOns.includes(addon.id)
                            ? 'bg-[#F5EBE0] border-[#D7C4B0]'
                            : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            formData.selectedAddOns.includes(addon.id) ? 'bg-[#A67B5B] border-[#A67B5B]' : 'border-stone-300'
                          }`}>
                            {formData.selectedAddOns.includes(addon.id) && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-stone-700">{addon.title}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#A67B5B]">{formatPrice(addon.price)}</span>
                          {addon.note && <p className="text-[10px] text-stone-400">{addon.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#F5EBE0]/50 p-3 rounded-lg text-xs text-[#5D4037] italic border border-[#D7C4B0]/50">
                  Note: Retouch/standby (max 3 hours) charge 50%
                </div>
              </div>

              {/* Category 2: Wedding */}
              <div className="space-y-4 pt-4">
                <h3 className="font-serif text-xl text-[#8D6E63] border-b border-[#E6D5C3] pb-2">Kategori 2: Wedding Makeup</h3>
                <div className="grid gap-4">
                  {services.filter(s => s.category === CATEGORIES.WEDDING).map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setFormData({ ...formData, serviceId: service.id })}
                      className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 group ${
                        formData.serviceId === service.id
                          ? 'bg-[#E6D5C3] border-[#D7C4B0] shadow-md'
                          : 'bg-white border-stone-200 hover:border-[#D7C4B0] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className={`font-serif font-semibold text-lg ${formData.serviceId === service.id ? 'text-[#3E2723]' : 'text-stone-700'}`}>{service.title}</h4>
                          <p className={`text-sm mt-1 ${formData.serviceId === service.id ? 'text-[#5D4037]' : 'text-stone-500'}`}>{service.description}</p>
                        </div>
                        <div className="text-right min-w-fit">
                          <p className={`font-bold ${formData.serviceId === service.id ? 'text-[#3E2723]' : 'text-[#A67B5B]'}`}>{formatPrice(service.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add-ons Wedding */}
                <div className="bg-white/50 p-4 rounded-lg border border-stone-100">
                  <h4 className="text-sm font-bold text-[#8D6E63] mb-3 uppercase tracking-wide">Adds On Wedding</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addOns.filter(a => a.category === CATEGORIES.WEDDING).map((addon) => (
                      <div 
                        key={addon.id}
                        onClick={() => toggleAddOn(addon.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.selectedAddOns.includes(addon.id)
                            ? 'bg-[#F5EBE0] border-[#D7C4B0]'
                            : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            formData.selectedAddOns.includes(addon.id) ? 'bg-[#A67B5B] border-[#A67B5B]' : 'border-stone-300'
                          }`}>
                            {formData.selectedAddOns.includes(addon.id) && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-stone-700">{addon.title}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#A67B5B]">{formatPrice(addon.price)}</span>
                          {addon.note && <p className="text-[10px] text-stone-400">{addon.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-serif text-center mb-8 text-[#5D4037] italic">Jadwal Makeup</h2>
              
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#A67B5B]" /> Tanggal Acara
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#FDFBF7] border border-stone-300 rounded-lg px-4 py-3 text-stone-900 focus:ring-2 focus:ring-[#A67B5B] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#A67B5B]" /> Pilih Jam Mulai
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setFormData({ ...formData, time })}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                          formData.time === time
                            ? 'bg-[#A67B5B] text-white border-[#A67B5B] shadow-md'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-[#D7C4B0] hover:bg-[#F5EBE0]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Details & Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-serif text-center mb-8 text-[#5D4037] italic">Konfirmasi Data</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#A67B5B]" /> Nama Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="Nama Anda"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-4 py-3 text-stone-900 focus:ring-2 focus:ring-[#A67B5B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#A67B5B]" /> WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="0812..."
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-4 py-3 text-stone-900 focus:ring-2 focus:ring-[#A67B5B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#A67B5B]" /> Lokasi Makeup
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Alamat lengkap..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-lg px-4 py-3 text-stone-900 focus:ring-2 focus:ring-[#A67B5B] outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[#E6D5C3] shadow-lg h-fit">
                  <h3 className="text-lg font-serif text-[#5D4037] mb-4 border-b border-[#E6D5C3] pb-2">Ringkasan Booking</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Layanan</span>
                      <span className="font-medium text-right text-stone-900">{selectedService?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Tanggal</span>
                      <span className="font-medium text-stone-900">{formData.date || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Jam</span>
                      <span className="font-medium text-stone-900">{formData.time || '-'}</span>
                    </div>
                    <div className="border-t border-[#E6D5C3] pt-3 flex justify-between items-center mt-4">
                      <span className="text-stone-500">Total Biaya</span>
                      <span className="text-xl font-bold text-[#A67B5B]">
                        {selectedService ? formatPrice(selectedService.price) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-stone-200 p-4 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-2xl mx-auto flex gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1 py-3 px-6 rounded-xl border border-stone-300 text-stone-600 font-medium hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Kembali
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-[#A67B5B] text-white py-3 px-6 rounded-xl font-bold hover:bg-[#8D6E63] transition-all shadow-[0_4px_15px_rgba(166,123,91,0.3)] flex items-center justify-center gap-2"
              >
                Lanjut <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[#A67B5B] to-[#8D6E63] text-white py-3 px-6 rounded-xl font-bold hover:from-[#8D6E63] hover:to-[#795548] transition-all shadow-[0_4px_15px_rgba(166,123,91,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    Booking Sekarang <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-stone-400 text-xs pb-28">
        <p>&copy; {new Date().getFullYear()} C.L.A. Pro Makeup Artist. All rights reserved.</p>
      </footer>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border border-stone-100 shadow-2xl"
            >
              <div className="w-16 h-16 bg-[#F5EBE0] text-[#A67B5B] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#5D4037] mb-2">Booking Berhasil!</h3>
              <p className="text-stone-500 mb-6">
                Terima kasih telah melakukan pemesanan. Anda akan segera dialihkan ke WhatsApp admin untuk konfirmasi akhir.
              </p>
              <div className="animate-pulse text-[#A67B5B] text-sm font-medium">
                Mengalihkan ke WhatsApp...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
