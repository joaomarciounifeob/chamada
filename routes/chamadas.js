// routes/chamada.js
const express = require("express");
const router = express.Router();
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. GET /chamada
//    Exibe formulário para selecionar Turma e data da chamada
router.get("/", async (req, res) => {
  try {
    // 1. Recupera todas as turmas (ordenadas por nome)
    const turmas = await prisma.turma.findMany({
      orderBy: { nome: "asc" },
    });
    // 2. Renderiza view, enviando lista de turmas
    return res.render("chamada/select", { turmas });
  } catch (error) {
    console.error("Erro ao buscar turmas para chamada:", error);
    return res.sendStatus(500);
  }
});

// 2. POST /chamada
//    Recebe turmaId e data; lista alunos dessa turma para marcação de presença
router.post("/", async (req, res) => {
  const { turmaId, dataChamada } = req.body;
  try {
    // 1. Converter turmaId em inteiro
    const idTurma = parseInt(turmaId);

    // 2. Buscar todos os alunos vinculados a essa turma
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: idTurma },
      orderBy: { nome: "asc" },
    });

    // 3. Se não houver alunos, exibir mensagem
    if (alunos.length === 0) {
      return res.render("chamada/semAlunos", { turmaId: idTurma });
    }

    // 4. Para cada aluno, verificar se já existe chamada para (alunoId, turmaId, data)
    //    e trazer o status, para pré‐marcar no formulário de edição de chamada
    const dataIso = new Date(dataChamada);
    const chamadasExistentes = await prisma.chamada.findMany({
      where: {
        turmaId: idTurma,
        data: dataIso,
      },
      select: {
        alunoId: true,
        status: true,
      },
    });

    // 5. Criar um mapa para acesso rápido: chamadasMap[alunoId] = status
    const chamadasMap = {};
    chamadasExistentes.forEach((c) => {
      chamadasMap[c.alunoId] = c.status;
    });

    // 6. Renderiza a view de marcação, enviando alunos, turmaId e data
    return res.render("chamada/form", {
      turmaId: idTurma,
      dataChamada,
      alunos,
      chamadasMap,
    });
  } catch (error) {
    console.error("Erro ao preparar lista de alunos para chamada:", error);
    return res.sendStatus(500);
  }
});

// 3. POST /chamada/salvar
//    Recebe o formulário de presença/ausência e atualiza/cria registros de chamada
router.post("/salvar", async (req, res) => {
  const { turmaId, dataChamada } = req.body;
  // O body deverá conter, para cada aluno, um campo como `status_<alunoId>` = 'true' ou 'false'
  try {
    const idTurma = parseInt(turmaId);
    const dataIso = new Date(dataChamada);

    // 1. Buscar alunos dessa turma (apenas IDs)
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: idTurma },
      select: { id: true },
    });

    // 2. Para cada aluno, determinar o valor do status vindo do req.body
    for (const aluno of alunos) {
      const campo = `status_${aluno.id}`; // por exemplo: 'status_5'
      const valor = req.body[campo] === "on" ? true : false;
      // 3. Usar upsert para criar ou atualizar o registro de chamada
      await prisma.chamada.upsert({
        where: {
          // Chave composta: alunoId, turmaId, data
          alunoId_turmaId_data: {
            alunoId: aluno.id,
            turmaId: idTurma,
            data: dataIso,
          },
        },
        update: { status: valor },
        create: {
          alunoId: aluno.id,
          turmaId: idTurma,
          data: dataIso,
          status: valor,
        },
      });
    }

    // 4. Após gravar todas as entradas, redirecionar (ex.: para lista de chamadas ou home)
    return res.redirect("/chamada/confirmacao");
  } catch (error) {
    // Se a chave composta (`alunoId_turmaId_data`) não existir no prisma do seu projeto,
    // volte ao schema.prisma e confira que incluiu:
    // @@unique([alunoId, turmaId, data]) no modelo Chamada
    console.error("Erro ao salvar chamada:", error);
    return res.sendStatus(500);
  }
});

// 4. GET /chamada/confirmacao
//    Exibe uma tela simples confirmando que a chamada foi salva com sucesso
router.get("/confirmacao", (req, res) => {
  return res.render("chamada/confirmacao");
});

module.exports = router;
