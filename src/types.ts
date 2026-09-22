export interface ImageObject {
  url: string;
  source: 'UPLOAD' | 'MEDIA_LIBRARY' | 'EXTERNAL_URL';
  name?: string;
  size?: number;
  type?: string;
}

export interface HeroBackgroundData {
  image: string | ImageObject | null;
  positionX: number;
  positionY: number;
  scale: number;
  opacity: number;
  brightness: number;
  contrast: number;
  blur: number;
  overlayOpacity: number;
  overlayColor: string;
}

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Badge {
  id: string;
  nama: string;
  warnaBackground: 'coral' | 'mint' | 'violet' | 'gold' | string;
  warnaText: string;
  posisi: number;
  visibility: boolean;
}

export interface HeroData {
  nama: string;
  namaPendek: string;
  kalimatPembuka: string;
  headlineUtama: string;
  headlineKedua: string;
  visualText: string;
  fotoProfile: string | ImageObject; // custom image url/object or empty for SVG
  statistikPengalaman: number;
  statistikJumlahProject: number;
  badges: Badge[];
  heroBackground?: HeroBackgroundData;
}

export interface ProfileData {
  nama: string;
  deskripsi: string;
  bio: string;
  fotoProfil: string | ImageObject;
  cvSummary: string;
  highlights: string[];
  informasiProfesional: { key: string; value: string }[];
}

export interface SkillItem {
  id: string;
  nama: string;
  kategori: string;
  level: number; // 0-100
  icon: string; // lucide icon name
  deskripsi: string;
  urutan: number;
  status: ContentStatus;
}

export interface PortfolioItem {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  thumbnail: string | ImageObject;
  cover: string | ImageObject;
  gallery: (string | ImageObject)[];
  deskripsi: string;
  client: string;
  tahun: number;
  role: string;
  tools: string[];
  projectURL: string;
  prototypeURL: string;
  status: ContentStatus;
  urutan: number;
}

export interface HasilKaryaItem {
  id: string;
  judul: string;
  kategori: 'gambar' | 'poster' | 'branding' | 'logo' | 'UI design' | 'ilustrasi' | 'artwork' | 'mockup' | string;
  gambar: string | ImageObject;
  deskripsi: string;
  tahun: number;
  tools: string;
  link: string;
  urutan: number;
  status: ContentStatus;
}

export interface ProsesKerjaItem {
  id: string;
  nomor: string; // '01', '02', etc.
  judul: string;
  deskripsi: string;
  icon: string; // lucide icon name
  urutan: number;
  status: ContentStatus;
}

export interface KontakData {
  email: string;
  telepon: string;
  whatsapp: string;
  ctaUtama: string;
  ctaKedua: string;
  teksKontak: string;
}

export interface SosialMediaItem {
  id: string;
  nama: string;
  username: string;
  URL: string;
  icon: string;
  urutan: number;
  visibility: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  type: string; // 'image/png', 'image/jpeg', 'application/pdf', etc.
  size: number; // in bytes
  uploadDate: string;
  url: string; // path or base64
  inUse?: boolean;
}

export interface BackgroundData {
  type: 'solid' | 'gradient' | 'image' | 'video';
  solidColor: string;
  gradientColors: string;
  image: string | ImageObject;
  video: string;
  position: string;
  size: string;
  opacity: number;
  blur: number;
  brightness: number;
  contrast: number;
  overlay: string;
}

export interface AppearanceData {
  backgroundColor: string;
  secondaryBackground: string;
  textColor: string;
  mutedText: string;
  accentColor: string;
  borderColor: string;
  borderRadius: string;
  typographyWeight: string;
}

export interface MotionData {
  enabled: boolean;
  speed: number; // 0.1 to 3
  revealIntensity: number; // 0 to 1
  blurIntensity: number; // 0 to 1
  parallaxIntensity: number; // 0 to 1
  hoverMovement: number; // 0 to 1
  pageTransition: string;
}

export interface CMSData {
  hero: HeroData;
  profile: ProfileData;
  skills: SkillItem[];
  portfolio: PortfolioItem[];
  hasilKarya: HasilKaryaItem[];
  prosesKerja: ProsesKerjaItem[];
  kontak: KontakData;
  sosialMedia: SosialMediaItem[];
  mediaLibrary: MediaItem[];
  background: BackgroundData;
  appearance: AppearanceData;
  motion: MotionData;
}
