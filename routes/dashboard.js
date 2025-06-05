// routes/dashboard.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1) GET /dashboard → apenas renderiza o template sem dados
router.get("/", (req, res) => {
  return res.render("dashboard");
});

// 2) GET /dashboard/data → devolve os dados em JSON
router.get("/data", async (req, res) => {
  try {
    // 1) Contagens gerais
    const totalTurmas = await prisma.turma.count();
    const totalProfessores = await prisma.professor.count();
    const totalAlunos = await prisma.aluno.count();

    // 2) Chamadas no mês atual
    const hoje = new Date();
    const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaDoMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Em vez de count, agrupe por data para contar dias distintos
    const chamadasAgrupadas = await prisma.chamada.groupBy({
      by: ["data"],
      where: {
        data: { gte: primeiroDiaDoMes, lte: ultimoDiaDoMes },
      },
    });
    // o número de elementos em chamadasAgrupadas é a quantidade de dias em que houve chamada
    const totalChamadasMes = chamadasAgrupadas.length;

    // 3) Para cada turma, calcular % de presença
    const turmas = await prisma.turma.findMany({
      select: { id: true, nome: true },
    });
    const presencaData = [];

    for (const t of turmas) {
      const totalChamadasTurma = await prisma.chamada.count({
        where: { turmaId: t.id },
      });
      const totalPresentes = await prisma.chamada.count({
        where: { turmaId: t.id, status: true },
      });
      const porcentagem =
        totalChamadasTurma > 0
          ? (totalPresentes / totalChamadasTurma) * 100
          : 0;
      presencaData.push({
        nome: t.nome,
        percent: parseFloat(porcentagem.toFixed(1)),
      });
    }

    // 4) Retorna tudo em JSON
    return res.json({
      totalTurmas,
      totalProfessores,
      totalAlunos,
      totalChamadasMes,
      presencaData,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;
