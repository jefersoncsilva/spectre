import { useState } from 'react';
import { Header } from '../components/Header';
import { Download, Filter, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', custeio: 28000, capital: 12000 },
  { month: 'Fev', custeio: 32000, capital: 8500 },
  { month: 'Mar', custeio: 30000, capital: 13000 },
  { month: 'Abr', custeio: 35000, capital: 7000 },
  { month: 'Mai', custeio: 38000, capital: 10500 },
  { month: 'Jun', custeio: 33000, capital: 12000 },
];

const categoryBreakdown = [
  { category: 'Materiais', jan: 8000, fev: 9500, mar: 8800, abr: 10200, mai: 11000, jun: 9800 },
  { category: 'Serviços', jan: 12000, fev: 13500, mar: 12500, abr: 14000, mai: 15000, jun: 13200 },
  { category: 'Equipamentos', jan: 10000, fev: 7000, mar: 11000, abr: 6000, mai: 8500, jun: 10000 },
  { category: 'Diárias', jan: 5000, fev: 6000, mar: 6200, abr: 7000, mai: 7500, jun: 6500 },
  { category: 'Passagens', jan: 3000, fev: 3500, mar: 3500, abr: 4000, mai: 4500, jun: 4000 },
];

export function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('semester');
  const [selectedProject, setSelectedProject] = useState('all');

  return (
    <div>
      <Header title="Relatórios" subtitle="Análises e exportação de dados" />
      
      <div className="p-8 space-y-6">
        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-[#DDE3EC] p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-600 uppercase">Filtros</span>
            </div>
            
            <div className="flex-1 flex items-center gap-4">
              {/* Project Filter */}
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-2 border border-[#DDE3EC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4DC2] bg-white"
              >
                <option value="all">Todos os Projetos</option>
                <option value="1">Projeto FAPESP 2024-001</option>
                <option value="2">Projeto CNPq 2023-045</option>
                <option value="3">Projeto CAPES 2025-012</option>
              </select>

              {/* Period Filter */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-[#DDE3EC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4DC2] bg-white"
              >
                <option value="month">Último Mês</option>
                <option value="quarter">Último Trimestre</option>
                <option value="semester">Último Semestre</option>
                <option value="year">Último Ano</option>
              </select>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  className="px-4 py-2 border border-[#DDE3EC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4DC2]"
                />
                <span className="text-gray-400">até</span>
                <input
                  type="date"
                  className="px-4 py-2 border border-[#DDE3EC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4DC2]"
                />
              </div>
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 bg-[#1A4DC2] hover:bg-[#163d9a] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-[#1A4DC2]/30">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-6">
            <p className="text-xs text-gray-500 font-mono uppercase mb-2">Total Gasto</p>
            <p className="text-2xl font-bold text-[#0E1117]">R$ 240.000</p>
            <p className="text-xs text-[#097D78] mt-2">+15% vs período anterior</p>
          </div>
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-6">
            <p className="text-xs text-gray-500 font-mono uppercase mb-2">Custeio</p>
            <p className="text-2xl font-bold text-[#0E1117]">R$ 196.000</p>
            <p className="text-xs text-gray-600 mt-2">81.7% do total</p>
          </div>
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-6">
            <p className="text-xs text-gray-500 font-mono uppercase mb-2">Capital</p>
            <p className="text-2xl font-bold text-[#0E1117]">R$ 44.000</p>
            <p className="text-xs text-gray-600 mt-2">18.3% do total</p>
          </div>
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-6">
            <p className="text-xs text-gray-500 font-mono uppercase mb-2">Lançamentos</p>
            <p className="text-2xl font-bold text-[#0E1117]">142</p>
            <p className="text-xs text-gray-600 mt-2">no período</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#0E1117]">Evolução Mensal</h3>
              <p className="text-sm text-gray-500 font-mono mt-1">Custeio vs Capital</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDE3EC" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'DM Mono' }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'DM Mono' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #DDE3EC', 
                    borderRadius: '8px',
                    fontFamily: 'DM Sans'
                  }} 
                />
                <Legend wrapperStyle={{ fontFamily: 'DM Mono', fontSize: '12px' }} />
                <Line key="line-custeio" type="monotone" dataKey="custeio" stroke="#1A4DC2" strokeWidth={2} dot={{ r: 4 }} />
                <Line key="line-capital" type="monotone" dataKey="capital" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Comparison */}
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#0E1117]">Por Categoria</h3>
              <p className="text-sm text-gray-500 font-mono mt-1">Últimos 6 meses</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDE3EC" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'DM Mono' }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'DM Mono' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #DDE3EC', 
                    borderRadius: '8px',
                    fontFamily: 'DM Sans'
                  }} 
                />
                <Legend wrapperStyle={{ fontFamily: 'DM Mono', fontSize: '12px' }} />
                <Bar key="bar-custeio" dataKey="custeio" stackId="a" fill="#1A4DC2" radius={[0, 0, 0, 0]} />
                <Bar key="bar-capital" dataKey="capital" stackId="a" fill="#097D78" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="bg-white rounded-xl border border-[#DDE3EC] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DDE3EC]">
            <h3 className="text-lg font-semibold text-[#0E1117]">Detalhamento por Categoria</h3>
            <p className="text-sm text-gray-500 font-mono mt-1">Valores mensais em R$</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F9FC]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-right text-xs font-mono text-gray-600 uppercase tracking-wider">Jan</th>
                  <th className="px-6 py-3 text-right text-xs font-mono text-gray-600 uppercase tracking-wider">Fev</th>
                  <th className="px-6 py-3 text-right text-xs font-mono text-gray-600 uppercase tracking-wider">Mar</th>
                  <th className="px-6 py-3 text-right text-xs font-mono text-gray-600 uppercase tracking-wider">Abr</th>
                  <th className="px-6 py-3 text-right text-xs font-mono text-gray-600 uppercase tracking-wider">Mai</th>
                  <th className="px-6 py-3 text-right text-xs font-mono text-gray-600 uppercase tracking-wider">Jun</th>
                  <th className="px-6 py-3 text-right text-xs font-mono text-gray-600 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EC]">
                {categoryBreakdown.map((category) => {
                  const total = category.jan + category.fev + category.mar + category.abr + category.mai + category.jun;
                  return (
                    <tr key={category.category} className="hover:bg-[#F7F9FC] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-mono">
                        {category.jan.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-mono">
                        {category.fev.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-mono">
                        {category.mar.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-mono">
                        {category.abr.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-mono">
                        {category.mai.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-mono">
                        {category.jun.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-[#0E1117] font-mono">
                        {total.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}