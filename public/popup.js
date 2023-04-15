// https://www.youtube.com/playlist?list=PLw5KL4Vdiy4rOEfSUrvtweACp1eJfyhSg //test
// https://www.youtube.com/playlist?list=PLw5KL4Vdiy4rAy77yRvFv44lGY4BHaEVi //test2
// https://www.youtube.com/playlist?list=PLw5KL4Vdiy4qG5DUHUAjt2WY45G1tx0Tk //test3
// https://www.youtube.com/playlist?list=PLyX_NJ4p86j2lR7gTaksBKd06HRtFDpph //albums private
// https://www.youtube.com/playlist?list=PLyX_NJ4p86j09VJOWo_RSi86-UydTZKUr //Jap music private
// https://www.youtube.com/playlist?list=PLyX_NJ4p86j3ZbFmubEzUuLVzS-tGr7uT //soundtrack private

let playlist_url = document.getElementById('url_playlist')
let addButton = document.getElementById('add_playlist')
let playlist_storage = new Set();


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAinkmG7Rcw7mcXotlyAJUvijmUS_KQJy8",
  authDomain: "playlist-archi.firebaseapp.com",
  projectId: "playlist-archi",
  storageBucket: "playlist-archi.appspot.com",
  messagingSenderId: "890800023068",
  appId: "1:890800023068:web:432a5f84f3be2111ac21d9"
};
// // Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

