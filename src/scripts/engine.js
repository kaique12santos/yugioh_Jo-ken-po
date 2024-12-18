const state={
    score:{
        playerScore:0,
        computerScore:0,
        scoreBox:document.getElementById("score_points"),
    },
    cardSprites:{
        avatar:document.getElementById("card-image"),
        name:document.getElementById("card-name"),
        type:document.getElementById("card-type"),
    },
    fieldCards:{
        player: document.getElementById("player-field-card"),
        computer: document.getElementById("computer-field-card"),
    },
    playerSides:{
        player1:"player-cards",
        player1BOX: document.querySelector("#player-cards"),
        computer: "computer-cards",
        computerBOX: document.querySelector("#computer-cards"),
    },
    actions:{
    button:document.getElementById("next-duel"),
    
    },
};


const pathImages= "./src/assets/icons/";
const cardData =[
    {
        id:0,
        name:"Blue Eyes White Dragon",
        type: "Paper",
        img: `${pathImages}dragon.png`,
        WinOf:[1],
        LoseOf:[2],
    },
    {
        id:1,
        name:"Dark Magician",
        type: "Rock",
        img: `${pathImages}magician.png`,
        WinOf:[2],
        LoseOf:[0],
    },
    {
        id:2,
        name:"Exodia",
        type: "Scissors",
        img: `${pathImages}exodia.png`,
        WinOf:[0],
        LoseOf:[1],
    },
]

async function getRandomCardID() {
    const randomIndex = Math.floor(Math.random()* cardData.length);
    return cardData[randomIndex].id;
}

async function createCardImage(IdCard, fieldSide) {
    const cardImage = document.createElement("img");
    let imageHeight = "100px";
    let isTouchInProgress = false;
    let initialX, initialY;

    if (window.innerWidth <= 768) {
        imageHeight = "60px";
    }

    cardImage.setAttribute("height", imageHeight);
    cardImage.setAttribute("src", "./src/assets/icons/card-back.png");
    cardImage.setAttribute("data-id", IdCard);
    cardImage.classList.add("card");

    if (fieldSide === state.playerSides.player1) {
        cardImage.addEventListener("click", () => {
            setCardsField(cardImage.getAttribute("data-id"));
        });

        cardImage.addEventListener("mouseover", () => {
            drawSelectCard(IdCard);
        });


        
        if (window.innerWidth <= 768 || navigator.maxTouchPoints > 0) { 
            cardImage.addEventListener("touchstart", (event) => {


              if (!isTouchInProgress) {
                drawSelectCard(IdCard);
                cardImage.classList.add("hover");
                cardImage.style.zIndex = "10";

                initialX = event.touches[0].clientX;
                initialY = event.touches[0].clientY;

                isTouchInProgress = true;
              } else {

                if (event.touches.length === 1) {

                  cardImage.style.position = "fixed";
                  const targetX = state.fieldCards.player.offsetLeft;
                  const targetY = state.fieldCards.player.offsetTop;

                  cardImage.style.transition = "left 0.5s, top 0.5s";
                  cardImage.style.left = targetX + "px";
                  cardImage.style.top = targetY + "px";

                  setTimeout(() => {
                    setCardsField(cardImage.getAttribute("data-id"));

                    cardImage.style.position = "static";
                    cardImage.style.transition = "";
                    cardImage.classList.remove("hover");
                    cardImage.style.zIndex = "0";


                    isTouchInProgress = false;
                  }, 500);

                }
              }

            });

            cardImage.addEventListener("touchmove", (event) => {

              if (isTouchInProgress && event.touches.length === 1) {
                  cardImage.style.left = (event.touches[0].clientX - cardImage.offsetWidth / 2) + "px";
                  cardImage.style.top = (event.touches[0].clientY - cardImage.offsetHeight / 2) + "px";
                }
            });



            cardImage.addEventListener("touchend", () => {
                if (event.touches.length === 0){
                    cardImage.style.position = "static";
                    cardImage.style.transition = "";
                    cardImage.classList.remove("hover");
                    cardImage.style.zIndex = "0";
                    isTouchInProgress = false;
                  }
            });

            cardImage.addEventListener("touchcancel", () => {

                cardImage.style.position = "static";
                cardImage.classList.remove("hover");
                cardImage.style.zIndex = "0";
                isTouchInProgress = false;
            });
        }
    }

    return cardImage;
}

