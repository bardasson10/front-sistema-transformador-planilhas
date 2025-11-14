"use client"

import React, { createContext, useContext, useState } from 'react'

export interface UploadedFile {
  id: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  name: string
  uploadDate: string
  records: number
  originalData?: any[]
  processedData?: any[]
}

export interface ClientRecord {
  id: string
  name: string
  email?: string
}

interface UploadsContextValue {
  uploads: UploadedFile[]
  clients: ClientRecord[]
  addUpload: (upload: UploadedFile) => void
  addClient: (client: ClientRecord) => void
  getClientById: (id: string) => ClientRecord | undefined
  getUploadsByOwner: (ownerId: string) => UploadedFile[]
}

const UploadsContext = createContext<UploadsContextValue | undefined>(undefined)

export const useUploads = () => {
  const ctx = useContext(UploadsContext)
  if (!ctx) throw new Error('useUploads must be used within UploadsProvider')
  return ctx
}

export const UploadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [clients, setClients] = useState<ClientRecord[]>([])

  const addUpload = (upload: UploadedFile) => {
    setUploads(prev => [upload, ...prev])
  }

  const addClient = (client: ClientRecord) => {
    setClients(prev => [client, ...prev])
  }

  const getClientById = (id: string) => clients.find(c => c.id === id)

  const getUploadsByOwner = (ownerId: string) => uploads.filter(u => u.ownerId === ownerId)

  return (
    <UploadsContext.Provider value={{ uploads, clients, addUpload, addClient, getClientById, getUploadsByOwner }}>
      {children}
    </UploadsContext.Provider>
  )
}

export default UploadsContext
