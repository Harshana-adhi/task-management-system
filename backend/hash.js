const bcrypt = require('bcrypt');

async function generateHash() {
  const hash = await bcrypt.hash('baary@123', 10);
  console.log(hash);
}

async function generateHash() {
  const hash = await bcrypt.hash('collab2@123', 10);
  console.log(hash);
}

generateHash();