# Deploy CloudCart — EC2 + Docker na AWS Academy

## Arquitetura final

```
Usuário (navegador)
        │
        ▼
┌───────────────────────────────────────────────────────┐
│                  EC2 — Frontend (porta 3000)           │
│              Docker: cloudcart-frontend                │
│         chama tudo via API Gateway (não direto)        │
└───────────────────┬───────────────────────────────────┘
                    │  NEXT_PUBLIC_API_URL (API Gateway)
                    ▼
        ┌───────────────────────┐
        │    Amazon API Gateway  │
        │  /api/*  → EC2 Backend │
        │  /report → Lambda      │
        └──────┬────────┬────────┘
               │        │
               ▼        ▼
  ┌─────────────────┐  ┌──────────────────────┐
  │ EC2 — Backend   │  │   AWS Lambda          │
  │ Docker: port    │  │   handler.js          │
  │ 8080 (Spring)   │  │   chama /api/* via    │
  └────────┬────────┘  │   API Gateway         │
           │           └──────────────────────┘
           ▼
  ┌─────────────────┐
  │  Amazon RDS     │
  │  PostgreSQL     │
  │ (subnet privada)│
  └─────────────────┘
```

---

## Antes de começar — suba o código no GitHub

O código precisa estar em um repositório GitHub para que as EC2 possam cloná-lo.

```bash
# No seu computador local (raiz do projeto cloud-cart)
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<seu-usuario>/cloud-cart.git
git push -u origin main
```

> Se o repositório já existe no GitHub, apenas garanta que está atualizado com `git push`.

---

## Passo 1 — VPC e Subnets

1. No console AWS, acesse **VPC → Your VPCs**
2. Use a **default VPC** (já existe na conta)
3. Acesse **Subnets** e confirme que existem:
   - Uma ou mais **subnets públicas** (onde ficam as EC2)
   - Uma ou mais **subnets privadas** (onde ficará o RDS)

> Se não houver subnet privada, crie uma: **Subnets → Create subnet**, escolha a VPC padrão, defina um CIDR como `10.0.128.0/24` e **não** marque "Enable auto-assign public IPv4".

---

## Passo 2 — RDS PostgreSQL (subnet privada)

1. Acesse **RDS → Create database**
2. Escolha:
   - Engine: **PostgreSQL**
   - Template: **Free tier**
3. Preencha em **Settings**:
   - DB instance identifier: `cloudcart-db`
   - Master username: `postgres`
   - Master password: escolha uma senha e **anote**
4. Em **Additional configuration** (role para baixo):
   - Initial database name: `cloudcart`
5. Em **Connectivity**:
   - VPC: a VPC padrão
   - Subnet group: use o padrão ou crie um com as subnets privadas
   - Public access: **No** ← obrigatório
   - VPC security group: crie novo → nome `sg-rds-cloudcart`
6. Clique em **Create database** e aguarde (~5 min para ficar `Available`)
7. Quando disponível, anote o **Endpoint**:
   `cloudcart-db.xxxx.us-east-1.rds.amazonaws.com`

---

## Passo 3 — Security Groups

### 3.1 sg-backend

1. **EC2 → Security Groups → Create security group**
2. Name: `sg-backend` | VPC: padrão
3. Inbound rules:

| Tipo | Protocolo | Porta | Origem |
|------|-----------|-------|--------|
| SSH | TCP | 22 | My IP |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 |

### 3.2 sg-frontend

1. **EC2 → Security Groups → Create security group**
2. Name: `sg-frontend` | VPC: padrão
3. Inbound rules:

| Tipo | Protocolo | Porta | Origem |
|------|-----------|-------|--------|
| SSH | TCP | 22 | My IP |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 |

### 3.3 sg-rds-cloudcart (liberar acesso do backend)

1. Vá em **Security Groups**, encontre o `sg-rds-cloudcart` criado no Passo 2
2. **Edit inbound rules → Add rule**:

