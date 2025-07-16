const info = document.getElementById("info");
const gridContainer = document.getElementById("grid-container");
const newGameButton = document.getElementById("newGameButton");
const submitButton = document.getElementById("submitButton");
const shuffleButton = document.getElementById("shuffleButton");
const clues = document.getElementById("clues");
const status = document.getElementById("status");
const share =  document.getElementById("share");
const tooltip = document.getElementById("myTooltip");
const image = document.getElementById("image");
const HintButton = document.getElementById("GetaHintButton");

// let wordsArray = [  "0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15"  ];

let trees_db;

async function get_trees_db() {
  
  let responses = await fetch('trees.txt');
  
  trees_db = await responses.json();
  
  console.log(trees_db);
  
}

get_trees_db();


const path = 'https://cdn.glitch.global/ffaa90aa-771d-4d01-a5ef-c08e4bd19395/';


let numSelected, num_wrong_guesses = 0, num_found = 0, num_hint_given = 0;

let already_guessed = [], all_guess_IDs = [], results = [];

let list_hint_class = ["hinted", "hint_group1", "hint_group2", "hint_group3"];

let tree_list = [];


function createGame() {
  // const inputWords = prompt("Enter 16 words separated by spaces:");
  // let word_list = wordsArray[0].split(" ").map((word) => word.trim());
  tree_list = [];
  document.body.className = "";
  status.innerHTML = ``;
  info.innerHTML = ``;
  share.style.display = "none";
  image.style.display = "none";
  
  let num_trees = trees_db.length;
  
  let rnd_indices = Array.from({length: num_trees}, (x, i) => i);
  shuffle(rnd_indices);
  
  clues.innerHTML = `Trees: `
  
  for(let i=0; i < 3; i++) {
    let tree_index = rnd_indices[i];
    
    let tree_obj = trees_db[tree_index];
    
    tree_list.push(tree_index);
    
    const clue = document.createElement("span");
    clue.classList.add(`group${i+1}`); 
    clue.textContent = ` ${tree_obj.name} `;
    clues.appendChild(clue);
    
  }
  
  createGridItems(tree_list);
  shuffleGrid();
  
  submitButton.style.display = "revert";
  shuffleButton.style.display = "revert";
  HintButton.style.display = "revert";
  
  numSelected = 0;
  num_wrong_guesses = 0;
  num_hint_given = 0;
  already_guessed = [];
  all_guess_IDs = [];
//  selectedGroupIDs = [];   
  num_found = 0;
  results = [];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to create grid items
function createGridItems(trees) {
  
    gridContainer.innerHTML = "";
  
    trees.forEach((tree_idx, index) => {
        let file = trees_db[tree_idx].file;
        
        const gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");       
        gridItem.innerHTML = `<img class="img" src=${path + 'bark-' + file + '.jpg'}>`;
        // gridItem.draggable = true;
        gridItem.setAttribute("data-id", `item-${3*index+0}`);
        gridItem.setAttribute("data-selected", "false"); // Set data-selected attribute to "false" initially
        gridItem.setAttribute("data-locked", "false"); // Set data-locked attribute to "false" initially
        gridItem.addEventListener("click", function() {
            toggleSelect(gridItem);
        });
        gridContainer.appendChild(gridItem);

        const gridItem2 = document.createElement("div");
        gridItem2.classList.add("grid-item");       
       gridItem2.innerHTML = `<img class="img" src=${path + 'bud-' + file + '.jpg'}>`;
        // gridItem.draggable = true;
        gridItem2.setAttribute("data-id", `item-${3*index+1}`);
        gridItem2.setAttribute("data-selected", "false"); // Set data-selected attribute to "false" initially
        gridItem2.setAttribute("data-locked", "false"); // Set data-locked attribute to "false" initially
        gridItem2.addEventListener("click", function() {
            toggleSelect(gridItem2);
        });
        gridContainer.appendChild(gridItem2);

        const gridItem3 = document.createElement("div");
        gridItem3.classList.add("grid-item");       
       gridItem3.innerHTML = `<img class="img" src=${path + 'leaf-' + file + '.jpg'}>`;
        // gridItem.draggable = true;
        gridItem3.setAttribute("data-id", `item-${3*index+2}`);
        gridItem3.setAttribute("data-selected", "false"); // Set data-selected attribute to "false" initially
        gridItem3.setAttribute("data-locked", "false"); // Set data-locked attribute to "false" initially
        gridItem3.addEventListener("click", function() {
            toggleSelect(gridItem3);
        });
        gridContainer.appendChild(gridItem3);
     });

}

// Function to toggle item lock
function toggleSelect(item) {
  
  const isSelected = item.getAttribute("data-selected") === "true";
  
  if ( (isSelected == false) && (numSelected>=3) ) {
      return;
    }
  const newSelectState = isSelected ? "false" : "true";
  
//  console.info(`Current state ${isSelected}`);
  
  item.setAttribute("data-selected", newSelectState);
  item.classList.toggle("selected");
//  item.draggable = newLockState === "false";
  if (newSelectState === "true") {
    numSelected += 1;  
  } else {
    numSelected -= 1;
  }
}

// Function to shuffle unlocked items
function shuffleGrid() {
    const unlockedItems = Array.from(gridContainer.querySelectorAll(".grid-item[data-locked='false']"));
    const shuffledItems = unlockedItems.sort(() => Math.random() - 0.5);

    // Create a map of locked item positions
    const lockedItemPositions = new Map();
    const gridItems = gridContainer.querySelectorAll(".grid-item");
    gridItems.forEach((item, index) => {
        if (item.getAttribute("data-locked") === "true") {
            lockedItemPositions.set(item, index);
        }
    });

    // Rearrange the unlocked items randomly
    gridContainer.innerHTML = "";
    shuffledItems.forEach((item) => {
        gridContainer.appendChild(item);
    });

    // Restore locked items to their original positions
    lockedItemPositions.forEach((index, item) => {
        gridContainer.insertBefore(item, gridContainer.children[index]);
    });
};



function checkGroup() {
  
  if ( (num_found == 3) || (num_wrong_guesses >= 4) ) {
    
    status.innerHTML = `Game Over. Start a new one?`;
    console.log('Game Over');
    
    return;
  }
  if (numSelected !=3){
    
    status.innerHTML = `Select 3 items`;
    return;
  }
  
  let selectedGroupIDs = [];

  const selectedItems = gridContainer.querySelectorAll(".grid-item[data-selected='true']");
  
  selectedItems.forEach((item, index) => {
    const selectedItemId = item.getAttribute("data-id");
    selectedGroupIDs.push(selectedItemId.match(/\d+/)[0]);
  });
  
//  console.info(selectedGroupIDs);
  
  let guess = selectedGroupIDs.toSorted().join('');
//  guess = guess.sort().join('');
//  console.log(guess);
//  selectedGroupIDs = [];
  
  if (already_guessed.includes(guess)) {
    
    status.innerHTML = `Already guessed`;
    console.log('Already guessed');
    
    numSelected = 0;
    
    selectedItems.forEach((item, index) => {
      item.classList.remove("selected");
      item.setAttribute("data-selected", false);
    });
    
    return;
  }
  
  already_guessed.push(guess);
  
  all_guess_IDs.push(selectedGroupIDs);
  
  let grp1 =0, grp2=0, grp3=0;
  
  selectedGroupIDs.forEach( (IDX, ind) => {
    // console.log(IDX);
    let ID = Number(IDX);
    if ( ([0,1,2]).includes(ID) ) {
      grp1 += 1;
    } else if ( ([3,4,5]).includes(ID) ) {
      grp2 += 1;
    } else if ( ([6,7,8]).includes(ID) ) {
      grp3 += 1;
    } 
  });
  
  let success = false, group;
  
  if ( (grp1==3) || (grp2==3) || (grp3==3) ) {
    
    success = true;
    num_found += 1;
    console.log('Found a group');
    status.innerHTML = `Found a group`;
    
  } else if ( (grp1==2) || (grp2==2) || (grp3==2)  ) {
    
    success = false;
    num_wrong_guesses += 1;
    console.log(`One Away. Wrong guess no. ${num_wrong_guesses}`);
    status.innerHTML = `Just miss! Wrong guess no. ${num_wrong_guesses}`;
    
  } else {
    
    num_wrong_guesses += 1;
    console.log(`Wrong guess no. ${num_wrong_guesses}`);
    
    if (num_wrong_guesses == 3)
      status.innerHTML = `Wrong guess no. ${num_wrong_guesses}. Last chance!`;
    else 
      status.innerHTML = `Wrong guess no. ${num_wrong_guesses}`;

  }

  if (grp1 == 3) {
    group = "group1";
  } else if (grp2 == 3) {
    group = "group2";
  } else if (grp3 == 3) {
    group = "group3";
  } 
  
/*  
  if (guess == '0123') {
    success = true;
    group = "group1";
    num_found += 1;
    console.log('Found group 1');
    status.innerHTML = `Found a group`;
    
  } else if (guess == '4567') {
    success = true;
    group = "group2";
    num_found += 1;
    console.log('Found group 2');
    status.innerHTML = `Found a group`;
    
  } else if (guess == '101189') {
    success = true;
    group = "group3";
    num_found += 1;
    console.log('Found group 3');
    status.innerHTML = `Found a group`;
    
  } else if (guess == '12131415') {
    success = true;
    group = "group4";
    num_found += 1;
    console.log('Found group 4');
    status.innerHTML = `Found a group`;
    
  } else {
    
    num_wrong_guesses += 1;
    
    console.log(`Wrong guess no. ${num_wrong_guesses}`);
    
    if (num_wrong_guesses < 4)
      status.innerHTML = `Wrong guess no. ${num_wrong_guesses}`;
    else
      status.innerHTML = `Wrong guess no. ${num_wrong_guesses}. Game Over.`;
    
  } */
  
  if (num_wrong_guesses == 4) {
    status.innerHTML = `Wrong guess no. ${num_wrong_guesses}. Game Over.`;
    
  } 
  
  if (num_found == 3) {
    status.innerHTML = `You won the Game.`;
    
    document.body.className = "winner";
  }
    
  // const selectedItems = gridContainer.querySelectorAll(".selected");
  const targetItems = gridContainer.querySelectorAll(".grid-item[data-locked='false']");

  selectedItems.forEach((item, index) => {

    item.classList.remove("selected");
    item.setAttribute("data-selected", false);
    
    if (success) {
      // const sourceItemId = item.dataTransfer.getData("text/plain");
      // const sourceItem = gridContainer.querySelector(`[data-id="${sourceItemId}"]`);
      // const targetItemId = e.target.getAttribute("data-id");
      // const targetItem = gridContainer.querySelector(`[data-id="${targetItemId}"]`);
      const targetItem = targetItems[index];
            
      if (item && targetItem && !targetItem.classList.contains("locked")) {

        const tempImg = item.innerHTML;
        item.innerHTML = targetItem.innerHTML;
        targetItem.innerHTML = tempImg;

        const new_targetID = item.getAttribute("data-id");
        const new_sourceID = targetItem.getAttribute("data-id");
        item.setAttribute("data-id",new_sourceID);
        targetItem.setAttribute("data-id",new_targetID);
        
        
        list_hint_class.forEach((tag, index) => {
          
          let tar_hinted = targetItem.classList.contains(tag);
          let src_hinted = item.classList.contains(tag);

          if ( (tar_hinted) && !(src_hinted) ){
            item.classList.add(tag);
            targetItem.classList.remove(tag);
          }
          if ( (src_hinted) && !(tar_hinted) ){
            item.classList.remove(tag);
            targetItem.classList.add(tag);
          }
          
        });
        
     }
      
      targetItem.classList.add(group);
      targetItem.classList.add("locked");
      targetItem.setAttribute("data-locked", true);
      
    }
  });

  numSelected = 0;
  
  
  if ( (num_found == 3) || (num_wrong_guesses == 4) ) {
    GameOver();
  }
  
}

function GetaHint() {
  
    if ( (num_found == 3) || (num_wrong_guesses == 4) ) {
      status.innerHTML = `Game Over!`;
      return;
    }
  
  const solvedHints = gridContainer.querySelectorAll(".hinted.locked");
  let num_solved_hints = solvedHints.length;
  
  if ((num_hint_given + num_found - num_solved_hints) >= 3) {
    status.innerHTML = `All hints used up.`
    return;
  }
  
  const unsolvedItems = gridContainer.querySelectorAll(".grid-item[data-locked='false']");
  
  let group, unsolvedIDs = [];
  
  unsolvedItems.forEach((item, index) => {
    
    const Id = item.getAttribute("data-id");
    let id = parseInt(Id.match(/\d+/)[0]);
    unsolvedIDs.push(id);
    
  });
  
  unsolvedIDs.sort((a,b) => a-b);
  
  let num_unsolved_hints = num_hint_given - num_solved_hints;
  
  let hint_indx = unsolvedIDs[num_unsolved_hints * 3 + 0];
  
  let hintedItem = gridContainer.querySelector(`[data-id="item-${hint_indx}"]`);
  
  if ( ([0,1,2]).includes(hint_indx) ) {
    group = "hint_group1";
  } else if ( ([3,4,5]).includes(hint_indx) ) {
    group = "hint_group2";
  } else if ( ([6,7,8]).includes(hint_indx) ) {
    group = "hint_group3";
  } 
  
  hintedItem.classList.add(group);
  hintedItem.classList.add("hinted");
  
  num_hint_given += 1;
  
  status.innerHTML = `Hint ${num_hint_given} used.`
}

function GameOver() {
  
  const targetItems = gridContainer.querySelectorAll(".grid-item[data-locked='false']");
  
  let group, sourceIDs = [];
  
  targetItems.forEach((item, index) => {
    
    const Id = item.getAttribute("data-id");
    let id = parseInt(Id.match(/\d+/)[0]);
    sourceIDs.push(id);
    
  });
  
  sourceIDs.sort((a,b) => a-b);
  // console.log("Items left out: " sourceIDs);
  
  targetItems.forEach((targetItem, index) => {
    
      const sourceItemId = sourceIDs[index];
      const sourceItem = gridContainer.querySelector(`[data-id="item-${sourceItemId}"]`);
      // const targetItemId = targetItem.getAttribute("data-id");
      // const targetItem = gridContainer.querySelector(`[data-id="${targetItemId}"]`);
            
      if ( sourceItem && targetItem && (sourceItem !== targetItem) ) {
        
          const tempIMG = sourceItem.innerHTML;
          sourceItem.innerHTML = targetItem.innerHTML;
          targetItem.innerHTML = tempIMG;
        
          const new_targetID = sourceItem.getAttribute("data-id");
          const new_sourceID = targetItem.getAttribute("data-id");
          sourceItem.setAttribute("data-id",new_sourceID);
          targetItem.setAttribute("data-id",new_targetID);
      } 
    
      list_hint_class.forEach((tag, index) => {

        let tar_hinted = targetItem.classList.contains(tag);
        let src_hinted = sourceItem.classList.contains(tag);

        if ( (tar_hinted) && !(src_hinted) ){
          sourceItem.classList.add(tag);
          targetItem.classList.remove(tag);
        }
        if ( (src_hinted) && !(tar_hinted) ){
          sourceItem.classList.remove(tag);
          targetItem.classList.add(tag);
        }

      });
    
      if ( ([0,1,2]).includes(sourceItemId) ) {
        group = "group1";
      } else if ( ([3,4,5]).includes(sourceItemId) ) {
        group = "group2";
      } else if ( ([6,7,8]).includes(sourceItemId) ) {
        group = "group3";
      } 
      
    //  targetItem.classList.remove("group1 group2 group3 group4");
      targetItem.classList.add(group);
      targetItem.classList.add("locked");
      targetItem.setAttribute("data-locked", true);
  });
  /*
  let hinted = gridContainer.querySelectorAll(".hinted");
  hinted.forEach((item, index) => {
    item.classList.remove("hint_group1");
    item.classList.remove("hint_group2");
    item.classList.remove("hint_group3");
    item.classList.remove("hint_group4");
  });*/
  
  share.style.display = "revert";
  share.focus();
  ShareIt();
}

let copyText

function ShareIt() {
  
  // Share your results
  let sq = [];
  results = ""
  all_guess_IDs.forEach((guess_ID, index) => {
    // console.log(guess_ID);
    guess_ID.forEach( (IDX, ind) => {
      // console.log(IDX);
      let ID = Number(IDX);
      if ( ([0,1,2]).includes(ID) ) {
        sq = "🟥"; // "\u1F7E5"
      } else if ( ([3,4,5]).includes(ID) ) {
        sq = "🟩"; // "\u1F7E9"
      } else if ( ([6,7,8]).includes(ID) ) {
        sq = "🟦"; // "\u1F7E6"
      } 
      
      results += sq;
    });
    results += "\n";
  });
  
  let linkURL = window.location.href;
  
  copyText = `I played #Treeple game to learn about ${trees_db[tree_list[0]].name + ', ' + trees_db[tree_list[1]].name + ', ' + trees_db[tree_list[2]].name } at ${linkURL}\n${results}`;
  
  navigator.clipboard.writeText(copyText);
  
   if (navigator.canShare) {
    navigator.share({
      title: 'Share results',
      text: `${copyText} at ${linkURL}`,
      // url: linkURL,
    })
    .then(() => console.log('Successful share'))
    .catch((error) => console.log('Error sharing', error));
  }
  
//  alert("Copied the results to clipboard");
  tooltip.innerHTML = "Results copied";
}
function outFunc() {
  tooltip.innerHTML = "Copy to clipboard";
}

document.addEventListener("keypress", function onPress(event) {
    if (event.key === "@") {
      console.log("cheat code for testing game");
      num_found = 3;
      GameOver();
      return;
    }
});

share.style.display = "none";
submitButton.style.display = "none";
shuffleButton.style.display = "none";
HintButton.style.display = "none";

// Function to handle input
newGameButton.addEventListener("click", createGame);
shuffleButton.addEventListener("click", shuffleGrid);
submitButton.addEventListener("click", checkGroup);
HintButton.addEventListener("click", GetaHint);
