export interface Aluno {
  readonly id: string;
  readonly nome: string;
  readonly ativo: boolean;
}

export interface Turma {
  readonly id: string;
  readonly nome: string;
  readonly alunos: Aluno[];
}

export interface Presenca {
  readonly alunoId: string;
  readonly status: 'P' | 'F'; // P = Presente, F = Falta
}