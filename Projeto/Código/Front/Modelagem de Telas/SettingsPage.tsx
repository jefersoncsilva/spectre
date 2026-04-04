import { useState } from 'react';
import { Header } from '../components/Header';
import { Users, FolderTree, Shield, Plus, Edit, Trash2 } from 'lucide-react';

const users = [
  { id: 1, name: 'João Silva', email: 'joao.silva@univ.br', role: 'Coordenador', status: 'Ativo' },
  { id: 2, name: 'Maria Santos', email: 'maria.santos@univ.br', role: 'Pesquisador', status: 'Ativo' },
  { id: 3, name: 'Carlos Oliveira', email: 'carlos.oliveira@univ.br', role: 'Administrador', status: 'Ativo' },
  { id: 4, name: 'Ana Costa', email: 'ana.costa@univ.br', role: 'Pesquisador', status: 'Inativo' },
];

const categories = [
  { id: 1, name: 'Materiais', type: 'Custeio', count: 45 },
  { id: 2, name: 'Serviços', type: 'Custeio', count: 32 },
  { id: 3, name: 'Equipamentos', type: 'Capital', count: 18 },
  { id: 4, name: 'Diárias', type: 'Custeio', count: 28 },
  { id: 5, name: 'Passagens', type: 'Custeio', count: 15 },
];

const permissions = [
  { id: 1, role: 'Administrador', users: 2, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
  { id: 2, role: 'Coordenador', users: 5, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
  { id: 3, role: 'Pesquisador', users: 12, canCreate: true, canEdit: false, canDelete: false, canApprove: false },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'permissions'>('users');

  return (
    <div>
      <Header title="Configurações" subtitle="Gerenciamento do sistema" />
      
      <div className="p-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-[#DDE3EC]">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-2 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-[#1A4DC2] text-[#1A4DC2]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Usuários</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-4 px-2 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-[#1A4DC2] text-[#1A4DC2]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FolderTree className="w-5 h-5" />
              <span className="font-medium">Categorias</span>
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`pb-4 px-2 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'permissions'
                  ? 'border-[#1A4DC2] text-[#1A4DC2]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">Permissões</span>
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6 flex justify-end">
              <button className="flex items-center gap-2 bg-[#1A4DC2] hover:bg-[#163d9a] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-[#1A4DC2]/30">
                <Plus className="w-5 h-5" />
                Novo Usuário
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#DDE3EC] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#F7F9FC]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Função</th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3EC]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#F7F9FC] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#1A4DC2]/10 text-[#1A4DC2]">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          user.status === 'Ativo' 
                            ? 'bg-[#097D78]/10 text-[#097D78]' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-[#C0392B]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="mb-6 flex justify-end">
              <button className="flex items-center gap-2 bg-[#1A4DC2] hover:bg-[#163d9a] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-[#1A4DC2]/30">
                <Plus className="w-5 h-5" />
                Nova Categoria
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-xl border border-[#DDE3EC] p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#0E1117] mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{category.type}</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-mono rounded-full bg-[#F7F9FC] text-gray-600">
                      {category.count} lançamentos
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-[#DDE3EC]">
                    <button className="flex-1 px-4 py-2 border border-[#DDE3EC] rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button className="flex-1 px-4 py-2 border border-[#C0392B] text-[#C0392B] rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="bg-white rounded-xl border border-[#DDE3EC] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F7F9FC]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Função</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Usuários</th>
                  <th className="px-6 py-4 text-center text-xs font-mono text-gray-600 uppercase tracking-wider">Criar</th>
                  <th className="px-6 py-4 text-center text-xs font-mono text-gray-600 uppercase tracking-wider">Editar</th>
                  <th className="px-6 py-4 text-center text-xs font-mono text-gray-600 uppercase tracking-wider">Excluir</th>
                  <th className="px-6 py-4 text-center text-xs font-mono text-gray-600 uppercase tracking-wider">Aprovar</th>
                  <th className="px-6 py-4 text-left text-xs font-mono text-gray-600 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EC]">
                {permissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {permission.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {permission.users} usuários
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={permission.canCreate}
                        readOnly
                        className="w-4 h-4 text-[#1A4DC2] border-[#DDE3EC] rounded focus:ring-[#1A4DC2]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={permission.canEdit}
                        readOnly
                        className="w-4 h-4 text-[#1A4DC2] border-[#DDE3EC] rounded focus:ring-[#1A4DC2]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={permission.canDelete}
                        readOnly
                        className="w-4 h-4 text-[#1A4DC2] border-[#DDE3EC] rounded focus:ring-[#1A4DC2]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={permission.canApprove}
                        readOnly
                        className="w-4 h-4 text-[#1A4DC2] border-[#DDE3EC] rounded focus:ring-[#1A4DC2]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-[#1A4DC2] hover:text-[#163d9a] font-medium text-sm">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
