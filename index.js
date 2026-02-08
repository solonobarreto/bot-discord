// Inicia o servidor HTTP (compartilhado)
const { startServer } = require('./message/server.js');
startServer();

// Importa e inicia todos os bots (eles se conectam automaticamente com seus tokens)
require('./message/npc/argenta.js');
require('./message/npc/nerwin.js');
require('./message/npc/irine.js');