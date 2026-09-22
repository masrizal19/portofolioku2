import React, { useState } from 'react';
import { CMSData, HeroData, ProfileData, SkillItem, PortfolioItem, HasilKaryaItem, ProsesKerjaItem, KontakData, SosialMediaItem, BackgroundData, AppearanceData, MotionData, Badge } from '../types';
import DashboardView from './DashboardView';
import MediaLibraryView from './MediaLibraryView';
import ImagePicker from './ImagePicker';
import { getImageUrl } from '../lib/imageUtils';
import { INITIAL_CMS_DATA } from '../data';
import { 
  LayoutDashboard, 
  User, 
  FolderGit2, 
  Image as ImageIcon, 
  HelpCircle, 
  Phone, 
  Share2, 
  Upload, 
  Sliders, 
  Palette, 
  Activity, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Save, 
  Eye, 
  Globe, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Info,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AdminPortalProps {
  data: CMSData;
  onSave: (newData: CMSData) => void;
  onPublish: () => void;
  onExit: () => void;
  onPreview: () => void;
}

export default function AdminPortal({ data, onSave, onPublish, onExit, onPreview }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form states initialized with current draft data
  const [hero, setHero] = useState<HeroData>({ ...data.hero });
  const [profile, setProfile] = useState<ProfileData>({ ...data.profile });
  const [skills, setSkills] = useState<SkillItem[]>([...data.skills]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([...data.portfolio]);
  const [hasilKarya, setHasilKarya] = useState<HasilKaryaItem[]>([...data.hasilKarya]);
  const [prosesKerja, setProsesKerja] = useState<ProsesKerjaItem[]>([...data.prosesKerja]);
  const [kontak, setKontak] = useState<KontakData>({ ...data.kontak });
  const [sosialMedia, setSosialMedia] = useState<SosialMediaItem[]>([...data.sosialMedia]);
  const [background, setBackground] = useState<BackgroundData>({ ...data.background });
  const [appearance, setAppearance] = useState<AppearanceData>({ ...data.appearance });
  const [motion, setMotion] = useState<MotionData>({ ...data.motion });
  const [mediaLibrary, setMediaLibrary] = useState(data.mediaLibrary || []);

  // Modal Editing States
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [editingKarya, setEditingKarya] = useState<HasilKaryaItem | null>(null);
  const [editingProses, setEditingProses] = useState<ProsesKerjaItem | null>(null);
  const [editingSocial, setEditingSocial] = useState<SosialMediaItem | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUploadToLibrary = (file: { name: string; type: string; size: number; url: string }) => {
    const newMedia = {
      id: 'ml_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString().split('T')[0],
      url: file.url,
      inUse: true
    };
    setMediaLibrary(prev => [newMedia, ...prev]);
    showToast('Berkas berhasil ditambahkan ke pustaka media!', 'success');
  };

  // Compile full CMSData back to parent
  const getCompiledData = (): CMSData => {
    return {
      hero,
      profile,
      skills,
      portfolio,
      hasilKarya,
      prosesKerja,
      kontak,
      sosialMedia,
      mediaLibrary,
      background,
      appearance,
      motion
    };
  };

  const handleSaveDraft = () => {
    const compiled = getCompiledData();
    onSave(compiled);
    showToast('Konfigurasi draft berhasil disimpan!', 'success');
  };

  const handlePublishLive = () => {
    const compiled = getCompiledData();
    onSave(compiled);
    onPublish();
    showToast('Konten berhasil dipublikasikan ke Website Utama!', 'success');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh visual token (Warna, Border-radius, Spacing) ke nilai default desain asli?')) {
      setAppearance({ ...INITIAL_CMS_DATA.appearance });
      setBackground({ ...INITIAL_CMS_DATA.background });
      setMotion({ ...INITIAL_CMS_DATA.motion });
      showToast('Visual token berhasil dikembalikan ke default!', 'info');
    }
  };

  // Badge list operations
  const handleAddBadge = () => {
    const newBadge: Badge = {
      id: 'bdg_' + Date.now(),
      nama: 'New Skill Tag',
      warnaBackground: 'mint',
      warnaText: '#1b1c23',
      posisi: hero.badges.length + 1,
      visibility: true
    };
    setHero({ ...hero, badges: [...hero.badges, newBadge] });
    showToast('Badge ditambahkan!', 'success');
  };

  const handleUpdateBadge = (badgeId: string, fields: Partial<Badge>) => {
    const updatedBadges = hero.badges.map(b => b.id === badgeId ? { ...b, ...fields } : b);
    setHero({ ...hero, badges: updatedBadges });
  };

  const handleDeleteBadge = (badgeId: string) => {
    const filtered = hero.badges.filter(b => b.id !== badgeId).map((b, idx) => ({ ...b, posisi: idx + 1 }));
    setHero({ ...hero, badges: filtered });
  };

  const moveBadge = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= hero.badges.length) return;
    const temp = [...hero.badges];
    const item = temp[index];
    temp[index] = temp[nextIdx];
    temp[nextIdx] = item;
    
    // update posisi field
    const reordered = temp.map((b, idx) => ({ ...b, posisi: idx + 1 }));
    setHero({ ...hero, badges: reordered });
  };

  // Reorder lists
  const handleMoveItem = (type: 'skills' | 'portfolio' | 'hasilKarya' | 'prosesKerja' | 'sosialMedia', index: number, direction: 'up' | 'down') => {
    let list: any[] = [];
    let setList: any = null;

    if (type === 'skills') { list = [...skills]; setList = setSkills; }
    else if (type === 'portfolio') { list = [...portfolio]; setList = setPortfolio; }
    else if (type === 'hasilKarya') { list = [...hasilKarya]; setList = setHasilKarya; }
    else if (type === 'prosesKerja') { list = [...prosesKerja]; setList = setProsesKerja; }
    else if (type === 'sosialMedia') { list = [...sosialMedia]; setList = setSosialMedia; }

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const item = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = item;

    // re-assign urutan field based on actual index
    const reordered = list.map((x, idx) => ({ ...x, urutan: idx + 1 }));
    setList(reordered);
    showToast('Urutan berhasil diubah!', 'info');
  };

  // Sidebar Menu List
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hero', label: 'Hero Section', icon: Sliders },
    { id: 'profile', label: 'Profil Saya', icon: User },
    { id: 'skills', label: 'Daftar Skills', icon: Activity },
    { id: 'portfolio', label: 'Karya Portfolio', icon: FolderGit2 },
    { id: 'hasil_karya', label: 'Karya Tambahan', icon: ImageIcon },
    { id: 'proses_kerja', label: 'Proses Kerja', icon: HelpCircle },
    { id: 'kontak', label: 'Kontak Info', icon: Phone },
    { id: 'sosial_media', label: 'Sosial Media', icon: Share2 },
    { id: 'media', label: 'Media Library', icon: Upload },
    { id: 'background', label: 'Background Web', icon: Globe },
    { id: 'appearance', label: 'Visual Token', icon: Palette },
    { id: 'motion', label: 'Intensitas Animasi', icon: Activity },
    { id: 'pengaturan', label: 'Sistem & Backup', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0e0f12] text-[#f6f6f8] flex flex-col relative selection:bg-[#25d0a4] selection:text-black font-batica" style={{ fontFamily: "'Anybody', 'Batica Sans', sans-serif" }}>
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`fixed top-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/10 transition-all duration-300 animate-slideUp ${
          toast.type === 'success' ? 'bg-[#131418] border-[#25d0a4] text-[#25d0a4]' :
          toast.type === 'info' ? 'bg-[#131418] border-white/20 text-white' : 'bg-[#131418] border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          <span className="text-[10px] font-black uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-[#0e0f12]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[#8e8f9b] hover:text-white md:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#25d0a4] Everybody">Alya CMS</span>
            <span className="text-[8px] bg-[#131418] text-[#8e8f9b] px-2 py-0.5 rounded border border-white/10 uppercase font-bold tracking-wider">Control Panel</span>
          </div>
        </div>

        {/* CMS Actions and Saving */}
        <div className="flex items-center gap-2 md:gap-3 text-[10px] font-bold uppercase tracking-wider">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-transparent hover:bg-white/5 text-white border border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simpan Draf</span>
          </button>

          <button
            onClick={() => {
              const compiled = getCompiledData();
              onSave(compiled);
              onPreview();
            }}
            className="px-4 py-2 bg-transparent hover:bg-white/5 text-white border border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            onClick={handlePublishLive}
            className="px-4 py-2 bg-[#25d0a4] hover:bg-[#25d0a4]/90 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Publish Live</span>
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION - DESKTOP */}
        <aside className={`border-r border-white/10 bg-[#131418] transition-all duration-300 hidden md:flex flex-col flex-shrink-0 ${
          sidebarCollapsed ? 'w-18' : 'w-64'
        }`}>
          {/* Collapse toggler */}
          <div className="p-4 border-b border-white/5 flex justify-end">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-[#8e8f9b] hover:text-white transition cursor-pointer"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white text-black font-black' 
                      : 'text-[#8e8f9b] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-black' : 'text-[#8e8f9b]'}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Logout trigger at sidebar footer */}
          <div className="p-3 border-t border-white/5">
            <button
              onClick={onExit}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg text-[10px] font-bold tracking-wider uppercase text-red-400 hover:bg-red-950/10 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              {!sidebarCollapsed && <span>Kembali ke Web</span>}
            </button>
          </div>
        </aside>

        {/* SIDEBAR NAVIGATION - MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-xs flex animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="w-72 bg-[#131418] h-full flex flex-col border-r border-white/10 animate-slideRight"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0e0f12]">
                <span className="text-xs font-black text-[#25d0a4] tracking-[0.2em] uppercase">Alya Admin</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-white/5 rounded-lg text-[#8e8f9b] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 p-3 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-white text-black font-black' 
                          : 'text-[#8e8f9b] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-[#8e8f9b]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/5">
                <button
                  onClick={onExit}
                  className="w-full flex items-center gap-3.5 p-3 rounded-lg text-[10px] font-bold tracking-wider uppercase text-red-400 hover:bg-red-950/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Kembali ke Web</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          
          {/* TITLE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-[9px] text-[#8e8f9b] uppercase font-bold tracking-widest mb-1.5">
                <span>Alya CMS</span>
                <ChevronRight className="w-2.5 h-2.5" />
                <span className="text-[#25d0a4]">{activeTab.replace('_', ' ')}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white Everybody">
                {activeTab === 'dashboard' ? 'Ringkasan Sistem' : 
                 activeTab === 'hero' ? 'Kelola Hero Header' :
                 activeTab === 'profile' ? 'Profil & Bio' :
                 activeTab === 'skills' ? 'Daftar Kompetensi' :
                 activeTab === 'portfolio' ? 'Kasus Portfolio' :
                 activeTab === 'hasil_karya' ? 'Karya Tambahan' :
                 activeTab === 'proses_kerja' ? 'Proses Kerja' :
                 activeTab === 'kontak' ? 'Kontak & WhatsApp' :
                 activeTab === 'sosial_media' ? 'Kelola Sosial Media' :
                 activeTab === 'media' ? 'Media Library' :
                 activeTab === 'background' ? 'Latar Belakang Web' :
                 activeTab === 'appearance' ? 'Visual Design Tokens' :
                 activeTab === 'motion' ? 'Intensitas Animasi' : 'Pengaturan & Backup'}
              </h2>
            </div>
          </div>

          {/* ACTIVE TAB RENDER ENGINE */}
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <DashboardView 
              data={getCompiledData()} 
              onNavigate={(tab) => setActiveTab(tab)}
              onAddPortfolio={() => {
                const emptyProj: PortfolioItem = {
                  id: 'p_' + Date.now(),
                  judul: 'Proyek Baru',
                  slug: 'proyek-baru',
                  kategori: 'UI/UX Design',
                  thumbnail: 'custom-card',
                  cover: '',
                  gallery: [],
                  deskripsi: 'Detail penjelasan proyek.',
                  client: 'Personal Project',
                  tahun: new Date().getFullYear(),
                  role: 'Product Designer',
                  tools: ['Figma'],
                  projectURL: '',
                  prototypeURL: '',
                  status: 'DRAFT',
                  urutan: portfolio.length + 1
                };
                setPortfolio([emptyProj, ...portfolio]);
                setActiveTab('portfolio');
                setEditingPortfolio(emptyProj);
                showToast('Draft Portfolio berhasil dibuat!', 'success');
              }}
              onAddKarya={() => {
                const emptyKarya: HasilKaryaItem = {
                  id: 'k_' + Date.now(),
                  judul: 'Artwork Baru',
                  kategori: 'mockup',
                  gambar: '',
                  deskripsi: 'Deskripsi singkat karya tambahan.',
                  tahun: new Date().getFullYear(),
                  tools: 'Figma',
                  link: '',
                  urutan: hasilKarya.length + 1,
                  status: 'DRAFT'
                };
                setHasilKarya([emptyKarya, ...hasilKarya]);
                setActiveTab('hasil_karya');
                setEditingKarya(emptyKarya);
                showToast('Draft Karya Tambahan berhasil dibuat!', 'success');
              }}
            />
          )}

          {/* TAB 2: HERO MANAGEMENT */}
          {activeTab === 'hero' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6 bg-[#131418] p-6 rounded-xl border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Nama Panjang</label>
                    <input 
                      type="text" 
                      value={hero.nama} 
                      onChange={(e) => setHero({ ...hero, nama: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Nama Pendek (Alias)</label>
                    <input 
                      type="text" 
                      value={hero.namaPendek} 
                      onChange={(e) => setHero({ ...hero, namaPendek: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Kalimat Pembuka Hero</label>
                  <input 
                    type="text" 
                    value={hero.kalimatPembuka} 
                    onChange={(e) => setHero({ ...hero, kalimatPembuka: e.target.value })}
                    className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Headline Utama</label>
                    <input 
                      type="text" 
                      value={hero.headlineUtama} 
                      onChange={(e) => setHero({ ...hero, headlineUtama: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Headline Kedua</label>
                    <input 
                      type="text" 
                      value={hero.headlineKedua} 
                      onChange={(e) => setHero({ ...hero, headlineKedua: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Visual Text (Italic)</label>
                    <input 
                      type="text" 
                      value={hero.visualText} 
                      onChange={(e) => setHero({ ...hero, visualText: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Pengalaman (Tahun)</label>
                    <input 
                      type="number" 
                      value={hero.statistikPengalaman} 
                      onChange={(e) => setHero({ ...hero, statistikPengalaman: +e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Selesai Proyek</label>
                    <input 
                      type="number" 
                      value={hero.statistikJumlahProject} 
                      onChange={(e) => setHero({ ...hero, statistikJumlahProject: +e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                </div>

                <div>
                  <ImagePicker 
                    label="Foto Profil Hero"
                    value={hero.fotoProfile}
                    mediaLibrary={mediaLibrary}
                    onUploadToLibrary={handleUploadToLibrary}
                    onChange={(newVal) => {
                      setHero({ ...hero, fotoProfile: newVal || '' });
                    }}
                  />
                  <p className="text-[9px] text-[#8e8f9b] mt-1.5 font-bold tracking-wider uppercase">Biarkan kosong untuk menggunakan avatar default SVG Alya.</p>
                </div>

                <div className="pt-6 border-t border-white/5 text-left">
                  <h4 className="text-[10px] font-black text-[#25d0a4] uppercase tracking-widest mb-3">🎬 Hero Background / Hero Visual</h4>
                  
                  <ImagePicker 
                    label="Pilih Gambar Latar Belakang Hero"
                    value={hero.heroBackground?.image}
                    mediaLibrary={mediaLibrary}
                    onUploadToLibrary={handleUploadToLibrary}
                    onChange={(newVal) => {
                      const bg = hero.heroBackground || {
                        image: null,
                        positionX: 50,
                        positionY: 50,
                        scale: 100,
                        opacity: 40,
                        brightness: 100,
                        contrast: 100,
                        blur: 0,
                        overlayOpacity: 30,
                        overlayColor: '#0e0f12',
                      };
                      setHero({
                        ...hero,
                        heroBackground: {
                          ...bg,
                          image: newVal
                        }
                      });
                    }}
                  />
                  
                  {hero.heroBackground?.image && (
                    <div className="mt-4 space-y-4 bg-[#0e0f12] p-4 rounded-lg border border-white/5">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Position X Slider */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold uppercase text-[#8e8f9b] mb-1">
                            <span>Position X</span>
                            <span className="text-[#25d0a4]">{hero.heroBackground.positionX ?? 50}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={hero.heroBackground.positionX ?? 50} 
                            onChange={(e) => {
                              setHero({
                                ...hero,
                                heroBackground: {
                                  ...hero.heroBackground!,
                                  positionX: +e.target.value
                                }
                              });
                            }}
                            className="w-full h-1 bg-[#131418] rounded appearance-none cursor-pointer accent-[#25d0a4]"
                          />
                        </div>

                        {/* Position Y Slider */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold uppercase text-[#8e8f9b] mb-1">
                            <span>Position Y</span>
                            <span className="text-[#25d0a4]">{hero.heroBackground.positionY ?? 50}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={hero.heroBackground.positionY ?? 50} 
                            onChange={(e) => {
                              setHero({
                                ...hero,
                                heroBackground: {
                                  ...hero.heroBackground!,
                                  positionY: +e.target.value
                                }
                              });
                            }}
                            className="w-full h-1 bg-[#131418] rounded appearance-none cursor-pointer accent-[#25d0a4]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Scale Slider */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold uppercase text-[#8e8f9b] mb-1">
                            <span>Scale / Zoom</span>
                            <span className="text-[#25d0a4]">{hero.heroBackground.scale ?? 100}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="400" 
                            value={hero.heroBackground.scale ?? 100} 
                            onChange={(e) => {
                              setHero({
                                ...hero,
                                heroBackground: {
                                  ...hero.heroBackground!,
                                  scale: +e.target.value
                                }
                              });
                            }}
                            className="w-full h-1 bg-[#131418] rounded appearance-none cursor-pointer accent-[#25d0a4]"
                          />
                        </div>

                        {/* Opacity Slider */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold uppercase text-[#8e8f9b] mb-1">
                            <span>Opacity</span>
                            <span className="text-[#25d0a4]">{hero.heroBackground.opacity ?? 40}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={hero.heroBackground.opacity ?? 40} 
                            onChange={(e) => {
                              setHero({
                                ...hero,
                                heroBackground: {
                                  ...hero.heroBackground!,
                                  opacity: +e.target.value
                                }
                              });
                            }}
                            className="w-full h-1 bg-[#131418] rounded appearance-none cursor-pointer accent-[#25d0a4]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {/* Brightness */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold uppercase text-[#8e8f9b] mb-1">
                            <span>Brightness</span>
                            <span className="text-white">{hero.heroBackground.brightness ?? 100}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="200" 
                            value={hero.heroBackground.brightness ?? 100} 
                            onChange={(e) => {
                              setHero({
                                ...hero,
                                heroBackground: {
                                  ...hero.heroBackground!,
                                  brightness: +e.target.value
                                }
                              });
                            }}
                            className="w-full h-1 bg-[#131418] rounded appearance-none cursor-pointer accent-[#25d0a4]"
                          />
                        </div>

                        {/* Contrast */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold uppercase text-[#8e8f9b] mb-1">
                            <span>Contrast</span>
                            <span className="text-white">{hero.heroBackground.contrast ?? 100}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="200" 
                            value={hero.heroBackground.contrast ?? 100} 
                            onChange={(e) => {
                              setHero({
                                ...hero,
                                heroBackground: {
                                  ...hero.heroBackground!,
                                  contrast: +e.target.value
                                }
                              });
                            }}
                            className="w-full h-1 bg-[#131418] rounded appearance-none cursor-pointer accent-[#25d0a4]"
                          />
                        </div>

                        {/* Blur */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold uppercase text-[#8e8f9b] mb-1">
                            <span>Blur</span>
                            <span className="text-white">{hero.heroBackground.blur ?? 0}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            value={hero.heroBackground.blur ?? 0} 
                            onChange={(e) => {
                              setHero({
                                ...hero,
                                heroBackground: {
                                  ...hero.heroBackground!,
                                  blur: +e.target.value
                                }
                              });
                            }}
                            className="w-full h-1 bg-[#131418] rounded appearance-none cursor-pointer accent-[#25d0a4]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        {/* Overlay Opacity */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold uppercase text-[#8e8f9b] mb-1">
                            <span>Overlay Opacity</span>
                            <span className="text-[#25d0a4]">{hero.heroBackground.overlayOpacity ?? 30}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={hero.heroBackground.overlayOpacity ?? 30} 
                            onChange={(e) => {
                              setHero({
                                ...hero,
                                heroBackground: {
                                  ...hero.heroBackground!,
                                  overlayOpacity: +e.target.value
                                }
                              });
                            }}
                            className="w-full h-1 bg-[#131418] rounded appearance-none cursor-pointer accent-[#25d0a4]"
                          />
                        </div>

                        {/* Overlay Color Picker */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold uppercase text-[#8e8f9b] mb-1">
                            <span>Overlay Color</span>
                            <span className="text-white font-mono uppercase text-[9px]">{hero.heroBackground.overlayColor ?? '#0e0f12'}</span>
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={hero.heroBackground.overlayColor ?? '#0e0f12'} 
                              onChange={(e) => {
                                setHero({
                                  ...hero,
                                  heroBackground: {
                                    ...hero.heroBackground!,
                                    overlayColor: e.target.value
                                  }
                                });
                              }}
                              className="w-8 h-8 rounded bg-transparent border border-white/10 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={hero.heroBackground.overlayColor ?? '#0e0f12'} 
                              onChange={(e) => {
                                setHero({
                                  ...hero,
                                  heroBackground: {
                                    ...hero.heroBackground!,
                                    overlayColor: e.target.value
                                  }
                                });
                              }}
                              className="flex-1 bg-[#131418] border border-white/10 rounded px-2 text-xs text-white uppercase focus:outline-none focus:border-[#25d0a4]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Control Actions buttons */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setHero({
                              ...hero,
                              heroBackground: {
                                ...hero.heroBackground!,
                                positionX: 50,
                                positionY: 50,
                                scale: 100,
                              }
                            });
                            showToast('Posisi background di-reset!', 'info');
                          }}
                          className="px-2.5 py-1.5 bg-[#131418] hover:bg-white/5 text-white border border-white/10 text-[9px] uppercase font-bold tracking-wider rounded transition"
                        >
                          Reset Position
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHero({
                              ...hero,
                              heroBackground: {
                                ...hero.heroBackground!,
                                opacity: 40,
                                brightness: 100,
                                contrast: 100,
                                blur: 0,
                                overlayOpacity: 30,
                                overlayColor: '#0e0f12',
                              }
                            });
                            showToast('Efek background di-reset!', 'info');
                          }}
                          className="px-2.5 py-1.5 bg-[#131418] hover:bg-white/5 text-white border border-white/10 text-[9px] uppercase font-bold tracking-wider rounded transition"
                        >
                          Reset Effects
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHero({
                              ...hero,
                              heroBackground: {
                                ...hero.heroBackground!,
                                image: null
                              }
                            });
                            showToast('Background dihapus!', 'info');
                          }}
                          className="px-2.5 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[9px] uppercase font-bold tracking-wider rounded transition"
                        >
                          Remove Background
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub CRUD - Badges */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-[10px] uppercase font-bold text-[#25d0a4]">Badges / Role Tags</label>
                    <button 
                      type="button"
                      onClick={handleAddBadge}
                      className="px-2.5 py-1.5 bg-[#0e0f12] hover:bg-white hover:text-black text-white border border-white/10 text-[9px] uppercase font-black tracking-wider rounded transition"
                    >
                      Tambah Badge
                    </button>
                  </div>

                  <div className="space-y-3">
                    {hero.badges.map((badge, idx) => (
                      <div key={badge.id} className="bg-[#0e0f12] p-3 border border-white/10 rounded-lg space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <input
                            type="text"
                            value={badge.nama}
                            onChange={(e) => handleUpdateBadge(badge.id, { nama: e.target.value })}
                            className="bg-transparent border-b border-white/10 focus:border-[#25d0a4] text-xs font-bold text-white py-0.5 focus:outline-none flex-1"
                          />
                          <div className="flex items-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => moveBadge(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 hover:bg-white/5 text-[#8e8f9b] hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => moveBadge(idx, 'down')}
                              disabled={idx === hero.badges.length - 1}
                              className="p-1 hover:bg-white/5 text-[#8e8f9b] hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteBadge(badge.id)}
                              className="p-1.5 hover:bg-red-950/10 text-red-400 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Adjust badge visual metadata */}
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          <div>
                            <span className="text-[#8e8f9b] block mb-0.5">Warna</span>
                            <select
                              value={badge.warnaBackground}
                              onChange={(e) => handleUpdateBadge(badge.id, { warnaBackground: e.target.value })}
                              className="w-full bg-[#131418] border border-white/10 rounded p-1 font-bold text-white"
                            >
                              <option value="mint">Mint</option>
                              <option value="coral">Coral</option>
                              <option value="violet">Violet</option>
                              <option value="gold">Gold</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[#8e8f9b] block mb-0.5">Teks</span>
                            <input
                              type="text"
                              value={badge.warnaText}
                              onChange={(e) => handleUpdateBadge(badge.id, { warnaText: e.target.value })}
                              className="w-full bg-[#131418] border border-white/10 rounded p-1 font-bold text-white"
                            />
                          </div>
                          <div className="flex items-center justify-center pt-3">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={badge.visibility}
                                onChange={(e) => handleUpdateBadge(badge.id, { visibility: e.target.checked })}
                                className="accent-[#25d0a4]"
                              />
                              <span className="font-bold uppercase text-[9px] text-[#8e8f9b]">Tampilkan</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>

              {/* LIVE PREVIEW BOX */}
              <div className="bg-[#131418] border border-white/10 rounded-xl p-6 space-y-4 sticky top-6">
                <span className="text-[10px] uppercase font-bold text-[#8e8f9b] tracking-widest block">LIVE PREVIEW</span>
                <div className="bg-[#0e0f12] border border-white/5 rounded-lg p-8 relative overflow-hidden flex flex-col items-center text-center space-y-4 min-h-[300px] justify-center">
                  
                  {/* Hero Background Visual Overlay inside Live Preview */}
                  {hero.heroBackground && getImageUrl(hero.heroBackground.image) && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-lg">
                      <img 
                        src={getImageUrl(hero.heroBackground.image)}
                        alt="Hero Visual Background Preview"
                        className="absolute w-full h-full transition-all duration-150 ease-out"
                        style={{
                          left: `${hero.heroBackground.positionX ?? 50}%`,
                          top: `${hero.heroBackground.positionY ?? 50}%`,
                          transform: `translate(-50%, -50%) scale(${(hero.heroBackground.scale ?? 100) / 100})`,
                          opacity: (hero.heroBackground.opacity ?? 40) / 100,
                          filter: `
                            blur(${hero.heroBackground.blur ?? 0}px)
                            brightness(${hero.heroBackground.brightness ?? 100}%)
                            contrast(${hero.heroBackground.contrast ?? 100}%)
                          `,
                          objectFit: 'cover',
                        }}
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Overlay Layer inside Live Preview */}
                      {hero.heroBackground.overlayOpacity > 0 && (
                        <div 
                          className="absolute inset-0 transition-colors duration-150"
                          style={{
                            backgroundColor: hero.heroBackground.overlayColor || '#0e0f12',
                            opacity: (hero.heroBackground.overlayOpacity ?? 30) / 100,
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Main contents with high z-index */}
                  <div className="relative z-10 flex flex-col items-center text-center space-y-4 w-full">
                    <div className="flex items-center gap-1 text-[10px] text-[#8e8f9b]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25d0a4]" />
                      <span>{hero.kalimatPembuka}</span>
                    </div>

                    <h3 className="text-lg md:text-xl font-black leading-snug tracking-tight Everybody select-none text-white">
                      {hero.headlineUtama} 
                      {hero.badges.filter(b => b.visibility).slice(0,1).map(b => (
                        <span key={b.id} className="inline-block mx-1.5 px-2.5 py-0.5 bg-[#25d0a4] text-black rounded-full text-[8px] font-bold font-sans uppercase">
                          {b.nama}
                        </span>
                      ))}
                      <br />
                      <em className="font-serif italic font-light tracking-wide text-[#c9cad2] mr-1.5">{hero.visualText}</em> 
                      {hero.headlineKedua}
                      {hero.badges.filter(b => b.visibility).slice(1,3).map(b => (
                        <span key={b.id} className="inline-block mx-1.5 px-2.5 py-0.5 bg-[#ff5f4a] text-black rounded-full text-[8px] font-bold font-sans uppercase">
                          {b.nama}
                        </span>
                      ))}
                    </h3>

                    {/* Profile photo circle container */}
                    <div className="w-16 h-16 rounded-xl bg-[#0e0f12] border border-white/10 overflow-hidden flex items-center justify-center mt-4">
                      {hero.fotoProfile ? (
                        <img src={getImageUrl(hero.fotoProfile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] text-[#8e8f9b] uppercase font-bold">Default SVG</span>
                      )}
                    </div>

                    {/* Experience Stats layout */}
                    <div className="flex gap-8 pt-4 mt-4 border-t border-white/5 text-xs w-full justify-center">
                      <div>
                        <b className="text-base font-black text-white">{hero.statistikPengalaman}</b>
                        <span className="block text-[8px] text-[#8e8f9b] uppercase font-bold tracking-wider">Tahun Pengalaman</span>
                      </div>
                      <div>
                        <b className="text-base font-black text-white">{hero.statistikJumlahProject}+</b>
                        <span className="block text-[8px] text-[#8e8f9b] uppercase font-bold tracking-wider">Proyek Selesai</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-2 border-t border-white/5">
                  <div className="text-[10px] uppercase font-black tracking-widest text-[#25d0a4] mb-1">Aksi Cepat</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        onSave(getCompiledData());
                        showToast('Draf berhasil disimpan!', 'success');
                      }}
                      className="py-2 bg-[#25d0a4] hover:bg-[#25d0a4]/90 text-black text-[9px] font-black uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Simpan Draft
                    </button>
                    
                    <button
                      onClick={() => {
                        onSave(getCompiledData());
                        onPreview();
                      }}
                      className="py-2 bg-transparent hover:bg-white/5 text-white border border-white/10 text-[9px] font-bold uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Web
                    </button>

                    <button
                      onClick={() => {
                        onSave(getCompiledData());
                        onPublish();
                        showToast('Berhasil dipublikasikan!', 'success');
                      }}
                      className="py-2 bg-[#25d0a4] hover:bg-[#25d0a4]/90 text-black text-[9px] font-black uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" /> Publish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE MANAGEMENT */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-4xl">
              <form onSubmit={(e) => e.preventDefault()} className="bg-[#131418] p-6 rounded-xl border border-white/10 space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Deskripsi Singkat (Intro Page Scrub)</label>
                  <textarea
                    rows={2}
                    value={profile.deskripsi}
                    onChange={(e) => setProfile({ ...profile, deskripsi: e.target.value })}
                    className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    placeholder="Teks scrub pendek..."
                  />
                  <p className="text-[9px] text-[#8e8f9b] mt-1.5 uppercase tracking-wider font-bold">Teks ini akan terbagi otomatis menjadi kata-kata interaktif yang mengikuti arah scroll pada web utama.</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Biografi Lengkap (Tentang Saya Page Scrub)</label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    placeholder="Biografi lengkap..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Ringkasan Unduh CV</label>
                  <input
                    type="text"
                    value={profile.cvSummary}
                    onChange={(e) => setProfile({ ...profile, cvSummary: e.target.value })}
                    className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                  />
                </div>

                {/* Sub CRUD - CV Highlights */}
                <div className="pt-4 border-t border-white/5">
                  <label className="block text-[10px] uppercase font-bold text-[#25d0a4] mb-3">CV Work Highlights (Riwayat Karir)</label>
                  <div className="space-y-2">
                    {profile.highlights.map((hl, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={hl}
                          onChange={(e) => {
                            const updated = [...profile.highlights];
                            updated[idx] = e.target.value;
                            setProfile({ ...profile, highlights: updated });
                          }}
                          className="bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#25d0a4] flex-1 transition"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = profile.highlights.filter((_, i) => i !== idx);
                            setProfile({ ...profile, highlights: filtered });
                            showToast('Highlight karir dihapus!', 'info');
                          }}
                          className="p-2 bg-[#0e0f12] border border-white/10 hover:border-red-500/30 hover:text-red-400 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setProfile({ ...profile, highlights: [...profile.highlights, 'Nama Perusahaan — Posisi Pekerjaan (Tahun - Tahun)'] });
                        showToast('Highlight karir ditambahkan!', 'success');
                      }}
                      className="px-3 py-2 bg-[#0e0f12] hover:bg-white hover:text-black border border-white/10 text-[9px] font-bold uppercase rounded transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Tambah Highlight Karir
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SKILLS MANAGEMENT */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#8e8f9b] uppercase font-bold tracking-wider">Total Keahlian: {skills.length}</span>
                <button
                  onClick={() => {
                    const newSkill: SkillItem = {
                      id: 's_' + Date.now(),
                      nama: 'Keahlian Baru',
                      kategori: 'Design',
                      level: 80,
                      icon: 'Palette',
                      deskripsi: 'Deskripsi kompetensi keahlian.',
                      urutan: skills.length + 1,
                      status: 'DRAFT'
                    };
                    setSkills([...skills, newSkill]);
                    setEditingSkill(newSkill);
                    showToast('Draft skill dibuat!', 'success');
                  }}
                  className="px-4 py-2 bg-[#25d0a4] hover:bg-[#25d0a4]/90 text-black text-[10px] font-black uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Skill
                </button>
              </div>

              {/* Skills Editor / List Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill, idx) => (
                  <div key={skill.id} className="bg-[#131418] border border-white/10 rounded-lg p-5 hover:border-[#25d0a4]/50 transition space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-[#0e0f12] border border-white/10 text-[#25d0a4] rounded text-[9px] font-bold uppercase tracking-wider">
                          {skill.kategori}
                        </span>
                        <h4 className="font-bold text-xs text-white uppercase tracking-wider">{skill.nama}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleMoveItem('skills', idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white/5 text-[#8e8f9b] hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleMoveItem('skills', idx, 'down')}
                          disabled={idx === skills.length - 1}
                          className="p-1 hover:bg-white/5 text-[#8e8f9b] hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setEditingSkill(skill)}
                          className="p-1.5 hover:bg-white/5 text-[#25d0a4] rounded cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            const duplicated: SkillItem = {
                              ...skill,
                              id: 's_' + Date.now(),
                              nama: `${skill.nama} (Copy)`,
                              urutan: skills.length + 1
                            };
                            setSkills([...skills, duplicated]);
                            showToast('Skill berhasil diduplikasi!', 'success');
                          }}
                          className="p-1.5 hover:bg-white/5 text-white/60 rounded cursor-pointer"
                          title="Duplikasi"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Hapus keahlian ${skill.nama}?`)) {
                              setSkills(skills.filter(s => s.id !== skill.id).map((s, i) => ({ ...s, urutan: i + 1 })));
                              showToast('Skill berhasil dihapus!', 'info');
                            }
                          }}
                          className="p-1.5 hover:bg-red-950/10 text-red-400 rounded cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats bar preview */}
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between font-bold text-[#8e8f9b] uppercase tracking-wider">
                        <span>Tingkat Penguasaan</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="w-full bg-[#0e0f12] h-1.5 rounded overflow-hidden">
                        <div className="h-full bg-[#25d0a4]" style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-[10px] text-[#8e8f9b]">
                      <span className="truncate flex-1 pr-4">{skill.deskripsi}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        skill.status === 'PUBLISHED' ? 'bg-[#5ed81a]/10 text-[#5ed81a]' : 'bg-[#f2b53d]/10 text-[#f2b53d]'
                      }`}>
                        {skill.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Editing Overlay Modal for single skill */}
              {editingSkill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                  <div className="bg-[#131418] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-5 text-left">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#25d0a4]">Formulir Edit Skill</h3>
                      <button onClick={() => setEditingSkill(null)} className="text-[#8e8f9b] hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Nama Skill</label>
                        <input
                          type="text"
                          value={editingSkill.nama}
                          onChange={(e) => setEditingSkill({ ...editingSkill, nama: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Kategori</label>
                          <select
                            value={editingSkill.kategori}
                            onChange={(e) => setEditingSkill({ ...editingSkill, kategori: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#25d0a4] transition"
                          >
                            <option value="Design">Design</option>
                            <option value="Research">Research</option>
                            <option value="Development">Development</option>
                            <option value="Management">Management</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Status Publikasi</label>
                          <select
                            value={editingSkill.status}
                            onChange={(e) => setEditingSkill({ ...editingSkill, status: e.target.value as any })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#25d0a4] transition"
                          >
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Level Penguasaan (%) — {editingSkill.level}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={editingSkill.level}
                          onChange={(e) => setEditingSkill({ ...editingSkill, level: +e.target.value })}
                          className="w-full h-1 bg-[#0e0f12] appearance-none cursor-pointer accent-[#25d0a4]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Icon Name (Lucide-React Name)</label>
                        <select
                          value={editingSkill.icon}
                          onChange={(e) => setEditingSkill({ ...editingSkill, icon: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#25d0a4] transition"
                        >
                          <option value="Palette">Palette (Desain)</option>
                          <option value="Activity">Activity (Animasi)</option>
                          <option value="Search">Search (Riset)</option>
                          <option value="Code2">Code2 (Pengembangan)</option>
                          <option value="HelpCircle">HelpCircle (Tanya Jawab)</option>
                          <option value="Compass">Compass (Arah Alur)</option>
                          <option value="Layers">Layers (Prototyping)</option>
                          <option value="Award">Award (Penghargaan)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Deskripsi Singkat</label>
                        <textarea
                          rows={3}
                          value={editingSkill.deskripsi}
                          onChange={(e) => setEditingSkill({ ...editingSkill, deskripsi: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2 text-[10px] font-bold uppercase tracking-wider">
                      <button
                        onClick={() => {
                          const updated = skills.map(s => s.id === editingSkill.id ? editingSkill : s);
                          setSkills(updated);
                          setEditingSkill(null);
                          showToast('Kompetensi skill diperbarui!', 'success');
                        }}
                        className="flex-1 py-2.5 bg-[#25d0a4] text-black font-black uppercase tracking-wider rounded transition cursor-pointer"
                      >
                        Simpan Perubahan
                      </button>
                      <button
                        onClick={() => setEditingSkill(null)}
                        className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white rounded cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PORTFOLIO MANAGEMENT */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#8e8f9b] uppercase font-bold tracking-wider">Total Portfolios: {portfolio.length}</span>
                <button
                  onClick={() => {
                    const newProj: PortfolioItem = {
                      id: 'p_' + Date.now(),
                      judul: 'Proyek Baru',
                      slug: 'proyek-baru',
                      kategori: 'UI/UX Design',
                      thumbnail: 'custom-card',
                      cover: '',
                      gallery: [],
                      deskripsi: 'Detail penjelasan proyek.',
                      client: 'Personal Project',
                      tahun: new Date().getFullYear(),
                      role: 'Product Designer',
                      tools: ['Figma'],
                      projectURL: '',
                      prototypeURL: '',
                      status: 'DRAFT',
                      urutan: portfolio.length + 1
                    };
                    setPortfolio([newProj, ...portfolio]);
                    setEditingPortfolio(newProj);
                    showToast('Draft Portfolio dibuat!', 'success');
                  }}
                  className="px-4 py-2 bg-[#25d0a4] hover:bg-[#25d0a4]/90 text-black text-[10px] font-black uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Portfolio
                </button>
              </div>

              {/* List grid portfolios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                {portfolio.map((item, idx) => (
                  <div key={item.id} className="bg-[#131418] border border-white/10 rounded-lg p-4 flex gap-4 hover:border-[#25d0a4]/50 transition">
                    <div className="w-24 h-28 rounded-lg bg-[#0e0f12] border border-white/5 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                      {item.cover ? (
                        <img src={getImageUrl(item.cover)} alt={item.judul} className="w-full h-full object-cover animate-fadeIn" />
                      ) : (
                        <span className="text-[10px] text-[#25d0a4] uppercase font-black tracking-widest">{getImageUrl(item.thumbnail).slice(0, 5)}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-white truncate">{item.judul}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            item.status === 'PUBLISHED' ? 'bg-[#5ed81a]/10 text-[#5ed81a]' : 
                            item.status === 'DRAFT' ? 'bg-[#f2b53d]/10 text-[#f2b53d]' : 'bg-[#8e8f9b]/10 text-[#8e8f9b]'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8e8f9b] uppercase tracking-wider font-bold mt-0.5">{item.kategori} • {item.tahun}</p>
                        <p className="text-[11px] text-[#8e8f9b] line-clamp-2 mt-1.5">{item.deskripsi}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleMoveItem('portfolio', idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 hover:bg-white/5 text-[#8e8f9b] disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleMoveItem('portfolio', idx, 'down')}
                            disabled={idx === portfolio.length - 1}
                            className="p-1 hover:bg-white/5 text-[#8e8f9b] disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex gap-1.5 text-[9px] font-bold uppercase tracking-wider">
                          <button
                            onClick={() => setEditingPortfolio(item)}
                            className="px-2.5 py-1.5 bg-[#0e0f12] hover:bg-white hover:text-black rounded border border-white/10 transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              const duplicated: PortfolioItem = {
                                ...item,
                                id: 'p_' + Date.now(),
                                judul: `${item.judul} (Copy)`,
                                slug: `${item.slug}-copy`,
                                urutan: portfolio.length + 1
                              };
                              setPortfolio([duplicated, ...portfolio]);
                              showToast('Project berhasil diduplikasi!', 'success');
                            }}
                            className="px-2 py-1.5 bg-[#0e0f12] hover:bg-white/5 rounded border border-white/10 text-white transition cursor-pointer"
                            title="Duplikasi"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus portfolio ${item.judul}?`)) {
                                setPortfolio(portfolio.filter(p => p.id !== item.id).map((p, i) => ({ ...p, urutan: i + 1 })));
                                showToast('Portfolio deleted!', 'info');
                              }
                            }}
                            className="p-1.5 hover:bg-red-950/10 text-red-400 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Editing Portfolio Overlay Dialog Modal */}
              {editingPortfolio && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
                  <div className="bg-[#131418] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-5 text-left my-8 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 sticky top-0 bg-[#131418] z-10">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#25d0a4]">Edit Portfolio Case</h3>
                      <button onClick={() => setEditingPortfolio(null)} className="text-[#8e8f9b] hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Judul Case</label>
                          <input
                            type="text"
                            value={editingPortfolio.judul}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, judul: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Kategori Project</label>
                          <input
                            type="text"
                            value={editingPortfolio.kategori}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, kategori: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Slug URL</label>
                          <input
                            type="text"
                            value={editingPortfolio.slug}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, slug: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Client</label>
                          <input
                            type="text"
                            value={editingPortfolio.client}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, client: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Tahun</label>
                          <input
                            type="number"
                            value={editingPortfolio.tahun}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, tahun: +e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Role Pekerjaan</label>
                          <input
                            type="text"
                            value={editingPortfolio.role}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, role: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Status</label>
                          <select
                            value={editingPortfolio.status}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, status: e.target.value as any })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          >
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Link Prototype (Figma)</label>
                          <input
                            type="text"
                            value={editingPortfolio.prototypeURL}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, prototypeURL: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Link Live Project URL</label>
                          <input
                            type="text"
                            value={editingPortfolio.projectURL}
                            onChange={(e) => setEditingPortfolio({ ...editingPortfolio, projectURL: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Tools Digunakan (Comma Separated)</label>
                        <input
                          type="text"
                          placeholder="Figma, React, Tailwind, Prototyping"
                          value={editingPortfolio.tools.join(', ')}
                          onChange={(e) => setEditingPortfolio({ ...editingPortfolio, tools: e.target.value.split(',').map(s => s.trim()) })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Desain Preset Vector Card</label>
                          <select
                            value={typeof editingPortfolio.thumbnail === 'string' ? editingPortfolio.thumbnail : 'custom-card'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'custom-card') {
                                setEditingPortfolio({ 
                                  ...editingPortfolio, 
                                  thumbnail: editingPortfolio.cover 
                                });
                              } else {
                                setEditingPortfolio({ 
                                  ...editingPortfolio, 
                                  thumbnail: val 
                                });
                              }
                            }}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          >
                            <option value="green-phone">Green Phone Screen (Kopi Senja)</option>
                            <option value="blue-layers">Blue Layer Panels (Rumah Denim)</option>
                            <option value="gold-charts">Gold Map Charts (Portal Iklim)</option>
                            <option value="blue-laptop">Blue Laptop Screen (Kelas Pintar)</option>
                            <option value="custom-card">Custom / Image Cover Upload</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <ImagePicker 
                          label="Cover Image (Studi Kasus & Thumbnail)"
                          value={editingPortfolio.cover}
                          mediaLibrary={mediaLibrary}
                          onUploadToLibrary={handleUploadToLibrary}
                          onChange={(newVal) => {
                            const updatedThumbnail = (typeof editingPortfolio.thumbnail === 'string' && ['green-phone', 'blue-layers', 'gold-charts', 'blue-laptop'].includes(editingPortfolio.thumbnail)) 
                              ? editingPortfolio.thumbnail 
                              : (newVal || '');
                            setEditingPortfolio({ 
                              ...editingPortfolio, 
                              cover: newVal || '',
                              thumbnail: updatedThumbnail
                            });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Deskripsi &amp; Alur Studi Kasus</label>
                        <textarea
                          rows={4}
                          value={editingPortfolio.deskripsi}
                          onChange={(e) => setEditingPortfolio({ ...editingPortfolio, deskripsi: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 text-[10px] font-bold uppercase tracking-wider">
                      <button
                        onClick={() => {
                          const updated = portfolio.map(p => p.id === editingPortfolio.id ? editingPortfolio : p);
                          setPortfolio(updated);
                          setEditingPortfolio(null);
                          showToast('Project case study berhasil disimpan!', 'success');
                        }}
                        className="flex-1 py-2.5 bg-[#25d0a4] text-black font-black uppercase tracking-wider rounded transition cursor-pointer"
                      >
                        Simpan Proyek
                      </button>
                      <button
                        onClick={() => setEditingPortfolio(null)}
                        className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white rounded cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: HASIL KARYA (Karya Tambahan) */}
          {activeTab === 'hasil_karya' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#8e8f9b] uppercase font-bold tracking-wider">Total Artwork Tambahan: {hasilKarya.length}</span>
                <button
                  onClick={() => {
                    const emptyKarya: HasilKaryaItem = {
                      id: 'k_' + Date.now(),
                      judul: 'Artwork Baru',
                      kategori: 'mockup',
                      gambar: '',
                      deskripsi: 'Deskripsi singkat karya tambahan.',
                      tahun: new Date().getFullYear(),
                      tools: 'Figma',
                      link: '',
                      urutan: hasilKarya.length + 1,
                      status: 'DRAFT'
                    };
                    setHasilKarya([...hasilKarya, emptyKarya]);
                    setEditingKarya(emptyKarya);
                    showToast('Draft Karya dibuat!', 'success');
                  }}
                  className="px-4 py-2 bg-[#25d0a4] hover:bg-[#25d0a4]/90 text-black text-[10px] font-black uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Karya
                </button>
              </div>

              {/* Grid view */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
                {hasilKarya.map((karya, idx) => (
                  <div key={karya.id} className="bg-[#131418] border border-white/10 rounded-lg p-3 flex flex-col hover:border-[#25d0a4]/50 transition group">
                    <div className="aspect-square bg-[#0e0f12] rounded-lg overflow-hidden mb-3 relative flex items-center justify-center border border-white/5">
                      {karya.gambar ? (
                        <img src={getImageUrl(karya.gambar)} alt={karya.judul} className="w-full h-full object-cover transition duration-300 group-hover:scale-102" />
                      ) : (
                        <span className="text-[10px] text-[#ff5f4a] uppercase font-black">{getImageUrl(karya.gambar) || 'Preset Card'}</span>
                      )}
                      
                      <span className="absolute bottom-2 left-2 bg-black/75 text-[8px] font-bold uppercase tracking-wider text-[#8e8f9b] px-2 py-0.5 rounded border border-white/5">
                        {karya.kategori}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-white truncate max-w-[120px]">{karya.judul}</h4>
                        <span className="text-[9px] text-[#8e8f9b] font-mono">{karya.tahun}</span>
                      </div>
                      <p className="text-[10px] text-[#8e8f9b] line-clamp-1">{karya.deskripsi}</p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                      <div className="flex gap-0.5">
                        <button 
                          onClick={() => handleMoveItem('hasilKarya', idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white/5 text-[#8e8f9b] disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleMoveItem('hasilKarya', idx, 'down')}
                          disabled={idx === hasilKarya.length - 1}
                          className="p-1 hover:bg-white/5 text-[#8e8f9b] disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditingKarya(karya)}
                          className="px-2.5 py-1.5 bg-[#0e0f12] hover:bg-white hover:text-black rounded border border-white/10 text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Apakah Anda yakin ingin menghapus karya ini?')) {
                              setHasilKarya(hasilKarya.filter(k => k.id !== karya.id).map((k, i) => ({ ...k, urutan: i + 1 })));
                              showToast('Karya berhasil dihapus!', 'info');
                            }
                          }}
                          className="p-1 hover:bg-red-950/10 text-red-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Editing Karya overlay modal */}
              {editingKarya && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                  <div className="bg-[#131418] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-5 text-left">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#25d0a4]">Edit Hasil Karya</h3>
                      <button onClick={() => setEditingKarya(null)} className="text-[#8e8f9b] hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Judul Karya</label>
                        <input
                          type="text"
                          value={editingKarya.judul}
                          onChange={(e) => setEditingKarya({ ...editingKarya, judul: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Kategori</label>
                          <select
                            value={editingKarya.kategori}
                            onChange={(e) => setEditingKarya({ ...editingKarya, kategori: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          >
                            <option value="ilustrasi">Ilustrasi</option>
                            <option value="poster">Poster</option>
                            <option value="branding">Branding</option>
                            <option value="logo">Logo</option>
                            <option value="UI design">UI Design</option>
                            <option value="artwork">Artwork</option>
                            <option value="mockup">Mockup</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Tahun Pembuatan</label>
                          <input
                            type="number"
                            value={editingKarya.tahun}
                            onChange={(e) => setEditingKarya({ ...editingKarya, tahun: +e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Status</label>
                          <select
                            value={editingKarya.status}
                            onChange={(e) => setEditingKarya({ ...editingKarya, status: e.target.value as any })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          >
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Tools</label>
                          <input
                            type="text"
                            placeholder="Figma, Illustrator..."
                            value={editingKarya.tools}
                            onChange={(e) => setEditingKarya({ ...editingKarya, tools: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                      </div>

                      <div>
                        <ImagePicker 
                          label="Gambar Hasil Karya"
                          value={editingKarya.gambar}
                          mediaLibrary={mediaLibrary}
                          onUploadToLibrary={handleUploadToLibrary}
                          onChange={(newVal) => {
                            setEditingKarya({ ...editingKarya, gambar: newVal || '' });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Deskripsi Singkat</label>
                        <textarea
                          rows={2}
                          value={editingKarya.deskripsi}
                          onChange={(e) => setEditingKarya({ ...editingKarya, deskripsi: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2 text-[10px] font-bold uppercase tracking-wider">
                      <button
                        onClick={() => {
                          const updated = hasilKarya.map(k => k.id === editingKarya.id ? editingKarya : k);
                          setHasilKarya(updated);
                          setEditingKarya(null);
                          showToast('Artwork berhasil diperbarui!', 'success');
                        }}
                        className="flex-1 py-2.5 bg-[#25d0a4] text-black font-black uppercase tracking-wider rounded transition cursor-pointer"
                      >
                        Simpan Karya
                      </button>
                      <button
                        onClick={() => setEditingKarya(null)}
                        className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white rounded cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PROSES KERJA */}
          {activeTab === 'proses_kerja' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#8e8f9b] uppercase font-bold tracking-wider">Proses Tahapan Kerja: {prosesKerja.length}</span>
                <button
                  onClick={() => {
                    const newStage: ProsesKerjaItem = {
                      id: 'pk_' + Date.now(),
                      nomor: `0${prosesKerja.length + 1}`,
                      judul: 'Tahap Baru',
                      deskripsi: 'Deskripsi alur kegiatan.',
                      icon: 'HelpCircle',
                      urutan: prosesKerja.length + 1,
                      status: 'PUBLISHED'
                    };
                    setProsesKerja([...prosesKerja, newStage]);
                    setEditingProses(newStage);
                    showToast('Tahapan proses ditambahkan!', 'success');
                  }}
                  className="px-4 py-2 bg-[#25d0a4] hover:bg-[#25d0a4]/90 text-black text-[10px] font-black uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Tahapan
                </button>
              </div>

              <div className="bg-[#131418] p-6 rounded-lg border border-white/10 space-y-4">
                {prosesKerja.map((step, idx) => (
                  <div key={step.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0e0f12] border border-white/5 rounded-lg gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-xl font-black text-[#25d0a4] font-mono select-none">{step.nomor}</span>
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-white">{step.judul}</h4>
                        <p className="text-[11px] text-[#8e8f9b] mt-0.5">{step.deskripsi}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleMoveItem('prosesKerja', idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white/5 text-[#8e8f9b] disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleMoveItem('prosesKerja', idx, 'down')}
                          disabled={idx === prosesKerja.length - 1}
                          className="p-1 hover:bg-white/5 text-[#8e8f9b] disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setEditingProses(step)}
                        className="px-2.5 py-1.5 bg-[#0e0f12] border border-white/10 text-[9px] font-bold uppercase tracking-wider rounded text-[#25d0a4] hover:bg-white/5 cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus tahapan ${step.judul}?`)) {
                            setProsesKerja(prosesKerja.filter(pk => pk.id !== step.id).map((p, i) => ({ ...p, urutan: i + 1, nomor: `0${i + 1}` })));
                            showToast('Proses dihapus!', 'info');
                          }
                        }}
                        className="p-1.5 hover:bg-red-950/10 text-red-400 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Editing Proses Overlay Dialog Modal */}
              {editingProses && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                  <div className="bg-[#131418] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-5 text-left">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#25d0a4]">Formulir Edit Proses</h3>
                      <button onClick={() => setEditingProses(null)} className="text-[#8e8f9b] hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Nomor Tahap (e.g., 01)</label>
                          <input
                            type="text"
                            value={editingProses.nomor}
                            onChange={(e) => setEditingProses({ ...editingProses, nomor: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Judul Tahap</label>
                          <input
                            type="text"
                            value={editingProses.judul}
                            onChange={(e) => setEditingProses({ ...editingProses, judul: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Icon (Lucide Icon)</label>
                          <select
                            value={editingProses.icon}
                            onChange={(e) => setEditingProses({ ...editingProses, icon: e.target.value })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          >
                            <option value="HelpCircle">HelpCircle (Tanya Jawab)</option>
                            <option value="Compass">Compass (Arah Kompas)</option>
                            <option value="Layers">Layers (Banyak Lapisan)</option>
                            <option value="CheckCircle2">CheckCircle2 (Tuntas Selesai)</option>
                            <option value="Search">Search (Pencarian)</option>
                            <option value="Activity">Activity (Grafik)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Status</label>
                          <select
                            value={editingProses.status}
                            onChange={(e) => setEditingProses({ ...editingProses, status: e.target.value as any })}
                            className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                          >
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Deskripsi Kegiatan</label>
                        <textarea
                          rows={3}
                          value={editingProses.deskripsi}
                          onChange={(e) => setEditingProses({ ...editingProses, deskripsi: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2 text-[10px] font-bold uppercase tracking-wider">
                      <button
                        onClick={() => {
                          const updated = prosesKerja.map(pk => pk.id === editingProses.id ? editingProses : pk);
                          setProsesKerja(updated);
                          setEditingProses(null);
                          showToast('Tahapan proses berhasil disimpan!', 'success');
                        }}
                        className="flex-1 py-2.5 bg-[#25d0a4] text-black font-black uppercase tracking-wider rounded transition cursor-pointer"
                      >
                        Simpan Tahapan
                      </button>
                      <button
                        onClick={() => setEditingProses(null)}
                        className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white rounded cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: KONTAK */}
          {activeTab === 'kontak' && (
            <div className="space-y-6 max-w-3xl animate-fadeIn">
              <form onSubmit={(e) => e.preventDefault()} className="bg-[#131418] p-6 rounded-lg border border-white/10 space-y-6 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Teks Header Kontak</label>
                  <input
                    type="text"
                    value={kontak.teksKontak}
                    onChange={(e) => setKontak({ ...kontak, teksKontak: e.target.value })}
                    className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Email Hubungi</label>
                    <input
                      type="email"
                      value={kontak.email}
                      onChange={(e) => setKontak({ ...kontak, email: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Nomor Telepon</label>
                    <input
                      type="text"
                      value={kontak.telepon}
                      onChange={(e) => setKontak({ ...kontak, telepon: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">WhatsApp Number (International Format, no + or 0)</label>
                    <input
                      type="text"
                      placeholder="6281200000000"
                      value={kontak.whatsapp}
                      onChange={(e) => setKontak({ ...kontak, whatsapp: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">WhatsApp Button Label (CTA Kedua)</label>
                    <input
                      type="text"
                      value={kontak.ctaKedua}
                      onChange={(e) => setKontak({ ...kontak, ctaKedua: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Pesan Button Label (CTA Utama)</label>
                  <input
                    type="text"
                    value={kontak.ctaUtama}
                    onChange={(e) => setKontak({ ...kontak, ctaUtama: e.target.value })}
                    className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#25d0a4] transition"
                  />
                </div>
              </form>
            </div>
          )}

          {/* TAB 9: SOSIAL MEDIA */}
          {activeTab === 'sosial_media' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#8e8f9b] uppercase font-bold tracking-wider">Total Platform: {sosialMedia.length}</span>
                <button
                  onClick={() => {
                    const newSocial: SosialMediaItem = {
                      id: 'sm_' + Date.now(),
                      nama: 'Custom Link',
                      username: '@username',
                      URL: 'https://',
                      icon: 'link',
                      urutan: sosialMedia.length + 1,
                      visibility: true
                    };
                    setSosialMedia([...sosialMedia, newSocial]);
                    setEditingSocial(newSocial);
                    showToast('Platform baru ditambahkan!', 'success');
                  }}
                  className="px-4 py-2 bg-[#25d0a4] hover:bg-[#25d0a4]/90 text-black text-[10px] font-black uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Sosial Media
                </button>
              </div>

              <div className="bg-[#131418] p-6 rounded-lg border border-white/10 space-y-4">
                {sosialMedia.map((sm, idx) => (
                  <div key={sm.id} className="flex items-center justify-between p-3.5 bg-[#0e0f12] border border-white/5 rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-[#131418] rounded border border-white/10 flex items-center justify-center text-[#25d0a4] text-xs font-mono font-bold select-none uppercase">
                        {sm.nama.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-white">{sm.nama}</h4>
                        <span className="text-[11px] text-[#8e8f9b]">{sm.username} • {sm.URL}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8e8f9b] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sm.visibility}
                          onChange={(e) => {
                            const updated = sosialMedia.map(x => x.id === sm.id ? { ...x, visibility: e.target.checked } : x);
                            setSosialMedia(updated);
                            showToast('Visibilitas diubah!', 'info');
                          }}
                          className="accent-[#25d0a4] w-3.5 h-3.5"
                        />
                        <span>Tampilkan</span>
                      </label>

                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleMoveItem('sosialMedia', idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white/5 text-[#8e8f9b] disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleMoveItem('sosialMedia', idx, 'down')}
                          disabled={idx === sosialMedia.length - 1}
                          className="p-1 hover:bg-white/5 text-[#8e8f9b] disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setEditingSocial(sm)}
                        className="px-2.5 py-1.5 bg-[#131418] border border-white/10 text-[9px] font-bold uppercase tracking-wider rounded text-white hover:bg-white/5 cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus link sosial ${sm.nama}?`)) {
                            setSosialMedia(sosialMedia.filter(x => x.id !== sm.id).map((x, i) => ({ ...x, urutan: i + 1 })));
                            showToast('Sosial Media dihapus!', 'info');
                          }
                        }}
                        className="p-1.5 hover:bg-red-950/10 text-red-400 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Editing Social Overlay Modal */}
              {editingSocial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                  <div className="bg-[#131418] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-5 text-left">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#25d0a4]">Edit Sosial Media</h3>
                      <button onClick={() => setEditingSocial(null)} className="text-[#8e8f9b] hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Nama Platform</label>
                        <input
                          type="text"
                          value={editingSocial.nama}
                          onChange={(e) => setEditingSocial({ ...editingSocial, nama: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Username / Handle</label>
                        <input
                          type="text"
                          value={editingSocial.username}
                          onChange={(e) => setEditingSocial({ ...editingSocial, username: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Alamat URL Link</label>
                        <input
                          type="text"
                          value={editingSocial.URL}
                          onChange={(e) => setEditingSocial({ ...editingSocial, URL: e.target.value })}
                          className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2 text-[10px] font-bold uppercase tracking-wider">
                      <button
                        onClick={() => {
                          const updated = sosialMedia.map(x => x.id === editingSocial.id ? editingSocial : x);
                          setSosialMedia(updated);
                          setEditingSocial(null);
                          showToast('Sosial Media berhasil diperbarui!', 'success');
                        }}
                        className="flex-1 py-2.5 bg-[#25d0a4] text-black font-black uppercase tracking-wider rounded transition cursor-pointer"
                      >
                        Simpan Platform
                      </button>
                      <button
                        onClick={() => setEditingSocial(null)}
                        className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white rounded cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 10: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <MediaLibraryView 
              mediaLibrary={mediaLibrary}
              onUpload={(newFile) => {
                setMediaLibrary([newFile, ...mediaLibrary]);
                showToast('Berkas berhasil ditambahkan ke pustaka media!', 'success');
              }}
              onDelete={(id) => {
                setMediaLibrary(mediaLibrary.filter(f => f.id !== id));
                showToast('Berkas berhasil dihapus!', 'info');
              }}
              onRename={(id, newName) => {
                setMediaLibrary(mediaLibrary.map(f => f.id === id ? { ...f, name: newName } : f));
                showToast('Berkas berhasil diganti nama!', 'success');
              }}
            />
          )}

          {/* TAB 11: BACKGROUND MANAGEMENT */}
          {activeTab === 'background' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <form onSubmit={(e) => e.preventDefault()} className="bg-[#131418] p-6 rounded-lg border border-white/10 space-y-6 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Tipe Background</label>
                    <select
                      value={background.type}
                      onChange={(e) => setBackground({ ...background, type: e.target.value as any })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4] transition"
                    >
                      <option value="solid">Solid Color</option>
                      <option value="gradient">Linear Gradient</option>
                      <option value="image">Image URL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Solid Background Color</label>
                    <input
                      type="text"
                      value={background.solidColor}
                      onChange={(e) => setBackground({ ...background, solidColor: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Linear Gradient Colors (Comma Separated)</label>
                  <input
                    type="text"
                    value={background.gradientColors}
                    onChange={(e) => setBackground({ ...background, gradientColors: e.target.value })}
                    className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#25d0a4] transition"
                  />
                </div>

                <div>
                  <ImagePicker 
                    label="Custom Image Background"
                    value={background.image}
                    mediaLibrary={mediaLibrary}
                    onUploadToLibrary={handleUploadToLibrary}
                    onChange={(newVal) => {
                      setBackground({ ...background, image: newVal || '' });
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Posisi Gambar</label>
                    <select
                      value={background.position}
                      onChange={(e) => setBackground({ ...background, position: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4] transition"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Ukuran Gambar</label>
                    <select
                      value={background.size}
                      onChange={(e) => setBackground({ ...background, size: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4] transition"
                    >
                      <option value="cover">Cover (Full Screen)</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Transparansi / Opacity ({background.opacity}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={background.opacity}
                      onChange={(e) => setBackground({ ...background, opacity: +e.target.value })}
                      className="w-full accent-[#25d0a4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Blur Intensity ({background.blur}px)</label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={background.blur}
                      onChange={(e) => setBackground({ ...background, blur: +e.target.value })}
                      className="w-full accent-[#25d0a4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Kecerahan ({background.brightness}%)</label>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={background.brightness}
                      onChange={(e) => setBackground({ ...background, brightness: +e.target.value })}
                      className="w-full accent-[#25d0a4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1">Overlay Color (RGBA)</label>
                    <input
                      type="text"
                      value={background.overlay}
                      onChange={(e) => setBackground({ ...background, overlay: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#25d0a4] transition"
                    />
                  </div>
                </div>
              </form>

              {/* LIVE PREVIEW BOX */}
              <div className="bg-[#131418] border border-white/10 rounded-lg p-6 space-y-4">
                <span className="text-[10px] uppercase font-bold text-[#8e8f9b] tracking-wider block">Live Preview (Latar Belakang Web)</span>
                <div className="aspect-video bg-[#0e0f12] rounded-lg relative overflow-hidden flex items-center justify-center border border-white/5">
                  {/* Miniature canvas representation */}
                  <div 
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      backgroundColor: background.type === 'solid' ? background.solidColor : undefined,
                      backgroundImage: background.type === 'gradient' ? `linear-gradient(${background.gradientColors})` : background.type === 'image' && background.image ? `url(${background.image})` : undefined,
                      backgroundPosition: background.position,
                      backgroundSize: background.size,
                      opacity: background.opacity / 100,
                      filter: `blur(${background.blur / 2}px) brightness(${background.brightness}%)`
                    }}
                  />
                  {background.overlay && (
                    <div className="absolute inset-0" style={{ backgroundColor: background.overlay }} />
                  )}
                  <span className="relative z-10 text-[9px] uppercase font-bold tracking-wider text-[#25d0a4] bg-black/80 px-4 py-2 rounded border border-white/5 select-none shadow-2xl">
                    Canvas Backdrop
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 max-w-3xl animate-fadeIn">
              <div className="bg-[#131418] p-6 rounded-lg border border-white/10 space-y-6 text-xs">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="flex gap-2 items-center text-xs text-[#25d0a4] font-bold">
                    <Palette className="w-5 h-5" />
                    <span className="uppercase tracking-wider">Visual Design Tokens (Gaya Website)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-3 py-1.5 bg-[#0e0f12] hover:bg-white hover:text-black text-white border border-white/10 text-[9px] font-black uppercase tracking-wider rounded transition cursor-pointer"
                  >
                    Reset To Default
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Primary Background Color</label>
                    <input
                      type="text"
                      value={appearance.backgroundColor}
                      onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Secondary Card Color</label>
                    <input
                      type="text"
                      value={appearance.secondaryBackground}
                      onChange={(e) => setAppearance({ ...appearance, secondaryBackground: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Primary Text Color</label>
                    <input
                      type="text"
                      value={appearance.textColor}
                      onChange={(e) => setAppearance({ ...appearance, textColor: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Muted Secondary Text</label>
                    <input
                      type="text"
                      value={appearance.mutedText}
                      onChange={(e) => setAppearance({ ...appearance, mutedText: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Warna Aksen Utama</label>
                    <input
                      type="text"
                      value={appearance.accentColor}
                      onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Warna Border Line</label>
                    <input
                      type="text"
                      value={appearance.borderColor}
                      onChange={(e) => setAppearance({ ...appearance, borderColor: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8e8f9b] mb-1.5">Card Corner Radius</label>
                    <input
                      type="text"
                      value={appearance.borderRadius}
                      onChange={(e) => setAppearance({ ...appearance, borderRadius: e.target.value })}
                      className="w-full bg-[#0e0f12] border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#25d0a4]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: MOTION (Intensitas Animasi) */}
          {activeTab === 'motion' && (
            <div className="space-y-6 max-w-2xl animate-fadeIn">
              <form onSubmit={(e) => e.preventDefault()} className="bg-[#131418] p-6 rounded-lg border border-white/10 space-y-6 text-xs">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#25d0a4] uppercase tracking-wider">Pengaturan Perilaku Animasi &amp; Motion</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={motion.enabled}
                      onChange={(e) => setMotion({ ...motion, enabled: e.target.checked })}
                      className="accent-[#25d0a4] w-4 h-4"
                    />
                    <span className="font-bold uppercase text-[9px] tracking-wider text-[#8e8f9b]">Aktifkan Efek Animasi</span>
                  </label>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#8e8f9b] mb-1">
                      <span>Kecepatan Scroll / Animasi ({motion.speed}x)</span>
                      <span>Default: 1.0x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={motion.speed}
                      onChange={(e) => setMotion({ ...motion, speed: +e.target.value })}
                      className="w-full accent-[#25d0a4]"
                      disabled={!motion.enabled}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#8e8f9b] mb-1">
                      <span>Intensitas Blur Animasi ({motion.blurIntensity}x)</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.1"
                      value={motion.blurIntensity}
                      onChange={(e) => setMotion({ ...motion, blurIntensity: +e.target.value })}
                      className="w-full accent-[#25d0a4]"
                      disabled={!motion.enabled}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#8e8f9b] mb-1">
                      <span>Efek Parallax Intensitas ({motion.parallaxIntensity}x)</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="2.0"
                      step="0.1"
                      value={motion.parallaxIntensity}
                      onChange={(e) => setMotion({ ...motion, parallaxIntensity: +e.target.value })}
                      className="w-full accent-[#25d0a4]"
                      disabled={!motion.enabled}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#8e8f9b] mb-1">
                      <span>Pergerakan Kursor Mouse ({motion.hoverMovement}x)</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="2.0"
                      step="0.1"
                      value={motion.hoverMovement}
                      onChange={(e) => setMotion({ ...motion, hoverMovement: +e.target.value })}
                      className="w-full accent-[#25d0a4]"
                      disabled={!motion.enabled}
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 14: SETTINGS / PENGATURAN */}
          {activeTab === 'pengaturan' && (
            <div className="space-y-6 max-w-3xl animate-fadeIn text-xs">
              <div className="bg-[#131418] p-6 rounded-lg border border-white/10 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#25d0a4] mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#25d0a4]" /> Backup &amp; Pemulihan Data
                  </h3>
                  <p className="text-[11px] text-[#8e8f9b] leading-relaxed mb-4">
                    Seluruh konten dan visual website Alya Pratama disimpan secara aman di penyimpanan browser lokal Anda (localStorage). Anda dapat mencadangkan seluruh data dalam bentuk file JSON, atau memulihkannya kembali kapan saja.
                  </p>
                  
                  <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
                    <button
                      onClick={() => {
                        const backupStr = JSON.stringify(getCompiledData(), null, 2);
                        const blob = new Blob([backupStr], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `alya_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        showToast('Backup JSON berhasil diunduh!', 'success');
                      }}
                      className="px-4 py-2.5 bg-[#0e0f12] hover:bg-white hover:text-black text-white border border-white/10 rounded transition flex items-center gap-1.5 cursor-pointer"
                    >
                      Export Backup JSON
                    </button>
                    
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'application/json';
                        input.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            try {
                              const restored = JSON.parse(evt.target?.result as string);
                              if (restored.hero && restored.profile) {
                                setHero(restored.hero);
                                setProfile(restored.profile);
                                setSkills(restored.skills || []);
                                setPortfolio(restored.portfolio || []);
                                setHasilKarya(restored.hasilKarya || []);
                                setProsesKerja(restored.prosesKerja || []);
                                setKontak(restored.kontak);
                                setSosialMedia(restored.sosialMedia || []);
                                setMediaLibrary(restored.mediaLibrary || []);
                                setBackground(restored.background);
                                setAppearance(restored.appearance);
                                setMotion(restored.motion);
                                showToast('Data berhasil direstore dari file!', 'success');
                              } else {
                                alert('Format file JSON backup tidak valid.');
                              }
                            } catch (err) {
                              alert('Gagal mengurai file backup JSON.');
                            }
                          };
                          reader.readAsText(file);
                        };
                        input.click();
                      }}
                      className="px-4 py-2.5 bg-transparent hover:bg-[#25d0a4]/10 text-[#25d0a4] border border-[#25d0a4]/30 rounded transition flex items-center gap-1.5 cursor-pointer"
                    >
                      Import Pemulihan JSON
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" /> Tindakan Berbahaya
                  </h3>
                  <div className="p-4 bg-[#0e0f12] border border-red-500/20 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-red-200">Reset Semua Data Ke Setelan Pabrik</h4>
                      <p className="text-[11px] text-[#8e8f9b] mt-0.5">Ini akan menghapus seluruh custom portfolio, draft, media, dan mengembalikannya ke data default Alya Pratama asli.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('APAKAH ANDA YAKIN? Tindakan ini tidak dapat dibatalkan. Seluruh custom konten Anda akan hilang selamanya.')) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2.5 bg-red-950/20 hover:bg-red-900/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer flex-shrink-0"
                    >
                      Factory Reset Web
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
