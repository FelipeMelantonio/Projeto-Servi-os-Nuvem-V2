# CloudCart — E-commerce em Nuvem (AWS)

## Sobre o projeto

CloudCart é um sistema de e-commerce desenvolvido como projeto acadêmico para a disciplina de Serviços em Nuvem. O sistema expõe um CRUD completo de produtos e utiliza serviços gerenciados da AWS para demonstrar uma arquitetura em nuvem segura e escalável.

---

## Arquitetura

```
Usuário (browser)
│
▼
EC2 Frontend — Next.js (porta 3000)
IP Elástico: 18.204.108.41
│
│ todas as chamadas via API Gateway
▼
Amazon API Gateway
https://fc82uufx6i.execute-api.us-east-1.amazonaws.com
│
├── /api/*  ──────────────► EC2 Backend — Spring Boot (porta 8080)
│                          IP Elástico: 98.95.5.147
│                                   │
│                                   ▼
│                           Amazon RDS PostgreSQL
│                           subnet privada — sem acesso público
│
└── /report ──────────────► AWS Lambda — cloudcart-report
                                    │
                                    │ HTTP via API Gateway
                                    ▼
                           /api/products + /api/orders/all
```

---

## Infraestrutura AWS

### VPC

| Recurso | Nome | Valor |
|---|---|---|
| VPC | cloudcart-vpc | 10.0.0.0/16 |
| Subnet pública | cloudcart-subnet-public | 10.0.1.0/24 — us-east-1a |
| Subnet privada | cloudcart-subnet-private-1a | 10.0.2.0/24 — us-east-1a |
| Subnet privada | cloudcart-subnet-private-1b | 10.0.3.0/24 — us-east-1b |
| Internet Gateway | cloudcart-igw | Anexado à cloudcart-vpc |
| Route Table | cloudcart-rtb-public | 0.0.0.0/0 → cloudcart-igw |

A subnet pública tem rota para a Internet via Internet Gateway. As subnets privadas não possuem rota externa — são completamente isoladas, garantindo que o banco de dados não seja acessível de fora da VPC.

---

### Security Groups

| Security Group | Porta | Protocolo | Origem | Finalidade |
|---|---|---|---|---|
| sg-backend | 8080 | TCP | 0.0.0.0/0 | Receber requisições do API Gateway |
| sg-backend | 22 | TCP | 0.0.0.0/0 | Acesso SSH para manutenção |
| sg-frontend | 3000 | TCP | 0.0.0.0/0 | Acesso do usuário ao frontend |
| sg-frontend | 22 | TCP | 0.0.0.0/0 | Acesso SSH para manutenção |
| sg-rds-cloudcart | 5432 | TCP | sg-backend | Somente o backend acessa o banco |

O `sg-rds-cloudcart` usa outro Security Group como origem em vez de um IP fixo. Isso garante que apenas recursos com o `sg-backend` associado consigam conectar ao banco, independentemente de mudanças de IP.

---

### EC2 — Backend

| Configuração | Valor |
|---|---|
| Nome | cloudcart-backend |
| AMI | Amazon Linux 2023 |
| Tipo | t3.micro |
| Subnet | cloudcart-subnet-public |
| IP Elástico | 98.95.5.147 |
| Security Group | sg-backend |
| Porta | 8080 |
| Runtime | Docker — Spring Boot JAR |

O backend roda dentro de um container Docker construído com multi-stage build. A imagem usa `eclipse-temurin:21-jdk-alpine` para compilar e `eclipse-temurin:21-jre-alpine` para rodar, reduzindo o tamanho final da imagem.

---

### EC2 — Frontend

| Configuração | Valor |
|---|---|
| Nome | cloudcart-frontend |
| AMI | Amazon Linux 2023 |
| Tipo | t3.micro |
| Subnet | cloudcart-subnet-public |
| IP Elástico | 18.204.108.41 |
| Security Group | sg-frontend |
| Porta | 3000 |
| Runtime | Docker — Next.js standalone |

As variáveis `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_REPORT_URL` são embutidas no build da imagem Docker em tempo de compilação, pois o Next.js exige que variáveis públicas sejam definidas no momento do build.

---

### Amazon RDS

