import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PetFacade } from './pet.facade';
import { PetService } from '../services/pet.service';
import { Pet } from '../../../core/models/pet.model';

describe('PetFacade', () => {
  let facade: PetFacade;
  let petServiceSpy: jasmine.SpyObj<PetService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPets: Pet[] = [
    { id: 1, nome: 'Rex', especie: 'Cão', raca: 'Labrador' },
    { id: 2, nome: 'Miau', especie: 'Gato', raca: 'Persa' },
  ];

  const mockPageResponse = {
    content: mockPets,
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
  };

  beforeEach(() => {
    petServiceSpy = jasmine.createSpyObj('PetService', ['getPets', 'getById', 'create', 'update', 'uploadPhoto']);
    petServiceSpy.getPets.and.returnValue(of(mockPageResponse));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        PetFacade,
        { provide: PetService, useValue: petServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    facade = TestBed.inject(PetFacade);
  });

  it('deve ser criado', () => {
    expect(facade).toBeTruthy();
  });

  it('deve emitir lista e total ao carregar pets', (done) => {
    const listValues: Pet[][] = [];
    const totalValues: number[] = [];

    facade.list$.subscribe((list) => listValues.push(list));
    facade.total$.subscribe((total) => totalValues.push(total));

    facade.loadPets();

    setTimeout(() => {
      expect(petServiceSpy.getPets).toHaveBeenCalledWith({
        page: 0,
        size: 10,
        nome: undefined,
      });
      expect(listValues.length).toBeGreaterThanOrEqual(1);
      expect(listValues[listValues.length - 1]).toEqual(mockPets);
      expect(totalValues[totalValues.length - 1]).toBe(2);
      done();
    }, 50);
  });

  it('deve chamar getPets com termo de busca ao usar search()', (done) => {
    facade.setSearchTerm('Rex');
    facade.search('Rex');

    setTimeout(() => {
      expect(petServiceSpy.getPets).toHaveBeenCalledWith({
        page: 0,
        size: 10,
        nome: 'Rex',
      });
      done();
    }, 50);
  });

  it('deve chamar getPets com página correta ao usar setPage()', (done) => {
    facade.setPage(1);

    setTimeout(() => {
      expect(petServiceSpy.getPets).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        nome: undefined,
      });
      done();
    }, 50);
  });

  it('deve expor totalPages calculado a partir do total', () => {
    facade.loadPets();
    expect(facade.totalPages).toBeGreaterThanOrEqual(1);
  });
});
