import fetch from 'node-fetch';

async function main() {
  const baseUrl = 'http://localhost:4000/api';
  const headers = { 'Content-Type': 'application/json' };

  // Login
  const login = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST', headers,
    body: JSON.stringify({ email: 'fleet@transitops.com', password: 'password123' })
  });
  const token = (await login.json()).data.accessToken;
  const authHeaders = { ...headers, Authorization: `Bearer ${token}` };

  // 1. Dashboard
  console.log('\n--- Dashboard ---');
  const dRes = await fetch(`${baseUrl}/analytics/dashboard`, { headers: authHeaders });
  console.log(await dRes.json());

  // 2. KPIs
  console.log('\n--- KPIs ---');
  const kRes = await fetch(`${baseUrl}/analytics/kpis`, { headers: authHeaders });
  console.log(await kRes.json());

  // 3. Top Costliest Vehicles
  console.log('\n--- Top Costliest Vehicles ---');
  const tcvRes = await fetch(`${baseUrl}/analytics/top-costliest-vehicles`, { headers: authHeaders });
  console.log(await tcvRes.json());

  // 4. Monthly Revenue
  console.log('\n--- Monthly Revenue ---');
  const mrRes = await fetch(`${baseUrl}/analytics/monthly-revenue`, { headers: authHeaders });
  console.log(await mrRes.json());

  // 5. Permissions Matrix
  console.log('\n--- Permissions Matrix ---');
  const pmRes = await fetch(`${baseUrl}/users/permissions-matrix`, { headers: authHeaders });
  const pmData = await pmRes.json();
  console.log('Driver Role -> Trips:', pmData.data.DRIVER.Trips);

  // 6. CSV Export Stream Check
  console.log('\n--- CSV Export Streaming Check ---');
  const csvRes = await fetch(`${baseUrl}/analytics/export/vehicles`, { headers: authHeaders });
  console.log('Content-Type:', csvRes.headers.get('content-type'));
  console.log('Content-Disposition:', csvRes.headers.get('content-disposition'));
  
  const text = await csvRes.text();
  console.log('CSV Lines Count:', text.split('\n').length - 1);
  console.log('CSV Header:', text.split('\n')[0]);
}

main().catch(console.error);
