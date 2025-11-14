import ClientFiles from '@/components/clients/client-files'

interface Props {
  params: { clientId: string }
}

export default function ClientPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-background">
      <ClientFiles clientId={params.clientId} />
    </main>
  )
}
