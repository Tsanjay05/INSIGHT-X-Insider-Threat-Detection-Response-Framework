
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { User, Bell, Shield, Lock } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary">Manage your preferences and system configurations.</p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 space-y-1">
          <button className="w-full flex items-center space-x-3  px-4 py-2 bg-primary-400/10 text-primary-400 rounded-md font-medium">
            <User className="h-5 w-5" />
            <span>General</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-text-secondary hover:bg-bg-elevated rounded-md font-medium transition-colors">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-text-secondary hover:bg-bg-elevated rounded-md font-medium transition-colors">
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-text-secondary hover:bg-bg-elevated rounded-md font-medium transition-colors">
            <Lock className="h-5 w-5" />
            <span>API Keys</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Profile Section */}
          <div className="bg-bg-secondary p-6 rounded-xl border border-border-default space-y-4">
            <h2 className="text-lg font-semibold text-text-primary border-b border-border-subtle pb-2">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Display Name</label>
                <Input defaultValue="Admin User" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Email Address</label>
                <Input defaultValue="admin@insightx.io" disabled />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-bg-secondary p-6 rounded-xl border border-border-default space-y-4">
            <h2 className="text-lg font-semibold text-text-primary border-b border-border-subtle pb-2">System Preferences</h2>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-text-primary">Dark Mode</p>
                <p className="text-sm text-text-secondary">Enforce dark theme across the application.</p>
              </div>
              <Toggle checked={true} onCheckedChange={() => { }} />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border-subtle">
              <div>
                <p className="font-medium text-text-primary">Compact View</p>
                <p className="text-sm text-text-secondary">Reduce whitespace in data tables.</p>
              </div>
              <Toggle checked={false} onCheckedChange={() => { }} />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border-subtle">
              <div>
                <p className="font-medium text-text-primary">Desktop Notifications</p>
                <p className="text-sm text-text-secondary">Receive alerts on your desktop.</p>
              </div>
              <Toggle checked={true} onCheckedChange={() => { }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
