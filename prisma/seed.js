/**
 * prisma/seed.js
 *
 * Script de seed para popular o banco com dados de exemplo:
 * - Professores
 * - Turmas
 * - Alunos (cada aluno vinculado a uma turma)
 * - Chamadas (registro de presença/ausência em datas específicas)
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o seed...");

  // 1) Limpar tabelas (opcional, se quiser sempre recomeçar do zero)
  //    ATENÇÃO: em produção, use com cuidado; aqui é só para ambiente de dev/teste.
  await prisma.chamada.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.professor.deleteMany();

  // 2) Criar Professores
  console.log("Criando professores...");
  const professoresData = [
    {
      nome: "João da Silva",
      email: "joao.silva@example.com",
      telefone: "(11) 99999-0001",
    },
    {
      nome: "Maria Oliveira",
      email: "maria.oliveira@example.com",
      telefone: "(11) 98888-0002",
    },
    {
      nome: "Carlos Pereira",
      email: "carlos.pereira@example.com",
      telefone: "(11) 97777-0003",
    },
  ];
  const professores = [];
  for (const p of professoresData) {
    const prof = await prisma.professor.create({ data: p });
    professores.push(prof);
  }

  // 3) Criar Turmas (cada turma associada a um professor)
  console.log("Criando turmas...");
  const turmasData = [
    {
      nome: "Turma A",
      descricao: "Turma de Crianças - Manhã",
      professorId: professores[0].id,
    },
    {
      nome: "Turma B",
      descricao: "Turma de Adolescentes - Tarde",
      professorId: professores[1].id,
    },
    {
      nome: "Turma C",
      descricao: "Turma de Jovens - Noite",
      professorId: professores[2].id,
    },
  ];
  const turmas = [];
  for (const t of turmasData) {
    const turma = await prisma.turma.create({ data: t });
    turmas.push(turma);
  }

  // 4) Criar Alunos (vinculados a cada turma)
  console.log("Criando alunos...");
  const alunosData = [
    // Alunos da Turma A
    {
      nome: "Alice Souza",
      dataNascimento: new Date("2018-05-10"),
      email: "alice.souza@example.com",
      telefone: "(11) 91234-0001",
      turmaId: turmas[0].id,
    },
    {
      nome: "Bruno Costa",
      dataNascimento: new Date("2017-08-22"),
      email: "bruno.costa@example.com",
      telefone: "(11) 91234-0002",
      turmaId: turmas[0].id,
    },
    {
      nome: "Carla Santos",
      dataNascimento: new Date("2019-02-15"),
      email: "carla.santos@example.com",
      telefone: "(11) 91234-0003",
      turmaId: turmas[0].id,
    },

    // Alunos da Turma B
    {
      nome: "Daniel Lima",
      dataNascimento: new Date("2008-11-05"),
      email: "daniel.lima@example.com",
      telefone: "(11) 92345-0004",
      turmaId: turmas[1].id,
    },
    {
      nome: "Eduarda Ferreira",
      dataNascimento: new Date("2009-03-18"),
      email: "eduarda.ferreira@example.com",
      telefone: "(11) 92345-0005",
      turmaId: turmas[1].id,
    },
    {
      nome: "Felipe Gomes",
      dataNascimento: new Date("2008-07-30"),
      email: "felipe.gomes@example.com",
      telefone: "(11) 92345-0006",
      turmaId: turmas[1].id,
    },

    // Alunos da Turma C
    {
      nome: "Gabriela Rocha",
      dataNascimento: new Date("2003-12-12"),
      email: "gabriela.rocha@example.com",
      telefone: "(11) 93456-0007",
      turmaId: turmas[2].id,
    },
    {
      nome: "Henrique Alves",
      dataNascimento: new Date("2004-09-09"),
      email: "henrique.alves@example.com",
      telefone: "(11) 93456-0008",
      turmaId: turmas[2].id,
    },
    {
      nome: "Isabela Mendes",
      dataNascimento: new Date("2003-04-25"),
      email: "isabela.mendes@example.com",
      telefone: "(11) 93456-0009",
      turmaId: turmas[2].id,
    },
  ];
  const alunos = [];
  for (const a of alunosData) {
    const aluno = await prisma.aluno.create({ data: a });
    alunos.push(aluno);
  }

  // 5) Criar Chamadas (vários dias e marcar alguns presentes/ausentes)
  console.log("Criando chamadas...");
  // Definimos manualmente algumas datas de chamada
  const datas = [
    new Date(), // hoje
    new Date(new Date().setDate(new Date().getDate() - 1)), // ontem
    new Date(new Date().setDate(new Date().getDate() - 2)), // anteontem
  ];

  // Para cada data e cada turma, vamos marcar presença para metade dos alunos
  for (const data of datas) {
    for (const turma of turmas) {
      // Buscar alunos que pertencem a esta turma
      const alunosDaTurma = alunos.filter((a) => a.turmaId === turma.id);
      for (let i = 0; i < alunosDaTurma.length; i++) {
        const aluno = alunosDaTurma[i];
        // Alternar presente/ausente: ex.: pares presentes, ímpares ausentes
        const statusPresenca = i % 2 === 0;
        await prisma.chamada.create({
          data: {
            data: data, // data exata (DateTime); Prisma salvará com horário da meia-noite
            status: statusPresenca, // true = presente, false = ausente
            alunoId: aluno.id,
            turmaId: turma.id,
          },
        });
      }
    }
  }

  console.log("Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
