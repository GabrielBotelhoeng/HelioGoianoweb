'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { enviarFotos, definirCapa, removerFoto } from '@/app/admin/(protegido)/imoveis/acoes-midia'

type Foto = {
  id: string
  url: string
  isCapa: boolean
  legenda: string | null
}

/**
 * Upload de fotos do imóvel — PROJETO.md seções 2 e 6.
 *
 * A COMPRESSÃO ACONTECE AQUI, no navegador, antes de subir. Não é otimização: é o que
 * torna o cadastro viável. Uma foto de celular sai com 3 a 8 MB; subir cinco delas pelo
 * 4G de Alexânia levaria minutos e o Hélio abandonaria o cadastro no meio — que é o
 * risco número um listado na seção 12 do documento.
 *
 * `browser-image-compression` é carregado sob demanda (`await import`), só quando ele
 * escolhe a primeira foto: quem só abre a tela para conferir dados não paga por ela.
 */
export function UploadFotos({
  imovelId,
  fotos,
  storageConfigurado,
}: {
  imovelId: string
  fotos: Foto[]
  storageConfigurado: boolean
}) {
  const entradaRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [progresso, setProgresso] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  async function aoEscolher(evento: React.ChangeEvent<HTMLInputElement>) {
    const escolhidas = Array.from(evento.target.files ?? [])
    if (escolhidas.length === 0) return

    setErro(null)
    setEnviando(true)

    try {
      const { default: comprimir } = await import('browser-image-compression')

      const dados = new FormData()
      dados.set('imovelId', imovelId)

      for (const [indice, arquivo] of escolhidas.entries()) {
        setProgresso(`Preparando ${indice + 1} de ${escolhidas.length}...`)

        const comprimida = await comprimir(arquivo, {
          maxSizeMB: 1,
          // 1920px cobre tela cheia em desktop; acima disso é peso sem ganho visível.
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          // Sem isto, foto tirada na vertical sobe deitada: o celular grava a orientação
          // no EXIF e a compressão descarta esse metadado.
          exifOrientation: undefined,
          fileType: 'image/jpeg',
          initialQuality: 0.82,
        })

        dados.append(
          'fotos',
          new File([comprimida], arquivo.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
          }),
        )
      }

      setProgresso('Enviando...')
      const resultado = await enviarFotos({}, dados)

      if (resultado.erro) setErro(resultado.erro)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não consegui enviar as fotos.')
    } finally {
      setEnviando(false)
      setProgresso('')
      if (entradaRef.current) entradaRef.current.value = ''
    }
  }

  if (!storageConfigurado) {
    return (
      <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        O envio de fotos ainda não está configurado. Falta criar o projeto no Supabase e
        preencher <code className="font-mono">SUPABASE_URL</code> e{' '}
        <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> no <code>.env</code>.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={entradaRef}
          type="file"
          accept="image/*"
          multiple
          // `capture` deixaria só a câmera; sem ele, ele escolhe entre tirar na hora e
          // pegar da galeria — as duas coisas acontecem no fluxo real.
          onChange={aoEscolher}
          disabled={enviando}
          className="hidden"
          id="entrada-fotos"
        />
        <label
          htmlFor="entrada-fotos"
          className={`flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center font-semibold transition-colors ${
            enviando
              ? 'border-stone-200 bg-stone-50 text-stone-400'
              : 'border-marca-300 bg-marca-50 text-marca-800 hover:border-marca-500'
          }`}
        >
          {enviando ? progresso || 'Enviando...' : '📷 Adicionar fotos'}
        </label>
        <p className="mt-2 text-xs text-stone-500">
          As fotos são reduzidas no seu celular antes de subir, para gastar menos internet.
        </p>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      {fotos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((foto) => (
            <li
              key={foto.id}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-stone-100">
                <Image
                  src={foto.url}
                  alt={foto.legenda ?? ''}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                />
                {foto.isCapa && (
                  <span className="absolute top-2 left-2 rounded-full bg-oferta-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    CAPA
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 p-2">
                {!foto.isCapa && (
                  <button
                    type="button"
                    disabled={pendente}
                    onClick={() => iniciar(() => definirCapa(foto.id))}
                    className="rounded-full px-2 py-1 text-xs font-semibold text-marca-700 hover:bg-marca-50"
                  >
                    Usar de capa
                  </button>
                )}
                <button
                  type="button"
                  disabled={pendente}
                  onClick={() => iniciar(() => removerFoto(foto.id))}
                  className="ml-auto rounded-full px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
