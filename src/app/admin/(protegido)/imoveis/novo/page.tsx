import type { Metadata } from 'next'
import { FormularioImovel } from '@/components/admin/formulario-imovel'

export const metadata: Metadata = {
  title: 'Cadastrar imóvel',
  robots: { index: false, follow: false },
}

export default function PaginaNovoImovel() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-carvao-900">
        Cadastrar imóvel
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Preencha o que souber agora. Só tipo e título são obrigatórios — o resto dá para
        completar depois.
      </p>

      <div className="mt-6">
        <FormularioImovel />
      </div>
    </div>
  )
}
