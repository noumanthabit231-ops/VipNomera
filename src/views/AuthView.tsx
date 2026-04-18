import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const AuthView = ({ authData, setAuthData, handleAuth }: any) => (
  <div className="pt-20 space-y-10 max-w-sm mx-auto text-center">
    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Access</h1>
    <Card className="p-8 space-y-5">
      <div className="space-y-4">
        <input 
          placeholder="Email" 
          className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 outline-none focus:ring-2 ring-[#D4AF37]/20 transition-all" 
          value={authData.email} 
          onChange={e => setAuthData({...authData, email: e.target.value})} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 outline-none focus:ring-2 ring-[#D4AF37]/20 transition-all" 
          value={authData.password} 
          onChange={e => setAuthData({...authData, password: e.target.value})} 
        />
        <Button fullWidth size="lg" onClick={handleAuth}>
          {authData.isLogin ? 'Войти' : 'Создать аккаунт'}
        </Button>
        <button 
          onClick={() => setAuthData({...authData, isLogin: !authData.isLogin})} 
          className="w-full text-center text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-gray-900 transition-colors py-2"
        >
          {authData.isLogin ? "Нет приглашения? Регистрация" : "Уже есть аккаунт? Вход"}
        </button>
      </div>
    </Card>
  </div>
);
