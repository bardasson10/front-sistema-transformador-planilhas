'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'

interface ExcelUploaderProps {
  onFileUpload: (file: File, formatA: any[], formatB: any[]) => void
  isAdmin?: boolean
}

export default function ExcelUploader({ onFileUpload, isAdmin = false }: ExcelUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const transformFormatAToB = (data: any[]) => {
    return data.map((row, idx) => ({
      id: idx + 1,
      timestamp: new Date().toISOString(),
      ...row,
      processed: true,
      processedDate: new Date().toLocaleDateString('pt-BR'),
    }))
  }

  const processExcelFile = (file: File) => {
    setIsProcessing(true)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result as ArrayBuffer)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(worksheet)

        const formatA = data
        const formatB = transformFormatAToB(formatA)

        setPreview({
          fileName: file.name,
          rowsA: formatA.length,
          rowsB: formatB.length,
          sample: formatB.slice(0, 3),
        })

        onFileUpload(file, formatA, formatB)
        setIsProcessing(false)
      } catch (error) {
        console.error('[v0] Error processing file:', error)
        setIsProcessing(false)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processExcelFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processExcelFile(files[0])
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          isDragging
            ? 'border-foreground bg-foreground/5'
            : 'border-border bg-muted/30 hover:border-foreground/50'
        }`}
      >
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l2-2m-2 2v-2.5M7 20H5a2 2 0 01-2-2V9a2 2 0 012-2h2m0-5h4a2 2 0 012 2v12a2 2 0 01-2 2h-4m6-14l2-2m0 0l-2 2m2-2v5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isAdmin ? 'Arraste o arquivo do cliente aqui' : 'Arraste seu arquivo Excel aqui'}
        </h3>
        <p className="text-muted-foreground mb-4">ou</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-foreground text-background hover:bg-foreground/90"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processando...' : 'Selecionar Arquivo'}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Formatos suportados: Excel (.xlsx, .xls), CSV
        </p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-muted rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Transformação de Formato Concluída</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded">
              <p className="text-sm text-muted-foreground">Nome do Arquivo</p>
              <p className="font-mono text-sm mt-2 text-foreground truncate">{preview.fileName}</p>
            </div>
            <div className="bg-background p-4 rounded">
              <p className="text-sm text-muted-foreground">Linhas (Entrada)</p>
              <p className="text-2xl font-bold text-foreground mt-2">{preview.rowsA}</p>
            </div>
            <div className="bg-background p-4 rounded">
              <p className="text-sm text-muted-foreground">Linhas (Saída)</p>
              <p className="text-2xl font-bold text-foreground mt-2">{preview.rowsB}</p>
            </div>
          </div>

          {preview.sample.length > 0 && (
            <div className="bg-background rounded overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-foreground">ID</th>
                    <th className="text-left px-4 py-2 font-semibold text-foreground">Data</th>
                    <th className="text-left px-4 py-2 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.sample.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted">
                      <td className="px-4 py-2 text-foreground">{row.id}</td>
                      <td className="px-4 py-2 text-muted-foreground text-xs">{row.processedDate}</td>
                      <td className="px-4 py-2">
                        <span className="bg-foreground/10 text-foreground px-2 py-1 rounded text-xs font-medium">
                          ✓ Processado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
            Confirmar e Salvar
          </Button>
        </div>
      )}
    </div>
  )
}
