function doGet(e) {
  let tracks = getAlbum()
  let doc = XmlService.parse(HtmlService.createHtmlOutputFromFile("Main.html").getContent())
  let root = doc.getRootElement()
  let songList = root.getChild("body").getChild("ul")  
  tracks.forEach(t => songList.addContent(XmlService.createElement("li").setText(t)))
  return HtmlService.createHtmlOutput(XmlService.getRawFormat().format(doc))
}

function getAlbum(artist="Feed Me Jack", album="Chumpfrey") {
  album = geniusClean(album)
  artist = geniusClean(artist)

  let albumPage = UrlFetchApp.fetch("https://genius.com/albums/"+artist+"/"+album+"/")
  if(albumPage.getResponseCode() == 404) Logger.log("not an actual album dorks")
  else {
    return getTracks(albumPage)
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


function hasClass(attributes, className) {
  return 'class' in attributes && attributes.class.split(" ").includes(className)
}

function getTracks(albumPage) {
  let htmlparser = htmlparser2.init()
  let currentState = ""
  let currentTrack = ""
  let tracks = []
      
  let parser = new htmlparser.Parser({
    onopentag: function(name, attributes) {
      if(hasClass(attributes, "chart_row-content-title")) {
        currentTrack = ""
        currentState = "TRACK"
      }
    },    
    ontext: function(text) {
      if(currentState == "TRACK") {
        currentTrack += text
      }
    },
    onclosetag: function(name) {
      if(currentState == "TRACK" && name == "h3") {
        currentTrack = currentTrack.trim().slice(0, -1*("Lyrics").length).trim()
        currentState = ""
        tracks.push(currentTrack)
      }
    }
  })
  
  parser.write(albumPage.getContentText())
  parser.end()
  
  return tracks
}
