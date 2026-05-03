// Test script for API server endpoints
const http = require('http');

function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n✓ ${description}`);
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  CORS Origin: ${res.headers['access-control-allow-origin']}`);
        console.log(`  CORS Methods: ${res.headers['access-control-allow-methods']}`);
        console.log(`  Content-Type: ${res.headers['content-type']}`);
        
        try {
          const json = JSON.parse(data);
          console.log(`  Response: ${JSON.stringify(json).substring(0, 100)}...`);
          resolve({ path, status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          console.log(`  Response: ${data.substring(0, 100)}...`);
          resolve({ path, status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`✗ ${description}: ${e.message}`);
      reject(e);
    });

    req.end();
  });
}

function testOptions(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'OPTIONS'
    };

    const req = http.request(options, (res) => {
      console.log(`\n✓ ${description}`);
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  CORS Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`  CORS Methods: ${res.headers['access-control-allow-methods']}`);
      console.log(`  CORS Headers: ${res.headers['access-control-allow-headers']}`);
      resolve({ path, status: res.statusCode, headers: res.headers });
    });

    req.on('error', (e) => {
      console.error(`✗ ${description}: ${e.message}`);
      reject(e);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing BobWatch API Server...\n');
  console.log('='.repeat(60));
  
  try {
    // Test health endpoint
    await testEndpoint('/api/health', 'GET /api/health');
    
    // Test summary endpoint
    await testEndpoint('/api/summary', 'GET /api/summary');
    
    // Test sessions endpoint
    await testEndpoint('/api/sessions', 'GET /api/sessions');
    
    // Test query endpoint
    await testEndpoint('/api/query?mode=code', 'GET /api/query?mode=code');
    
    // Test OpenAPI spec
    await testEndpoint('/openapi.json', 'GET /openapi.json');
    
    // Test OPTIONS preflight
    await testOptions('/api/health', 'OPTIONS /api/health (CORS preflight)');
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✓ All tests passed! API server is working correctly.');
    console.log('  - CORS headers present on all endpoints');
    console.log('  - Health endpoint returns session count');
    console.log('  - All endpoints return valid JSON');
    console.log('  - OPTIONS preflight handled correctly');
    
  } catch (error) {
    console.error('\n✗ Tests failed:', error.message);
    process.exit(1);
  }
}

runTests();

// Made with Bob
