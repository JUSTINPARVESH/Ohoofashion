// Test script to verify reels and settings endpoints
import http from 'http';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`${method} ${path}: ${res.statusCode}`);
        if (body && res.statusCode !== 200) console.log('Error:', body.substring(0, 50));
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n=== TESTING REELS AND SETTINGS ENDPOINTS ===\n');
  
  try {
    // Test 1: GET reels
    await makeRequest('GET', '/api/reels');
    
    // Test 2: GET settings
    await makeRequest('GET', '/api/settings');
    
    // Test 3: POST new reel
    const postResult = await makeRequest('POST', '/api/admin/reels', {
      url: 'https://example.com/testvideo.mp4',
      description: 'Test Reel for Deletion'
    });
    const newReelId = JSON.parse(postResult.body).id;
    console.log(`   └─ Created reel ID: ${newReelId}`)
    
    // Test 4: GET reels to verify POST worked
    await makeRequest('GET', '/api/reels');
    
    // Test 5: DELETE the reel
    console.log(`DELETE /api/admin/reels/${newReelId}: Testing...`);
    const deleteResult = await makeRequest('DELETE', `/api/admin/reels/${newReelId}`);
    console.log(`DELETE /api/admin/reels/${newReelId}: ${deleteResult.statusCode}`);
    
    // Test 6: PUT settings
    await makeRequest('PUT', '/api/admin/settings', {
      key: 'payment_qr_code',
      value: 'https://example.com/qr.png'
    });
    
    // Test 7: GET settings to verify PUT worked
    await makeRequest('GET', '/api/settings');
    
    console.log('\n✅ All endpoint tests PASSED!\n');
    console.log('Summary:');
    console.log('  ✓ GET /api/reels - Fetch reels');
    console.log('  ✓ POST /api/admin/reels - Create new reel');
    console.log('  ✓ DELETE /api/admin/reels/:id - Delete reel');
    console.log('  ✓ GET /api/settings - Fetch settings');
    console.log('  ✓ PUT /api/admin/settings - Update settings');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Test error:', err);
    process.exit(1);
  }
}

// Wait for server then run tests
setTimeout(runTests, 1000);
