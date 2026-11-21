# Expresso Baldim

Aplicação Angular para o site da Expresso Baldim. Os pedidos, avaliações,
usuários e depoimentos são lidos e gravados em `db.json` pelo JSON Server.

## Executar localmente

Instale as dependências:

```bash
npm install
```

Inicie o JSON Server em um terminal:

```bash
npm run api
```

Inicie a aplicação em outro terminal:

```bash
npm start
```

A aplicação fica em `http://localhost:4200` e a API em
`http://localhost:3000`. As alterações feitas pela aplicação são persistidas
em `db.json`.

## Validar

```bash
npm run build
npm test
```

O JSON Server é destinado ao desenvolvimento local; não substitui uma API com
autenticação e persistência seguras para produção.
