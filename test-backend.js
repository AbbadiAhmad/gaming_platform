import fetch from 'node-fetch';

// Get token first (you'll need to replace with actual admin credentials)
const testBackend = async () => {
  try {
    // Test 1: Check if backend is running
    console.log('1. Testing if backend is running...');
    const healthCheck = await fetch('http://localhost:3000/api/groups');
    console.log('   Status:', healthCheck.status);
    const groups = await healthCheck.json();
    console.log('   Groups:', groups);

    // Test 2: Try to create a group (will fail without auth)
    console.log('\n2. Testing group creation (no auth - should fail)...');
    const noAuthResponse = await fetch('http://localhost:3000/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Group',
        display_order: 1,
        show_on_dashboard: 1
      })
    });
    console.log('   Status:', noAuthResponse.status);
    const noAuthData = await noAuthResponse.json();
    console.log('   Response:', noAuthData);

  } catch (error) {
    console.error('Error:', error.message);
  }
};

testBackend();
