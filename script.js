
const DONE = 4
const OK = 200
const NOT_FOUND = 404

var testButton = document.getElementById("test_button")
testButton.addEventListener('click', getAlbum)

function getAlbum(artist="Feed Me Jack", album="Chumpfrey") {
    album = geniusClean(album)
    artist = geniusClean(artist)
    
    let xhr = new XMLHttpRequest()
    xhr.open("GET", `https://genius.com/albums/${artist}/${album}`)
    xhr.onreadystatechange = function() {
        if(xhr.readyState === DONE) {
            if(xhr.status === OK) {
                console.log(getTracks(xhr.responseText))
            } else if(xhr.status === NOT_FOUND) {
                console.log(`Album ${album} by ${artist} not found!`)
            } else {
                console.log(`Error: ${xhr.status}`)
            }
        }
    }
    xhr.send(null)
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


function hasClass(attributes, className) {
    return 'class' in attributes && attributes.class.split(" ").includes(className)
}

function getTracks(pageContent) {
    let currentState = ""
    let currentTrack = ""
    let tracks = []

    let pageDoc = new DOMParser().parseFromString(pageContent)
    let tracks = Array.from(pageDoc.getElementsByClassName("chart_row-content-title")).map(t => t.textContent.trim().slice(0, -1*("Lyrics").length).trim())

    return tracks
}
