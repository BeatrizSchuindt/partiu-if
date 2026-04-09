export type UserRole = 'monitor' | 'coordenacao';

export interface Usuario {
  readonly uid: string;
  readonly email: string;
  readonly role: UserRole;
}

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

export interface PresencaDoc {
  readonly id: string;
  readonly data: string;
  readonly turmaId: string;
  readonly chamada: '1' | '2' | '3';
  readonly lista: Record<string, 'P' | 'F'>;
  readonly atualizadoEm: string;
}