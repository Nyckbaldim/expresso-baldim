import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { soDigitos } from './mascaras';

export function digitos(...quantidades: number[]): ValidatorFn {
  return (controle: AbstractControl): ValidationErrors | null => {
    const valor = String(controle.value ?? '');
    if (!valor) return null;
    return quantidades.includes(soDigitos(valor).length)
      ? null
      : { digitos: { esperado: quantidades } };
  };
}

export function dataNaoPassada(controle: AbstractControl): ValidationErrors | null {
  const valor = controle.value as string;
  if (!valor) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const [ano, mes, dia] = valor.split('-').map(Number);
  return new Date(ano, mes - 1, dia) < hoje ? { dataPassada: true } : null;
}