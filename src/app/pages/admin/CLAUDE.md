# Expresso Baldim — painel administrativo (Angular)

Contexto para o Claude Code. Responda e comente o código em português do Brasil.

## O que é o projeto
Site da **Expresso Baldim Transportes e Mudanças**, feito em dupla (trabalho de front-end web). Esta parte cobre a **área administrativa**:
- **Login administrativo** (usuário e senha, só para os gestores; autenticação JWT ou sessão).
- **Painel de pedidos** (dashboard): listar pedidos, ler os detalhes e alterar o status, que atualiza o rastreio que o cliente vê.

As páginas públicas (Home, Escolha do serviço, Frota, Sobre nós, formulários, Rastreio, Avaliação) são de outra pessoa da dupla. **Não altere as páginas públicas sem eu pedir.**

## Código (integrado a partir do pacote `baldim-admin-angular`)
O pacote foi integrado seguindo a estrutura do projeto: arquivos gerados com `ng generate` (convenção `nome.ts` / `.html` / `.css` / `.spec.ts`, classe sem sufixo), **CSS puro** (sem SCSS).

Estrutura:
- `src/admin.css` tokens do Figma e classes globais `eb-*` (botões, campos, cartões, tricolor). Registrado em `angular.json` → `styles`, depois do `styles.css`.
- `src/environments/` `environment.ts` (produção) e `environment.development.ts` (`ng serve`), com `apiUrl` e `useMock`.
- `src/app/constants.ts` `LOGO_SRC` (usa `public/images/Logo.jpeg`, o mesmo do site) e rotas fixas do admin.
- `src/app/models/order.ts` modelo, status, rótulos e tipos da paginação.
- `src/app/services/` `Auth`, `Orders` (mock ou API) e `OrdersStore` (estado, filtros, contadores).
- `src/app/guards/` `authGuard` e `guestGuard`; `src/app/interceptors/` `authInterceptor`; `src/app/pipes/` `BrDatePipe`.
- `src/app/components/` `admin-layout` (cabeçalho/rodapé simplificados), `public-layout` (navbar + footer do site), `order-detail`, `status-tag`, `pagination`.
- `src/app/pages/admin/` `admin.routes.ts`, `login/` e `pedidos/` (lista + detalhe).
- `app.routes.ts`: páginas públicas como filhas do `PublicLayout`; `/admin` com `loadChildren`. `app.routes.server.ts`: `/admin` em `RenderMode.Client` (não é pré-renderizado).

Rotas: `/admin/login`, `/admin/pedidos`, `/admin/pedidos/:codigo`.

## Regras de código
- Angular 17 ou superior: componentes standalone, `@if`/`@for`, signals. Confira a versão real do projeto e adapte se for mais antiga.
- Prefixo `eb-` nas classes globais e nos seletores de componentes do admin, para não colidir com o site público.
- Layout mobile × desktop com **breakpoint de 768 px** (`max-width: 767.98px` para mobile). Mesma página e mesmo HTML; o CSS decide o que aparece.
- Acessibilidade: rótulos nos campos, foco visível, `aria-invalid` e mensagens de erro ligadas ao campo.
- Nunca coloque credenciais reais no código. O login `admin` / `admin123` existe **só no mock** e deve sair quando `useMock` for `false`.
- Antes de dar um trabalho como pronto, rode `ng build` e corrija os erros. O pacote foi validado só com TypeScript, nunca compilado dentro de um projeto Angular.

## Design (fonte da verdade: Figma)
- Arquivo Figma: `https://www.figma.com/design/2Wc5ADTPJwCHpzNE2kvsQR` (fileKey `2Wc5ADTPJwCHpzNE2kvsQR`). Página **Admin** = telas desta área; página **Publico** = site público.
- Telas oficiais na página Admin (IDs podem mudar; procure pelo nome):
  - `Admin 1 - Login administrativo` (77:3) e `Admin 1m - Login (mobile)` (87:21)
  - `Admin 2 - Dashboard de pedidos` (84:7; rodapé de paginação 115:60)
  - `Admin 2m - Dashboard lista (mobile)` (104:22; rodapé de paginação 115:150) e `Admin 2m - Dashboard detalhe (mobile)` (104:125)
- O frame `admin 2m - Dashboard de pedidos(mobile)` (93:17) é uma versão alternativa gerada pelo agente do Figma, em página única. **Não é a oficial**, mas três ideias dele foram aproveitadas na lista mobile oficial: contadores com número à direita, filtros quebrando em linhas e destaque verde no pedido selecionado.
- Componentes de cabeçalho e rodapé: conjuntos `Navegação` e `Rodapé`, com as propriedades `Tipo` (Completa / Simplificada) e `Tela` (Desktop / Mobile). O `/admin` usa sempre a **Simplificada**.

Tokens (já em `src/styles/_eb-tokens.scss`):

