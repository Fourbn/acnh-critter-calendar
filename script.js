//namespace
const acnh = {};

acnh.apiFish = 'https://acnhapi.com/v1/fish';
acnh.apiBug = 'https://acnhapi.com/v1/bugs';

//array used to help me format the user inputted Date that is displayed on the page.
acnh.monthArray = ['blank', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

//cached bracket-notations saved for ease of use and reading

//make API call and get data on fish and bugs 
    acnh.getFish = $.ajax({
        url: `${acnh.apiFish}`,
        method: 'GET',
        dataType: 'json',
        })
    
    acnh.getBugs = $.ajax({
        url: `${acnh.apiBug}`,
        method: 'GET',
        dataType: 'json',
        })
    
    //1. User inputs some initial data about their island in front of a curtain (name of villager, name of island, hemisphere). When user submits, this function captures those values and displays the results onto the page.
    acnh.userSubmitEvent = () => {
        $('input[type=submit]').on('click', function(e){
            e.preventDefault();

            //function used to fade away the form and reveal the results page hiding underneath
            acnh.fadeAway();
            
            //all of the information entered by the user is stored in these variables
            acnh.villagerName = $('#villagerName').val();
            acnh.islandName = $('#islandName').val();
            acnh.currentTime = $('#currentTime').val();
            acnh.currentDate = $('#currentDate').val();
            acnh.month = parseInt(acnh.currentDate.slice(5, 7), 10);
            acnh.displayMonth = acnh.monthArray[`${acnh.month}`];
            acnh.hemisphere = $('select#hemisphere-select option:checked').val();
            
            //this ensures that if, by some miracle, the user hits the submit button twice, the results don't display on the page twice
            acnh.clearDisplay();

            //get my fish and bug data at the same time before moving on
            $.when(acnh.getFish, acnh.getBugs)
            .then(function(fish, bugs){
                //create separate arrays of all the available critters from the API
                const fishObject = fish[0]
                const fishArray = Object.entries(fishObject);
        
                const bugObject = bugs[0];
                const bugArray = Object.entries(bugObject);

                //function that will be used to sort the results and figure out what critters need to be displayed
                acnh.populateIsland(fishArray, bugArray, acnh.month);
                //blathers quote function that allows user to click critter icon for more info
                acnh.museumDescr(fishArray, bugArray)
            })
        })
    }

acnh.populateIsland = (fishArray, bugArray, month) => {
    //from the fish array, iterate through the array and pull out every fish whose availability matches user inputted month
    const displayFish = []
    //separate array for fish that appear year round
    const yearRoundFish = []
    for (let avail of fishArray) {
        let fishSearch = avail[1]['availability'][`month-array-${acnh.hemisphere}`];
        const allYear = avail[1]['availability']['isAllYear'];

        if (fishSearch.includes(month) && allYear === false) {
            displayFish.push(avail);
        } else if (allYear === true) {
            yearRoundFish.push(avail);
        }
    }

    //same as above but with bugs!
    const displayBugs = []
    const yearRoundBugs = []
    for (let avail of bugArray) {
        let bugSearch = avail[1]['availability'][`month-array-${acnh.hemisphere}`];
        const allYear = avail[1]['availability']['isAllYear'];

        if (bugSearch.includes(month) && allYear === false) {
            displayBugs.push(avail)
        } else if (allYear === true) {
            yearRoundBugs.push(avail);
        }
    }

    //display functions that will put the results of the sorted arrays onto the page
    acnh.yearRoundDisplay(yearRoundFish, yearRoundBugs)
    acnh.displayFunction(displayFish, displayBugs);

}

acnh.displayFunction = (displayFish, displayBugs) => {
    //displays a title for the displayed images
    $('.fishMonth').text(`All the Fish you can catch in ${acnh.displayMonth}!`)
    //display fish for-in loop. goes through each object in the array and displays the relevant information into the .fishContainer div on the html
    for (let avail of displayFish) {
        $('.fishContainer').append(`
        <div class="indivFish">
            <img id="${avail[1]['file-name']}" class="icon" src="${avail[1]['icon_uri']}" alt="Animal Crossing Fish: ${avail[1]['name']['name-USen']}" title="Click to hear what Blather's has to say about the ${avail[1]['name']['name-USen']}.">
            <h5>${avail[1]['name']['name-USen']}</h5>
            <p>Location: <span class="critterHome">${avail[1]['availability']['location']}</span>.</p>
            <p>Time: <span class="critterHome">${avail[1]['availability'][`time`]}</span>.</p>
        </div>
        `)
        //is there a way to store a parameter into a global variable for reuse? It would be helpful to have avail[1]['name']['name-USen'] as a variable I could put into each of these functions over and over again to clean it up.
    }

    $('.bugMonth').text(`All the Bugs you can catch in ${acnh.displayMonth}!`)
    //display bugs for-in loop
    for (let avail of displayBugs) {
        $('.bugContainer').append(`
        <div class="indivBug">
        <img id="${avail[1]['file-name']}" class="icon" src="${avail[1]['icon_uri']}" alt="Animal Crossing Bug: ${avail[1]['name']['name-USen']}" title="Click to hear what Blather's has to say about the ${avail[1]['name']['name-USen']}.">
            <h5>${avail[1]['name']['name-USen']}</h5>
            <p>Location: <span class="critterHome">${avail[1]['availability']['location']}</span>.</p>
            <p>Time: <span class="critterHome">${avail[1]['availability'][`time`]}</span>.</p>
        </div>
        `)
    }
    //displays some user info to personalize the results page
    $('h1').text(`Welcome to ${acnh.islandName} Island, ${acnh.villagerName}!`);
    acnh.dateFormat();
    //function that will allow the user to click on the critter icon and get a pop-up with some more details
}

//ensure displayed items only display once
acnh.clearDisplay = () => {
    $('.fishContainer').empty();
    $('.bugContainer').empty();
}

//transforms user inputted date/time information into a more readable string
acnh.dateFormat = () => {
    $('.welcomeSign p').text(`${acnh.displayMonth} ${acnh.currentDate.slice(8, 10), 10}, ${acnh.currentDate.slice(0, 4)} / ${acnh.currentTime}`)
}

//fade out function for form page
acnh.fadeAway = () => {
    $('.coverPage').fadeOut('slow');
}

//user click function to trigger pop up of a animal crossing museum quote
acnh.museumDescr = (fishArray, bugArray) => {
    $('.icon').on('click', function() {
        //empties previously loaded quote
        $('.museumQuote').empty();
        //variable that identifies what the id of the clicked on image is
        const id = $(this)[0]['id'];
        //looks through the displayed Fish array and finds the corresponding id for the icon that was clicked. It then triggers a div to appear with the museum quote displayed.
        for (let avail of fishArray) {
            if (avail[0] === id) {
                const museumPhrase = avail[1]['museum-phrase']

                $('.museumQuote').append(`
                <div class="quoteBlock">
                <h5>Blather's Says!</h5>
                <p class="quoteTitle">${avail[1]['name']['name-USen']}</p>
                    <p>${museumPhrase}</p>
                    </div>
                <img src="./assets/acnh-blathers.PNG/" alt="Blathers the Owl">
                <i class="fas fa-times"></i>
                `)
                acnh.museumExit();
            }
        }
        //same as above but for bugs
        for (let avail of bugArray) {
            if (avail[0] === id) {
                const museumPhrase = avail[1]['museum-phrase']

                $('.museumQuote').append(`
                <div class="quoteBlock">
                <h5>Blather's Says!</h5>
                    <p class="quoteTitle">${avail[1]['name']['name-USen']}</p>
                    <p>${museumPhrase}</p>
                </div>
                <img src="./assets/acnh-blathers.PNG/" alt="Blathers the Owl">
                <i class="fas fa-times"></i>
                `)
                acnh.museumExit();
            }
        }
        $('.museumQuote').fadeTo('fast', 1);
    })
}

acnh.museumExit = () => {
    $('i').on('click', function(){
        $('.museumQuote').fadeOut('fast');
    })
}

acnh.yearRoundDisplay = (yearlyFish, yearlyBugs) => {
    for (let avail of yearlyFish) {
        $('.commonContainer').append(`
        <div class="common">
        <img id="${avail[1]['file-name']}" class="icon" src="${avail[1]['icon_uri']}" alt="Animal Crossing Bug: ${avail[1]['name']['name-USen']}" title="Click to hear what Blather's has to say about the ${avail[1]['name']['name-USen']}.">
        </div>
        `)
    }
    
    for (let avail of yearlyBugs) {
        $('.commonContainer').append(`
        <div class="common">
        <img id="${avail[1]['file-name']}" class="icon" src="${avail[1]['icon_uri']}" alt="Animal Crossing Bug: ${avail[1]['name']['name-USen']}" title="Click to hear what Blather's has to say about the ${avail[1]['name']['name-USen']}.">
        </div>
        `)
    }
}

//init function
acnh.init = () => {
    acnh.userSubmitEvent();
};

//doc ready
$(function(){
    console.log('inits')
    acnh.init();
})

//I think there is a lot of repitition in this code and I'm not sure how to reduce it. I tried to create functions that I could call multiple times within the same function (using different arguments) but only the second function in the sequence would run. This meant I needed to build two expressions, one for the bugs and one for the fish, for each function.



//These are my attempts at catching errors that were present in the API but I wasn't able to get them to work.

//Essentially, there are certain bugs and fish that are mislabeled in the API. So they've been given an isAllYear value of false (not available all year), however in the months-available arrays they've been given every single month value (1 - 12).

//When I filter through the arrays I pulled from the API, these bugs and fish appear in every search despite only being actually available for specific months, which means my results are wrong.

//For this error fix, I tried to sort through the new array that I made AFTER I filtered out the bugs that would be displayed onto the page. I was able to identify (based on user input) when the bug should and shouldn't be displayed, but I wasn't able to remove the bug from that displayBugs array.
// acnh.errorFixing = (displayBugs) => {
//     for (let avail of displayBugs) {
//         // console.log('avail:', avail)
//         // console.log('display bugs:', displayBugs)
//         if (avail[0] === 'firefly') {
//             if (acnh.month === 6 && acnh.hemisphere === 'northern') {
//                 console.log('northern fine')
//             } else if (acnh.month === 12 && acnh.hemisphere === 'southern') {
//                 console.log('southern fine')
//             } else {
//                 for (let elements of displayBugs) {
//                     let fireflyIndex = displayBugs.indexOf(elements['firefly'])
//                     console.log('not fine', fireflyIndex)
//                 }
//             }
//         } 
//     }
//     console.log(displayBugs);
//     console.log(acnh.jail)
// }

//In this error fix, I tried to write a function that would run during the initial filtering function. If this function came across one of the problem bugs, it would run a few more if statements to decide if it should be added into the displayBugs array or put into jail. I think I got the syntax right but when I put it into my if statements, it wouldn't run and I'm not sure why.
// acnh.errorFixing = (avail, month, bugSearch, displayBugs) => {
//     if (avail['firefly']) {
//         if (acnh.hemisphere === 'northern' && bugSearch.includes(month) === 6) {
//             displayBugs.push(avail)
//         } else if (acnh.hemisphere === 'southern' && bugSearch.includes(month) === 12) {
//             displayBugs.push(avail)
//         } else {
//             acnh.jail.push(avail)
//             console.log('bug jail', acnh.jail)
//         }
//     }
// }
