<div align="center">

<img src="https://img.shields.io/badge/version-V2.0-0ea5e9?style=for-the-badge&logo=git&logoColor=white" />
<img src="https://img.shields.io/badge/status-Em%20Desenvolvimento-f59e0b?style=for-the-badge" />
<img src="https://img.shields.io/badge/licença-MIT-22c55e?style=for-the-badge" />

<br/>
<br/>

# 🗺️ CodeMap

### Seu guia de estudos para programadores juniores

**CodeMap** é uma aplicação web que organiza o aprendizado de programadores iniciantes através de **roadmaps interativos**, permitindo registrar progresso e acessar conteúdos na ordem certa — sem se perder no mar de informações da internet.

[🚀 Ver Demo](#) · [🐛 Reportar Bug](https://github.com/Devs097518/codemap/issues) · [✨ Sugerir Feature](https://github.com/Devs097518/codemap/issues)

</div>

---

## 📌 Sobre o Projeto

Quem está começando na programação se depara com um problema clássico: **existe muito conteúdo disponível, mas nenhuma ordem clara para seguir**. O resultado? Confusão, desmotivação e horas perdidas.

O **CodeMap** resolve isso oferecendo:

- 🗺️ **Roadmaps estruturados** com trilhas de estudo definidas
- ✅ **Registro de progresso** por etapa do roadmap
- 🔗 **Redirecionamento de conteúdos** curados na ordem certa
- 🔐 **Área autenticada** com experiência personalizada por usuário

---

## 🛣️ Roadmap do Projeto

O CodeMap está sendo construído em versões funcionais incrementais:

| Versão | Funcionalidade | Status |
|--------|---------------|--------|
| V0 | Usuário cria uma nota | ✅ Concluído |
| V1 | Usuário cria várias notas | ✅ Concluído |
| **V2** | **Usuário cria pastas e organiza notas** | ✅ Concluído |
| V3 | Painel do Administrador | 🔄 Em andamento |
| V4 | Painel do Cliente | 🔜 Planejado |

---

## 🧰 Tecnologias

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

---

## ⚙️ Como Instalar e Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [PostgreSQL](https://www.postgresql.org/) instalado e rodando
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/Devs097518/codemap.git
cd codemap
```

### 2. Configure as variáveis de ambiente

O projeto possui arquivos `.env_exemple.txt` tanto no frontend quanto no backend. Copie-os e preencha com suas configurações:

```bash
# No diretório do backend
cp .env_exemple.txt .env

# No diretório do frontend
cp .env_exemple.txt .env
```

> ⚠️ Preencha os valores das variáveis de ambiente antes de rodar o projeto.

### 3. Instale as dependências

```bash
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd frontend
npm install
```

### 4. Rode o projeto

```bash
# Backend
cd backend
cd api
node app.js

# Frontend
cd frontend
npm run dev
```

Acesse em: `http://localhost:3000`

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Veja como participar:

1. **Fork** este repositório
2. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Faça suas alterações e **commit**:
   ```bash
   git commit -m "feat: adiciona minha feature"
   ```
4. Envie para o seu fork:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request** descrevendo o que foi alterado

### 📋 Convenção de Commits

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Uso |
|---------|-----|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Alteração em documentação |
| `style:` | Formatação, sem mudança de lógica |
| `refactor:` | Refatoração de código |
| `chore:` | Tarefas de manutenção |

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com ❤️ por [Devs097518](https://github.com/Devs097518)

</div>
