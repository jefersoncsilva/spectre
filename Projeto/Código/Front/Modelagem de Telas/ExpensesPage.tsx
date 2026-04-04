import { useState } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { Plus, Filter, Download } from 'lucide-react';

const expenses = [
  { id: 1, date: '15/03/2026', category: 'Materiais', description: 'Reagentes químicos para pesquisa', value: 'R$ 8.500,00', status: 'Aprovado', type: 'Custeio' },
  { id: 2, date: '14/03/2026', category: 'Serviços', description: 'Consultoria técnica especializada', value: 'R$ 12.000,00', status: 'Pendente', type: 'Custeio' },
  { id: 3, date: '13/03/2026', category: 'Equipamentos', description: 'Microscópio eletrônico', value: 'R$ 45.000,00', status: 'Aprovado', type: 'Capital' },
  { id: 4, date: '12/03/2026', category: 'Diárias', description: 'Viagem São Paulo - 3 dias', value: 'R$ 2.400,00', status: 'Aprovado', type: 'Custeio' },
  { id: 5, date: '10/03/2026', category: 'Passagens', description: 'Aéreo SP-RJ ida e volta', value: 'R$ 850,00', status: 'Aprovado', type: 'Custeio' },
  { id: 6, date: '09/03/2026', category: 'Materiais', description: 'Material de laboratório', value: 'R$ 3.200,00', status: 'Rejeitado', type: 'Custeio' },
  { id: 7, date: '08/03/2026', category: 'Serviços', description: 'Análise de amostras', value: 'R$ 5.500,00', status: 'Aprovado', type: 'Custeio' },
  { id: 8, date: '07/03/2026', category: 'Equipamentos', description: 'Computador análise de dados', value: 'R$ 8.900,00', status: 'Pendente', type: 'Capital' },
];

export function ExpensesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  return (
    <div>
      <Header title="Despesas" subtitle="Gerenciamento de despesas e lançamentos" />
      
      <div className="p-8">
        {/* Filters and Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-[#DDE3EC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4DC2] bg-white"
              >
                <option value="all">Todas Categorias</option>
                <option value="materiais">Materiais</option>
                <option value="servicos">Serviços</option>
                <option value="equipamentos">Equipamentos</option>
                <option value="diarias">Diárias</option>
                <option value="passagens">Passagens</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-[#DDE3EC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4DC2] bg-white"
            >
              <option value="all">Todos Status</option>
              <option value="aprovado">Aprovado</option>
              <option value="pendente">Pendente</option>
              <option value="rejeitado">Rejeitado</option>
            </select>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-[#DDE3EC] rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>

          {/* New Expense Button */}
          <Link
            to="/app/expenses/new"
            className="flex items-center gap-2 bg-[#1A4DC2] hover:bg-[#163d9a] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-[#1A4DC2]/30 hover:shadow-xl hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Nova Despesa
          </Link>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl border border-[#DDE3EC] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F9FC]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EC]">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      {expense.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-mono rounded ${
                        expense.type === 'Capital' 
                          ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' 
                          : 'bg-[#1A4DC2]/10 text-[#1A4DC2]'
                      }`}>
                        {expense.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#0E1117]">
                      {expense.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        expense.status === 'Aprovado' 
                          ? 'bg-[#097D78]/10 text-[#097D78]' 
                          : expense.status === 'Pendente'
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                          : 'bg-[#C0392B]/10 text-[#C0392B]'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-[#1A4DC2] hover:text-[#163d9a] font-medium">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-[#DDE3EC] flex items-center justify-between">
            <p className="text-sm text-gray-600 font-mono">
              Mostrando <span className="font-semibold">1-8</span> de <span className="font-semibold">8</span> resultados
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-[#DDE3EC] rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
                Anterior
              </button>
              <button className="px-3 py-1 bg-[#1A4DC2] text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-[#DDE3EC] rounded text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
                Próximo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
