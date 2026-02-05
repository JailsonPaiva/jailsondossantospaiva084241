import { Pipe, PipeTransform } from '@angular/core';

/**
 * Aplica máscara de celular/fixo brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
 * Remove não dígitos antes de formatar.
 */
@Pipe({ name: 'telefoneMask', standalone: true })
export class TelefoneMaskPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value == null || value === '') return '';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length <= 2) {
      return digits.length ? `(${digits}` : '';
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
}
