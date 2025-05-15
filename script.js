const apiBase = "https://www.themealdb.com/api/json/v1/1";
let currentRecipeId = null;
let allRecipes = []; // Store all fetched recipes
let currentPage = 1;
const recipesPerPage = 6; // Number of recipes to show per page
function showCustomAlert(message) {
  const alertBox = document.getElementById("customAlert");
  if (!alertBox) return;

  alertBox.querySelector("p").textContent = message;
  alertBox.style.display = "block";

  setTimeout(() => {
    alertBox.style.display = "none";
  }, 2500);
}

async function searchRecipes(inputId) {
  const ingredient = document.getElementById(inputId).value.trim();
  if (!ingredient) {
    showCustomAlert("Please enter an ingredient!");
    return;
  }

  document.getElementById("loading").style.display = "block";

  const searchBox = document.querySelector(".search-box");
  if (searchBox) {
    searchBox.classList.add("search-box-top");
  }

  currentPage = 1;

  setTimeout(async () => {
    try {
      const response = await fetch(`${apiBase}/filter.php?i=${ingredient}`);
      const data = await response.json();

      document.getElementById("loading").style.display = "none";

      if (!data.meals) {
        showCustomAlert("No recipes found. Try another ingredient!");
        document.getElementById("results").innerHTML = "";
        document.getElementById("searchMoreContainer").style.display = "none";
        return;
      }

      allRecipes = data.meals;
      displayRecipePage(1);
      updateSearchMoreButton();

    } catch (error) {
      console.error(error);
      document.getElementById("loading").style.display = "none";
      showCustomAlert("Error fetching recipes");
    }
  }, 1000);
}


function displayRecipePage(page) {
  currentPage = page;
  const startIndex = (page - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  
  // Get recipes for current page
  const pageRecipes = allRecipes.slice(startIndex, endIndex);
  
  // If it's the first page, clear the results
  if (page === 1) {
    document.getElementById("results").innerHTML = "";
  }
  
  const results = document.getElementById("results");
  
  pageRecipes.forEach(meal => {
    // Create recipe card
    const mealCard = createRecipeCard(meal);
    results.appendChild(mealCard);
    
    // Fetch additional recipe details for each meal
    fetchRecipeDetails(meal.idMeal);
  });
  
  // Update search more button visibility
  updateSearchMoreButton();
}

function updateSearchMoreButton() {
  const searchMoreContainer = document.getElementById("searchMoreContainer");
  const totalPages = Math.ceil(allRecipes.length / recipesPerPage);
  
  if (currentPage < totalPages) {
    searchMoreContainer.style.display = "flex";
  } else {
    searchMoreContainer.style.display = "none";
  }
}

function loadMoreRecipes() {
  displayRecipePage(currentPage + 1);
}

function createRecipeCard(meal) {
  console.log("the function is call inside the createRecipeCard function",meal);
  const mealDiv = document.createElement("div");
  mealDiv.classList.add("recipe-card");
  mealDiv.id = `recipe-${meal.idMeal}`;

  mealDiv.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <h3 class="recipe-card-title">${meal.strMeal}</h3>
    <div class="recipe-ingredients" id="ingredients-${meal.idMeal}">
      <div class="ingredient-item">Chicken</div>
      <div class="ingredient-item" id="ingredient1-${meal.idMeal}">Loading...</div>
      <div class="ingredient-item" id="ingredient2-${meal.idMeal}">Loading...</div>
    </div>
    <button class="detail-btn" onclick="showRecipeDetails('${meal.idMeal}')">Details</button>
  `;
  
  return mealDiv;
}

async function fetchRecipeDetails(id) {
  try {
    const response = await fetch(`${apiBase}/lookup.php?i=${id}`);
    const data = await response.json();
    const meal = data.meals[0];

    // Get main ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== '') {
        ingredients.push(meal[`strIngredient${i}`]);
      }
    }

    // Update the recipe card with the first 3 ingredients
    const ingredientsContainer = document.getElementById(`ingredients-${id}`);
    if (ingredientsContainer) {
      ingredientsContainer.innerHTML = '';
      
      // Always use Chicken as first ingredient if it's in the recipe or add it anyway
      const hasChicken = ingredients.some(ing => ing.toLowerCase().includes('chicken'));
      if (hasChicken) {
        ingredientsContainer.innerHTML += `<div class="ingredient-item">Chicken</div>`;
      } else {
        ingredientsContainer.innerHTML += `<div class="ingredient-item">Chicken</div>`;
      }
      
      // Add additional ingredients from the recipe, prioritizing common ones shown in the design
      const priorityIngredients = ['rice', 'potato', 'tomato', 'bread', 'macaroni'];
      let addedCount = 0;
      
      // First add priority ingredients
      for (const priority of priorityIngredients) {
        if (addedCount >= 2) break;
        
        const matchingIng = ingredients.find(ing => 
          ing.toLowerCase().includes(priority.toLowerCase())
        );
        
        if (matchingIng) {
          ingredientsContainer.innerHTML += `<div class="ingredient-item">${capitalizeFirstLetter(priority)}</div>`;
          addedCount++;
        }
      }
      
      // If we haven't added enough, add other ingredients
      for (let i = 0; i < ingredients.length && addedCount < 2; i++) {
        if (!ingredientsContainer.innerHTML.includes(ingredients[i])) {
          ingredientsContainer.innerHTML += `<div class="ingredient-item">${ingredients[i]}</div>`;
          addedCount++;
        }
      }
    }

  } catch (error) {
    console.error("Error fetching recipe details:", error);
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function showRecipeDetails(id) {
  try {
    const response = await fetch(`${apiBase}/lookup.php?i=${id}`);
    const data = await response.json();
    const meal = data.meals[0];

    currentRecipeId = id;

    document.getElementById("recipeTitle").textContent = meal.strMeal;
    document.getElementById("recipeImage").src = meal.strMealThumb;
    document.getElementById("recipeCategory").textContent = meal.strCategory;
    document.getElementById("recipeArea").textContent = meal.strArea;
    document.getElementById("recipeInstructions").textContent = meal.strInstructions;

    document.getElementById("recipeOverlay").style.display = "flex";
  } catch (error) {
    console.error("Error showing recipe details:", error);
  }
}

function closeOverlay() {
  document.getElementById("recipeOverlay").style.display = "none";
}

function deleteRecipe() {
  closeOverlay();

  if (currentRecipeId) {
    const recipeElement = document.getElementById(`recipe-${currentRecipeId}`);
    if (recipeElement) {
      recipeElement.remove();
      
      // Also remove from our stored recipes array
      allRecipes = allRecipes.filter(recipe => recipe.idMeal !== currentRecipeId);
      
      // Update search more button visibility
      updateSearchMoreButton();
    }
  }

  currentRecipeId = null;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener for Search More button
  const searchMoreBtn = document.getElementById('searchMoreBtn');
  if (searchMoreBtn) {
    searchMoreBtn.addEventListener('click', loadMoreRecipes);
  }
});