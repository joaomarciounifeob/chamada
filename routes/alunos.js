// routes/alunos.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. GET /alunos
router.get("/", async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany({
      orderBy: { nome: "asc" },
      include: {
        // incluir dados da turma para mostrar ao listar
        turma: {
          select: { nome: true },
        },
      },
    });
    return res.render("alunos/index", { alunos });
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return res.sendStatus(500);
  }
});

// 2. GET /alunos/novo
router.get("/novo", async (req, res) => {
  try {
    const turmas = await prisma.turma.findMany({ orderBy: { nome: "asc" } });
    return res.render("alunos/form", { aluno: {}, turmas });
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    return res.sendStatus(500);
  }
});

// 3. POST /alunos/novo
router.post("/novo", async (req, res) => {
  const { nome, dataNascimento, email, telefone, turmaId } = req.body;
  try {
    await prisma.aluno.create({
      data: {
        nome,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        email,
        telefone,
        turmaId: parseInt(turmaId),
      },
    });
    return res.redirect("/alunos");
  } catch (error) {
    console.error("Erro ao criar aluno:", error);
    return res.sendStatus(500);
  }
});

// 4. GET /alunos/editar/:id
router.get("/editar/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [aluno, turmas] = await Promise.all([
      prisma.aluno.findUnique({ where: { id } }),
      prisma.turma.findMany({ orderBy: { nome: "asc" } }),
    ]);
    if (!aluno) {
      return res.status(404).send("Aluno não encontrado");
    }
    return res.render("alunos/form", { aluno, turmas });
  } catch (error) {
    console.error("Erro ao buscar aluno ou turmas:", error);
    return res.sendStatus(500);
  }
});

// 5. POST /alunos/editar/:id
router.post("/editar/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, dataNascimento, email, telefone, turmaId } = req.body;
  try {
    await prisma.aluno.update({
      where: { id },
      data: {
        nome,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        email,
        telefone,
        turmaId: parseInt(turmaId),
      },
    });
    return res.redirect("/alunos");
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    return res.sendStatus(500);
  }
});

// 6. POST /alunos/deletar/:id
router.post("/deletar/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.aluno.delete({ where: { id } });
    return res.redirect("/alunos");
  } catch (error) {
    console.error("Erro ao deletar aluno:", error);
    return res.sendStatus(500);
  }
});

module.exports = router;
