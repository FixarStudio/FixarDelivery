# Webhook para Atualização de Status de Pedidos

Este documento explica como configurar e usar o webhook para atualização automática de status de pedidos via n8n.

## Endpoint do Webhook

**URL:** `http://localhost:5678/webhook-test/pedido-status`  
**Método:** `POST`  
**Content-Type:** `application/json`

## Estrutura do JSON

```json
{
  "nome": "Lucas Silva",
  "numero_cliente": "558396881746", 
  "status": "Entregue",
  "pedido_id": "123456"
}
```

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nome` | string | ✅ | Nome real do cliente |
| `numero_cliente` | string | ✅ | Número real do telefone do cliente |
| `status` | string | ✅ | Novo status do pedido (em português) |
| `pedido_id` | string | ✅ | ID único do pedido |

## Status Permitidos

| Status | Descrição |
|--------|-----------|
| `Aguardando Preparo` | Pedido recebido e aguardando preparação |
| `Em Preparação` | Pedido sendo preparado na cozinha |
| `Pronto para Entrega` | Pedido pronto e aguardando entrega |
| `Entregue` | Pedido entregue com sucesso |
| `Cancelado` | Pedido cancelado |

## Configuração no n8n

### 1. Criar um Webhook Node

1. Adicione um novo nó "Webhook" ao seu workflow
2. Configure a URL: `http://localhost:5678/webhook-test/pedido-status`
3. Configure o método como `POST`

### 2. Configurar o JSON de Saída

No nó que envia dados para o webhook, configure o JSON com os dados do pedido:

```json
{
  "nome": "{{ $json.nome_real_cliente }}",
  "numero_cliente": "{{ $json.telefone_real_cliente }}",
  "status": "{{ $json.status_portugues }}",
  "pedido_id": "{{ $json.id_pedido }}"
}
```

### 3. Exemplo de Workflow

```
Trigger (Status Change) → Process Data → Webhook → Notification
```

## Respostas da API

### Sucesso (200)
```json
{
  "success": true,
  "message": "Status do pedido atualizado com sucesso via webhook",
  "pedido": {
    "id": "123456",
    "status": "preparing",
    "customerName": "Lucas Silva",
    "customerPhone": "558396881746",
    "updatedAt": "2025-01-30T15:30:00.000Z"
  }
}
```

### Erro - Pedido não encontrado (404)
```json
{
  "success": false,
  "message": "Pedido não encontrado"
}
```

### Erro - Status inválido (400)
```json
{
  "success": false,
  "message": "Status inválido. Status permitidos: Aguardando Preparo, Em Preparação, Pronto para Entrega, Entregue, Cancelado"
}
```

### Erro - Campos obrigatórios (400)
```json
{
  "success": false,
  "message": "pedido_id, status, nome e numero_cliente são obrigatórios"
}
```

## Teste do Webhook

### 1. Página de Teste

Acesse: `http://localhost:5678/test-webhook`

Esta página permite:
- Testar se o endpoint está funcionando
- Simular envios de webhook
- Verificar respostas da API

### 2. Teste via cURL

```bash
curl -X POST http://localhost:5678/webhook-test/pedido-status \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Lucas Silva",
    "numero_cliente": "558396881746",
    "status": "Entregue",
    "pedido_id": "123456"
  }'
```

### 3. Teste via GET

```bash
curl http://localhost:5678/webhook-test/pedido-status
```

## Logs

O webhook registra logs no console do servidor:

```
Webhook recebido - Pedido 123456 atualizado para status: delivered
```

## Segurança

- O webhook aceita apenas requisições POST
- Validação de campos obrigatórios
- Validação de status permitidos
- Verificação de existência do pedido no banco de dados

## Troubleshooting

### Erro 404 - Pedido não encontrado
- Verifique se o `pedido_id` está correto
- Confirme se o pedido existe no banco de dados

### Erro 400 - Status inválido
- Verifique se o status está na lista de status permitidos
- Use apenas os valores: `pending`, `preparing`, `ready`, `delivered`, `cancelled`

### Erro 500 - Erro interno
- Verifique os logs do servidor
- Confirme se o banco de dados está acessível
- Verifique se o Prisma está configurado corretamente

## Integração com o Sistema

O webhook atualiza automaticamente:
- **Status do pedido** (convertido de português para inglês internamente)
- **Nome do cliente** (dados reais)
- **Número do cliente** (dados reais)
- Data de atualização

**Importante:** O webhook recebe o status em português (como aparece na interface) e converte internamente para inglês para salvar no banco de dados.

As mudanças são refletidas imediatamente na interface de acompanhamento de pedidos. 