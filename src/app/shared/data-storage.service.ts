import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, tap} from 'rxjs/operators';

import {RecipeService} from '../recipes/recipe.service';
import {environment} from '../../environments/environment';
import {Recipe} from '../recipes/recipe.model';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(
    private http: HttpClient,
    private recipeService: RecipeService
  ) {}

  fetchRecipes() {
    return this.http
      .get<Recipe[]>(
        environment.serverUrl + 'recipe'
      )
      .pipe(
        map(recipes => {
          return recipes.map(recipe => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : []
            };
          });
        }),
        tap(recipes => {
          this.recipeService.setRecipes(recipes);
        })
      );
  }
}