| Configuração | Valor |
|---|---|
| Identificador | cloudcart-db |
| Engine | PostgreSQL 18 |
| Classe | db.t3.micro |
| Armazenamento | 20 GiB gp3 |
| Endpoint | cloudcart-db.ca0fuqvrs5z2.us-east-1.rds.amazonaws.com |
| Porta | 5432 |
| Subnet Group | cloudcart-db-subnet-group |
| Subnets | cloudcart-subnet-private-1a + cloudcart-subnet-private-1b |
| Acesso público | Não |
| Security Group | sg-rds-cloudcart |
| Zona | us-east-1a |

O RDS está em subnet privada sem acesso público. O único serviço que consegue conectar é o backend, controlado pelo Security Group. O DB Subnet Group usa duas zonas de disponibilidade conforme exigência da AWS.

---

### Amazon API Gateway

| Configuração | Valor |
|---|---|
| Nome | cloudcart-api |
| Tipo | HTTP API |
| ID | fc82uufx6i |
| URL base | https://fc82uufx6i.execute-api.us-east-1.amazonaws.com |
| Estágio | $default (auto-deploy ativado) |

#### Rotas configuradas

| Método | Rota | Integração | Destino |
|---|---|---|---|
| ANY | /api/{proxy+} | HTTP | http://98.95.5.147:8080/api/{proxy} |
| GET | /report | Lambda | cloudcart-report |

O API Gateway é o único ponto de entrada público do sistema. O frontend nunca chama o backend diretamente — todas as requisições passam pelo API Gateway, que roteia para o serviço correto.

---

### AWS Lambda

| Configuração | Valor |
|---|---|
| Nome | cloudcart-report |
| Runtime | Node.js 22.x |
| Handler | index.handler |
| Timeout | 15 segundos |
| Variável de ambiente | API_URL = https://fc82uufx6i.execute-api.us-east-1.amazonaws.com |

A função é acionada pelo API Gateway na rota `GET /report`. Ela não acessa o RDS diretamente — consome a API do backend via HTTP através do próprio API Gateway, respeitando a separação de camadas da arquitetura.

Chamadas realizadas pela Lambda:
- `GET /api/products` — busca lista de produtos
- `GET /api/orders/all` — busca todos os pedidos

Estatísticas retornadas:
- Total de produtos, sem estoque e com estoque baixo
- Preço médio dos produtos
- Produtos por categoria
- Total de pedidos, receita total e ticket médio
- Produto mais vendido

---

## CRUD — Entidade Principal: Produto

| Operação | Método | Rota |
|---|---|---|
| Listar todos | GET | /api/products |
| Buscar por ID | GET | /api/products/{id} |
| Criar | POST | /api/products |
| Atualizar | PUT | /api/products/{id} |
| Deletar | DELETE | /api/products/{id} |

Todas as rotas são acessadas exclusivamente via API Gateway.

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 + Spring Boot 4 — Maven |
| Frontend | TypeScript + Next.js 16 + React 19 + Tailwind CSS 4 |
| Lambda | JavaScript ES Modules — Node.js 22 |
| Banco local (dev) | H2 em memória |
| Banco produção | PostgreSQL 18 — Amazon RDS |
| Containerização | Docker — multi-stage build |

---

## URLs de produção

```
Frontend:    http://18.204.108.41:3000
API Gateway: https://fc82uufx6i.execute-api.us-east-1.amazonaws.com
Produtos:    https://fc82uufx6i.execute-api.us-east-1.amazonaws.com/api/products
Relatório:   https://fc82uufx6i.execute-api.us-east-1.amazonaws.com/report
```

---

## Como executar localmente

### Backend

```bash
cd Backend/cloudcart
./mvnw spring-boot:run
```

Acesse: `http://localhost:8080/api/products`

### Frontend

```bash
cd Frontend/frontend
npm install
npm run dev
```

Acesse: `http://localhost:3000`

---

## Como iniciar na AWS

### Backend (EC2 — 98.95.5.147)

```bash
sudo service docker start
sudo chmod 666 /var/run/docker.sock
docker start backend
```

### Frontend (EC2 — 18.204.108.41)

```bash
sudo service docker start
sudo chmod 666 /var/run/docker.sock
docker start frontend
```
