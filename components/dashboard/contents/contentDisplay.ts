import { FileText, FileImage, FileSpreadsheet } from 'lucide-react';
import { Content } from '@/lib/api';

export const formatContentBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null) return 'Unknown size';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exp);
  return `${value.toFixed(exp === 0 ? 0 : 1)} ${units[exp]}`;
};

export const getContentTypeMeta = (content: Content) => {
  const raw = content.type?.toLowerCase() ?? 'file';
  if (raw.includes('pdf')) return { label: 'PDF', Icon: FileText, badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'bg-rose-50 text-rose-600' };
  if (raw.includes('image') || raw.includes('jpg') || raw.includes('png')) return { label: 'Image', Icon: FileImage, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'bg-emerald-50 text-emerald-600' };
  if (raw.includes('doc')) return { label: 'DOC', Icon: FileText, badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'bg-amber-50 text-amber-600' };
  if (raw.includes('excel') || raw.includes('xls')) return { label: 'Excel', Icon: FileSpreadsheet, badge: 'bg-green-50 text-green-700 border-green-200', icon: 'bg-green-50 text-green-600' };
  return { label: content.type || 'File', Icon: FileText, badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'bg-blue-50 text-blue-600' };
};
