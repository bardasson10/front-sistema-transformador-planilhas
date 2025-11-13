'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ClientFile {
  id: string
  name: string
  uploadDate: string
  records: number
  status: string
}

interface ClientFileManagerProps {
  files: ClientFile[]
}

export default function ClientFileManager({ files }: ClientFileManagerProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Meus Arquivos Processados</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum arquivo processado ainda</p>
              <p className="text-sm text-muted-foreground">
                Envie um arquivo Excel para começar o processamento
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>{file.uploadDate}</span>
                      <span>{file.records} registros</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-foreground/10 text-foreground px-3 py-1 rounded text-sm font-medium">
                      {file.status}
                    </span>
                    <Button variant="outline" size="sm" className="border-border">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
