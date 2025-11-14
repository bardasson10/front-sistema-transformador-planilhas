"use client"

import React from 'react'
import { useUploads } from '@/components/uploads/uploads-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'

export default function ClientFiles({ clientId }: { clientId: string }) {
  const uploadsCtx = useUploads()
  const client = uploadsCtx.getClientById(clientId)
  const uploads = uploadsCtx.getUploadsByOwner(clientId)

  if (!client) return <div className="p-6">Cliente não encontrado</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Arquivos processados — {client.name}</h2>
      {uploads.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Nenhum arquivo processado para este cliente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {uploads.map(u => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.uploadDate} • {u.records} registros</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => {
                    if (u.processedData && u.processedData.length > 0) {
                      const wb = XLSX.utils.book_new()
                      const ws = XLSX.utils.json_to_sheet(u.processedData)
                      XLSX.utils.book_append_sheet(wb, ws, 'transformado')
                      XLSX.writeFile(wb, `${u.name.replace(/\.[^.]+$/, '')}-transformado.xlsx`)
                    } else {
                      alert('Sem dados transformados disponíveis')
                    }
                  }} className="border-border">Baixar Transformado</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
