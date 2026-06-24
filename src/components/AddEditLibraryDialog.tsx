import React, { useState, useEffect, useRef } from 'react';
import { X, Leaf, Heart, Camera, Trash2 } from 'lucide-react';
import { Language, translate } from '../utils/translations';
import { UserLibraryItem } from '../utils/userLibraryStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<UserLibraryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  lang: Language;
  editItem?: UserLibraryItem | null;
  prefill?: Partial<Omit<UserLibraryItem, 'id' | 'createdAt' | 'updatedAt'>> | null;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AddEditLibraryDialog({ isOpen, onClose, onSave, lang, editItem, prefill }: Props) {
  const [type, setType] = useState<'plant' | 'pet'>(editItem?.type || prefill?.type || 'plant');
  const [name, setName] = useState(editItem?.name || prefill?.name || '');
  const [scientificName, setScientificName] = useState(editItem?.scientificName || prefill?.scientificName || '');
  const [category, setCategory] = useState(editItem?.category || prefill?.category || '');
  const [description, setDescription] = useState(editItem?.description || prefill?.description || '');
  const [careInstructions, setCareInstructions] = useState(editItem?.careInstructions || prefill?.careInstructions || '');
  const [benefits, setBenefits] = useState(editItem?.benefits || prefill?.benefits || '');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor' | 'both'>(editItem?.indoorOutdoor || prefill?.indoorOutdoor || 'indoor');
  const [image, setImage] = useState(editItem?.image || prefill?.image || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setName(editItem.name);
      setScientificName(editItem.scientificName || '');
      setCategory(editItem.category);
      setDescription(editItem.description);
      setCareInstructions(editItem.careInstructions);
      setBenefits(editItem.benefits);
      setIndoorOutdoor(editItem.indoorOutdoor || 'indoor');
      setImage(editItem.image || '');
    } else if (prefill) {
      setType(prefill.type || 'plant');
      setName(prefill.name || '');
      setScientificName(prefill.scientificName || '');
      setCategory(prefill.category || '');
      setDescription(prefill.description || '');
      setCareInstructions(prefill.careInstructions || '');
      setBenefits(prefill.benefits || '');
      setIndoorOutdoor(prefill.indoorOutdoor || 'indoor');
      setImage(prefill.image || '');
    } else {
      setType('plant');
      setName('');
      setScientificName('');
      setCategory('');
      setDescription('');
      setCareInstructions('');
      setBenefits('');
      setIndoorOutdoor('indoor');
      setImage('');
    }
  }, [editItem, prefill, isOpen]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'tl' ? 'Ang larawan ay dapat mas mababa sa 5MB.' : 'Image must be under 5MB.');
      return;
    }
    setUploading(true);
    try {
      const base64 = await readFileAsBase64(file);
      setImage(base64);
    } catch {
      alert(lang === 'tl' ? 'Hindi mabasa ang larawan.' : 'Could not read image.');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    setImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    onSave({
      type,
      name: name.trim(),
      scientificName: scientificName.trim(),
      category: category.trim() || (type === 'plant' ? 'Houseplant' : 'Domestic Pet'),
      description: description.trim(),
      careInstructions: careInstructions.trim(),
      benefits: benefits.trim(),
      indoorOutdoor,
      image: image.trim(),
      importedFrom: editItem?.importedFrom || prefill?.importedFrom,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-4">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-display font-semibold text-sm text-slate-800 flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${type === 'plant' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
              {type === 'plant' ? <Leaf size={15} /> : <Heart size={15} />}
            </span>
            {editItem
              ? (lang === 'tl' ? 'I-edit ang Entry' : 'Edit Entry')
              : (lang === 'tl' ? 'Magdagdag ng Entry' : 'Add New Entry')}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            <button type="button" onClick={() => setType('plant')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${
                type === 'plant' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <Leaf size={13} className="inline mr-1" />{lang === 'tl' ? 'Halaman' : 'Plant'}
            </button>
            <button type="button" onClick={() => setType('pet')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition cursor-pointer ${
                type === 'pet' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <Heart size={13} className="inline mr-1" />{lang === 'tl' ? 'Alaga' : 'Pet'}
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 text-sm">{translate('plantName', lang)} *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'tl' ? 'Pangalan...' : 'e.g., Monstera, Labrador...'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800" />
          </div>

          {/* Scientific Name */}
          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 text-sm">
              {lang === 'tl' ? 'Siyentipikong Pangalan' : 'Scientific Name'}
            </label>
            <input type="text" value={scientificName} onChange={(e) => setScientificName(e.target.value)}
              placeholder="e.g., Monstera deliciosa, Canis lupus..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800" />
          </div>

          {/* Category + Indoor/Outdoor for plants */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 text-sm">{lang === 'tl' ? 'Kategorya' : 'Category'}</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                placeholder={type === 'plant' ? 'Houseplant, Herb...' : 'Dog, Cat, Bird...'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800" />
            </div>
            {type === 'plant' && (
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 text-sm">{lang === 'tl' ? 'Lokasyon' : 'Indoor/Outdoor'}</label>
                <select value={indoorOutdoor} onChange={(e) => setIndoorOutdoor(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500">
                  <option value="indoor">{lang === 'tl' ? 'Panloob' : 'Indoor'}</option>
                  <option value="outdoor">{lang === 'tl' ? 'Panlabas' : 'Outdoor'}</option>
                  <option value="both">{lang === 'tl' ? 'Pareho' : 'Both'}</option>
                </select>
              </div>
            )}
          </div>

          {/* Upload Photo */}
          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 text-sm">
              <Camera size={12} className="inline mr-1" />{lang === 'tl' ? 'Mag-upload ng Larawan' : 'Upload Photo'}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {image ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition cursor-pointer"
                  title={lang === 'tl' ? 'Tanggalin ang larawan' : 'Remove image'}>
                  <Trash2 size={14} />
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/50 hover:bg-black/70 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer">
                  <Camera size={12} />{lang === 'tl' ? 'Palitan' : 'Change'}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="w-full h-36 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 text-slate-400 hover:text-emerald-600 transition cursor-pointer disabled:opacity-50">
                <Camera size={24} />
                <span className="text-xs font-bold">
                  {uploading ? (lang === 'tl' ? 'Binabasa...' : 'Reading...') : (lang === 'tl' ? 'Pumili ng larawan' : 'Tap to select photo')}
                </span>
                <span className="text-[8px] text-slate-400">{lang === 'tl' ? 'Max 5MB' : 'Max 5MB'}</span>
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 text-sm">{lang === 'tl' ? 'Paglalarawan' : 'Description'} *</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder={lang === 'tl' ? 'Ilarawan ang halaman o alaga...' : 'Describe this plant or pet...'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 resize-none" />
          </div>

          {/* Care Instructions */}
          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 text-sm">{lang === 'tl' ? 'Mga Tagubilin sa Pag-aalaga' : 'Care Instructions'}</label>
            <textarea value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} rows={2}
              placeholder={lang === 'tl' ? 'Paano alagaan...' : 'How to care for this plant/pet...'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 resize-none" />
          </div>

          {/* Benefits */}
          <div>
            <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1 text-sm">{lang === 'tl' ? 'Mga Benepisyo' : 'Benefits'}</label>
            <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={2}
              placeholder={lang === 'tl' ? 'Mga benepisyo...' : 'Health, lifestyle benefits...'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 resize-none" />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition cursor-pointer">
              {lang === 'tl' ? 'Kanselahin' : 'Cancel'}
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition cursor-pointer">
              {editItem ? (lang === 'tl' ? 'I-save ang Pagbabago' : 'Save Changes') : (lang === 'tl' ? 'Idagdag' : 'Add Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
