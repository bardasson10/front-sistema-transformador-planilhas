'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LoginPageProps {
  onLogin: (role: 'admin' | 'client') => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'client' | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">DataFlow</h1>
          <p className="text-muted-foreground">Gestão Profissional de Dados</p>
        </div>

        {!selectedRole ? (
          // Role Selection
          <div className="space-y-4">
            <p className="text-center text-foreground font-medium mb-6">Selecione seu tipo de acesso</p>
            
            <Card 
              className="cursor-pointer border-2 border-border hover:border-foreground transition-colors"
              onClick={() => setSelectedRole('admin')}
            >
              <CardHeader>
                <CardTitle className="text-lg">Administrador</CardTitle>
                <CardDescription>Acesso completo ao sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Gerenciar todos os arquivos</li>
                  <li>✓ Visualizar relatórios</li>
                  <li>✓ Processar planilhas</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer border-2 border-border hover:border-foreground transition-colors"
              onClick={() => setSelectedRole('client')}
            >
              <CardHeader>
                <CardTitle className="text-lg">Cliente</CardTitle>
                <CardDescription>Acesso restrito e seguro</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Acessar meus relatórios</li>
                  <li>✓ Download de arquivos</li>
                  <li>✓ Histórico mensal</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Login Form
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedRole === 'admin' ? 'Login - Administrador' : 'Login - Cliente'}
              </CardTitle>
              <CardDescription>Insira suas credenciais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedRole(null)}
                >
                  Voltar
                </Button>
                <Button 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => onLogin(selectedRole)}
                >
                  Entrar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
