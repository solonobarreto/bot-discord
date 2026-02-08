const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;  // Render define PORT automaticamente

app.get('/', (req, res) => {
    res.send('Bot está online!');  // Resposta genérica; personalize se necessário
});

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
};

module.exports = { startServer };