'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUploads } from '@/components/uploads/uploads-context'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ExcelUploader from '@/components/excel/excel-uploader'
import ClientSelector from './client-selector'

interface AdminDashboardProps {
  user: { id: string; email: string; name: string; type: 'admin' | 'client' }
  onLogout: () => void
}

interface FileData {
  id: string
  name: string
  uploadDate: string
  month: string
  status: 'Processado' | 'Pendente' | 'Erro'
  recordsCount: number
  size: string
  transformedFormat?: any[]
}

interface ClientData {
  id: string
  name: string
  email: string
  uploadedFiles: FileData[]
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'download' | 'transform'>('download')
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const uploadsCtx = useUploads()

  // derive clients from uploads store
  const clientsFromUploads = uploadsCtx.uploads.reduce((acc: { [k: string]: ClientData }, u) => {
    const key = u.ownerId || u.ownerEmail || u.ownerName
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: u.ownerName || u.ownerEmail || 'Cliente',
        email: u.ownerEmail || '',
        uploadedFiles: [],
      }
    }
    acc[key].uploadedFiles.push({
      id: u.id,
      name: u.name,
      uploadDate: u.uploadDate,
      month: '',
      status: 'Processado',
      recordsCount: u.records,
      size: '',
      transformedFormat: u.processedData,
    })
    return acc
  }, {})

  const clients: ClientData[] = Object.values(clientsFromUploads)

  // include registered clients without uploads
  uploadsCtx.clients.forEach(c => {
    if (!clients.find(cl => cl.id === c.id)) {
      clients.push({ id: c.id, name: c.name, email: c.email || '', uploadedFiles: [] })
    }
  })

  const handleDownloadFile = (clientName: string, fileName: string) => {
    console.log(`[v0] Iniciando download do arquivo: ${fileName} do cliente: ${clientName}`)
    // Simulação de download
    // try to find transformed data and download as xlsx
    try {
      const client = clients.find(c => c.name === clientName)
      if (!client) {
        throw new Error('Cliente não encontrado')
      }
      const file = client.uploadedFiles.find(f => f.name === fileName)
      if (!file) throw new Error('Arquivo não encontrado')

      if (file.transformedFormat && file.transformedFormat.length > 0) {
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(file.transformedFormat)
        XLSX.utils.book_append_sheet(wb, ws, 'transformado')
        XLSX.writeFile(wb, `${fileName.replace(/\.[^.]+$/, '')}-transformado.xlsx`)
        return
      }

      // fallback: trigger a simple download link (simulação)
      const link = document.createElement('a')
      link.href = `/files/${clientName}/${fileName}`
      link.download = fileName
      link.click()
    } catch (err) {
      console.error('[v0] Erro ao preparar download:', err)
    }
  }

  const groupFilesByMonth = (files: FileData[]) => {
    const grouped: { [key: string]: FileData[] } = {}
    files.forEach(file => {
      const month = file.month || 'Não classificado'
      if (!grouped[month]) {
        grouped[month] = []
      }
      grouped[month].push(file)
    })
    return grouped
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processado':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'Pendente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'Erro':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">DataFlow Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">Bem-vindo, {user.name}</p>
          </div>
          <Button 
            variant="outline"
            onClick={onLogout}
            className="border-border"
          >
            Sair
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {[
            { id: 'download', label: 'Download de Arquivos', icon: '⬇️' },
            { id: 'transform', label: 'Transformação de Dados', icon: '⚙️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'download' && (
          <div className="space-y-6">
            {/* Search and Stats */}
            <div className="flex items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="Buscar cliente por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
              />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Total de Clientes</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{filteredClients.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Total de Arquivos</p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {filteredClients.reduce((sum, c) => sum + c.uploadedFiles.length, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Arquivos Processados</p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {filteredClients.reduce((sum, c) => 
                        sum + c.uploadedFiles.filter(f => f.status === 'Processado').length, 0
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clients List with Files */}
            <div className="mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Cadastrados</CardTitle>
                </CardHeader>
                <CardContent>
                  {uploadsCtx.clients.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-border">
                          <tr>
                            <th className="text-left px-4 py-2">Nome</th>
                            <th className="text-left px-4 py-2">Email</th>
                            <th className="text-left px-4 py-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadsCtx.clients.map((c) => (
                            <tr key={c.id} className="border-b hover:bg-muted">
                              <td className="px-4 py-2 font-medium text-foreground">{c.name}</td>
                              <td className="px-4 py-2 text-muted-foreground">{c.email}</td>
                              <td className="px-4 py-2">
                                <a href={`/clients/${c.id}`} className="text-primary underline">Ver arquivos</a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              {filteredClients.length === 0 ? (
                <Card>
                  <CardContent className="pt-8 pb-8">
                    <p className="text-center text-muted-foreground">Nenhum cliente encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                filteredClients.map(client => {
                  const monthlyFiles = groupFilesByMonth(client.uploadedFiles)
                  return (
                    <Card key={client.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader 
                        className="bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => setSelectedClient(selectedClient === client.id ? null : client.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <span>{selectedClient === client.id ? '▼' : '▶'}</span>
                              {client.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{client.uploadedFiles.length} arquivos</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {client.uploadedFiles.filter(f => f.status === 'Processado').length} processados
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      {selectedClient === client.id && (
                        <CardContent className="pt-6 space-y-4 bg-background/50">
                          {client.uploadedFiles.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">Nenhum arquivo enviado</p>
                          ) : (
                            Object.entries(monthlyFiles).map(([month, files]) => (
                              <div key={month} className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-border">
                                  <span className="text-lg">📁</span>
                                  <h4 className="font-semibold text-foreground text-sm">{month}</h4>
                                  <span className="ml-auto text-xs text-muted-foreground">{files.length} arquivo(s)</span>
                                </div>
                                <div className="space-y-2">
                                  {files.map(file => (
                                    <div
                                      key={file.id}
                                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-lg">📄</span>
                                          <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span>📅 {file.uploadDate}</span>
                                          <span>📊 {file.recordsCount.toLocaleString()} registros</span>
                                          <span>💾 {file.size}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 ml-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(file.status)}`}>
                                          {file.status}
                                        </span>
                                        <Button 
                                          size="sm"
                                          variant="default"
                                          onClick={() => handleDownloadFile(client.name, file.name)}
                                          className="whitespace-nowrap"
                                        >
                                          ⬇️ Download
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'transform' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload e Transformação de Planilhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ClientSelector />
                <ExcelUploader
                  onFileUpload={(file, formatA, formatB) => {
                    // when admin uploads here, must have selected client in selector
                    const selected = (document.getElementById('admin-client-select') as HTMLSelectElement | null)?.value
                    if (!selected) {
                      alert('Selecione um cliente antes de enviar')
                      return
                    }
                    const client = uploadsCtx.getClientById(selected)
                    if (!client) {
                      alert('Cliente inválido')
                      return
                    }
                    // register upload under selected client
                    uploadsCtx.addUpload({
                      id: Date.now().toString(),
                      ownerId: client.id,
                      ownerName: client.name,
                      ownerEmail: client.email || '',
                      name: file.name.replace('.xlsx', '_processado.xlsx').replace('.xls', '_processado.xlsx'),
                      uploadDate: new Date().toLocaleDateString('pt-BR'),
                      records: formatB.length,
                      originalData: formatA,
                      processedData: formatB,
                    })
                    alert('Upload registrado para ' + client.name)
                  }}
                  isAdmin={true}
                  onConfirm={() => { onLogout(); router.push('/'); }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
