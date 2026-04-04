import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validation
    const newErrors = {
      username: !formData.username.trim(),
      password: !formData.password.trim(),
    };
    setErrors(newErrors);
    
    if (newErrors.username || newErrors.password) {
      return;
    }

    // Loading state
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (formData.username === 'jeferson' && formData.password === 'spectre@2026') {
        setSuccess(true);
        setTimeout(() => {
          navigate('/app');
        }, 1400);
      } else {
        setError('Credenciais inválidas. Verifique seu login e senha.');
      }
    }, 1100);
  };

  return (
    <div className="min-h-screen grid grid-cols-2 bg-[var(--bg)]">
      {/* Left Panel - Branding */}
      <div className="bg-[var(--ink)] px-16 py-14 flex flex-col justify-between relative overflow-hidden">
        {/* Dot pattern background */}
        <div 
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23ffffff' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px',
          }}
        />
        
        <div className="relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-3.5 mb-16">
            <div className="w-[38px] h-[38px] border-2 border-white/15 rounded-lg flex items-center justify-center">
              <span className="font-['DM_Mono'] text-[15px] font-medium text-white/90">S</span>
            </div>
            <div className="font-['DM_Mono'] text-[13px] font-medium tracking-[0.25em] text-white/45 uppercase">
              Spectre
            </div>
          </div>

          {/* Tagline */}
          <h1 className="font-['Playfair_Display'] text-[38px] font-bold leading-[1.2] text-white mb-6 tracking-tight">
            Controle<br />
            financeiro<br />
            <em className="font-italic text-white/40">sem atrito.</em>
          </h1>
          
          <p className="text-[14px] leading-[1.7] text-white/38 font-light max-w-[360px]">
            Gerencie custeio e capital de projetos de pesquisa com rastreabilidade completa e auditoria automática.
          </p>
        </div>

        {/* Metrics */}
        <div>
          <div className="grid grid-cols-2 gap-[1px] bg-white/6 rounded-xl overflow-hidden">
            <div className="bg-white/[0.02] px-6 py-5">
              <div className="font-['DM_Mono'] text-[22px] text-white/75 mb-1 tracking-tight">9</div>
              <div className="text-[10px] text-white/25 tracking-wider uppercase">Tabelas</div>
            </div>
            <div className="bg-white/[0.02] px-6 py-5">
              <div className="font-['DM_Mono'] text-[22px] text-white/75 mb-1 tracking-tight">15</div>
              <div className="text-[10px] text-white/25 tracking-wider uppercase">Triggers</div>
            </div>
            <div className="bg-white/[0.02] px-6 py-5">
              <div className="font-['DM_Mono'] text-[22px] text-white/75 mb-1 tracking-tight">JWT</div>
              <div className="text-[10px] text-white/25 tracking-wider uppercase">Autenticação</div>
            </div>
            <div className="bg-white/[0.02] px-6 py-5">
              <div className="font-['DM_Mono'] text-[22px] text-white/75 mb-1 tracking-tight">REST</div>
              <div className="text-[10px] text-white/25 tracking-wider uppercase">API</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative font-['DM_Mono'] text-[11px] text-white/18 tracking-widest">
          UNISC · PI MÓDULO III A · 2026
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="bg-white px-16 py-14 flex items-center justify-center relative">
        <div className="max-w-md w-full">
          {/* Form Header */}
          <div className="mb-10">
            <div className="font-['DM_Mono'] text-[22px] font-medium tracking-[0.27em] text-[var(--ink)] mb-5">
              SPECTRE
            </div>
            <div className="font-['DM_Mono'] text-[11px] tracking-[0.125em] uppercase text-[var(--blue)] mb-2.5">
              Acesso ao sistema
            </div>
            <h2 className="text-[26px] font-medium text-[var(--ink)] tracking-tight leading-[1.2]">
              Bem-vindo de volta<br />
              <span className="text-[var(--muted)] font-light">informe suas credenciais</span>
            </h2>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-[1px] bg-[var(--line)]"></div>
            <div className="font-['DM_Mono'] text-[10px] text-[var(--muted)] tracking-widest">
              identificação
            </div>
            <div className="flex-1 h-[1px] bg-[var(--line)]"></div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className={`mb-5 ${errors.username ? 'has-error' : ''}`}>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="username" className="text-[12px] font-medium tracking-[0.019rem] text-[var(--slate)]">
                  Login
                </label>
              </div>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    setErrors({ ...errors, username: false });
                  }}
                  placeholder="Seu nome de login"
                  autoComplete="username"
                  autoFocus
                  className={`w-full h-[46px] border-[1.5px] ${errors.username ? 'border-[var(--red)]' : 'border-[var(--line)]'} rounded-lg px-3.5 text-[14px] text-[var(--ink)] bg-white outline-none transition-all duration-150 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(26,77,194,0.08)] placeholder:text-[#BCC5D0]`}
                />
              </div>
              {errors.username && (
                <div className="text-[11.5px] text-[var(--red)] mt-1.5 pl-0.5">
                  Campo obrigatório.
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className={`mb-5 ${errors.password ? 'has-error' : ''}`}>
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="password" className="text-[12px] font-medium tracking-[0.019rem] text-[var(--slate)]">
                  Senha
                </label>
                <button 
                  type="button"
                  className="text-[11px] text-[var(--blue)] opacity-70 hover:opacity-100 transition-opacity duration-200"
                >
                  Esqueceu?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors({ ...errors, password: false });
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full h-[46px] border-[1.5px] ${errors.password ? 'border-[var(--red)]' : 'border-[var(--line)]'} rounded-lg px-3.5 pr-11 text-[14px] text-[var(--ink)] bg-white outline-none transition-all duration-150 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(26,77,194,0.08)] placeholder:text-[#BCC5D0]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#BCC5D0] hover:text-[var(--slate)] transition-colors duration-200 flex items-center cursor-pointer bg-none border-none p-0"
                  title="Mostrar/ocultar senha"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="text-[11.5px] text-[var(--red)] mt-1.5 pl-0.5">
                  Campo obrigatório.
                </div>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 mb-7 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                className="w-[15px] h-[15px] cursor-pointer accent-[var(--blue)]"
              />
              <span className="text-[12.5px] text-[var(--slate)]">Manter conectado</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[46px] bg-[var(--ink)] hover:bg-[var(--ink2)] text-white border-none rounded-lg font-medium text-[14px] tracking-[0.019rem] cursor-pointer flex items-center justify-center gap-2 transition-all duration-150 relative overflow-hidden ${loading ? 'pointer-events-none' : ''} active:scale-[0.99]`}
            >
              <span className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                Entrar no sistema
              </span>
              <ArrowRight 
                className={`w-4 h-4 ${loading ? 'opacity-0' : 'opacity-100'} transition-all duration-200 group-hover:translate-x-1`}
              />
              {loading && (
                <div className="absolute w-[18px] h-[18px] border-2 border-white/20 border-t-white rounded-full animate-spin" />
              )}
            </button>

            {/* Alerts */}
            {error && (
              <div className="mt-4 px-3.5 py-3 rounded-[7px] text-[12.5px] leading-[1.5] bg-[#FDF0EF] border border-[#F5C6C0] text-[var(--red)]">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 px-3.5 py-3 rounded-[7px] text-[12.5px] leading-[1.5] bg-[#EEF7F6] border border-[#B0D9D6] text-[var(--teal)]">
                ✓ Autenticado — redirecionando para o dashboard…
              </div>
            )}
          </form>

          {/* Form Footer */}
          <div className="mt-10 pt-6 border-t border-[var(--line)] flex justify-between items-center">
            <div className="text-[11.5px] text-[var(--muted)]">
              Projeto Integrador · UNISC 2026
            </div>
            <div className="font-['DM_Mono'] text-[10px] bg-[var(--bg)] border border-[var(--line)] rounded px-2 py-1 text-[var(--muted)]">
              v1.0-dev
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}