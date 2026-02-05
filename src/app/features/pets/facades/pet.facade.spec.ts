import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PetFacade } from './pet.facade';
import { PetService } from '../services/pet.service';
import { tutoresService } from '../../tutores/services/tutor.service';
import { Pet } from '../../../core/models/pet.model';

describe('PetFacade', () => {
  let facade: PetFacade;
  let petServiceSpy: jasmine.SpyObj<PetService>;
  let tutorServiceSpy: jasmine.SpyObj<tutoresService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPets: Pet[] = [
    { id: 1, nome: 'Rex', especie: 'Cão', raca: 'Labrador' },
    { id: 2, nome: 'Miau', especie: 'Gato', raca: 'Persa' },
  ];

  const mockPageResponse = {
    content: mockPets,
    total: 2,
    pageCount: 1,
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
  };

  beforeEach(() => {
    petServiceSpy = jasmine.createSpyObj('PetService', ['getPets', 'getById', 'create', 'update', 'uploadPhoto']);
    petServiceSpy.getPets.and.returnValue(of(mockPageResponse));
    tutorServiceSpy = jasmine.createSpyObj('tutoresService', ['linkPet', 'getById']);
    tutorServiceSpy.linkPet.and.returnValue(of(undefined));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        PetFacade,
        { provide: PetService, useValue: petServiceSpy },
        { provide: tutoresService, useValue: tutorServiceSpy },
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

  it('deve expor totalPages usando pageCount da API', () => {
    facade.loadPets();
    expect(facade.totalPages).toBe(1);
  });

  it('deve usar total e pageCount da API quando fornecidos', (done) => {
    const responseComTotalPageCount = {
      content: mockPets,
      total: 25,
      pageCount: 3,
    };
    petServiceSpy.getPets.and.returnValue(of(responseComTotalPageCount));
    const totalValues: number[] = [];
    const pageCountValues: number[] = [];
    facade.total$.subscribe((v) => totalValues.push(v));
    facade.pageCount$.subscribe((v) => pageCountValues.push(v));
    facade.loadPets();
    setTimeout(() => {
      expect(totalValues[totalValues.length - 1]).toBe(25);
      expect(pageCountValues[pageCountValues.length - 1]).toBe(3);
      expect(facade.totalPages).toBe(3);
      done();
    }, 50);
  });
});
