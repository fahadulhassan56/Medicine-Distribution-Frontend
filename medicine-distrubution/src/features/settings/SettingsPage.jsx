import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';

const SettingsPage = () => {
  const [settings, setSettings] = useState({ store_name: '' });
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/settings');
      setSettings(res.data || { store_name: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((s) => ({ ...s, [name]: value }));
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/settings', settings);
      alert('Settings updated');
      await loadSettings();
    } catch (err) {
      console.error(err);
      alert('Failed to update settings');
    }
  };

  return (
    <main className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-600">
          Configure store name and other master settings (admin only).
        </p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <form className="space-y-3" onSubmit={saveSettings}>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Store Name
            </label>
            <input
              name="store_name"
              value={settings.store_name}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              {loading ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default SettingsPage;
