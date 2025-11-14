'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'

interface ExcelUploaderProps {
  onFileUpload: (file: File, formatA: any[], formatB: any[]) => void
  isAdmin?: boolean
  onConfirm?: (file: File | null, formatA: any[] | null, formatB: any[] | null) => void
}

export default function ExcelUploader({ onFileUpload, isAdmin = false, onConfirm }: ExcelUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [lastFormatB, setLastFormatB] = useState<any[] | null>(null)
  const [lastFormatA, setLastFormatA] = useState<any[] | null>(null)
  const [lastFile, setLastFile] = useState<File | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const transformFormatAToB = (data: any[]) => {
    // mapa de códigos para bancos (pode ser estendido)
    const bankMap: Record<string, number> = {
      'ITAU': 1,
      'BRADESCO': 2,
      'CAIXA': 3,
      'BANCO DO BRASIL': 4,
      'BANCO DO BRASIL S.A.': 4,
      'SANTANDER': 5,
      'SANTANDER BRASIL': 5,
      'BB': 4,
      'ITAU UNIBANCO': 1,
    }

    const normalizeBankName = (name: any) => {
      if (!name) return ''
      return String(name).toUpperCase().replace(/[^A-Z0-9 ]+/g, '').trim()
    }

    return data.map((row, idx) => {
      const rawBank = normalizeBankName(row.NOME_DO_BANCO || row.nome_do_banco || row.Banco)
      const bankCode = bankMap[rawBank] ?? 99
      const seq = String(idx + 1).padStart(3, '0')
      return {
        NUM_BANCO: `${bankCode}-${seq}`,
        ID_CLIENTE: row.ID_CLIENTE ?? row.id_cliente ?? row.Id ?? '',
        VALOR_TRANSACAO: row.VALOR_TRANSACAO ?? row.valor_transacao ?? row.Valor ?? 0,
      }
    })
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
        setIsConfirmed(false)
        onFileUpload(file, formatA, formatB)
        setLastFormatB(formatB)
        setLastFormatA(formatA)
        setLastFile(file)
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

          {!isConfirmed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Antes - Formato A (amostra) */}
              <div className="bg-background rounded overflow-x-auto p-2">
                <h4 className="text-sm font-semibold text-foreground mb-2">Antes (Formato A) — Amostra</h4>
                {lastFormatA && lastFormatA.length > 0 ? (
                  (() => {
                    const sampleA = lastFormatA.slice(0, 5)
                    const colsA = Object.keys(sampleA[0] || {})
                    return (
                      <table className="w-full text-sm">
                        <thead className="border-b border-border">
                          <tr>
                            {colsA.map((c) => (
                              <th key={c} className="text-left px-3 py-2 font-semibold text-foreground">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sampleA.map((row: any, idx: number) => (
                            <tr key={idx} className="border-b border-border hover:bg-muted">
                              {colsA.map((c) => (
                                <td key={c} className="px-3 py-2 text-foreground truncate">{String(row[c] ?? '')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">Sem amostra do formato original</p>
                )}
              </div>

              {/* Depois - Formato B (amostra) */}
              <div className="bg-background rounded overflow-x-auto p-2">
                <h4 className="text-sm font-semibold text-foreground mb-2">Depois (Formato B) — Amostra</h4>
                {preview.sample && preview.sample.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-foreground">NUM_BANCO</th>
                        <th className="text-left px-4 py-2 font-semibold text-foreground">ID_CLIENTE</th>
                        <th className="text-left px-4 py-2 font-semibold text-foreground">VALOR_TRANSACAO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.sample.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-border hover:bg-muted">
                          <td className="px-4 py-2 text-foreground">{row.NUM_BANCO}</td>
                          <td className="px-4 py-2 text-muted-foreground text-xs">{row.ID_CLIENTE}</td>
                          <td className="px-4 py-2">{row.VALOR_TRANSACAO}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem amostra do formato transformado</p>
                )}
              </div>
            </div>
          )}

          <Button
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            onClick={() => {
              setIsConfirmed(true)
              if (typeof onConfirm === 'function') {
                try {
                  onConfirm(lastFile, lastFormatA, lastFormatB)
                } catch (err) {
                  console.error('[v0] erro em onConfirm:', err)
                }
              }
            }}
          >
            Confirmar e Salvar
          </Button>

          {isConfirmed && (
            <div className="p-4 bg-background rounded text-center">
              <p className="text-sm text-muted-foreground">Processamento confirmado</p>
              <p className="text-2xl font-bold text-foreground mt-2">{preview.rowsB} linhas processadas</p>
              <div className="mt-3 grid gap-2">
                {lastFormatB && (
                  <Button
                    onClick={() => {
                      try {
                        const wb = XLSX.utils.book_new()
                        const ws = XLSX.utils.json_to_sheet(lastFormatB)
                        XLSX.utils.book_append_sheet(wb, ws, 'transformado')
                        XLSX.writeFile(wb, `${preview.fileName || 'transformado'}-b.xlsx`)
                      } catch (err) {
                        console.error('Erro ao gerar arquivo:', err)
                      }
                    }}
                    className="w-full border-border"
                  >
                    Baixar Transformado (.xlsx)
                  </Button>
                )}

                <Button variant="outline" onClick={() => setIsConfirmed(false)} className="border-border">
                  Ver amostra
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
