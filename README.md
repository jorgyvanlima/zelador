# 🏢 Zelador - API de Controle de Portaria

![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192.svg?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?logo=docker)

**Zelador** é uma API RESTful robusta desenvolvida em **FastAPI** para o gerenciamento de portarias, recepções e controle de acesso a edifícios corporativos. O sistema permite o cadastro de visitantes, armazenamento de fotos (documentos ou rosto), controle de check-in/check-out e emissão de logs por setores.

---

## 🎯 Funcionalidades Principais

- **Autenticação Segura (JWT)**: Login com OAuth2 Password Bearer e senhas criptografadas usando `bcrypt`.
- **RBAC (Controle de Acesso Baseado em Roles)**:
  - `ADMIN`: Gerenciamento completo de usuários (recepcionistas), setores e visão global.
  - `OPERATOR`: Permissões para cadastro de visitantes e registros de check-in/check-out.
- **Gestão de Departamentos**: Cadastro e controle de setores, andares e responsáveis.
- **Gestão de Visitantes**: Registro de dados e documentos (CPF, RG, OAB) com validação contra duplicidade.
- **Upload de Fotos**: Armazenamento local de fotos dos visitantes (suporte nativo via FastAPI).
- **Controle de Fluxo (Check-in/Check-out)**:
  - Registro de entrada vinculada ao visitante, ao recepcionista logado e ao setor destino.
  - Marcação de saída e controle de "Visitantes no Local" em tempo real.

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem:** Python 3.11+
- **Framework Web:** FastAPI
- **Banco de Dados:** PostgreSQL
- **ORM:** SQLAlchemy 2.0 (totalmente assíncrono)
- **Migrações:** Alembic (preparado no ambiente)
- **Validação:** Pydantic V2
- **Segurança:** PyJWT, passlib[bcrypt]
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
   - O Docker fará o download das imagens, instalará as dependências e o banco de dados.
   - O script de seed (`init_db.py`) criará as tabelas e o usuário administrador padrão.

### 🔑 Acesso de Administrador Padrão
Após iniciar o contêiner, um usuário inicial será gerado para seu primeiro login:
- **Username:** `admin`
- **Password:** `admin123`

---

## 📚 Documentação da API (Swagger/ReDoc)

Com a aplicação rodando, acesse a documentação interativa autogerada pelo FastAPI no seu navegador:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📁 Estrutura do Projeto

```text
.
├── app/
│   ├── api/
│   │   ├── dependencies.py    # Injeção de dependências (banco, auth)
│   │   └── v1/                # Endpoints (Auth, Users, Departments, Visitors, Visits)
│   ├── core/                  # Configurações (Pydantic Settings), Segurança (JWT)
│   ├── db/                    # Setup do Engine Assíncrono
│   ├── models/                # Modelos SQLAlchemy (Tabelas do Banco)
│   ├── schemas/               # Schemas Pydantic (Validação de Input/Output)
│   └── services/              # Lógica de negócio e Upload de Arquivos
├── media/
│   └── fotos_visitantes/      # Armazenamento persistente de uploads (Docker Volume)
├── Dockerfile                 # Construção da Imagem da API
├── docker-compose.yml         # Orquestração (API + Postgres)
├── init_db.py                 # Script de criação de tabelas e seed inicial
├── requirements.txt           # Dependências Python
└── README.md
```
