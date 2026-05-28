import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  if (!date) return '';
  return format(new Date(date), pattern);
};

export const truncate = (text, length = 120) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length).trim() + '…' : text;
};

export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export const getAvatarUrl = (user) => {
  if (!user) return '';
  if (user.avatar) return user.avatar;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.username)}&backgroundColor=a855f7&textColor=ffffff`;
};

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};

export const readingTimeText = (minutes) => {
  return `${minutes} min read`;
};

export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return String(num);
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const stripMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
};
