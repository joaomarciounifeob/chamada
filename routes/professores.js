// routes/professores.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. GET /professores
//    Lista todos os professores
router.get("/", async (req, res) => {
  try {
    const professores = await prisma.professor.findMany({
      orderBy: { nome: "asc" },
    });
    res.render("professores/index", { professores });
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    return res.sendStatus(500);
  }
});

// 2. GET /professores/novo
//    Exibe formulário para criar novo professor
router.get("/novo", (req, res) => {
  res.render("professores/form", { professor: {} });
});

// 3. POST /professores/novo
//    Cria um novo professor no banco
router.post("/novo", async (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    await prisma.professor.create({
      data: { nome, email, telefone },
    });
    return res.redirect("/professores");
  } catch (error) {
    console.error("Erro ao criar professor:", error);
    return res.sendStatus(500);
  }
});

// 4. GET /professores/editar/:id
//    Carrega dados para edição de um professor existente
router.get("/editar/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const professor = await prisma.professor.findUnique({ where: { id } });
    if (!professor) {
      return res.status(404).send("Professor não encontrado");
    }
    return res.render("professores/form", { professor });
  } catch (error) {
    console.error("Erro ao buscar professor:", error);
    return res.sendStatus(500);
  }
});

// 5. POST /professores/editar/:id
//    Atualiza os dados do professor
router.post("/editar/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, email, telefone } = req.body;
  try {
    await prisma.professor.update({
      where: { id },
      data: { nome, email, telefone },
    });
    return res.redirect("/professores");
  } catch (error) {
    console.error("Erro ao atualizar professor:", error);
    return res.sendStatus(500);
  }
});

// 6. POST /professores/deletar/:id
//    Exclui o professor (via POST, para segurança)
router.post("/deletar/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.professor.delete({ where: { id } });
    return res.redirect("/professores");
  } catch (error) {
    console.error("Erro ao deletar professor:", error);
    return res.sendStatus(500);
  }
});

module.exports = router;
