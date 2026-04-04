import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Ano todo'];

const recentTransactions = [
  { id: '#047', desc: 'Passagem aérea — Congresso SBRC', category: 'Transporte', date: '14/03/2026', value: 'R$ 1.240,00', status: 'Realizado', statusColor: 'green' },
  { id: '#046', desc: 'Notebook Dell Inspiron 15 — Lab.', category: 'Permanente', date: '12/03/2026', value: 'R$ 4.890,00', status: 'Realizado', statusColor: 'green' },
  { id: '#045', desc: 'Revisão de texto — Artigo WSCAD', category: 'Serviços', date: '10/03/2026', value: 'R$ 650,00', status: 'Orçado', statusColor: 'gold' },
  { id: '#044', desc: 'Diárias — Porto Alegre (3 dias)', category: 'Diárias', date: '08/03/2026', value: 'R$ 870,00', status: 'Realizado', statusColor: 'green' },
  { id: '#043', desc: 'Resmas de papel A4 e toner', category: 'Mat. Consumo', date: '05/03/2026', value: 'R$ 318,00', status: 'Realizado', statusColor: 'green' },
];

const donutData = [
  { name: 'Serviços', percent: 32, color: '#1A4DC2' },
  { name: 'Transporte', percent: 24, color: '#097D78' },
  { name: 'Mat. Consumo', percent: 20, color: '#B7891A' },
  { name: 'Diárias', percent: 14, color: '#4A5568' },
  { name: 'Permanente', percent: 10, color: '#8896A7' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('Mar');

  return (
    <div>
      <Header 
        title="Dashboard" 
        subtitle="Visão geral do projeto"
        onExport={() => console.log('Export')}
        onNew={() => navigate('/app/new')}
      />
      
      <div className="px-7 py-6 flex-1">
        {/* Period Filter Bar */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[12px] text-[var(--muted)] font-['DM_Mono']">Período:</span>
          {months.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedPeriod(month)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium cursor-pointer border-[1.5px] transition-all duration-150 ${
                selectedPeriod === month
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                  : 'bg-white text-[var(--slate)] border-[var(--line)] hover:border-[var(--slate)]'
              }`}
            >
              {month}
            </button>
          ))}
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Card 1 - Highlighted */}
          <div className="bg-[var(--ink)] border border-[var(--ink)] rounded-xl p-5">
            <div className="text-[11px] font-medium tracking-wide uppercase text-white/35 mb-2.5">
              Total Orçado
            </div>
            <div className="font-['DM_Mono'] text-[22px] font-medium text-white mb-1 tracking-tight">
              R$ 48.500
            </div>
            <div className="text-[11.5px] flex items-center gap-1 text-white/40">
              Edital Fapergs 2026
            </div>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-white/30">Executado</span>
                <span className="font-['DM_Mono'] text-[11px] text-white/50">62%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
                <div className="h-full bg-white/50 rounded-sm" style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5">
            <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--muted)] mb-2.5">
              Total Realizado
            </div>
            <div className="font-['DM_Mono'] text-[22px] font-medium text-[var(--ink)] mb-1 tracking-tight">
              R$ 29.870
            </div>
            <div className="text-[11.5px] flex items-center gap-1 text-[var(--teal)]">
              ↑ R$ 4.200 este mês
            </div>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-[var(--muted)]">Do orçado</span>
                <span className="font-['DM_Mono'] text-[11px] text-[var(--slate)]">62%</span>
              </div>
              <div className="h-1 bg-[var(--line)] rounded-sm overflow-hidden">
                <div className="h-full bg-[var(--blue)] rounded-sm" style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5">
            <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--muted)] mb-2.5">
              Saldo Disponível
            </div>
            <div className="font-['DM_Mono'] text-[22px] font-medium text-[var(--ink)] mb-1 tracking-tight">
              R$ 18.630
            </div>
            <div className="text-[11.5px] flex items-center gap-1 text-[var(--muted)]">
              38% do orçamento
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-[var(--muted)]">Custeio</span>
                  <span className="font-['DM_Mono'] text-[11px] text-[var(--slate)]">71%</span>
                </div>
                <div className="h-1 bg-[var(--line)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[var(--teal)] rounded-sm" style={{ width: '71%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-[var(--muted)]">Capital</span>
                  <span className="font-['DM_Mono'] text-[11px] text-[var(--slate)]">44%</span>
                </div>
                <div className="h-1 bg-[var(--line)] rounded-sm overflow-hidden">
                  <div className="h-full bg-[var(--gold)] rounded-sm" style={{ width: '44%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5">
            <div className="text-[11px] font-medium tracking-wide uppercase text-[var(--muted)] mb-2.5">
              Lançamentos
            </div>
            <div className="font-['DM_Mono'] text-[22px] font-medium text-[var(--ink)] mb-1 tracking-tight">
              47
            </div>
            <div className="text-[11.5px] flex items-center gap-1 text-[var(--muted)]">
              28 realizados · 19 orçados
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-[var(--muted)]">Realizados</span>
                <span className="font-['DM_Mono'] text-[11px] text-[var(--slate)]">60%</span>
              </div>
              <div className="h-1 bg-[var(--line)] rounded-sm overflow-hidden">
                <div className="h-full bg-[var(--green)] rounded-sm" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-[1.6fr_1fr] gap-4 mb-6">
          {/* Bar Chart */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="text-[13px] font-medium text-[var(--ink)]">
                Orçado × Realizado por categoria
              </div>
              <div className="flex gap-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                  <div className="w-2 h-2 rounded-sm bg-[var(--blue)]"></div>
                  Orçado
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                  <div className="w-2 h-2 rounded-sm bg-[var(--teal)]"></div>
                  Realizado
                </div>
              </div>
            </div>
            {/* SVG Bar Chart */}
            <svg className="w-full h-40" viewBox="0 0 520 160" xmlns="http://www.w3.org/2000/svg">
              <line x1="40" y1="10" x2="40" y2="130" stroke="var(--line)" strokeWidth="1"/>
              <line x1="40" y1="130" x2="510" y2="130" stroke="var(--line)" strokeWidth="1"/>
              <line x1="40" y1="90" x2="510" y2="90" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="3,3"/>
              <line x1="40" y1="50" x2="510" y2="50" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="3,3"/>
              <text x="34" y="133" textAnchor="end" fontSize="9" fill="var(--muted)" fontFamily="DM Mono,monospace">0</text>
              <text x="34" y="93" textAnchor="end" fontSize="9" fill="var(--muted)" fontFamily="DM Mono,monospace">10k</text>
              <text x="34" y="53" textAnchor="end" fontSize="9" fill="var(--muted)" fontFamily="DM Mono,monospace">20k</text>
              
              {/* Diárias */}
              <rect x="55" y="60" width="22" height="70" rx="3" fill="var(--blue)" opacity="0.85"/>
              <rect x="80" y="75" width="22" height="55" rx="3" fill="var(--teal)" opacity="0.85"/>
              <text x="80" y="148" textAnchor="middle" fontSize="9" fill="var(--muted)">Diárias</text>
              
              {/* Transporte */}
              <rect x="145" y="50" width="22" height="80" rx="3" fill="var(--blue)" opacity="0.85"/>
              <rect x="170" y="68" width="22" height="62" rx="3" fill="var(--teal)" opacity="0.85"/>
              <text x="170" y="148" textAnchor="middle" fontSize="9" fill="var(--muted)">Transporte</text>
              
              {/* Mat.Consumo */}
              <rect x="240" y="70" width="22" height="60" rx="3" fill="var(--blue)" opacity="0.85"/>
              <rect x="265" y="85" width="22" height="45" rx="3" fill="var(--teal)" opacity="0.85"/>
              <text x="265" y="148" textAnchor="middle" fontSize="9" fill="var(--muted)">Mat.Consumo</text>
              
              {/* Serviços */}
              <rect x="335" y="40" width="22" height="90" rx="3" fill="var(--blue)" opacity="0.85"/>
              <rect x="360" y="58" width="22" height="72" rx="3" fill="var(--teal)" opacity="0.85"/>
              <text x="360" y="148" textAnchor="middle" fontSize="9" fill="var(--muted)">Serviços</text>
              
              {/* Mat.Permanente */}
              <rect x="425" y="65" width="22" height="65" rx="3" fill="var(--blue)" opacity="0.85"/>
              <rect x="450" y="92" width="22" height="38" rx="3" fill="var(--teal)" opacity="0.85"/>
              <text x="450" y="148" textAnchor="middle" fontSize="9" fill="var(--muted)">Permanente</text>
            </svg>
          </div>

          {/* Donut Chart */}
          <div className="bg-white border border-[var(--line)] rounded-xl p-5">
            <div className="text-[13px] font-medium text-[var(--ink)] mb-5">
              Distribuição por tipo
            </div>
            <div className="flex items-center gap-5">
              {/* SVG Donut */}
              <svg className="w-[120px] h-[120px] flex-shrink-0" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="44" fill="none" stroke="var(--line)" strokeWidth="16"/>
                <circle cx="60" cy="60" r="44" fill="none" stroke="#1A4DC2" strokeWidth="16"
                  strokeDasharray="88 189" strokeDashoffset="0" transform="rotate(-90 60 60)"/>
                <circle cx="60" cy="60" r="44" fill="none" stroke="#097D78" strokeWidth="16"
                  strokeDasharray="66 211" strokeDashoffset="-88" transform="rotate(-90 60 60)"/>
                <circle cx="60" cy="60" r="44" fill="none" stroke="#B7891A" strokeWidth="16"
                  strokeDasharray="55 222" strokeDashoffset="-154" transform="rotate(-90 60 60)"/>
                <circle cx="60" cy="60" r="44" fill="none" stroke="#4A5568" strokeWidth="16"
                  strokeDasharray="38 239" strokeDashoffset="-209" transform="rotate(-90 60 60)"/>
                <circle cx="60" cy="60" r="44" fill="none" stroke="#8896A7" strokeWidth="16"
                  strokeDasharray="28 249" strokeDashoffset="-247" transform="rotate(-90 60 60)"/>
                <text x="60" y="56" textAnchor="middle" fontSize="14" fontWeight="500" fill="var(--ink)" fontFamily="DM Mono,monospace">62%</text>
                <text x="60" y="68" textAnchor="middle" fontSize="8" fill="var(--muted)">executado</text>
              </svg>
              
              {/* Legend */}
              <div className="flex-1">
                {donutData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-1.5 border-b border-[var(--line)] last:border-b-0">
                    <div className="flex items-center gap-2 text-[12px] text-[var(--slate)]">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                      {item.name}
                    </div>
                    <div className="font-['DM_Mono'] text-[11px] text-[var(--ink)] font-medium">
                      {item.percent}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white border border-[var(--line)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
            <div className="text-[13px] font-medium text-[var(--ink)]">
              Lançamentos recentes
            </div>
            <button className="h-8 px-3.5 rounded-[7px] bg-transparent text-[var(--slate)] border-[1.5px] border-[var(--line)] text-[12px] font-medium hover:border-[var(--slate)] transition-all duration-150">
              Ver todos →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--line)]">
                  <th className="text-left px-5 py-2.5 text-[10.5px] font-semibold tracking-wide uppercase text-[var(--muted)]">#</th>
                  <th className="text-left px-5 py-2.5 text-[10.5px] font-semibold tracking-wide uppercase text-[var(--muted)]">Descrição</th>
                  <th className="text-left px-5 py-2.5 text-[10.5px] font-semibold tracking-wide uppercase text-[var(--muted)]">Categoria</th>
                  <th className="text-left px-5 py-2.5 text-[10.5px] font-semibold tracking-wide uppercase text-[var(--muted)]">Data</th>
                  <th className="text-left px-5 py-2.5 text-[10.5px] font-semibold tracking-wide uppercase text-[var(--muted)]">Valor</th>
                  <th className="text-left px-5 py-2.5 text-[10.5px] font-semibold tracking-wide uppercase text-[var(--muted)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[#FAFBFC] transition-colors">
                    <td className="px-5 py-3 text-[13px] font-['DM_Mono'] text-[var(--muted)]">{transaction.id}</td>
                    <td className="px-5 py-3 text-[13px] text-[var(--ink)] font-medium">{transaction.desc}</td>
                    <td className="px-5 py-3 text-[13px] text-[var(--slate)]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--blue-lt)] text-[var(--blue)] text-[10.5px] font-semibold tracking-wide">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[13px] font-['DM_Mono'] text-[var(--slate)]">{transaction.date}</td>
                    <td className="px-5 py-3 text-[13px] font-['DM_Mono'] text-[var(--slate)]">{transaction.value}</td>
                    <td className="px-5 py-3 text-[13px]">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold tracking-wide ${
                        transaction.statusColor === 'green' 
                          ? 'bg-[var(--green-lt)] text-[var(--green)]' 
                          : 'bg-[var(--gold-lt)] text-[var(--gold)]'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
