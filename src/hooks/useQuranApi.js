import { useState, useCallback, useRef } from 'react';
import { getVerse, getTafsir, getTranslations } from '../api/quranBackendApi';
import toast from 'react-hot-toast';

export const useQuranApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchVerse = useCallback(async (surahNumber, verseNumber) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getVerse(surahNumber, verseNumber);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.name === 'AbortError' ? 'Request cancelled' : 'Failed to fetch verse';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTafsir = useCallback(async (surahNumber, verseNumber) => {
    setLoading(true);
    try {
      const result = await getTafsir(surahNumber, verseNumber);
      return result;
    } catch (err) {
      console.error('Tafsir error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTranslations = useCallback(async (surahNumber, verseNumber) => {
    setLoading(true);
    try {
      const result = await getTranslations(surahNumber, verseNumber);
      return result;
    } catch (err) {
      console.error('Translation error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFullVerse = useCallback(async (surahNumber, verseNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const [verse, tafsir, translations] = await Promise.all([
        getVerse(surahNumber, verseNumber),
        getTafsir(surahNumber, verseNumber),
        getTranslations(surahNumber, verseNumber)
      ]);
      
      const result = { verse, tafsir, translations };
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch Quran data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    data,
    fetchVerse,
    fetchTafsir,
    fetchTranslations,
    fetchFullVerse,
    clearData
  };
};