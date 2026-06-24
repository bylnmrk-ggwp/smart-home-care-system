import React, { useState, useEffect, useRef } from 'react';
import { Language, translate } from '../utils/translations';

interface PINLockProps {
  lang: Language;
  onUnlock: () => void;
}

const PIN_KEY = 'care_system_pin';

export function getPinStatus(): { hasPin: boolean; pinHash: string } {
  const stored = localStorage.getItem(PIN_KEY);
  if (stored) {
    try {
      return { hasPin: true, pinHash: stored };
    } catch {
      return { hasPin: false, pinHash: '' };
    }
  }
  return { hasPin: false, pinHash: '' };
}

function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h' + Math.abs(hash).toString(36);
}

export function setPin(pin: string): void {
  localStorage.setItem(PIN_KEY, hashPin(pin));
}

export function clearPin(): void {
  localStorage.removeItem(PIN_KEY);
}

function verifyPin(pin: string): boolean {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return true;
  return stored === hashPin(pin);
}

export function PINLock({ lang, onUnlock }: PINLockProps) {
  const [step, setStep] = useState<'setup' | 'confirm' | 'lock'>('lock');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  const { hasPin } = getPinStatus();

  useEffect(() => {
    if (!hasPin) {
      setStep('setup');
    } else {
      setStep('lock');
    }
  }, [hasPin]);

  useEffect(() => {
    if (step === 'setup' && inputRef.current) inputRef.current.focus();
    if (step === 'confirm' && confirmInputRef.current) confirmInputRef.current.focus();
    if (step === 'lock' && inputRef.current) inputRef.current.focus();
  }, [step]);

  const handleDigit = (digit: string) => {
    if (step === 'setup' && pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      if (newPin.length === 6) {
        setTimeout(() => setStep('confirm'), 200);
      }
    } else if (step === 'confirm' && confirmPin.length < 6) {
      const newConfirm = confirmPin + digit;
      setConfirmPin(newConfirm);
      setError('');
      if (newConfirm.length === 6) {
        if (newConfirm === pin) {
          setPin(pin);
          setPin(pin);
          setTimeout(() => {
            setPin(pin);
            localStorage.setItem(PIN_KEY, hashPin(pin));
            onUnlock();
          }, 200);
        } else {
          setError(lang === 'tl' ? 'Hindi tugma ang PIN. Subukan muli.' : 'PIN does not match. Try again.');
          setConfirmPin('');
          setStep('setup');
          setPin('');
        }
      }
    } else if (step === 'lock') {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 6) {
        if (verifyPin(newPin)) {
          onUnlock();
        } else {
          setAttempts(prev => prev + 1);
          setError(lang === 'tl' ? 'Maling PIN. Subukan muli.' : 'Wrong PIN. Try again.');
          setPin('');
          if (inputRef.current) inputRef.current.focus();
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'setup' && pin.length > 0) setPin(pin.slice(0, -1));
    else if (step === 'confirm' && confirmPin.length > 0) setConfirmPin(confirmPin.slice(0, -1));
    else if (step === 'lock' && pin.length > 0) setPin(pin.slice(0, -1));
  };

  const currentPin = step === 'confirm' ? confirmPin : pin;
  const displayPin = currentPin;

  const getTitle = () => {
    if (step === 'setup') return lang === 'tl' ? 'Gumawa ng PIN (6 digit)' : 'Create a 6-digit PIN';
    if (step === 'confirm') return lang === 'tl' ? 'Kumpirmahin ang PIN' : 'Confirm your PIN';
    return lang === 'tl' ? 'Ilagay ang PIN' : 'Enter PIN';
  };

  const getSubtitle = () => {
    if (step === 'confirm') return lang === 'tl' ? 'I-type muli ang iyong PIN' : 'Re-type your PIN';
    if (step === 'lock' && attempts > 0) return lang === 'tl' ? `${attempts} maling pagsubok` : `${attempts} wrong attempt(s)`;
    return lang === 'tl' ? 'Ipasok ang 6-digit code para buksan ang app' : 'Enter 6-digit code to unlock the app';
  };

  return (
    <div className="fixed inset-0 z-[300] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-xs mx-auto text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white">{getTitle()}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{getSubtitle()}</p>

        <div className="flex justify-center gap-3 my-8">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                idx < displayPin.length
                  ? 'bg-indigo-600 border-indigo-600 scale-110'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-[11px] text-rose-600 font-semibold bg-rose-50 dark:bg-rose-900/30 px-3 py-2 rounded-xl mb-4">
            {error}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(String(d))}
              className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xl transition active:scale-95 cursor-pointer"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xl transition active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-500 dark:text-slate-400 transition active:scale-95 cursor-pointer flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
