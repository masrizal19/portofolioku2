import React, { useState, useRef } from 'react';
import { MediaItem } from '../types';
import { 
  Search, 
  Upload, 
  Trash2, 
  Copy, 
  File, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  FileCode, 
  X,
  Info
} from 'lucide-react';

interface MediaLibraryViewProps {
  mediaLibrary: MediaItem[];
  onUpload: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export default function MediaLibraryView({ mediaLibrary, onUpload, onDelete, onRename }: MediaLibraryViewProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'pdf'>('all');
  const [dragActive, setDragActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editNameId, setEditNameId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & Search
  const filteredMedia = mediaLibrary.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'image' ? item.type.startsWith('image/') :
      filterType === 'pdf' ? item.type.includes('pdf') : true;
    return matchesSearch && matchesFilter;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      const newItem: MediaItem = {
        id: 'ml_' + Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        url: base64Url,
        inUse: false
      };
      onUpload(newItem);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const copyToClipboard = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startRename = (item: MediaItem) => {
    setEditNameId(item.id);
    setNewName(item.name);
  };

  const saveRename = (id: string) => {
    if (newName.trim()) {
      onRename(id, newName.trim());
      setEditNameId(null);
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, name: newName.trim() });
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, className = 'w-6 h-6') => {
    if (type.startsWith('image/')) return <ImageIcon className={`${className} text-[#25d0a4]`} />;
    if (type.includes('pdf')) return <FileText className={`${className} text-[#ff5f4a]`} />;
    if (type.includes('svg')) return <FileCode className={`${className} text-[#25d0a4]`} />;
    return <File className={`${className} text-[#8e8f9b]`} />;
  };

  return (
    <div className="space-y-6 animate-fadeIn" style={{ fontFamily: "'Anybody', 'Batica Sans', sans-serif" }}>
      {/* Action and Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8f9b]" />
          <input
            type="text"
            placeholder="Cari file media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131418] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#25d0a4] text-white transition duration-150"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'image', label: 'Gambar' },
            { id: 'pdf', label: 'PDF / CV' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id as any)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                filterType === btn.id 
                  ? 'bg-white text-black border-white' 
                  : 'bg-[#131418] text-[#f6f6f8] border-white/10 hover:border-white/20'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Grid and Upload Dropzone */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upload Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
              dragActive 
                ? 'border-[#25d0a4] bg-[#25d0a4]/5' 
                : 'border-white/10 bg-[#131418] hover:border-white/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleChange}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-[#0e0f12] flex items-center justify-center text-[#25d0a4] mb-3 border border-white/5">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Tarik &amp; lepas file ke sini, atau klik untuk memilih</p>
            <p className="text-[10px] text-[#8e8f9b] mt-1 font-bold uppercase tracking-widest">Mendukung PNG, JPG, WebP, SVG, PDF up to 5MB</p>
          </div>

          {/* Media Grid */}
          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-[#131418] border rounded-xl p-3 flex flex-col items-stretch group cursor-pointer transition-all duration-150 ${
                    selectedItem?.id === item.id ? 'border-white' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-[#0e0f12] rounded-lg overflow-hidden mb-3 relative flex items-center justify-center border border-white/5">
                    {item.type.startsWith('image/') ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      getFileIcon(item.type, 'w-8 h-8')
                    )}
                    {item.inUse && (
                      <span className="absolute top-2 right-2 bg-black/85 border border-[#25d0a4]/30 text-[#25d0a4] px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider">
                        In Use
                      </span>
                    )}
                  </div>

                  {/* Details truncated */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#f6f6f8] uppercase tracking-wider truncate mb-0.5">{item.name}</p>
                    <p className="text-[9px] text-[#8e8f9b] font-bold tracking-wider">{formatBytes(item.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 border border-dashed border-white/10 bg-[#131418] rounded-2xl text-center space-y-3">
              <ImageIcon className="w-8 h-8 mx-auto text-[#8e8f9b]" />
              <p className="text-xs uppercase tracking-wider font-bold text-[#c9cad2]">Belum ada file media</p>
            </div>
          )}
        </div>

        {/* Sidebar Detail Inspector Panel */}
        <div className="lg:col-span-1 bg-[#131418] border border-white/10 rounded-2xl p-5 sticky top-6">
          {selectedItem ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-[#25d0a4]">File Details</h3>
                <button onClick={() => setSelectedItem(null)} className="text-[#8e8f9b] hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>

              {/* Detail Thumbnail */}
              <div className="aspect-video bg-[#0e0f12] rounded-lg border border-white/5 overflow-hidden flex items-center justify-center">
                {selectedItem.type.startsWith('image/') ? (
                  <img src={selectedItem.url} alt={selectedItem.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  getFileIcon(selectedItem.type, 'w-10 h-10')
                )}
              </div>

              {/* Metadata Info */}
              <div className="space-y-4 text-xs">
                {/* Rename Section */}
                <div>
                  <label className="block text-[9px] uppercase font-bold text-[#8e8f9b] mb-1 tracking-wider">Nama File</label>
                  {editNameId === selectedItem.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-[#0e0f12] border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white flex-1 min-w-0"
                      />
                      <button 
                        onClick={() => saveRename(selectedItem.id)} 
                        className="p-1.5 bg-[#25d0a4] text-black rounded-lg cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-[#f6f6f8] break-all uppercase text-[10px] tracking-wider">{selectedItem.name}</span>
                      <button 
                        onClick={() => startRename(selectedItem)}
                        className="text-[9px] uppercase tracking-wider font-bold text-[#25d0a4] hover:underline flex-shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-[#8e8f9b] block mb-0.5 tracking-wider">Tipe File</span>
                  <span className="text-white/80 font-bold uppercase text-[10px] tracking-wide">{selectedItem.type}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#8e8f9b] block mb-0.5 tracking-wider">Ukuran</span>
                    <span className="text-white/80 text-[11px] font-bold">{formatBytes(selectedItem.size)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#8e8f9b] block mb-0.5 tracking-wider">Tanggal Upload</span>
                    <span className="text-white/80 text-[11px] font-bold">{selectedItem.uploadDate}</span>
                  </div>
                </div>

                {/* File URL to copy */}
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#8e8f9b] block mb-1 tracking-wider">Lokasi URL</span>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url.startsWith('data:') ? 'Base64 Local Data (Kapasitas Maksimal)' : selectedItem.url}
                      className="bg-[#0e0f12] border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-[#8e8f9b] flex-1 truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedItem)}
                      className="p-2 bg-[#0e0f12] hover:bg-white/5 text-[#c9cad2] rounded-lg border border-white/10 transition cursor-pointer"
                      title="Salin URL"
                    >
                      {copiedId === selectedItem.id ? <Check className="w-3.5 h-3.5 text-[#25d0a4]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 flex gap-2">
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus file ini dari pustaka media?')) {
                      onDelete(selectedItem.id);
                      setSelectedItem(null);
                    }
                  }}
                  className="flex-1 py-2 bg-red-950/10 hover:bg-red-950/30 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus File
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-[#8e8f9b] space-y-2">
              <Info className="w-6 h-6 mx-auto opacity-30 text-[#25d0a4]" />
              <p className="text-[10px] font-black uppercase tracking-wider text-white">File Inspector</p>
              <p className="text-[10px] leading-relaxed">Klik salah satu media pada grid sebelah kiri untuk melihat rincian metadata lengkap, mengganti nama file, atau menyalin lokasi URL.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
