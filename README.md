# XVAL (React + TypeScript + Vite)

## Rodar

```bash
npm install
npm run dev
```

## Se o `npm install` ficar travado / ETIMEDOUT

Este projeto inclui um `.npmrc` **no nível do projeto** forçando o registry do npm:

- `registry=https://registry.npmjs.org/`

Isso evita ambientes que redirecionam npm para registries internos/proxy instáveis.

Se ainda assim travar, confira seu registry atual:

```bash
npm config get registry
```

E procure overrides em:

- `~/.npmrc` (usuário)
- `.npmrc` (projeto)
- variáveis de ambiente (proxy)

