"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useUploads } from '@/components/uploads/uploads-context'

export default function ClientSelector() {
  const uploadsCtx = useUploads()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleCreate = () => {
    if (!name) return alert('Nome do cliente é obrigatório')
    const id = Date.now().toString()
    uploadsCtx.addClient({ id, name, email })
    setName('')
    setEmail('')
    alert('Cliente cadastrado: ' + name)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select id="admin-client-select" className="flex-1 px-3 py-2 border border-border rounded bg-background text-foreground">
          <option value="">-- Selecionar Cliente --</option>
          {uploadsCtx.clients.map(c => (
            <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do cliente" className="px-3 py-2 border border-border rounded bg-background" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (opcional)" className="px-3 py-2 border border-border rounded bg-background" />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleCreate} className="bg-foreground text-background">Cadastrar Cliente</Button>
      </div>
    </div>
  )
}
