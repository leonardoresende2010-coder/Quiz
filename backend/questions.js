const questions = [
  {
    id: 1,
    question: "De acordo com a PSI da 1pra1, qual é o prazo máximo para que usuários comuns alterem suas senhas?",
    options: [
      "30 dias",
      "45 dias",
      "60 dias",
      "90 dias"
    ],
    correctAnswerIndex: 1, // 45 dias
    difficultyStr: "Fácil",
    points: 5
  },
  {
    id: 2,
    question: "Segundo a PPDP da 1pra1, qual canal oficial deve ser utilizado pelos apostadores para exercer seus direitos de acesso, correção ou exclusão de dados pessoais?",
    options: [
      "RIPD",
      "ROPA",
      "DSAR",
      "ANPD"
    ],
    correctAnswerIndex: 2, // DSAR
    difficultyStr: "Média",
    points: 10
  },
  {
    id: 3,
    question: "Conforme a PSI da 1pra1, quem compõe a Equipe de Resposta a Incidentes (ETIR) e é responsável pela prevenção e recuperação de sistemas em caso de incidentes cibernéticos?",
    options: [
      "O DPO (Encarregado de Dados), que também cuida da interface com a ANPD",
      "O CISO (Gestor de Segurança), responsável por coordenar normas e auditorias",
      "A Alta Administração, que provê recursos e formaliza o comprometimento",
      "A ETIR, equipe específica para prevenção, tratamento de incidentes e recuperação"
    ],
    correctAnswerIndex: 3, // ETIR
    difficultyStr: "Difícil",
    points: 20
  }
];

module.exports = questions;
