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

  // 1. Create Vehicle
  const v1Res = await fetch(`${baseUrl}/vehicles`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({ regNo: 'OPS-V-' + Date.now(), nameModel: 'Ops Van', type: 'VAN', capacityKg: 1000, acquisitionCost: 20000 })
  });
  const v1 = (await v1Res.json()).data;
  console.log('Vehicle Created:', v1.id);

  // 2. Create Driver
  const d1Res = await fetch(`${baseUrl}/drivers`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({ name: 'Ops Driver', licenseNo: 'OPS-DL-' + Date.now(), licenseCategory: 'LMV', licenseExpiry: '2030-01-01T00:00:00.000Z', contact: '123' })
  });
  const d1 = (await d1Res.json()).data;
  console.log('Driver Created:', d1.id);

  // 3. Create Trip (Over Capacity)
  const t1Res = await fetch(`${baseUrl}/trips`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({ source: 'A', destination: 'B', cargoWeightKg: 1500, plannedDistanceKm: 100 })
  });
  const t1 = (await t1Res.json()).data;
  
  // 4. Assign Over Capacity
  console.log('\n--- Assign Over Capacity ---');
  const a1Res = await fetch(`${baseUrl}/trips/${t1.id}/assign`, {
    method: 'PATCH', headers: authHeaders,
    body: JSON.stringify({ vehicleId: v1.id, driverId: d1.id })
  });
  console.log('Status:', a1Res.status, await a1Res.json());

  // 5. Create Trip (Valid)
  const t2Res = await fetch(`${baseUrl}/trips`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({ source: 'A', destination: 'B', cargoWeightKg: 800, plannedDistanceKm: 100 })
  });
  const t2 = (await t2Res.json()).data;

  // 6. Assign Valid
  console.log('\n--- Assign Valid Trip ---');
  const a2Res = await fetch(`${baseUrl}/trips/${t2.id}/assign`, {
    method: 'PATCH', headers: authHeaders,
    body: JSON.stringify({ vehicleId: v1.id, driverId: d1.id })
  });
  console.log('Status:', a2Res.status, await a2Res.json());

  // 7. Dispatch Trip
  console.log('\n--- Dispatch Trip ---');
  const dRes = await fetch(`${baseUrl}/trips/${t2.id}/dispatch`, {
    method: 'PATCH', headers: authHeaders,
  });
  console.log('Status:', dRes.status, await dRes.json());

  // 8. Maintenance on ON_TRIP Vehicle
  console.log('\n--- Maintenance on ON_TRIP Vehicle ---');
  const mRes = await fetch(`${baseUrl}/maintenance`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({ vehicleId: v1.id, serviceType: 'Repair', cost: 500, serviceDate: '2023-01-01T00:00:00.000Z' })
  });
  console.log('Status:', mRes.status, await mRes.json());

  // 9. Complete Trip
  console.log('\n--- Complete Trip ---');
  const cRes = await fetch(`${baseUrl}/trips/${t2.id}/complete`, {
    method: 'PATCH', headers: authHeaders,
    body: JSON.stringify({ finalOdometerKm: 100, fuelConsumedLiters: 10, fuelCost: 50 })
  });
  console.log('Status:', cRes.status, await cRes.json());

  // 10. Check if FuelLog was auto-created
  console.log('\n--- Fetch FuelLogs ---');
  const fRes = await fetch(`${baseUrl}/fuel?tripId=${t2.id}`, { headers: authHeaders });
  const fLogs = (await fRes.json()).data;
  console.log('FuelLogs linked to Trip:', fLogs.length, 'Cost:', fLogs[0]?.cost);
  
  // 11. Check Vehicle avgCostPerKm update
  console.log('\n--- Fetch Vehicle avgCostPerKm ---');
  const vCheck = await fetch(`${baseUrl}/vehicles/${v1.id}`, { headers: authHeaders });
  console.log('Vehicle avgCostPerKm:', (await vCheck.json()).data.avgCostPerKm);
}

main().catch(console.error);