| Tipo | Protocolo | Porta | Origem |
|------|-----------|-------|--------|
| PostgreSQL | TCP | 5432 | sg-backend (selecione pelo nome) |

---

## Passo 4 — EC2 para o Backend

### 4.1 Lançar a instância

1. **EC2 → Launch instance**
2. Name: `cloudcart-backend`
3. AMI: **Amazon Linux 2023**
4. Instance type: `t3.small` (recomendado) ou `t2.micro`
5. Key pair: crie um novo (`.pem`) e salve no seu computador
6. Network settings:
   - VPC: padrão
   - Subnet: qualquer subnet **pública**
   - Auto-assign public IP: **Enable**
   - Security group: selecione `sg-backend`
7. Em **Advanced details → User data**, cole o script abaixo:

```bash
#!/bin/bash
dnf update -y
dnf install -y docker git
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user
```

8. Clique em **Launch instance**
9. Aguarde o status ficar **Running** e anote o **Public IPv4 address**

### 4.2 Conectar via SSH

```bash
# Ajustar permissão da chave (Mac/Linux)
chmod 400 sua-chave.pem

# Conectar
ssh -i sua-chave.pem ec2-user@<IP_PUBLICO_BACKEND>
```

> **Windows:** use o terminal do VS Code ou o PowerShell. Se pedir permissão da chave, clique com botão direito no `.pem` → Propriedades → Segurança → remova permissões de outros usuários.

### 4.3 Clonar o código e buildar

```bash
# Dentro da EC2 backend
git clone https://github.com/<seu-usuario>/cloud-cart.git
cd cloud-cart/Backend/cloudcart

# Build da imagem Docker (demora ~3 min — Maven baixa dependências)
docker build -t cloudcart-backend .

# Confirmar que a imagem foi criada
docker images
```

### 4.4 Rodar o container

```bash
docker run -d \
  --name cloudcart-backend \
  --restart unless-stopped \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://<RDS_ENDPOINT>:5432/cloudcart" \
  -e SPRING_DATASOURCE_USERNAME="postgres" \
  -e SPRING_DATASOURCE_PASSWORD="<sua-senha-rds>" \
  -e SPRING_JPA_HIBERNATE_DDL_AUTO="update" \
  cloudcart-backend
```

Substitua `<RDS_ENDPOINT>` e `<sua-senha-rds>` pelos valores do Passo 2.

```bash
# Acompanhar logs até aparecer "Started CloudcartApplication"
docker logs -f cloudcart-backend
```

### 4.5 Testar o backend

```bash
curl http://localhost:8080/api/products
# Deve retornar um array JSON com os 12 produtos do seed
```

---

## Passo 5 — API Gateway

1. Acesse **API Gateway → Create API**
2. Escolha **HTTP API → Build**
3. Name: `cloudcart-api` → clique **Next** até chegar em **Review and create → Create**
4. Após criar, vá em **Routes → Create**:

**Rota 1 — CRUD do backend:**
- Method: `ANY`
- Path: `/api/{proxy+}`
- Integration type: **HTTP**
- URL: `http://<IP_PUBLICO_BACKEND>:8080/api/{proxy}`

**Rota 2 — Lambda report:**
- Method: `GET`
- Path: `/report`
- Integration type: **Lambda**
- Lambda function: `cloudcart-report` ← crie a Lambda primeiro (Passo 6) e volte aqui

5. Vá em **Deployments → Create**:
   - Stage name: `prod`
   - Clique **Deploy**
6. Anote a URL gerada:
   `https://<ID>.execute-api.us-east-1.amazonaws.com/prod`

**Configurar CORS:**
- Vá em **CORS** no menu lateral
- Configure:
  - Allow origins: `*`
  - Allow methods: `*`
  - Allow headers: `*`
- Salve

---

## Passo 6 — Lambda /report

### 6.1 Criar a função

1. **Lambda → Create function**
2. Author from scratch:
   - Name: `cloudcart-report`
   - Runtime: **Node.js 22.x**
   - Architecture: x86_64
3. Clique **Create function**

