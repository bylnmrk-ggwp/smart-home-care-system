import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Heart, Leaf, PhoneCall } from 'lucide-react';
import { Language } from '../utils/translations';

interface EmergencyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function EmergencyDialog({ isOpen, onClose, lang }: EmergencyDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-50 flex items-end justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900 cursor-pointer"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full bg-white rounded-t-[32px] border-t border-rose-100 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85%] relative"
          >
            {/* Header */}
            <div className="p-4 bg-rose-50 border-b border-rose-150 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl p-1.5 bg-rose-100 text-rose-600 rounded-xl animate-bounce">🚨</span>
                <div>
                  <h3 className="font-display font-black text-rose-900 text-sm tracking-tight">
                    {lang === 'tl' ? 'Mabilisang Saklolo at Unang Lunas' : 'Emergency & First Aid Manual'}
                  </h3>
                  <p className="text-[10px] text-rose-700 font-semibold uppercase tracking-wider">
                    {lang === 'tl' ? 'Pagsagip sa mga alaga at halaman' : 'Instant Pet & Plant Rescues'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Manual Content */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
              {/* PETS FIRST AID SECTION */}
              <div className="space-y-2.5">
                <h4 className="font-display font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-orange-100 pb-1 text-orange-700">
                  <Heart size={14} />
                  {lang === 'tl' ? 'Unang Lunas para sa mga Alaga (Pet First Aid)' : 'Pet First Aid Manual'}
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Poisoning */}
                  <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider text-orange-800 font-mono block">
                      ⚠️ {lang === 'tl' ? 'Nakalason / Poisoning' : 'Poisoning Alert'}
                    </span>
                    <p className="mt-1 font-semibold text-slate-800">
                      {lang === 'tl' ? 'Kung nakakain ng tsokolate, ubas, o nakalalasong halaman:' : 'If ingested chocolate, grapes, or toxic houseplants:'}
                    </p>
                    <ul className="list-disc pl-4 mt-1 text-[10px] text-slate-600 space-y-0.5">
                      <li>{lang === 'tl' ? 'Huwag piliting isuka maliban kung payo ng beterinaryo.' : 'Do not induce vomiting unless advised by a vet.'}</li>
                      <li>{lang === 'tl' ? 'Kumuha ng litrato ng nakain para ipakita sa vet.' : 'Take a photo of the substance or plant for the vet.'}</li>
                      <li>{lang === 'tl' ? 'Painumin agad ng tubig kung gising at kaya pa.' : 'Give clean water immediately if conscious.'}</li>
                    </ul>
                  </div>

                  {/* Choking */}
                  <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider text-orange-800 font-mono block">
                      🥩 {lang === 'tl' ? 'Nabilaukan / Choking' : 'Choking / Blocked Airway'}
                    </span>
                    <p className="mt-1 font-semibold text-slate-800">
                      {lang === 'tl' ? 'Hirap huminga o kinakamot ang bibig:' : 'Struggling to breathe or pawing at mouth:'}
                    </p>
                    <ul className="list-disc pl-4 mt-1 text-[10px] text-slate-600 space-y-0.5">
                      <li>{lang === 'tl' ? 'Maingat na buksan ang bibig gamit ang dalawang kamay.' : 'Carefully open the mouth using both hands.'}</li>
                      <li>{lang === 'tl' ? 'Tingnan kung may nakabara. Hilahin lang kung madaling maabot.' : 'Check for obstructions. Swipe only if easily reachable.'}</li>
                      <li>{lang === 'tl' ? 'Heimlich Maneuver: Yakapin sa tiyan sa likod ng tadyang at pisilin pataas.' : 'Perform Heimlich: Squeeze the abdomen upwards right below ribs.'}</li>
                    </ul>
                  </div>

                  {/* Heatstroke */}
                  <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider text-orange-800 font-mono block">
                      🔥 {lang === 'tl' ? 'Heatstroke / Labis na Init' : 'Heatstroke Rescue'}
                    </span>
                    <p className="mt-1 font-semibold text-slate-800">
                      {lang === 'tl' ? 'Mabilisang paghinga (panting) at panghihina sa ilalim ng araw:' : 'Rapid panting, weakness or collapse in hot weather:'}
                    </p>
                    <ul className="list-disc pl-4 mt-1 text-[10px] text-slate-600 space-y-0.5">
                      <li>{lang === 'tl' ? 'Ilayo agad sa initan. Ilagay sa tapat ng bentilador.' : 'Move to a cool, shaded air-conditioned area immediately.'}</li>
                      <li>{lang === 'tl' ? 'Basain ang tiyan, kilikili, at talampakan ng tapid o malamig na tubig.' : 'Wet their chest, belly, and paws with cool (not ice-cold) water.'}</li>
                      <li>{lang === 'tl' ? 'Huwag gumamit ng yelo dahil maaari itong magdulot ng shock.' : 'Avoid ice-cold baths as they cause dangerous blood vessel constriction.'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* PLANT REVIVAL SECTION */}
              <div className="space-y-2.5">
                <h4 className="font-display font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-emerald-100 pb-1 text-emerald-700">
                  <Leaf size={14} />
                  {lang === 'tl' ? 'Pagsagip sa Nalalantang Halaman' : 'Plant Revival Quick Guide'}
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Overwatering */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-800 font-mono block">
                      💧 {lang === 'tl' ? 'Nabulok na Ugat (Overwatered Root Rot)' : 'Root Rot (Overwatered)'}
                    </span>
                    <p className="mt-1 font-semibold text-slate-800">
                      {lang === 'tl' ? 'Dilaw at malambot na dahon, basa at mabahong lupa:' : 'Yellowing mushy leaves, soggy stinky soil:'}
                    </p>
                    <ul className="list-disc pl-4 mt-1 text-[10px] text-slate-600 space-y-0.5">
                      <li>{lang === 'tl' ? 'Itigil agad ang pagdidilig. Patuyuin ang halaman sa maliwanag na lugar.' : 'Stop watering instantly. Let the soil dry completely.'}</li>
                      <li>{lang === 'tl' ? 'Tanggalin sa paso, gupitin ang mga ugat na maitim at malambot.' : 'Unpot and trim black, slimy mushy roots with clean scissors.'}</li>
                      <li>{lang === 'tl' ? 'I-repot sa bagong tuyong lupa na mabilis matuyo (well-draining).' : 'Repot in fresh dry well-draining soil and a pot with drainage.'}</li>
                    </ul>
                  </div>

                  {/* Underwatering */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider text-emerald-800 font-mono block">
                      🏜️ {lang === 'tl' ? 'Tuyong-tuyo / Dehydrated Plant' : 'Severe Dehydration'}
                    </span>
                    <p className="mt-1 font-semibold text-slate-800">
                      {lang === 'tl' ? 'Tuyo, kulubot, at malatuyong dahon na may bitak sa lupa:' : 'Crispy, drooping leaves, soil pulled away from pot edge:'}
                    </p>
                    <ul className="list-disc pl-4 mt-1 text-[10px] text-slate-600 space-y-0.5">
                      <li>{lang === 'tl' ? 'Bottom Watering: Ilubog ang kalahati ng paso sa balde ng tubig sa loob ng 30 minuto.' : 'Bottom Water: Submerge the pot bottom in a tub of water for 30 mins.'}</li>
                      <li>{lang === 'tl' ? 'I-mist ang mga dahon upang tumaas ang halumigmig (humidity).' : 'Mist the leaves to assist in immediate moisture absorption.'}</li>
                      <li>{lang === 'tl' ? 'Ilayo muna sa matinding sikat ng araw hanggang makabawi ang dahon.' : 'Move out of direct blazing sun until leaves plump up again.'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* EMERGENCY HOTLINES placeholder */}
              <div className="p-4 bg-rose-500 text-white rounded-2xl flex items-center gap-3 shadow-md">
                <PhoneCall size={24} className="shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-display font-bold text-xs">
                    {lang === 'tl' ? 'Beterinaryo at Ambulansya (Emergency Numbers)' : 'Local Emergency Contacts'}
                  </h4>
                  <p className="text-[10px] opacity-90 mt-0.5 leading-normal">
                    {lang === 'tl' 
                      ? 'Dalhin agad sa pinakamalapit na 24/7 Veterinary Hospital kung malubha ang lagay.' 
                      : 'Rush to the nearest 24-hour Animal Emergency Clinic if condition deteriorates.'}
                  </p>
                  <p className="text-[10px] font-mono font-bold mt-1 bg-white/20 px-2 py-0.5 rounded inline-block">
                    {lang === 'tl' ? 'Tawagan: 24/7 Vet Hotline - 0917-VET-CARE (838-2273)' : 'Call: 24/7 Companion Care - (02) 8888-VETS'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
