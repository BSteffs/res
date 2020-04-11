import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

import {Recipe} from './recipe.model';
import {Ingredient} from '../shared/ingredient.model';
import {ShoppingListService} from '../shopping-list/shopping-list.service';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [];

  constructor(private slService: ShoppingListService, private http: HttpClient) {
  }

  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
  }

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(index: number) {
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.slService.addIngredients(ingredients);
  }

  addRecipe(recipe: Recipe) {
    this.saveRecipeInStorage(recipe);
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.updateRecipeInStorage(newRecipe, index);
  }

  deleteRecipe(index: number) {
    console.log(this.recipes[index].id);
    this.deleteRecipeFromStorage(this.recipes[index].id);
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }

  private saveRecipeInStorage(recipe: Recipe) {
    this.http
      .post<Recipe>(
        environment.serverUrl + 'recipe/saveRecipe',
        {
          name: recipe.name,
          description: recipe.description,
          imagePath: recipe.imagePath,
          ingredients: recipe.ingredients ? recipe.ingredients : []
        }
      )
      .subscribe(savedRecipe => {
        console.log(savedRecipe);
        this.recipes.push(savedRecipe);
        this.recipesChanged.next(this.recipes.slice());
      });
  }

  private updateRecipeInStorage(recipe: Recipe, index: number) {
    this.http
      .post<Recipe>(
        environment.serverUrl + 'recipe/saveRecipe/' + this.recipes[index].id,
        {
          name: recipe.name,
          description: recipe.description,
          imagePath: recipe.imagePath,
          ingredients: recipe.ingredients ? recipe.ingredients : []
        }
      ).subscribe(updatedRecipe => {
      console.log(updatedRecipe);
      this.recipes[index] = updatedRecipe;
      this.recipesChanged.next(this.recipes.slice());
    });
  }

  private deleteRecipeFromStorage(recipeIndex: number) {
    this.http
      .delete(
        environment.serverUrl + 'recipe/' + recipeIndex
      )
      .subscribe(response => {
        console.log(response);
      });
  }

}
