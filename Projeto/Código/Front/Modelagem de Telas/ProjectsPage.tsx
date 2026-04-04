import { Header } from '../components/Header';
import { Calendar, DollarSign, TrendingUp, Plus } from 'lucide-react';

const projects = [
  {
    id: 1,
    name: 'Projeto FAPESP 2024-001',
    description: 'Estudo sobre materiais avançados',
    budget: 'R$ 500.000',
    spent: 'R$ 342.500',
    percentage: 68.5,
    status: 'Em andamento',
    period: 'Jan/2024 - Dez/2026',
    coordinator: 'Prof. Dr. João Silva',
  },
  {
    id: 2,
    name: 'Projeto CNPq 2023-045',
    description: 'Pesquisa em biotecnologia',
    budget: 'R$ 350.000',
    spent: 'R$ 280.000',
    percentage: 80,
    status: 'Em andamento',
    period: 'Mar/2023 - Fev/2025',
    coordinator: 'Profa. Dra. Maria Santos',
  },
  {
    id: 3,
    name: 'Projeto CAPES 2025-012',
    description: 'Desenvolvimento de novos fármacos',
    budget: 'R$ 750.000',
    spent: 'R$ 187.500',
    percentage: 25,
    status: 'Iniciando',
    period: 'Jan/2025 - Dez/2027',
    coordinator: 'Prof. Dr. Carlos Oliveira',
  },
  {
    id: 4,
    name: 'Projeto FINEP 2022-089',
    description: 'Inovação em energias renováveis',
    budget: 'R$ 650.000',
    spent: 'R$ 630.000',
    percentage: 96.9,
    status: 'Finalizando',
    period: 'Jun/2022 - Mai/2026',
    coordinator: 'Profa. Dra. Ana Costa',
  },
];

export function ProjectsPage() {
  return (
    <div>
      <Header title="Projetos" subtitle="Gerenciamento de projetos de pesquisa" />
      
      <div className="p-8">
        {/* Actions */}
        <div className="mb-6 flex justify-end">
          <button className="flex items-center gap-2 bg-[#1A4DC2] hover:bg-[#163d9a] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-[#1A4DC2]/30 hover:shadow-xl hover:scale-[1.02]">
            <Plus className="w-5 h-5" />
            Novo Projeto
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-[#DDE3EC] p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              {/* Header */}
              <div className="mb-4 pb-4 border-b border-[#DDE3EC]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-[#0E1117] group-hover:text-[#1A4DC2] transition-colors">
                    {project.name}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    project.status === 'Em andamento' 
                      ? 'bg-[#097D78]/10 text-[#097D78]' 
                      : project.status === 'Iniciando'
                      ? 'bg-[#1A4DC2]/10 text-[#1A4DC2]'
                      : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1A4DC2]/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-[#1A4DC2]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-mono uppercase">Orçamento</p>
                    <p className="text-sm font-semibold text-[#0E1117]">{project.budget}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-mono uppercase">Gasto</p>
                    <p className="text-sm font-semibold text-[#0E1117]">{project.spent}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#097D78]/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#097D78]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-mono uppercase mb-1">Execução</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          project.percentage > 80 ? 'bg-[#F59E0B]' : 'bg-[#097D78]'
                        }`}
                        style={{ width: `${project.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#0E1117]">{project.percentage}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-mono uppercase">Período</p>
                    <p className="text-sm font-semibold text-[#0E1117]">{project.period}</p>
                  </div>
                </div>
              </div>

              {/* Coordinator */}
              <div className="pt-4 border-t border-[#DDE3EC]">
                <p className="text-xs text-gray-500 font-mono uppercase mb-1">Coordenador</p>
                <p className="text-sm text-[#0E1117]">{project.coordinator}</p>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-[#DDE3EC] flex gap-2">
                <button className="flex-1 px-4 py-2 border border-[#DDE3EC] rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Ver Detalhes
                </button>
                <button className="flex-1 px-4 py-2 bg-[#1A4DC2] hover:bg-[#163d9a] text-white rounded-lg text-sm transition-colors">
                  Lançamentos
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
