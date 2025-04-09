
const concurrently = require('concurrently');

concurrently([
  { 
    command: 'cd server && npm install && npm run dev',
    name: 'BACKEND',
    prefixColor: 'blue'
  },
  { 
    command: 'npm run dev',
    name: 'FRONTEND',
    prefixColor: 'green'
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
  restartDelay: 1000,
}).then(
  () => console.log('All processes exited with success'),
  (error) => console.error('One or more processes failed', error)
);
