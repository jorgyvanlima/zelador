# 🏢 Zelador - Sistema de Controle de Portaria

![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192.svg?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?logo=docker)

**Zelador** é um sistema completo 100% Python desenvolvido com **FastAPI** para o gerenciamento de portarias, recepções e controle de acesso a edifícios corporativos. O projeto oferece tanto uma **API RESTful robusta** quanto um **Painel de Interface Premium** (Frontend SPA) nativamente acoplado, trazendo uma estética *Glassmorphism* e *Dark Mode*.

---

## 🎯 Funcionalidades Principais

- **Interface de Usuário Integrada (Frontend)**: Telas modernas para gerenciar visitantes e administração de setores sem depender do Swagger. 
- **Autenticação Segura (JWT)**: Login com OAuth2 Password Bearer e senhas protegidas com `bcrypt`.
- **RBAC (Controle de Acesso Baseado em Roles)**: Modos distintos na interface gráfica dependendo do acesso:
  - `ADMIN`: Visualiza todos os menus, tem acesso total ao **Módulo de Cadastro de Setores** e ao **Módulo de Usuários**.
  - `OPERATOR`: Visualiza apenas a tela da Portaria (Check-in/Check-out de visitantes), impedindo que modifique as configurações do prédio.
- **Gestão de Departamentos**: Interface para cadastro e controle de setores, andares e ramais telefônicos.
- **Gestão de Usuários**: Interface para criar contas de Operadores e Administradores.
- **Controle de Portaria**:
  - Formulário ágil para registro de visitantes (CPF, RG, Nome).
  - Autopreenchimento para visitantes já cadastrados anteriormente.
  - Tabela "Em Tempo Real" exibindo visitantes atualmente no prédio.
  - Botões para registrar a Saída (Check-out) com 1 clique.
- **Upload de Fotos**: Armazenamento local de fotos dos visitantes (suporte na API).

---

## 🛠️ Tecnologias Utilizadas

- **Backend & Servidor:** Python 3.11+ e FastAPI (Uvicorn)
- **Frontend / Templates:** HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (Fetch API) e Jinja2
- **Banco de Dados:** PostgreSQL (imagem alpine)
- **ORM:** SQLAlchemy 2.0 (assíncrono)
- **Segurança:** PyJWT, bcrypt puro
- **Infraestrutura:** Docker & Docker Compose

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Docker** e **Docker Compose** instalados na sua máquina.

### Passos

1. **Clone este repositório:**
   ```bash
   git clone https://github.com/jorgyvanlima/zelador.git
   cd zelador
   ```

2. **Inicie os contêineres:**
   ```bash
   docker-compose up -d --build
   ```

3. **Pronto!**
   - O Docker fará o download das imagens, instalará as dependências e inicializará o banco.
   - O sistema de seed criará o usuário administrador inicial e as estruturas base.

### 💻 Acessando o Sistema (Frontend)

Com a aplicação rodando, acesse a Interface pelo navegador:
- **Painel Zelador (Login):** [http://localhost:8051/login](http://localhost:8051/login)

**Acesso de Administrador Padrão:**
- **Username:** `admin`
- **Password:** `admin123`

### 📚 Documentação da API

Se você for realizar integrações sistêmicas, a documentação REST autogerada está disponível em:
- **Swagger UI:** [http://localhost:8051/docs](http://localhost:8051/docs)

---

## 📁 Estrutura do Projeto

```text
.
├── app/
│   ├── api/                   # Rotas da REST API (/v1)
│   ├── core/                  # Segurança, Configurações e Hash
│   ├── db/                    # Sessões do SQLAlchemy
│   ├── models/                # Tabelas PostgreSQL
│   ├── schemas/               # Validações e Serialização Pydantic
│   ├── static/                # CSS e JS do Frontend da aplicação
│   │   ├── css/style.css
│   │   └── js/ui.js, api.js
│   ├── templates/             # Arquivos HTML Jinja2 (Dashboard e Login)
│   └── main.py                # Ponto de Entrada, injetor de rotas estáticas
├── media/                     # Volumes persistentes Docker
├── Dockerfile                 # Imagem de Construção
├── docker-compose.yml         # Orquestração de Containers
├── deploy.py                  # Script Python paramiko/ssh para Server Linux
└── README.md
```