### 6.2 Upload do código

No seu computador local:

```bash
# Mac/Linux
cd lambda
zip function.zip handler.js package.json

# Windows (PowerShell)
Compress-Archive -Path lambda\handler.js, lambda\package.json -DestinationPath lambda\function.zip
```

Na console da Lambda:
1. Clique em **Upload from → .zip file**
2. Suba o `function.zip`

### 6.3 Configurar

- **Handler:** `handler.handler`
- Em **Configuration → Environment variables → Edit → Add**:
  - Key: `API_URL`
  - Value: `https://<ID>.execute-api.us-east-1.amazonaws.com/prod`
- Em **Configuration → General configuration → Edit**:
  - Timeout: **15 segundos**

### 6.4 Voltar ao API Gateway

Agora que a Lambda existe, volte ao Passo 5 e crie a rota `/report` apontando para `cloudcart-report`.

---

## Passo 7 — EC2 para o Frontend

### 7.1 Lançar a instância

1. **EC2 → Launch instance**
2. Name: `cloudcart-frontend`
3. AMI: **Amazon Linux 2023**
4. Instance type: `t2.micro`
5. Key pair: use o mesmo do backend
6. Network settings:
   - Subnet: pública, Auto-assign public IP: **Enable**
   - Security group: `sg-frontend`
7. **User data:** mesmo script do Passo 4.1
8. Anote o **Public IPv4 address**

### 7.2 Conectar, clonar e buildar

```bash
ssh -i sua-chave.pem ec2-user@<IP_PUBLICO_FRONTEND>

git clone https://github.com/<seu-usuario>/cloud-cart.git
cd cloud-cart/Frontend/frontend

# Build com as URLs do API Gateway embutidas (obrigatório para variáveis NEXT_PUBLIC_*)
docker build \
  --build-arg NEXT_PUBLIC_API_URL="https://<ID>.execute-api.us-east-1.amazonaws.com/prod" \
  --build-arg NEXT_PUBLIC_REPORT_URL="https://<ID>.execute-api.us-east-1.amazonaws.com/prod/report" \
  -t cloudcart-frontend .
```

### 7.3 Rodar o container

```bash
docker run -d \
  --name cloudcart-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  cloudcart-frontend

docker logs -f cloudcart-frontend
```

Acesse no navegador: `http://<IP_PUBLICO_FRONTEND>:3000`

---

## Passo 8 — Testar tudo

```bash
# 1. Backend via API Gateway
curl https://<ID>.execute-api.us-east-1.amazonaws.com/prod/api/products

# 2. Lambda via API Gateway
curl https://<ID>.execute-api.us-east-1.amazonaws.com/prod/report

# 3. Frontend no navegador
http://<IP_PUBLICO_FRONTEND>:3000
```

---

## Checklist de entrega

- [ ] RDS PostgreSQL em subnet **privada**, porta 5432 **não exposta** à internet
- [ ] EC2 Backend rodando container Spring Boot (porta 8080)
- [ ] EC2 Frontend rodando container Next.js (porta 3000)
- [ ] API Gateway: `/api/*` → EC2 Backend e `/report` → Lambda
- [ ] Lambda `cloudcart-report` consome `/api/products` e `/api/orders/all` via HTTP
- [ ] Frontend usa `NEXT_PUBLIC_API_URL` apontando para o API Gateway (não para o backend direto)
- [ ] Página `/report` no frontend exibe estatísticas vindas da Lambda
- [ ] CRUD completo funcionando (GET, POST, PUT, DELETE em `/api/products`)

---

## Capturas de tela necessárias para o PDF

1. RDS — aba **Connectivity** mostrando "Publicly accessible: No"
2. EC2 — lista das duas instâncias rodando
3. API Gateway — tela de rotas configuradas
4. Lambda — aba **Configuration** com a variável `API_URL`
5. Docker — saída de `docker ps` em cada EC2
6. Postman ou curl — CRUD funcionando via API Gateway
7. Navegador — Página `/report` com dados da Lambda
