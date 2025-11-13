'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FileManagerProps {
  files: any[]
  isAdmin: boolean
}

export default function FileManager({ files, isAdmin }: FileManagerProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? 'Todos os Arquivos' : 'Meus Arquivos'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum arquivo encontrado</p>
              <p className="text-sm text-muted-foreground">
                Faça upload de um arquivo Excel para começar
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
                      <span>Enviado: {file.uploadDate}</span>
                      <span>Registros: {file.formatB?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded text-sm font-medium">
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
