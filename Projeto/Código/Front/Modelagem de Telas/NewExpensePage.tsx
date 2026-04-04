import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { Upload, X, ArrowLeft } from 'lucide-react';

export function NewExpensePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'custeio',
    category: '',
    value: '',
    date: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate back to expenses
    navigate('/app/expenses');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Header title="Nova Despesa" subtitle="Cadastrar novo lançamento" />
      
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate('/app/expenses')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1A4DC2] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para despesas
          </button>

          {/* Form */}
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-xs text-gray-600 mb-3">Tipo de Despesa</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'custeio' })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.type === 'custeio'
                        ? 'border-[#1A4DC2] bg-[#1A4DC2]/5'
                        : 'border-[#DDE3EC] hover:border-[#1A4DC2]/50'
                    }`}
                  >
                    <div className="font-semibold text-[#0E1117] mb-1">Custeio</div>
                    <div className="text-xs text-gray-500">Despesas operacionais e materiais de consumo</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'capital' })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.type === 'capital'
                        ? 'border-[#1A4DC2] bg-[#1A4DC2]/5'
                        : 'border-[#DDE3EC] hover:border-[#1A4DC2]/50'
                    }`}
                  >
                    <div className="font-semibold text-[#0E1117] mb-1">Capital</div>
                    <div className="text-xs text-gray-500">Equipamentos e bens permanentes</div>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-xs text-gray-600 mb-2">
                  Categoria
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-[#DDE3EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A4DC2] bg-white"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="materiais">Materiais</option>
                  <option value="servicos">Serviços</option>
                  <option value="equipamentos">Equipamentos</option>
                  <option value="diarias">Diárias</option>
                  <option value="passagens">Passagens</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              {/* Value and Date */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="value" className="block text-xs text-gray-600 mb-2">
                    Valor
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                    <input
                      id="value"
                      type="text"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="0,00"
                      className="w-full pl-12 pr-4 py-3 border border-[#DDE3EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A4DC2]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="date" className="block text-xs text-gray-600 mb-2">
                    Data
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-[#DDE3EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A4DC2]"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-xs text-gray-600 mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a despesa..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[#DDE3EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A4DC2] resize-none"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Anexos</label>
                <div className="border-2 border-dashed border-[#DDE3EC] rounded-lg p-8 text-center hover:border-[#1A4DC2] transition-colors">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">Arraste arquivos ou clique para fazer upload</p>
                  <p className="text-xs text-gray-400 mb-4">PDF, DOC, XLSX até 10MB</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F9FC] border border-[#DDE3EC] rounded-lg text-sm hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    Selecionar arquivos
                  </label>
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-lg">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-[#C0392B] hover:text-[#a02f22]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-[#DDE3EC]">
                <button
                  type="submit"
                  className="flex-1 bg-[#1A4DC2] hover:bg-[#163d9a] text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-[#1A4DC2]/30 hover:shadow-xl"
                >
                  Salvar Despesa
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/app/expenses')}
                  className="px-6 py-3 border border-[#DDE3EC] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
