const https = require('https');
const http = require('http');

const WEBHOOK_URL = 'http://localhost:5678/webhook-test/pedido-status';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    if (options.body) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            json: () => Promise.resolve(jsonData)
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            json: () => Promise.resolve({ message: data })
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testWebhook() {
  console.log('🧪 Testando Webhook de Atualização de Status de Pedidos\n');

  // Teste 1: Verificar se o endpoint está funcionando
  console.log('1️⃣ Testando endpoint GET...');
  try {
    const response = await makeRequest(WEBHOOK_URL);
    const data = await response.json();
    console.log('✅ Endpoint funcionando:', data.message);
  } catch (error) {
    console.log('❌ Erro ao testar endpoint:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando em http://localhost:5678');
    return;
  }

  // Teste 2: Testar com dados válidos
  console.log('\n2️⃣ Testando POST com dados válidos...');
  const validData = {
    nome: "Lucas Silva",
    numero_cliente: "558396881746",
    status: "Entregue",
    pedido_id: "test-pedido-123"
  };

  try {
    const response = await makeRequest(WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(validData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook funcionando corretamente!');
      console.log('📊 Resposta:', JSON.stringify(data, null, 2));
    } else {
      console.log('⚠️ Webhook retornou erro:', data.message);
    }
  } catch (error) {
    console.log('❌ Erro ao enviar webhook:', error.message);
  }

  // Teste 3: Testar com dados inválidos
  console.log('\n3️⃣ Testando POST com dados inválidos...');
  const invalidData = {
    nome: "Teste",
    numero_cliente: "123456789",
    status: "Status Inválido",
    pedido_id: "test-pedido-123"
  };

  try {
    const response = await makeRequest(WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    const data = await response.json();
    console.log('✅ Validação funcionando:', data.message);
  } catch (error) {
    console.log('❌ Erro ao testar validação:', error.message);
  }

  console.log('\n🎉 Testes concluídos!');
  console.log('\n📝 Para testar manualmente:');
  console.log(`   curl -X POST ${WEBHOOK_URL} \\`);
  console.log('   -H "Content-Type: application/json" \\');
  console.log('   -d \'{"nome": "Teste", "numero_cliente": "123456789", "status": "Entregue", "pedido_id": "123"}\'');
  console.log('\n🌐 Ou acesse: http://localhost:5678/test-webhook');
}

// Executar teste se o script for chamado diretamente
if (require.main === module) {
  testWebhook().catch(console.error);
}

module.exports = { testWebhook }; 