const projectId = 'h13hv5jw';
const dataset = 'production';
const url = `https://${projectId}.api.sanity.io/v2025-01-01/data/query/${dataset}?query=*[_type=='product']{_id,name}`;
fetch(url).then(r=>r.json()).then(d=>console.log(JSON.stringify(d, null, 2))).catch(console.error);
