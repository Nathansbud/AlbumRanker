
const DONE = 4
const OK = 200
const NOT_FOUND = 404

var show = (el, val='') => el.style.display = (val) ? (val) : ("block")
var hide = (el, actualHide=false) => el.style.display = (!actualHide) ? ('none') : ('hidden')

var formDiv = document.getElementById("intro")
var albumForm = document.getElementById("album-form")
var loadingAnimation = document.getElementById("loading")

var bracketDiv = document.getElementById('bracket')
var leftOption = document.getElementById("battle-left")
var rightOption = document.getElementById("battle-right")
var lr = ["battle-left", "battle-right"]

var resultsDiv = document.getElementById('results')
var resultsTable = document.getElementById('results-table')

var albumTracks = []
var albumRanking = []
var processSet = []
var processedIndex = 0


Document.prototype.createElementWithText = function(tagName, text) {
    let elem = this.createElement(tagName)
    elem.textContent = text
    return elem
}

albumForm.addEventListener('submit', function() {
    let [artist, album] = [albumForm.elements.artist.value, albumForm.elements.album.value]
    
    startApp(artist, album)
})

Array.from(document.getElementsByClassName('battle-option')).forEach(bo => bo.addEventListener('click', function() {
    processBattle(processSet, bo.textContent, document.getElementById((lr.indexOf(bo.getAttribute('id')) == 0) ? (lr[1]) : (lr[0])).textContent)
}))

function processBattle(cArr, winner, loser) {
    console.log({winner: winner, loser: loser})
    console.log(["Current Array", cArr])
    if(albumRanking.length < albumTracks.length) {
        if(cArr.length > 1) {
            if(cArr.includes(loser)) {
                if(cArr.indexOf(loser) < cArr.length - 1) {
                    processSet = cArr.slice(cArr.indexOf(loser)+1)
                    setBattle(processSet[Math.floor(processSet.length / 2)], (cArr.includes(loser)) ? (winner) : (loser))
                } else {
                    albumRanking.splice(albumRanking.indexOf(loser)+1, 0, winner)
                    processSet = []
                    setBattle(albumRanking[Math.floor(albumRanking.length / 2)], albumTracks[++processedIndex])
                }
            } else {
                if(cArr.indexOf(winner) == 0) {
                    albumRanking.splice(albumRanking.indexOf(winner), 0, loser)
                    processSet = []
                    setBattle(albumRanking[Math.floor(albumRanking.length / 2)], albumTracks[++processedIndex])
                } else {
                    processSet = cArr.slice(0, cArr.indexOf(winner))
                    setBattle(processSet[Math.floor(processSet.length / 2)], (cArr.includes(loser)) ? (winner) : (loser))
                }
            }
        } else if(cArr.length == 1) {
            if(cArr.includes(loser)) albumRanking.splice(albumRanking.indexOf(loser) + 1, 0, winner)
            else {
                if(albumRanking.indexOf(winner) > 0) {
                    albumRanking.splice(albumRanking.indexOf(winner), 0, loser)
                } else {
                    albumRanking.unshift(loser)
                }
            }
            
            processSet = []        
            setBattle(albumRanking[Math.floor(albumRanking.length / 2)], albumTracks[++processedIndex])
        } else {
            if(albumRanking.length == 0) {
                albumRanking.push(loser, winner)
                processedIndex += 2
                setBattle(albumRanking[1], albumTracks[processedIndex])
            } else if(albumRanking.length == 2) {
                if(albumRanking.includes(winner)) {
                    albumRanking.splice(1, 0, loser)
                } else {
                    albumRanking.push(winner)
                }
                processSet = []
                setBattle(albumRanking[1], albumTracks[++processedIndex])
            } else {
                //there's a bug right now to do with out of bounds but i'm literally so tired i can't keep my eyes open
                if(processSet.length == 0) {
                    if(albumRanking.includes(winner)) {
                        processSet = albumRanking.slice(0, albumRanking.indexOf(winner))
                    } else {
                        processSet = albumRanking.slice(albumRanking.indexOf(loser) + 1)
                    }
                } else {
                    if(processSet.includes(winner)) {
                        processSet = cArr.slice(0, cArr.indexOf(winner))
                    } else {
                        processSet = cArr.slice(cArr.indexOf(loser) + 1)
                    }
                }
                setBattle(processSet[Math.floor(processSet.length / 2)], albumTracks[processedIndex])
            }
        }
        console.log(["Process Set", processSet])
        console.log(albumRanking)
    } 
    
    if(albumRanking.length == albumTracks.length) {
        function createSongRow(st, i) {
            let tr = document.createElement("tr")
            
            let trackRank = document.createElement("td")
            trackRank.textContent = i
            let trackName = document.createElement("td")
            trackName.textContent = st
            tr.appendChild(trackRank)
            tr.appendChild(trackName)
            return tr
        }

        setBattle("--", "--")
        showResults()
    }
}

