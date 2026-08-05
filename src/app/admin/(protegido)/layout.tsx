import Link from 'next/link'
import { redirect } from 'next/navigation'
import { lerSessao } from '@/lib/auth'
import { sair } from '@/app/admin/login/acoes'

/**
 * Layout do admin — mobile-first, porque é onde o Hélio cadastra: em pé, na frente do
 * imóvel, com o celular (PROJETO.md seção 2). Painel desenhado para desktop é o maior
 * risco do projeto: se cadastrar der mais trabalho que postar no Instagram, ele abandona.
 *
 * POR QUE UM ROUTE GROUP `(protegido)`: o grupo não aparece na URL, então `/admin` e
 * `/admin/imoveis` continuam iguais — mas `/admin/login` fica FORA dele e não herda
 * esta verificação. Sem isso, a tela de login exigiria estar logado para ser vista.
 *
 * A VERIFICAÇÃO VIVE AQUI, não no `proxy.ts`: a documentação do Next 16 diz
 * explicitamente que o proxy não serve como solução de autorização. Aqui a sessão é
 * conferida no servidor antes de qualquer conteúdo do admin ser renderizado.
 */
export default async function LayoutAdminProtegido({
  children,
}: {
  children: React.ReactNode
}) {
  const sessao = await lerSessao()

  if (!sessao) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="font-display font-extrabold text-carvao-900">
            Painel
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:inline">{sessao.nome}</span>
            <form action={sair}>
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        {/* Faixa rolável em vez de menu escondido: no celular, menu é um toque a mais. */}
        <nav
          aria-label="Painel"
          className="flex gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 [scrollbar-width:none]"
        >
          {[
            { href: '/admin', rotulo: 'Início' },
            { href: '/admin/imoveis', rotulo: 'Imóveis' },
            { href: '/admin/imoveis/novo', rotulo: '+ Cadastrar' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 pb-24">{children}</main>
    </div>
  )
}
