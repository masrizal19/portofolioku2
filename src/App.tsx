import React, { useState, useEffect } from 'react';
import { CMSData } from './types';
import { INITIAL_CMS_DATA } from './data';
import PublicPortfolio from './components/PublicPortfolio';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const [viewMode, setViewMode] = useState<'public' | 'admin' | 'preview'>('public');

  // Safe deep/shallow merge function to protect against partial localStorage states
  const mergeWithDefaults = (saved: any): CMSData => {
    if (!saved) return INITIAL_CMS_DATA;
    return {
      ...INITIAL_CMS_DATA,
      ...saved,
      hero: {
        ...INITIAL_CMS_DATA.hero,
        ...(saved.hero || {}),
        badges: saved.hero?.badges ?? INITIAL_CMS_DATA.hero.badges,
        heroBackground: {
          ...INITIAL_CMS_DATA.hero.heroBackground,
          ...(saved.hero?.heroBackground || {}),
        }
      },
      profile: {
        ...INITIAL_CMS_DATA.profile,
        ...(saved.profile || {}),
      },
      skills: saved.skills ?? INITIAL_CMS_DATA.skills,
      portfolio: saved.portfolio ?? INITIAL_CMS_DATA.portfolio,
      hasilKarya: saved.hasilKarya ?? INITIAL_CMS_DATA.hasilKarya ?? [],
      prosesKerja: saved.prosesKerja ?? INITIAL_CMS_DATA.prosesKerja,
      kontak: {
        ...INITIAL_CMS_DATA.kontak,
        ...(saved.kontak || {}),
      },
      sosialMedia: saved.sosialMedia ?? INITIAL_CMS_DATA.sosialMedia,
      mediaLibrary: saved.mediaLibrary ?? INITIAL_CMS_DATA.mediaLibrary,
      background: {
        ...INITIAL_CMS_DATA.background,
        ...(saved.background || {}),
      },
      appearance: {
        ...INITIAL_CMS_DATA.appearance,
        ...(saved.appearance || {}),
      },
      motion: {
        ...INITIAL_CMS_DATA.motion,
        ...(saved.motion || {}),
      },
    };
  };

  // Load published data from localStorage, or fall back to default seed data
  const [publishedData, setPublishedData] = useState<CMSData>(() => {
    const saved = localStorage.getItem('published_portfolio_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return mergeWithDefaults(parsed);
        }
      } catch (e) {
        console.error('Failed to parse published data, resetting', e);
      }
    }
    return INITIAL_CMS_DATA;
  });

  // Load draft data from localStorage, falling back to published data
  const [draftData, setDraftData] = useState<CMSData>(() => {
    const saved = localStorage.getItem('draft_portfolio_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return mergeWithDefaults(parsed);
        }
      } catch (e) {
        console.error('Failed to parse draft data, resetting', e);
      }
    }
    return publishedData;
  });

  // Keep draftData synchronized with publishedData on first load if draft is empty
  useEffect(() => {
    if (!localStorage.getItem('draft_portfolio_data')) {
      setDraftData(publishedData);
    }
  }, [publishedData]);

  // Optional: Sync with PHP/MySQL backend if online on hosting domain
  useEffect(() => {
    const fetchFromPHPBackend = async () => {
      try {
        const response = await fetch('/api/get_portfolio.php');
        if (response.ok) {
          const json = await response.json();
          if (json.status === 'success' && json.data) {
            console.log('Successfully synced with PHP MySQL backend');
            const merged = mergeWithDefaults(json.data);
            setPublishedData(merged);
            if (!localStorage.getItem('draft_portfolio_data')) {
              setDraftData(merged);
            }
          } else {
            console.log('PHP Database status:', json.message || 'offline fallback active');
          }
        }
      } catch (err) {
        console.log('PHP MySQL connection offline. Staging with LocalStorage state engine.');
      }
    };
    fetchFromPHPBackend();
  }, []);

  const handleSaveDraft = async (newData: CMSData) => {
    setDraftData(newData);
    localStorage.setItem('draft_portfolio_data', JSON.stringify(newData));

    // Try syncing to PHP MySQL backend
    try {
      const token = localStorage.getItem('admin_session_token') || '';
      await fetch('/api/save_portfolio.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newData)
      });
    } catch (err) {
      console.log('Saved to LocalStorage. Remote server sync offline.');
    }
  };

  const handlePublishLive = async () => {
    // Save live published data
    setPublishedData(draftData);
    localStorage.setItem('published_portfolio_data', JSON.stringify(draftData));
    localStorage.setItem('draft_portfolio_data', JSON.stringify(draftData));

    // Try syncing to PHP MySQL backend
    try {
      const token = localStorage.getItem('admin_session_token') || '';
      await fetch('/api/save_portfolio.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(draftData)
      });
    } catch (err) {
      console.log('Published to LocalStorage. Remote server sync offline.');
    }
  };

  return (
    <>
      {viewMode === 'public' && (
        <PublicPortfolio 
          data={publishedData} 
          onEnterAdmin={() => setViewMode('admin')} 
          isPreviewMode={false}
        />
      )}

      {viewMode === 'preview' && (
        <PublicPortfolio 
          data={draftData} 
          onEnterAdmin={() => setViewMode('admin')} 
          isPreviewMode={true}
        />
      )}

      {viewMode === 'admin' && (
        <AdminPortal 
          data={draftData}
          onSave={handleSaveDraft}
          onPublish={handlePublishLive}
          onExit={() => setViewMode('public')}
          onPreview={() => setViewMode('preview')}
        />
      )}
    </>
  );
}
