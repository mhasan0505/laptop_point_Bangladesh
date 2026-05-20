fetch('http://localhost:3000/api/admin/products', {
  headers: {
    'Cookie': 'admin_authenticated=true'
  }
}).then(r => r.json()).then(console.log).catch(console.error);
