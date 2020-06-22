
const DONE = 4
const OK = 200
const NOT_FOUND = 404

var show = (el, val='') => el.style.display = (val) ? (val) : ("block")
var hide = (el, actualHide=false) => el.style.display = (!actualHide) ? ('none') : ('hidden')

var formDiv = document.getElementById("intro")
var albumForm = document.getElementById("album-form")
var loadingAnimation = document.getElementById("loading")

var bracketDiv = document.getElementById('bracket')
var songList = document.getElementById('song-list')

var albumTracks = []


Document.prototype.createElementWithText = function(tagName, text) {
    let elem = this.createElement(tagName)
    elem.textContent = text
    return elem
}

albumForm.addEventListener('submit', function() {
    let [artist, album] = [albumForm.elements.artist.value, albumForm.elements.album.value]
    
    startApp(artist, album)
})

async function getAlbumTracks(artist, album) {
    //probably shouldn't use cors-anywhere but idk why it ain't working from ghp
    const response = await fetch(`https://cors-anywhere.herokuapp.com/https://genius.com/albums/${geniusClean(artist)}/${geniusClean(album)}`)
    
    const pageContent = new DOMParser().parseFromString(await response.text(), 'text/html')
    let tracks = Array.from(pageContent.getElementsByClassName("chart_row-content-title")).map(t => t.textContent.trim().slice(0, -1*("Lyrics").length).trim())
    return tracks
}


async function startApp(artist, album) {
    if(artist && album) {
        show(loading)
        for(let an of document.getElementsByClassName("album-name")) an.textContent = album
        albumTracks = await getAlbumTracks(artist, album)   
        if(albumTracks.length > 0) {
            document.getElementById("battle-tracks").textContent = albumTracks.join(", ")
            hide(formDiv)
            show(bracketDiv)
        } else {
            hide(loading)
            alert(`Album ${album} by ${artist} not found on Genius!`)
        }
    }
    
    //tracks.forEach(t => songList.appendChild(document.createElementWithText("li", t)))
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





