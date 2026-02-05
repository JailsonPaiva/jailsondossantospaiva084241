import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { TutorFacade } from '../../features/tutores/facades/tutor.facade';
import { Tutor } from '../../core/models/tutor.model';

@Component({
  selector: 'app-tutores',
  standalone: true,
  imports: [AsyncPipe, UpperCasePipe, FormsModule, LucideAngularModule],
  templateUrl: './tutores.component.html',
  styleUrl: './tutores.component.css',
})
export class TutoresComponent implements OnInit, OnDestroy {
  private readonly tutorFacade = inject(TutorFacade);
  private readonly destroy$ = new Subject<void>();

  readonly searchInput = signal('');
  readonly list = signal<Tutor[]>([]);
  readonly list$ = this.tutorFacade.list$;
  readonly loading$ = this.tutorFacade.loading$;
  readonly error$ = this.tutorFacade.error$;

  ngOnInit(): void {
    this.tutorFacade.list$.pipe(takeUntil(this.destroy$)).subscribe((items) => this.list.set(items));
    this.tutorFacade.loadTutores();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    this.tutorFacade.search(this.searchInput());
  }

  trackByTutorId(_index: number, tutor: Tutor): number {
    return tutor.id;
  }
}
