const questions = [
  {
    id: 1,
    question: "Qual dessas não é uma linguagem de programação?",
    options: ["A) Python", "B) HTML", "C) Java", "D) C++"],
    correctAnswerIndex: 1, // B) HTML
    difficultyStr: "Fácil",
    points: 5
  },
  {
    id: 2,
    question: "O que significa a sigla CSS?",
    options: ["A) Cascading Style Sheets", "B) Computer Style Symbols", "C) Creative Style System", "D) Cascading Simple Sheets"],
    correctAnswerIndex: 0, // A) Cascading Style Sheets
    difficultyStr: "Fácil",
    points: 5
  },
  {
    id: 3,
    question: "Em Javascript, qual palavra-chave é usada para declarar uma variável que NÃO pode ser reatribuída?",
    options: ["A) var", "B) let", "C) const", "D) static"],
    correctAnswerIndex: 2, // C) const
    difficultyStr: "Média",
    points: 10
  },
  {
    id: 4,
    question: "Qual padrão de design garante a criação de apenas uma instância de uma classe?",
    options: ["A) Factory", "B) Observer", "C) Decorator", "D) Singleton"],
    correctAnswerIndex: 3, // D) Singleton
    difficultyStr: "Difícil",
    points: 20
  },
  {
    id: 5,
    question: "Qual comando Git é usado para salvar as alterações no repositório local?",
    options: ["A) git push", "B) git commit", "C) git add", "D) git save"],
    correctAnswerIndex: 1, // B) git commit
    difficultyStr: "Média",
    points: 10
  }
];

module.exports = questions;
