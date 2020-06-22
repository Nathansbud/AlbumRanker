
const DONE = 4
const OK = 200
const NOT_FOUND = 404

var testButton = document.getElementById("test_button")
testButton.addEventListener('click', function() {
    startApp()
})


async function getAlbumTracks(artist="Feed Me Jack", album="Chumpfrey") {
    album = geniusClean(album)
    artist = geniusClean(artist)

    //probably shouldn't use cors-anywhere but idk why it ain't working from ghd
    const response = await fetch(`https://cors-anywhere.herokuapp.com/https://genius.com/albums/${artist}/${album}`)
    const pageContent = new DOMParser().parseFromString(await response.text(), 'text/html')
    let tracks = Array.from(pageContent.getElementsByClassName("chart_row-content-title")).map(t => t.textContent.trim().slice(0, -1*("Lyrics").length).trim())
    return tracks
}

async function startApp() {
    let tracks = await getAlbumTracks()
    console.log(tracks)
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





