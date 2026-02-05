import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { PetsComponent } from './pets.component';
import { PetFacade } from '../../features/pets/facades/pet.facade';
import { Pet } from '../../core/models/pet.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PetsComponent', () => {
  let component: PetsComponent;
  let fixture: ComponentFixture<PetsComponent>;
  let listSubject: BehaviorSubject<Pet[]>;
  let totalSubject: BehaviorSubject<number>;
  let totalPagesSubject: BehaviorSubject<number>;
  let currentPageSubject: BehaviorSubject<number>;
  let loadPetsSpy: jasmine.Spy;

  const mockFacade = {
    list$: new BehaviorSubject<Pet[]>([]),
    loading$: new BehaviorSubject<boolean>(false),
    error$: new BehaviorSubject<string | null>(null),
    total$: new BehaviorSubject<number>(0),
    totalPages$: new BehaviorSubject<number>(1),
    currentPage$: new BehaviorSubject<number>(0),
    loadPets: () => {},
    search: (_nome: string) => {},
    setPage: (_page: number) => {},
  };

  beforeEach(async () => {
    listSubject = new BehaviorSubject<Pet[]>([]);
    totalSubject = new BehaviorSubject<number>(0);
    totalPagesSubject = new BehaviorSubject<number>(1);
    currentPageSubject = new BehaviorSubject<number>(0);
    (mockFacade as unknown as { list$: BehaviorSubject<Pet[]> }).list$ = listSubject;
    (mockFacade as unknown as { total$: BehaviorSubject<number> }).total$ = totalSubject;
    (mockFacade as unknown as { totalPages$: BehaviorSubject<number> }).totalPages$ = totalPagesSubject;
    (mockFacade as unknown as { currentPage$: BehaviorSubject<number> }).currentPage$ = currentPageSubject;
    loadPetsSpy = spyOn(mockFacade, 'loadPets');

    await TestBed.configureTestingModule({
      imports: [PetsComponent],
      providers: [{ provide: PetFacade, useValue: mockFacade }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar loadPets no init', () => {
    expect(loadPetsSpy).toHaveBeenCalled();
  });

  it('deve chamar facade.setPage ao goToPage com página 1-based', () => {
    totalPagesSubject.next(3);
    fixture.detectChanges();
    const setPageSpy = spyOn(mockFacade, 'setPage');
    component.goToPage(2);
    expect(setPageSpy).toHaveBeenCalledWith(1);
  });

  it('deve chamar facade.search ao onSearch com valor do input', () => {
    const searchSpy = spyOn(mockFacade, 'search');
    component.searchInput.set('Rex');
    component.onSearch();
    expect(searchSpy).toHaveBeenCalledWith('Rex');
  });

  it('deve usar totalPages vindo da facade (API total/pageCount)', () => {
    totalPagesSubject.next(3);
    fixture.detectChanges();
    expect(component.totalPages()).toBe(3);
  });
});
