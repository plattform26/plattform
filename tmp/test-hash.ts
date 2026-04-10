const bcrypt = require('bcryptjs');

async function test() {
  const password = 'Plattform2025';
  const rounds = 12;
  const hash = await bcrypt.hash(password, rounds);
  console.log('Hash generado:', hash);
  
  const isMatch = await bcrypt.compare(password, hash);
  console.log('¿Coincide con el mismo hash?:', isMatch);

  const testHashFromSeed = '$2a$12$6Nl8X4UeX8...' // I can't know this without querying DB
}

test();
