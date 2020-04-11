import {Ingredient} from '../shared/ingredient.model';
import {Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {take} from 'rxjs/operators';

@Injectable()
export class ShoppingListService {
  ingredientsChanged = new Subject<Ingredient[]>();
  startedEditing = new Subject<number>();
  private ingredients: Ingredient[] = [];

  constructor(private http: HttpClient) {
  }

  getIngredients() {
    return this.fetchIngredientsFromStorage();
  }

  getIngredient(index: number) {
    return this.ingredients[index];
  }

  addIngredient(ingredient: Ingredient) {
    this.saveIngredientToStorage(ingredient, null);
  }

  addIngredients(ingredients: Ingredient[]) {
    for (let i = 0; i < ingredients.length; i++){
      this.saveIngredientToStorage(ingredients[i], i);
    }
  }

  updateIngredient(index: number, newIngredient: Ingredient) {
    this.saveIngredientToStorage(newIngredient, index);
  }

  deleteIngredient(index: number) {
    this.removeIngredientFromStorage(this.ingredients[index], index);
  }

  private fetchIngredientsFromStorage() {
    this.http.get<RsIngredient[]>(
      environment.serverUrl + '/shoppinglist'
    ).pipe(take(1))
      .subscribe(response => {
        let ingredientsToAdd = [];
        for (let i = 0; i < response.length; i++) {
          ingredientsToAdd.push(new Ingredient(response[i].ingredients.name, response[i].amount));
        }
        this.ingredients = [];
        this.ingredients.push(...ingredientsToAdd);
        this.ingredientsChanged.next(this.ingredients.slice());
      });
    return this.ingredients.slice();
  }

  private saveIngredientToStorage(ingredient: Ingredient, index: number) {
    this.http.post<RsIngredient>(
      environment.serverUrl + '/shoppinglist/saveIngredient', {}, {
        params: new HttpParams().append('ingredientName', ingredient.name).append('amount', String(ingredient.amount))
      }
    ).subscribe(response => {
      console.log(response);
      if (index != null) {
        console.log('with index called');
        this.ingredients[index] = new Ingredient(response.ingredients.name, response.amount);
        this.ingredientsChanged.next(this.ingredients.slice());
      } else {
        console.log('with NO index called');
        this.ingredients.push(new Ingredient(response.ingredients.name, response.amount));
        this.ingredientsChanged.next(this.ingredients.slice());
      }
    });
  }

  private removeIngredientFromStorage(ingredient: Ingredient, index: number) {
    this.http.delete(
      environment.serverUrl + '/shoppinglist/deleteIngredient', {
        params: new HttpParams().append('ingredientName', ingredient.name)
      }).subscribe(response => {
      console.log(response)
      this.ingredients.splice(index, 1);
      this.ingredientsChanged.next(this.ingredients.slice());
    });

  }


}

interface RsIngredient {
  amount: number,
  ingredients: {
    id: number,
    name: string,
    imagePath: string
  }
}
