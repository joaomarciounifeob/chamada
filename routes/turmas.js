// routes/turmas.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. GET /turmas
//    Lista todas as turmas cadastradas (inclui dados do professor para exibir na tabela)
router.get("/", async (req, res) => {
  try {
    const turmas = await prisma.turma.findMany({
      orderBy: { nome: "asc" },
      include: {
        professor: {
          select: { nome: true },
        },
      },
    });
    return res.render("turmas/index", { turmas });
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    return res.sendStatus(500);
  }
});

// 2. GET /turmas/novo
//    Exibe formulário para criar nova turma, enviando lista de professores
router.get("/novo", async (req, res) => {
  try {
    const professores = await prisma.professor.findMany({
      orderBy: { nome: "asc" },
    });
    return res.render("turmas/form", { turma: {}, professores });
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    return res.sendStatus(500);
  }
});

// 3. POST /turmas/novo
//    Cria nova turma, salvando nome, descrição e professorId
router.post("/novo", async (req, res) => {
  const { nome, descricao, professorId } = req.body;
  try {
    await prisma.turma.create({
      data: {
        nome,
        descricao,
        professorId: parseInt(professorId),
      },
    });
    return res.redirect("/turmas");
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    return res.sendStatus(500);
  }
});

// 4. GET /turmas/editar/:id
//    Carrega dados para edição, incluindo turmas e lista de professores
router.get("/editar/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [turma, professores] = await Promise.all([
      prisma.turma.findUnique({ where: { id } }),
      prisma.professor.findMany({ orderBy: { nome: "asc" } }),
    ]);
    if (!turma) {
      return res.status(404).send("Turma não encontrada");
    }
    return res.render("turmas/form", { turma, professores });
  } catch (error) {
    console.error("Erro ao buscar turma ou professores:", error);
    return res.sendStatus(500);
  }
});

// 5. POST /turmas/editar/:id
//    Atualiza dados de uma turma existente
router.post("/editar/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, descricao, professorId } = req.body;
  try {
    await prisma.turma.update({
      where: { id },
      data: {
        nome,
        descricao,
        professorId: parseInt(professorId),
      },
    });
    return res.redirect("/turmas");
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);
    return res.sendStatus(500);
  }
});

// 6. POST /turmas/deletar/:id
//    Exclui uma turma
router.post("/deletar/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.turma.delete({ where: { id } });
    return res.redirect("/turmas");
  } catch (error) {
    console.error("Erro ao deletar turma:", error);
    return res.sendStatus(500);
  }
});

module.exports = router;
