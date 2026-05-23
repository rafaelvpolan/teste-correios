# teste-correios

Projeto fullstack com Docker Swarm, incluindo:

- `api/` — backend PHP 8.3 + MySQL + Redis
- `front-end/` — React + Vite + Nginx
- `docker-stack.yml` — orquestração Swarm para todos os serviços
- `.env` — variáveis de configuração do ambiente

## Arquitetura

- `api` é o backend PHP 8.3 que roda em PHP-FPM e se conecta ao MySQL / Redis
- `api_nginx` expõe a API em `http://127.0.0.1:8080` e encaminha requisições para o PHP
- `frontend` serve o React build em `http://127.0.0.1:3000` e proxyia chamadas para `/api/`
- `db` é MySQL 8.0 com script de inicialização em `api/mysql/init.sql`
- `redis` está integrado no mesmo overlay network para cache e futuras sessões
- `api` também expõe consulta de CEP via route `/cep/{cep}` usando a API de CEP dos Correios/ViaCEP

## Variáveis de ambiente

Edite `.env` com os valores do seu ambiente. Exemplo mínimo:

```env
VITE_API_URL=/api
API_IMAGE=api:local
FRONTEND_IMAGE=frontend:local
DB_HOST=db
DB_NAME=teste_api
DB_USER=system
DB_PASS=system8052
DB_ROOT_PASS=system805299
JWT_SECRET=9^&s8gfya98sg%u0@8asg
REDIS_HOST=redis
REDIS_PORT=6379
CORREIOS_ACCESS_KEY=5SmJiUaxVK6PmCiMIprZDlXm3vCcjFIS9y0qADIn
```

## Como rodar

1. Construa e faça deploy do stack com o script de apoio:

```bash
cd /home/rpolan/projects/teste-correios
chmod +x run-stack.sh
./run-stack.sh
```

2. Se preferir, faça manualmente:

```bash
cd /home/rpolan/projects/teste-correios
export $(python3 -c "from pathlib import Path; import shlex; print(' '.join(f'{k}={shlex.quote(v)}' for k,v in (line.split('=',1) for line in Path('.env').read_text().splitlines() if line and not line.startswith('#'))))")
docker build -t api:local ./api
docker build -t frontend:local ./front-end
docker stack deploy -c docker-stack.yml teste-correios
```

3. Acesse:

- Backend: `http://127.0.0.1:8080/health`
- Frontend: `http://127.0.0.1:3000`

> Se `localhost` não funcionar no Windows/WSL, use `127.0.0.1`.

## Modo de desenvolvimento

No frontend você pode usar Vite diretamente:

```bash
cd front-end
npm install
npm run dev
```

## Fluxo da aplicação

- O React faz chamadas para `/api/users`
- O Nginx do frontend faz proxy para `api_nginx`
- O Nginx da API faz proxy para PHP-FPM `api`

## Observações

- A chave de acesso dos Correios está configurada em `.env`
- O MySQL inicializa com a tabela `users`
- O `frontend` usa máscara de telefone e validação de formulário
