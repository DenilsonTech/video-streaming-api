# Documentação do Projeto de Streaming de Vídeo com HLS

Este projeto é uma API de streaming de vídeo que permite o upload de vídeos, conversão para o formato HLS (HTTP Live Streaming) e reprodução dos vídeos em um player compatível. A API foi desenvolvida usando Node.js, Express, FFmpeg e MySQL para armazenamento de metadados.

## Estrutura do Projeto

### Diretórios e Arquivos

- `server.js`: Arquivo principal da API, responsável por lidar com o upload de vídeos, conversão para HLS e gerenciamento de requisições.
- `database/db.js`: Contém a configuração do banco de dados MySQL e funções para manipulação dos dados (upload e listagem de vídeos).
- `uploads/`: Diretório temporário onde os vídeos enviados são armazenados antes da conversão.
- `stream/`: Diretório onde os vídeos convertidos (arquivos `.m3u8` e `.ts`) são armazenados.
- `.env`: Arquivo de configuração para variáveis de ambiente (ex.: credenciais do banco de dados).

## Funcionamento do Projeto

### 1. Upload de Vídeo
- O usuário envia um vídeo através de uma requisição `POST` para o endpoint `/upload`.
- O vídeo é armazenado temporariamente no diretório `uploads/`.
- O vídeo é convertido para o formato HLS usando o FFmpeg, gerando arquivos `.m3u8` (playlist) e `.ts` (segmentos de vídeo).
- Os metadados do vídeo (título, descrição e caminho do arquivo) são armazenados no banco de dados MySQL.

### 2. Reprodução de Vídeo
- Os vídeos convertidos são servidos estaticamente a partir do diretório `stream/`.
- O endpoint `/videos` retorna uma lista de todos os vídeos cadastrados no banco de dados, permitindo que o frontend acesse os arquivos HLS para reprodução.

### 3. Banco de Dados
- O banco de dados MySQL armazena os metadados dos vídeos, incluindo título, descrição, caminho do arquivo e data de upload.
- A tabela `videos` é criada automaticamente durante a migração inicial.

## Como Executar o Projeto

### Pré-requisitos
- Node.js instalado.
- MySQL instalado e configurado.
- FFmpeg instalado.

### Passos para Execução

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o banco de dados:

- Crie um banco de dados MySQL chamado `videostreaming`.
- Configure as variáveis de ambiente no arquivo `.env`:

```plaintext
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin
DB_NAME=videostreaming
DB_PORT=3306
```

4. Execute a migração do banco de dados:

```bash
node database/db.js
```

5. Inicie o servidor:

```bash
node server.js
```

6. Acesse a API em [http://localhost:3000](http://localhost:3000).

## Endpoints da API

### `POST /upload`
**Descrição:** Faz o upload de um vídeo e converte para HLS.

#### Corpo da Requisição:
```json
{
  "file": "Arquivo de vídeo (multipart/form-data)",
  "title": "Título do vídeo (string)",
  "description": "Descrição do vídeo (string)"
}
```

#### Resposta:
```json
{
  "message": "Video uploaded and converted successfully",
  "videoId": 1,
  "streamPath": "stream_12345/output_12345.m3u8"
}
```

---

### `GET /videos`
**Descrição:** Retorna a lista de vídeos cadastrados.

#### Resposta:
```json
[
  {
    "id": 1,
    "title": "Meu Vídeo",
    "description": "Descrição do vídeo",
    "file_path": "stream_12345/output_12345.m3u8",
    "uploaded_at": "2023-10-01T12:00:00.000Z"
  }
]
```

## Estrutura de Diretórios

```plaintext
/projeto
│
├── server.js
├── database
│   └── db.js
├── uploads/
├── stream/
│   └── stream_12345/
│       ├── output_12345.m3u8
│       └── output_12345_0.ts
├── .env
├── package.json
└── README.md
```

