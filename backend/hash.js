const bcrypt = require('bcryptjs');

bcrypt.hash('Admin@123', 10)
  .then(hash => {
    console.log(hash);
  });

bcrypt.hash('ProjectManager@123', 10)
  .then(hash => {
    console.log(hash);
  });

bcrypt.hash('Collaborator@123', 10)
  .then(hash => {
    console.log(hash);
  });