function showResults() {
    function createSongRow(st, i) {
        let tr = document.createElement("tr")
        
        let trackRank = document.createElement("td")
        trackRank.textContent = i
        let trackName = document.createElement("td")
        trackName.textContent = st
        tr.appendChild(trackRank)
        tr.appendChild(trackName)
        return tr
    }
    albumRanking.reverse().forEach((st, idx) => resultsTable.appendChild(createSongRow(st, idx+1)))
    hide(bracketDiv)
    hide(formDiv)
    show(resultsDiv)
}


async function getAlbumTracks(artist, album) {
    //probably shouldn't use cors-anywhere but idk why it ain't working from ghp
    const response = await fetch(`https://cors-anywhere.herokuapp.com/https://genius.com/albums/${geniusClean(artist)}/${geniusClean(album)}`)
    
    const pageContent = new DOMParser().parseFromString(await response.text(), 'text/html')
    let tracks = Array.from(pageContent.getElementsByClassName("chart_row-content-title")).map(t => t.textContent.trim().slice(0, -1*("Lyrics").length).trim())
    return tracks
}

function setBattle(left, right) {
    leftOption.textContent = left
    rightOption.textContent = right
}


async function startApp(artist, album) {
    if(artist && album) {
        show(loading)
        for(let an of document.getElementsByClassName("album-name")) an.textContent = album
        albumTracks = await getAlbumTracks(artist, album)
        if(albumTracks.length > 1) {
            document.getElementById("battle-tracks").textContent = albumTracks.join(", ")
            albumTracks = shuffle(albumTracks) //shuffle so things are kept spicy
            
            setBattle(albumTracks[0], albumTracks[1])
            
            hide(formDiv)
            show(bracketDiv)
        } else if(albumTracks.length == 1) {   
            albumRanking = albumTracks 
            showResults()
        } else {
            hide(loading)
            albumForm.reset()
            alert(`Album ${album} by ${artist} not found on Genius!`)
        }
    }
} 
  
function geniusClean(fi) {
    let splitSet = ["ft.", "feat.", "featuring.", "(with"]
    let replaceSet = {"&":"and", "•":"", "æ":"", "œ":""}
        
    Object.entries(replaceSet).forEach(([k, v]) => fi = fi.replace(k, v))
    splitSet.forEach(ss => fi = fi.split(` ${ss} `)[0])

    fi = fi.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                .replace(/[^a-zA-Z0-9]/g, "-")
                                .replace(/[-]+/g, "-")
                                .replace(/(^-)|(-$)/, "")

    return fi.charAt(0).toUpperCase() + fi.slice(1).toLowerCase()
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(arr) {
    let currentIndex = arr.length, randIndex, temp
    while(0 !== currentIndex) {
        randIndex = Math.floor(Math.random()*currentIndex)
        currentIndex -= 1

        temp = arr[randIndex]
        arr[randIndex] = arr[currentIndex]
        arr[currentIndex] = temp
    }
    return arr
}