async function queryForDocuments() {
  playlistCollection = firestore.collection('listCollection').doc('playlistCollection');
  const playlistDoc = await playlistCollection.get();
  playlist_array = playlistDoc.data().playlistArray;

  if(playlist_array.length !== 0){
    for (const playlist_url of playlist_array){
      query = firestore.collection(playlist_url.slice(38));
      const snapshot = await query.get();
      console.log(playlist_url)

      snapshotMap = new Map()
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        snapshotMap.set(doc.id, doc.data())
        
      });
      publishPlaylist(playlist_url, snapshotMap)
    }
  }
}
console.log('Firestore setup')
//------------------------------------------------------------------------------//

  function publishPlaylist(playlist_url, snapshotMap){
    videos_containerExist = document.getElementById("videos-container-" + playlist_url.slice(38))
    //opend or closed
    videos_containerDisplay = "none"

    
    if(!!videos_containerExist){
      videos_containerDisplay = getComputedStyle(videos_containerExist).display
      // videos_containerExist.remove();
    }

    playlist_containerExist = !!document.getElementById(playlist_url.slice(38));;
    if(!playlist_containerExist){
      console.log(playlist_containerExist)
      createPlaylist(playlist_url, snapshotMap);
    }

    //videos
    console.log(playlist_containerExist)
    playlist_container = document.getElementById(playlist_url.slice(38))

    let videos_container = document.createElement("div");
    videos_container.className = "videos-container"
    videos_container.id = "videos-container-" + playlist_url.slice(38)
    videos_container.style.display = videos_containerDisplay

    playlist_container.appendChild(videos_container);

    let videos_ol = document.createElement("ol");
    videos_ol.className = "videos-ol"
    videos_ol.id = "videos-ol-" + playlist_url.slice(38)
    videos_container.appendChild(videos_ol);

    for (const [video_id, video_data] of snapshotMap) {
      videoExist = !!document.getElementById(video_data.link.slice(32))
      if(videoExist == false){
        console.log("create")
        createVideos(playlist_url, video_id, video_data);      
      }
      //removed
      if(video_data.removed){
        video_block = document.getElementById(video_data.link.slice(32))
        video_block.style.backgroundColor = "#fa8072";
      }
    };

  }
  function createPlaylist(playlist_url, snapshotMap){
    let playlist_container = document.createElement("div");
    playlist_container.className = "playlist-container"
    playlist_container.id = playlist_url.slice(38)
    document.getElementById("content-container").appendChild(playlist_container)


    //playlist-dropdown
    let playlist_dropdown = document.createElement("div");
    playlist_dropdown.className = "playlist-dropdown"
    playlist_container.appendChild(playlist_dropdown)

    //remove-button
    let playlist_remove_button = document.createElement("button");
    playlist_remove_button.className = "playlist-remove-button";
    playlist_remove_button.innerHTML = "X";
    playlist_remove_button.type = "submit";
    playlist_remove_button.onclick = function () {
      send(playlist_url, "remove");
    };
    playlist_dropdown.appendChild(playlist_remove_button);

    //playlist title
    const [firstVideo] = snapshotMap.values();
    let playlist_title = document.createElement("span");
    playlist_title.className = "playlist-title";
    playlist_dropdown.appendChild(playlist_title);
    const playlistContent = document.createTextNode(firstVideo.playlist_title);
    playlist_title.appendChild(playlistContent);

    //dropdown-button
    let playlist_dropdown_button = document.createElement("button");
    playlist_dropdown_button.className = "playlist-dropdown-button";
    playlist_dropdown_button.innerHTML = "button";
    playlist_dropdown_button.type = "button";
    playlist_dropdown_button.onclick = function () {
      // alert(firstVideo.playlist_title);
      videos_container = document.getElementById("videos-container-" + playlist_url.slice(38))
      
      if (getComputedStyle(videos_container).display === "none") {
        videos_container.style.display = "block";
      } else {
        videos_container.style.display = "none";
      }
    };
    playlist_dropdown.appendChild(playlist_dropdown_button);
  }
  function createVideos(playlist_url, video_id, video_data){
    videos_ol = document.getElementById("videos-ol-" + playlist_url.slice(38))

    let video_li = document.createElement("li"); 
    video_li.className = "video-li"
    videos_ol.appendChild(video_li);

    let video_block = document.createElement("div"); 
    video_block.className = "video-block"
    video_block.id = video_data.link.slice(32)
    video_li.appendChild(video_block)

    // //removed
    // if(video_data.removed){
    //   video_block.style.backgroundColor = "#fa8072";
    // }
    //create Video Object

    //image 
    let image_block = document.createElement("div"); 
    image_block.className = "image-block"
    video_block.appendChild(image_block)

    let video_image = document.createElement("img");
    video_image.className = "video-image"
    video_image.src = video_data.thumbnail
    image_block.appendChild(video_image);

    //text
    let text_block = document.createElement("div"); 
    text_block.className = "text-block"
    video_block.appendChild(text_block)

    //videoTitle
    let videoTitle_block = document.createElement("div"); 
    videoTitle_block.className = "videoTitle-block"
    text_block.appendChild(videoTitle_block)

    const newVideoTitle = document.createTextNode(video_data.title);
    videoTitle_block.appendChild(newVideoTitle);

    // //videoTitle span
    // let videoTitle_span = document.createElement("span"); 
    // videoTitle_span.className = "videoTitle-span"
    // videoTitle_block.appendChild(videoTitle_span)

    // const newVideoTitleSpan = document.createTextNode(video_data.title);
    // videoTitle_span.appendChild(newVideoTitleSpan);

    //videoAuthor
    let videoAuthor_block = document.createElement("div"); 
    videoAuthor_block.className = "videoAuthor-block"
    text_block.appendChild(videoAuthor_block)

    const newVideoAuthor = document.createTextNode(video_data.author);
    videoAuthor_block.appendChild(newVideoAuthor);

    //videoDownloadBlock
    let videoDownload_block = document.createElement("div"); 
    videoDownload_block.className = "videoDownload-block"
    video_block.appendChild(videoDownload_block)

    //videoDownloadButton
    let videoDownload_button = document.createElement("button"); 
    videoDownload_button.className = "videoDownload-button"
    videoDownload_block.appendChild(videoDownload_button)
  }







  if(playlist_url){
    addButton.onclick = (() => {
      if (url_valid(playlist_url)){
        send(playlist_url, "add");
      }
      else {
        playlist_url.value = "Invalid URL";
      }

      playlist_url.addEventListener("click", () => {
        playlist_url.value = null
      })

    });
  }
  main();
  async function main(){
    while(true){
      await queryForDocuments()
      await delay(30); //seconds
    }
  } 
  function delay(seconds) { //figure why this works
    let ms = seconds * 1000;
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
  } 
  function url_valid(playlist_url){
    if(playlist_url.value.slice(0, 38) == "https://www.youtube.com/playlist?list="){
      return true;
    }
    return false;
  }
  async function send(playlist_url, choice){
    //remove
    console.log(playlist_url, choice)
    playlist_urlValue = playlist_url
    if(choice == "add") {
      playlist_urlValue = playlist_url.value
    }

    console.log(playlist_urlValue)
    const data = {
      command: choice,
      url: playlist_urlValue
    }
    playlist_url.value = null;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

    // console.log(data)  
    await fetch('http://localhost:3000/', options)
    .then( async (response) => {
      const data = await response.json();
      console.log(data.status, data.message);
      playlist_url.value = data.message;
    })
    .catch(error => {
      console.error('Error:', error);
      playlist_url.value = 'Failed to Fetch Server';
    });
  }


  // chrome.storage.sync.set({ storage: playlist_array}, (data) => {
  //     console.log("data saved", data)
  // });






// const registerServiceWorker = async () => {
//   if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => { 

//       navigator.serviceWorker.register('../background.js')
//       .then(register => console.log('Service Worker: Registered'))
//       .catch(error => console.log('Service Worker: Registered', error))
//     });

//   }
// };
