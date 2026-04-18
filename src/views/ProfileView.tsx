import { User as UserIcon, LogOut, Settings, Crown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../cn';

export const ProfileView = ({ user, setView, setUser }: any) => (
  <div className="pt-4 space-y-6">
    <h1 className="text-2xl font-black italic text-gray-900 px-2 uppercase tracking-tighter">Ownership</h1>
    <Card className="p-8 space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-sm">
          <UserIcon size={36} className="text-gray-900" />
        </div>
        <div>
          <h3 className="text-xl font-black italic text-gray-900 tracking-tighter uppercase">
            {user.email.split('@')[0]}
          </h3>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
            Status: {user.role}
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-gray-50">
        <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Subscription</span>
          <span className={cn(
            "text-[9px] font-black uppercase px-3 py-1 rounded-full",
            user.subscription === 'ACTIVE' ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600 animate-pulse"
          )}>
            {user.subscription === 'ACTIVE' ? 'Active' : 'Pending'}
          </span>
        </div>

        {user.role === 'ADMIN' && (
          <Button fullWidth variant="primary" onClick={() => setView('admin')}>
            <Settings size={18}/> Админ-панель
          </Button>
        )}

        {user.subscription !== 'ACTIVE' && user.role !== 'ADMIN' && (
          <Button fullWidth variant="outline" onClick={() => setView('subscription')}>
            <Crown size={18}/> Активировать VIP
          </Button>
        )}

        <Button fullWidth variant="danger" onClick={() => { setUser(null); setView('catalog'); }}>
          <LogOut size={18}/> Выйти
        </Button>
      </div>
    </Card>
  </div>
);
