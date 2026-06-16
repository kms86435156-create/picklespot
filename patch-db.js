const fs = require('fs');
let code = fs.readFileSync('src/lib/db.ts', 'utf8');

code = code.replace(
  'let q = db!.from("venues").select("*");',
  'let q = db!.from("venues").select("*").eq("is_verified", true);'
);

code = code.replace(
  'const { data } = await db!.from("venues").select("*").eq("is_featured", true)',
  'const { data } = await db!.from("venues").select("*").eq("is_featured", true).eq("is_verified", true)'
);

code = code.replace(
  'let q = db!.from("tournaments").select("*");',
  'let q = db!.from("tournaments").select("*").eq("is_verified", true);'
);

code = code.replace(
  'const { data } = await db!.from("tournaments").select("*").eq("is_featured", true)',
  'const { data } = await db!.from("tournaments").select("*").eq("is_featured", true).eq("is_verified", true)'
);

fs.writeFileSync('src/lib/db.ts', code);
console.log('db.ts updated successfully!');
