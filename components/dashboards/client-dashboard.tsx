'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ExcelUploader from '@/components/excel/excel-uploader'
import { useUploads } from '@/components/uploads/uploads-context'
import ClientFileManager from '@/components/file-manager/client-file-manager'

interface ClientDashboardProps {
  user: { id: string; email: string; name: string; type: 'admin' | 'client' }
  onLogout: () => void
}

interface MonthlyFiles {
  month: string
  files: any[]
}

export default function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'upload' | 'downloads'>('upload')
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [processedFiles, setProcessedFiles] = useState<MonthlyFiles[]>([
    {
      month: 'Janeiro 2025',
      files: [
        {
          id: '1',
          name: 'dados_processados_janeiro.xlsx',
          uploadDate: '2025-01-15',
          records: 245,
          status: 'Processado',
        },
      ],
    },
  ])

  const uploadsCtx = useUploads()

  const handleFileUpload = (file: File, formatA: any[], formatB: any[]) => {
    console.log('[v0] Client uploaded file:', file.name, 'Rows:', formatB.length)
    const currentMonth = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }).replace(/^\w/, (c) => c.toUpperCase())
    const newFile = {
      id: Date.now().toString(),
      name: file.name.replace('.xlsx', '_processado.xlsx').replace('.xls', '_processado.xlsx'),
      uploadDate: new Date().toLocaleDateString('pt-BR'),
      records: formatB.length,
      status: 'Processado',
    }

    setUploadedFiles(prev => [...prev, { ...newFile, originalData: formatA, processedData: formatB }])

    const monthExists = processedFiles.findIndex(m => m.month.includes(currentMonth.split(' ')[0]))
    if (monthExists >= 0) {
      setProcessedFiles(prev => {
        const updated = [...prev]
        updated[monthExists].files.push(newFile)
        return updated
      })
    } else {
      setProcessedFiles(prev => [...prev, { month: `${currentMonth} ${new Date().getFullYear()}`, files: [newFile] }])
    }
    // also register upload in global uploads store for admin
    try {
      const { addUpload } = uploadsCtx
      addUpload({
        id: Date.now().toString(),
        ownerId: user.id,
        ownerName: user.name,
        ownerEmail: user.email,
        name: newFile.name,
        uploadDate: newFile.uploadDate,
        records: newFile.records,
        originalData: formatA,
        processedData: formatB,
      })
    } catch (err) {
      console.warn('[v0] Não foi possível registrar upload no store global', err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minha Área</h1>
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
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {[
            { id: 'upload', label: 'Enviar Arquivos', icon: '📤' },
            { id: 'downloads', label: 'Meus Arquivos Processados', icon: '📥' },
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
        {activeTab === 'upload' && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Envie seus Arquivos Excel</CardTitle>
              </CardHeader>
              <CardContent>
                <ExcelUploader onFileUpload={handleFileUpload} isAdmin={false} onConfirm={() => { onLogout(); router.push('/'); }} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'downloads' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Arquivos Processados por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                {processedFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Nenhum arquivo processado ainda</p>
                    <p className="text-sm text-muted-foreground">
                      Envie um arquivo na aba "Enviar Arquivos" para começar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {processedFiles.map((monthData, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <span className="text-lg">📁</span> {monthData.month}
                        </h3>
                        <div className="space-y-2">
                          {monthData.files.map(file => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-foreground text-sm">{file.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {file.uploadDate} | {file.records} registros
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                                  {file.status}
                                </span>
                                <Button variant="outline" size="sm" className="border-border text-xs">
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">{uploadedFiles.length}</p>
                    <p className="text-muted-foreground text-sm mt-2">Arquivos Enviados</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {uploadedFiles.reduce((sum, f) => sum + (f.records || 0), 0)}
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">Registros Processados</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">100%</p>
                    <p className="text-muted-foreground text-sm mt-2">Taxa de Sucesso</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
