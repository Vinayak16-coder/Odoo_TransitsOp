import fetch from 'node-fetch';

async function main() {
  const loginUrl = 'http://localhost:4000/api/auth/login';
  
  const roles = [
    { name: 'Fleet Manager', email: 'fleet@transitops.com' },
    { name: 'Driver', email: 'driver@transitops.com' },
    { name: 'Safety Officer', email: 'safety@transitops.com' },
    { name: 'Financial Analyst', email: 'finance@transitops.com' },
  ];

  for (const role of roles) {
    console.log(`\nTesting login for ${role.name} (${role.email})...`);
    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: role.email, password: 'password123' }),
      });
      const data = await res.json();
      console.log(`Status:`, res.status);
      if (res.status === 200) {
        console.log(`Token present:`, !!data.data?.accessToken);
        console.log(`User object:`, data.data?.user?.email, data.data?.user?.role);
      } else {
        console.log(`Error:`, data.error?.message);
      }
    } catch (e) {
      console.log(`Error connecting to server`);
    }
  }
}

main().catch(console.error);
