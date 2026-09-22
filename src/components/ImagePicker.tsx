import React, { useState, useRef, useEffect } from 'react';
import { ImageObject, MediaItem } from '../types';
import { getImageUrl, getImageSource, formatBytes } from '../lib/imageUtils';
import { Upload, Image as ImageIcon, Link2, Trash2, Edit, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ImagePickerProps {
  label: string;
  value: string | ImageObject | null | undefined;
  onChange: (newValue: ImageObject | null) => void;
  mediaLibrary: MediaItem[];
  onUploadToLibrary: (file: { name: string; type: string; size: number; url: string }) => void;
  className?: string;
}

export default function ImagePicker({
  label,
  value,
  onChange,
  mediaLibrary = [],
  onUploadToLibrary,
  className = '',
}: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUrl = getImageUrl(value);
  const currentSource = getImageSource(value);

  // Derive metadata
  let fileName = 'N/A';
  let fileSize = 0;
  let fileType = 'image';

  if (value && typeof value === 'object') {
    fileName = value.name || 'Unnamed file';
    fileSize = value.size || 0;
    fileType = value.type || 'image';
  } else if (typeof value === 'string' && value) {
    if (value.startsWith('data:')) {
      fileName = 'uploaded_file.png';
      fileType = value.substring(value.indexOf(':') + 1, value.indexOf(';'));
    } else {
      fileName = value.split('/').pop()?.split('?')[0] || 'external_image';
    }
  }

  // Pre-fill URL input if current mode is URL
  useEffect(() => {
    if (currentSource === 'EXTERNAL_URL' && currentUrl && !currentUrl.startsWith('data:')) {
      setUrlInput(currentUrl);
    }
  }, [currentUrl, currentSource]);

  // Handle URL changes
  const handleUrlSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) {
      setUrlError('URL tidak boleh kosong');
      return;
    }
    
    const isHttpUrl = urlInput.startsWith('http://') || urlInput.startsWith('https://');
    if (!isHttpUrl) {
      setUrlError('Masukkan URL web yang valid (harus dimulai dengan http:// atau https://)');
      return;
    }

    setUrlError('');
    onChange({
      url: urlInput,
      source: 'EXTERNAL_URL',
      name: urlInput.split('/').pop()?.split('?')[0] || 'external_image',
      type: 'image/external',
      size: 0
    });
  };

  // Process selected file
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Hanya diperbolehkan berkas gambar (PNG, JPG, JPEG, WebP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      
      onUploadToLibrary({
        name: file.name,
        type: file.type,
        size: file.size,
        url: base64Url
      });

      onChange({
        url: base64Url,
        source: 'UPLOAD',
        name: file.name,
        type: file.type,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const filteredLibrary = mediaLibrary.filter(item => {
    const isImage = item.type.startsWith('image/') || item.url.startsWith('data:image/');
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isImage && matchesSearch;
  });

  const selectFromLibrary = (item: MediaItem) => {
    onChange({
      url: item.url,
      source: 'MEDIA_LIBRARY',
      name: item.name,
      type: item.type,
      size: item.size
    });
  };

  return (
    <div className={`p-4 rounded-xl border border-white/10 bg-[#131418] text-[#f6f6f8] ${className}`} style={{ fontFamily: "'Anybody', 'Batica Sans', sans-serif" }}>
      {/* Header Label */}
      <div className="flex justify-between items-center mb-3">
        <label className="text-[10px] uppercase font-black tracking-wider text-[#8e8f9b]">{label}</label>
        {currentSource && (
          <span className="text-[8px] px-2 py-0.5 rounded bg-[#0e0f12] border border-white/10 text-[#25d0a4] font-bold flex items-center gap-1 uppercase tracking-wider">
            <CheckCircle2 className="w-2.5 h-2.5" />
            {currentSource === 'UPLOAD' ? 'UPLOAD' : currentSource === 'MEDIA_LIBRARY' ? 'MEDIA LIBRARY' : 'EXTERNAL URL'}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#0e0f12] rounded-lg mb-4 text-[9px] font-bold tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`py-1.5 rounded uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'upload' ? 'bg-white text-black font-black' : 'text-[#8e8f9b] hover:text-white'
          }`}
        >
          <Upload className="w-3 h-3" />
          UPLOAD
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`py-1.5 rounded uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'library' ? 'bg-white text-black font-black' : 'text-[#8e8f9b] hover:text-white'
          }`}
        >
          <ImageIcon className="w-3 h-3" />
          LIBRARY
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`py-1.5 rounded uppercase transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'url' ? 'bg-white text-black font-black' : 'text-[#8e8f9b] hover:text-white'
          }`}
        >
          <Link2 className="w-3 h-3" />
          URL
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mb-4">
        {activeTab === 'upload' && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-lg p-5 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[120px] ${
              dragOver
                ? 'border-[#25d0a4] bg-[#25d0a4]/5'
                : 'border-white/10 hover:border-white/20 bg-[#0e0f12]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Upload className="w-6 h-6 text-[#8e8f9b] mb-2" />
            <p className="text-[10px] font-bold text-white uppercase tracking-wider">Tarik & taruh gambar, atau klik untuk memilih</p>
            <p className="text-[8px] text-[#8e8f9b] mt-0.5 uppercase tracking-widest">Mendukung PNG, JPG, JPEG, WebP, SVG</p>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="bg-[#0e0f12] rounded-lg p-3 min-h-[120px]">
            {/* Search */}
            <input
              type="text"
              placeholder="Cari gambar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[10px] px-3 py-1.5 rounded bg-[#131418] border border-white/5 text-white focus:outline-none focus:border-[#25d0a4] mb-2"
            />

            <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {filteredLibrary.length > 0 ? (
                filteredLibrary.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectFromLibrary(item)}
                    className={`relative aspect-square rounded overflow-hidden border bg-[#131418] hover:opacity-90 transition group ${
                      currentUrl === item.url ? 'border-white' : 'border-white/5'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-1">
                      <span className="text-[8px] text-white truncate w-full text-center uppercase tracking-wider">{item.name}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-4 py-8 text-center text-[#8e8f9b] text-[9px] uppercase tracking-wider">
                  Tidak ada gambar di Media Library.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="bg-[#0e0f12] rounded-lg p-3 min-h-[120px] flex flex-col justify-between">
            <div>
              <label className="block text-[8px] font-bold text-[#8e8f9b] uppercase mb-1 tracking-wider">External Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 text-[10px] px-3 py-1.5 rounded bg-[#131418] border border-white/5 text-white focus:outline-none focus:border-[#25d0a4]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-wider rounded transition cursor-pointer"
                >
                  Set
                </button>
              </div>
              {urlError && (
                <p className="text-[9px] text-[#ff5f4a] mt-1.5 flex items-center gap-1 font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3 h-3" />
                  {urlError}
                </p>
              )}
            </div>
            <p className="text-[8px] text-[#8e8f9b] uppercase tracking-widest mt-2">
              Gunakan link gambar langsung dari Unsplash atau CDN lainnya.
            </p>
          </form>
        )}
      </div>

      {/* Preview Area & Actions */}
      <div className="bg-[#0e0f12] border border-white/5 rounded-lg p-3">
        <div className="relative aspect-video rounded bg-[#131418] overflow-hidden flex items-center justify-center mb-3 border border-white/5">
          {currentUrl ? (
            <img
              src={currentUrl}
              alt="Pratinjau"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="text-center text-[#8e8f9b] flex flex-col items-center">
              <ImageIcon className="w-6 h-6 opacity-30 mb-1" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Belum ada gambar yang dipilih</span>
            </div>
          )}
        </div>

        {/* Metadata Details */}
        {currentUrl && (
          <div className="text-[10px] text-[#8e8f9b] space-y-1 mb-3 pt-2 border-t border-white/5 uppercase tracking-wider">
            <div className="flex justify-between gap-2">
              <span>Nama file:</span>
              <span className="text-white truncate max-w-[200px] text-right font-bold" title={fileName}>{fileName}</span>
            </div>
            {fileSize > 0 && (
              <div className="flex justify-between">
                <span>Ukuran:</span>
                <span className="text-white font-bold">{formatBytes(fileSize)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tipe:</span>
              <span className="text-white font-bold">{fileType}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {currentUrl && (
          <div className="flex justify-between gap-2 text-[9px] font-black uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="px-3 py-1.5 border border-white/10 hover:border-white/20 rounded text-white flex items-center gap-1 bg-[#131418] cursor-pointer"
            >
              <Edit className="w-2.5 h-2.5" />
              Ganti
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-1.5 border border-red-500/20 text-red-400 hover:bg-red-500/5 rounded flex items-center gap-1 bg-transparent cursor-pointer"
            >
              <Trash2 className="w-2.5 h-2.5" />
              Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
