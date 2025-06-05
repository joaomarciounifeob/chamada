// index.js (CommonJS)
require("dotenv").config();
const express = require("express");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

// 5. Montar as rotas de Turmas
const turmasRouter = require("./routes/turmas.js");
app.use("/turmas", turmasRouter);

// 6. Montar as rotas de Professores
const professoresRouter = require("./routes/professores.js");
app.use("/professores", professoresRouter);

// 7. Montar as rotas de Alunos
const alunosRouter = require("./routes/alunos.js");
app.use("/alunos", alunosRouter);

// 8. Montar as rotas de Chamadas
const chamadasRouter = require("./routes/chamadas.js");
app.use("/chamada", chamadasRouter);

// NOVO: rota de dashboard
const dashboardRouter = require("./routes/dashboard");
app.use("/dashboard", dashboardRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
