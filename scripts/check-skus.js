const fs = require('fs');
const products = JSON.parse(fs.readFileSync('d:/ARTYX DIGITAL/lp-new-version/app/data/products.json', 'utf8'));

for (const p of products) {
  if ([1, 2, 3, 21, 45, 46].includes(p.id)) {
    console.log(`products.json -> id: ${p.id}, sku: ${p.sku}, name: ${p.name}`);
  }
}
