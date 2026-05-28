import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { getAvatarUrl, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    coverImage: user?.coverImage || '',
    website: user?.website || '',
    social: {
      twitter: user?.social?.twitter || '',
      github: user?.social?.github || '',
      linkedin: user?.social?.linkedin || ''
    }
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSocialChange = (field, value) => setForm(prev => ({ ...prev, social: { ...prev.social, [field]: value } }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await usersAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 mb-8 gap-1">
        {['profile', 'password'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
              tab === t ? 'border-ink-600 text-ink-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleProfileSave}
          className="space-y-6"
        >
          {/* Avatar preview */}
          <div className="flex items-center gap-5">
            <img src={getAvatarUrl({ ...user, avatar: form.avatar })} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800" />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">Avatar URL</label>
              <input
                type="url"
                value={form.avatar}
                onChange={e => handleChange('avatar', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input value={form.name} onChange={e => handleChange('name', e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Website</label>
              <input type="url" value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://yoursite.com" className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="Tell readers about yourself" className="input resize-none" rows={3} maxLength={300} />
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/300</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Cover Image URL</label>
            <input type="url" value={form.coverImage} onChange={e => handleChange('coverImage', e.target.value)} placeholder="https://example.com/cover.jpg" className="input" />
          </div>

          <div>
            <h3 className="font-medium text-sm mb-3">Social Links</h3>
            <div className="space-y-3">
              {[
                { key: 'twitter', placeholder: 'Twitter username (without @)' },
                { key: 'github', placeholder: 'GitHub username' },
                { key: 'linkedin', placeholder: 'LinkedIn profile URL' }
              ].map(({ key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1 capitalize">{key}</label>
                  <input
                    value={form.social[key]}
                    onChange={e => handleSocialChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="input"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </motion.form>
      )}

      {tab === 'password' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handlePasswordChange}
          className="space-y-5 max-w-md"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5">Current Password</label>
            <input type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New Password</label>
            <input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} className="input" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
            <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} className="input" required />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Updating...' : 'Update password'}
          </button>
        </motion.form>
      )}
    </div>
  );
};

export default SettingsPage;
