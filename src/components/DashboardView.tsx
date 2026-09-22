import React from 'react';
import { CMSData } from '../types';
import { getImageUrl } from '../lib/imageUtils';
import { 
  FolderGit2, 
  Image as ImageIcon, 
  Award, 
  FileText, 
  CheckCircle, 
  PenTool, 
  Plus, 
  Upload, 
  Sliders, 
  ArrowUpRight 
} from 'lucide-react';

interface DashboardViewProps {
  data: CMSData;
  onNavigate: (tab: string) => void;
  onAddPortfolio: () => void;
  onAddKarya: () => void;
}

export default function DashboardView({ data, onNavigate, onAddPortfolio, onAddKarya }: DashboardViewProps) {
  // Compute counts
  const totalPortfolios = data.portfolio.length;
  const publishedPortfolios = data.portfolio.filter(p => p.status === 'PUBLISHED').length;
  const draftPortfolios = data.portfolio.filter(p => p.status === 'DRAFT').length;

  const totalKarya = data.hasilKarya.length;
  const publishedKarya = data.hasilKarya.filter(k => k.status === 'PUBLISHED').length;

  const totalSkills = data.skills.length;
  const totalMedia = data.mediaLibrary.length;

  const activities = [
    { id: 1, action: 'Memperbarui Hero Headline', category: 'Hero', time: '10 m ago' },
    { id: 2, action: `Menambahkan portfolio "${data.portfolio[0]?.judul || 'Baru'}"`, category: 'Portfolio', time: '1 h ago' },
    { id: 3, action: 'Mengunggah avatar_alya.png ke Media Library', category: 'Media', time: 'Yesterday' },
    { id: 4, action: 'Mengubah warna aksen menjadi mint', category: 'Appearance', time: '2 d ago' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn" style={{ fontFamily: "'Anybody', 'Batica Sans', sans-serif" }}>
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { icon: FolderGit2, val: totalPortfolios, label: 'Total Portfolio' },
          { icon: ImageIcon, val: totalKarya, label: 'Hasil Karya' },
          { icon: Award, val: totalSkills, label: 'Total Skills' },
          { icon: PenTool, val: totalMedia, label: 'Media Files' },
          { icon: CheckCircle, val: publishedPortfolios + publishedKarya, label: 'Published' },
          { icon: FileText, val: draftPortfolios, label: 'Drafts' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-[#131418] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-150">
              <div className="text-[#8e8f9b] mb-3"><Icon className="w-4 h-4" /></div>
              <div className="text-2xl font-black text-white tracking-tight">{item.val}</div>
              <div className="text-[9px] text-[#8e8f9b] uppercase tracking-wider font-bold mt-1">{item.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#131418] border border-white/10 rounded-2xl p-6">
        <h3 className="text-[10px] uppercase tracking-widest text-[#8e8f9b] font-black mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { action: onAddPortfolio, icon: Plus, label: 'Tambah Portfolio' },
            { action: onAddKarya, icon: Plus, label: 'Tambah Karya' },
            { action: () => onNavigate('skills'), icon: Plus, label: 'Tambah Skill' },
            { action: () => onNavigate('media'), icon: Upload, label: 'Upload Media' },
            { action: () => onNavigate('hero'), icon: Sliders, label: 'Edit Hero' },
            { action: () => onNavigate('background'), icon: Sliders, label: 'Ganti Background' }
          ].map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button 
                key={idx}
                onClick={btn.action}
                className="flex flex-col items-center justify-center p-4 bg-[#0e0f12] hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-150 gap-2 text-white/80 hover:text-white cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-[#8e8f9b]" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Portfolios */}
        <div className="lg:col-span-2 bg-[#131418] border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#8e8f9b] font-black">Portfolio Terbaru</h3>
            <button 
              onClick={() => onNavigate('portfolio')}
              className="text-[10px] uppercase tracking-wider font-black text-[#25d0a4] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Kelola semua <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-3">
            {data.portfolio.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3.5 bg-[#0e0f12] border border-white/10 rounded-xl hover:border-white/20 transition duration-150">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#131418] flex items-center justify-center text-xs text-[#8e8f9b] overflow-hidden border border-white/10">
                    {getImageUrl(item.cover).startsWith('http') || getImageUrl(item.cover).startsWith('data:') ? (
                      <img src={getImageUrl(item.cover)} alt={item.judul} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] uppercase font-bold text-[#25d0a4]">{getImageUrl(item.thumbnail).slice(0, 4)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">{item.judul}</h4>
                    <span className="text-[10px] text-[#8e8f9b]">{item.kategori} • {item.tahun}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                  item.status === 'PUBLISHED' ? 'bg-[#25d0a4]/10 text-[#25d0a4]' : 'bg-[#8e8f9b]/10 text-[#8e8f9b]'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Website Status & Activities */}
        <div className="space-y-6">
          {/* Website Status */}
          <div className="bg-[#131418] border border-white/10 rounded-2xl p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#8e8f9b] font-black mb-4">Status Website</h3>
            <div className="flex items-center justify-between p-3.5 bg-[#0e0f12] border border-white/10 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d0a4] opacity-75 animate-pulse"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25d0a4]"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-white">Online / Published</span>
              </div>
              <span className="text-[9px] font-bold uppercase text-[#8e8f9b] tracking-wider">Live Preview OK</span>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[#131418] border border-white/10 rounded-2xl p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#8e8f9b] font-black mb-4">Aktivitas Terakhir</h3>
            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs leading-relaxed border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="mt-1 w-1 h-1 rounded-full bg-[#25d0a4] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white/90 text-[11px] font-medium leading-normal">{act.action}</p>
                    <div className="flex gap-2 text-[8px] text-[#8e8f9b] mt-1 font-bold uppercase tracking-widest">
                      <span>{act.category}</span>
                      <span>•</span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