| Uso | Valor |
|---|---|
| Fundo | `#000000` |
| Cartões | `#111313` |
| Botão secundário / linha selecionada | `#191c1b` |
| Campos | `#090b0b` |
| Borda | `#2b302e` |
| Texto secundário | `#a9b2ad` |
| Verde de destaque | `#25d47d` |
| Vermelho (faixa tricolor, erros) | `#db453d` |

Fonte: Inter (400, 600, 700, 800). Raios: 8 px (botões, campos) e 16 px (cartões). A assinatura tricolor (verde, branco, vermelho) aparece no topo de cada seção.

## Decisões já tomadas
- **Tema escuro** em todo o site. Se um dia houver tema claro, a faixa branca do tricolor precisa de contorno fino em cinza escuro (sem degradê).
- Login com **cabeçalho e rodapé simplificados** (logo + "Voltar ao site"; só o copyright), para a pessoa voltar ao site fácil e a tela ficar menos poluída.
- Login **sem** "esqueci minha senha" e **sem** "manter conectado": o kanban só pede usuário, senha e JWT/sessão.
- Desktop: tabela de pedidos e painel de detalhe lado a lado. Mobile: lista em cartões, e tocar num pedido abre `/admin/pedidos/:codigo` como tela própria, com "Voltar aos pedidos" e barra fixa "Atualizar status".
- A data desejada é **opcional**: quando o cliente não informa, mostrar "—". Aparece como coluna na tabela (desktop) e como linha "Data desejada" em cada cartão (mobile).
- Contadores do topo: Novos (Recebido), Andamento (Em análise + Em transporte), Concluídos. No mobile são **um único cartão com uma linha por contador** (descrição à esquerda, número à direita), em vez de três cartões separados, para não gastar uma tela inteira de scroll.
- Filtros de status **quebram em mais de uma linha** (desktop e mobile): todas as opções ficam visíveis, sem rolar para o lado.
- **Paginação** (lista de pedidos): padrão **10 por página**, seletor com 10 / 20 / 50. Feita no servidor (`pagina`, `tamanho`, `status`, `busca` → `{ items, total }`). Busca (com atraso de 300 ms), filtro de status e troca de quantidade voltam para a página 1. Página e quantidade ficam na URL (`?pagina=2&tamanho=20`; omitidos quando são o padrão) e são preservados ao abrir um pedido. Contadores do topo vêm de `/resumo` e não dependem da página. Desktop: "Mostrando X a Y de Z pedidos" + "Por página" + páginas numeradas com reticências (`‹ 1 2 3 … 5 ›`). Mobile: barra Anterior / "Página N de M" / Próxima, com resumo e seletor abaixo; "Anterior" desabilitado na página 1. Componente: `shared/pagination.component`. O mock tem 47 pedidos.
- Mobile: o cartão do **último pedido aberto** ganha borda verde ao voltar do detalhe para a lista (`OrdersStore.lastOpened`).
- Status sugeridos: `RECEBIDO`, `EM_ANALISE`, `EM_TRANSPORTE`, `CONCLUIDO` (ainda não confirmados com o back-end).
- Código do pedido no formato `EB-XXXXX` é só exemplo; o formato real vem da API de recepção.

## API (quando existir)

| Para quê | Chamada |
|---|---|
| Entrar | `POST /api/auth/login` com `{ username, password }` → `{ token }` |
| Listar pedidos | `GET /api/pedidos?pagina=1&tamanho=10&status=&busca=` → `{ items, total }` |
| Contadores | `GET /api/pedidos/resumo` → `{ novos, andamento, concluidos }` |
| Um pedido | `GET /api/pedidos/{codigo}` (link direto para pedido fora da página atual) |
| Alterar status | `PATCH /api/pedidos/{codigo}/status` com `{ status }` → pedido atualizado |

Respostas 401 (fora do login) deslogam e voltam para `/admin/login`. A paginação, a busca e o filtro já são pensados para rodar na API.

## Próximos passos
1. ~~Integrar o pacote ao projeto e fazer `ng build` passar.~~ Feito.
2. Logo: hoje usa `public/images/Logo.jpeg`. Se exportar um PNG transparente do Figma, ajuste `LOGO_SRC` e o `width`/`height` do `ngSrc` em `admin-layout.html`.
3. ~~Criar o `PublicLayout`.~~ Feito (`components/public-layout`).
4. Testar login (mock), lista, filtros, busca e troca de status, em desktop e em 390 px.
5. Ligar à API real (`useMock: false`) quando o back-end estiver pronto.
6. Pendências de design (feitas no Figma, fora do código): estado de erro do login com a senha incorreta e o dropdown de status aberto.

## Pontos para alinhar com a dupla
- Formato do código do pedido e lista final de status.
- Contrato da paginação: nomes dos parâmetros (`pagina`, `tamanho`, `status`, `busca`), formato `{ items, total }` e o endpoint `/resumo`.
- Caminhos e formatos exatos dos endpoints.
- Se o site público também terá versão mobile (falta a variante Completa mobile do cabeçalho, com menu hambúrguer).
