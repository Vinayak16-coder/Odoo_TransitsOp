import fetch from 'node-fetch';

async function main() {
  const baseUrl = 'http://localhost:4000/api';

  // 1. Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fleet@transitops.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Create Vehicle
  console.log('\n--- 1. Create Vehicle ---');
  const v1 = await fetch(`${baseUrl}/vehicles`, {
    method: 'POST', headers,
    body: JSON.stringify({ regNo: 'TEST-V-001', nameModel: 'Test Van', type: 'VAN', capacityKg: 1000, acquisitionCost: 20000 })
  });
  console.log('Status:', v1.status, await v1.json());

  // 3. Duplicate regNo
  console.log('\n--- 2. Duplicate regNo ---');
  const v2 = await fetch(`${baseUrl}/vehicles`, {
    method: 'POST', headers,
    body: JSON.stringify({ regNo: 'TEST-V-001', nameModel: 'Dup', type: 'VAN', capacityKg: 1000, acquisitionCost: 20000 })
  });
  console.log('Status:', v2.status, await v2.json());

  // 4. Create Driver (Valid)
  console.log('\n--- 3. Create Valid Driver ---');
  const d1 = await fetch(`${baseUrl}/drivers`, {
    method: 'POST', headers,
    body: JSON.stringify({ name: 'Valid Driver', licenseNo: 'TEST-DL-001', licenseCategory: 'LMV', licenseExpiry: '2030-01-01T00:00:00.000Z', contact: '111' })
  });
  console.log('Status:', d1.status, await d1.json());

  // 5. Create Driver (Expired)
  console.log('\n--- 4. Create Expired Driver ---');
  const d2 = await fetch(`${baseUrl}/drivers`, {
    method: 'POST', headers,
    body: JSON.stringify({ name: 'Expired Driver', licenseNo: 'TEST-DL-002', licenseCategory: 'HMV', licenseExpiry: '2020-01-01T00:00:00.000Z', contact: '222' })
  });
  console.log('Status:', d2.status, await d2.json());

  // 6. Get Available Drivers
  console.log('\n--- 5. Get Available Drivers ---');
  const drvQuery = await fetch(`${baseUrl}/drivers?status=AVAILABLE`, { headers });
  const drvData = await drvQuery.json();
  const drivers = drvData.data || [];
  
  const hasValid = drivers.some((d: any) => d.licenseNo === 'TEST-DL-001');
  const hasExpired = drivers.some((d: any) => d.licenseNo === 'TEST-DL-002');
  console.log(`Has Valid Driver: ${hasValid}`);
  console.log(`Has Expired Driver: ${hasExpired}`);
}

main().catch(console.error);