async function setCardsField(cardId) {
    await removeAllCardsImages();
    let computerCardId= await getRandomCardID();
    await showHiddenCardFieldsImages(true);

    await hiddenCardDetails();

    await drawCardsInfield(cardId,computerCardId);

    let duelResult = await checkDuelResult(cardId,computerCardId );

    await updateScore();
    await drawButton(duelResult);
}

async function drawButton(text) {
    state.actions.button.innerText= text.toUpperCase();
    state.actions.button.style.display="block";
    
    
    
}
async function updateScore() {
    state.score.scoreBox.innerText= `Win: ${state.score.playerScore}   Lose: ${state.score.computerScore}`
}


async function  checkDuelResult(playerCardId, computerCardId) {
    let duelResult = "draw";
    let playerCard= cardData[playerCardId];
    if (playerCard.WinOf.includes(computerCardId)) {
        duelResult = "win";
        
        state.score.playerScore++;
    }
    if (playerCard.LoseOf.includes(computerCardId)) {
        duelResult= "lose";
        
        state.score.computerScore++;
    }

    await playAudio(duelResult);
    return duelResult;

}


async function removeAllCardsImages() {
    let {computerBOX,player1BOX} = state.playerSides;
    let imgElements = computerBOX.querySelectorAll("img");
    imgElements.forEach((img)=> img.remove());

    imgElements = player1BOX.querySelectorAll("img");
    imgElements.forEach((img)=> img.remove());

}

async function drawSelectCard(id) {
    state.cardSprites.avatar.src=cardData[id].img;
    state.cardSprites.name.innerText=cardData[id].name;
    state.cardSprites.type.innerText="Attribute :" + cardData[id].type;

}   



async function drawCards(cardNumbers, fieldSide) {
    for (let i =0 ; i < cardNumbers; i++){
        const randomIdCard= await getRandomCardID();
        const cardImage= await createCardImage(randomIdCard,fieldSide);
        
        document.getElementById(fieldSide).appendChild(cardImage);
    }
    
}
async function drawCardsInfield(cardId,computerCardId) {
    state.fieldCards.player.src=cardData[cardId].img;
    state.fieldCards.computer.src=cardData[computerCardId].img;
}

async function showHiddenCardFieldsImages(value) {
    if (value === true) {
        state.fieldCards.player.style.display="block";
        state.fieldCards.computer.style.display="block";
    }if(value === false ){
        state.fieldCards.player.style.display="none";
        state.fieldCards.computer.style.display="none";
    }
}

async function hiddenCardDetails() {
    state.cardSprites.name.innerText="";
    state.cardSprites.type.innerText="Selecione uma Carta";
    state.cardSprites.avatar.src="";
}

async function hiddenFieldCardsDetails() {
    state.actions.button.style.display="none";
    state.fieldCards.player.style.display="none";
    state.fieldCards.computer.style.display="none";
}

async function resetDuel() {
    hiddenCardDetails();
    hiddenFieldCardsDetails();
    init();
}

async function playAudio(status) {
    const audio = new Audio(`./src/assets/audios/${status}.wav`); 
    try{
        audio.volume= 0.2;
        audio.play();
    }catch{

    }
    
}

function init(){

    showHiddenCardFieldsImages(false);
    drawCards(5,state.playerSides.player1);
    drawCards(5,state.playerSides.computer);
    const bgm = document.getElementById("bgm");
    bgm.volume = 0.3;
    bgm.play();
}
init();