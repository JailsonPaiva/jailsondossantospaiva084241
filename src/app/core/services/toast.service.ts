import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

const AUTO_DISMISS_MS = 5000;
const DEFAULT_STATE: ToastState = { message: '', type: 'info', visible: false };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly stateSignal = signal<ToastState>(DEFAULT_STATE);
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  readonly state = this.stateSignal.asReadonly();
  readonly visible = computed(() => this.stateSignal().visible);
  readonly message = computed(() => this.stateSignal().message);
  readonly type = computed(() => this.stateSignal().type);

  showError(message: string): void {
    this.show(message, 'error');
  }

  showSuccess(message: string): void {
    this.show(message, 'success');
  }

  show(message: string, type: ToastType = 'info'): void {
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    this.stateSignal.set({ message, type, visible: true });
    this.dismissTimer = setTimeout(() => this.dismiss(), AUTO_DISMISS_MS);
  }

  dismiss(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    this.stateSignal.set({ ...DEFAULT_STATE });
  }
}
