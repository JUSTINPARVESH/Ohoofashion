const fs = require('fs');
const path = require('path');

// Test video upload
async function testVideoUpload() {
  try {
    // Create a small test video file (base64 encoded)
    const testVideoBase64 = 'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAGF21kYXQ=';

    const response = await fetch('http://localhost:5001/api/admin/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth but we can see if the upload logic works
      },
      body: JSON.stringify({
        image: testVideoBase64,
        fileType: 'video/mp4'
      })
    });

    const result = await response.json();
    console.log('Upload result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVideoUpload();