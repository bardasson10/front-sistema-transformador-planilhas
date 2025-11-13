'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AuthPageProps {
  onLogin: (user: { id: string; email: string; name: string; type: 'admin' | 'client' }) => void
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'client' as 'admin' | 'client',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: formData.email,
      name: formData.name || formData.email.split('@')[0],
      type: formData.userType,
    }
    
    onLogin(mockUser)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">DataFlow</h1>
          <p className="text-muted-foreground">Gestão Profissional de Dados</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isSignup ? 'Criar Conta' : 'Entrar'}
            </CardTitle>
            <CardDescription>
              {isSignup 
                ? 'Preencha os dados para se cadastrar' 
                : 'Faça login para acessar seu painel'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Senha</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo de Conta</label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            )}

            <Button 
              onClick={handleSubmit}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSignup ? 'Cadastrar' : 'Entrar'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSignup(!isSignup)
                setFormData({ name: '', email: '', password: '', userType: 'client' })
              }}
              className="w-full border-border"
            >
              {isSignup 
                ? 'Já tenho conta. Entrar' 
                : 'Não tenho conta. Cadastrar'}
            </Button>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Demo:</p>
          <p className="text-xs text-muted-foreground">
            Use qualquer email para fazer login. Selecione o tipo de conta desejado.
          </p>
        </div>
      </div>
    </div>
  )
}
