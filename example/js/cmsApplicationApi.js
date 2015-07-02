var DEFAULT_TABLE = 'imageTable';
var DROPBOX_APP_KEY = "a8zq40gtw0w9wjy";

var IMAGE_CONTAINER_ID = "loadedImages";
var selectedDropBoxFilesArray = [];
var retrievedDatastoreObjs = [];

function removeHtmlElementWithId(recordId){
    console.log("removing html element");
    var htmlElement = document.getElementById(recordId).parentNode;
    $(htmlElement).remove();
}

function loadImagesFromDataStore(retrievedImageRecords, containerId){
    if(retrievedImageRecords.length < 1){
        console.log("no images retrieved from data store")
    }else{
        console.log("logging images from data store");
        for (i = 0; i < retrievedImageRecords.length; i++){
            var record = retrievedImageRecords[i];
            var imageObj = record.getFields();
            imageObj.id = record.getId();
            console.log(imageObj);
            var imageElement = getImageHtmlFromObj(imageObj);
            document.getElementById(containerId).appendChild(imageElement);
        }
    }
}

function markImageForDeletion(recordId){
    for (i = 0; i < retrievedDatastoreObjs.length; i++){
        var record = retrievedDatastoreObjs[i];
        console.log("searching for item to mark for deletion ...");
        console.log("record recordId: " + record.getId());
        console.log("recordId passed in: " + recordId);
        console.log(record.getId() == recordId);
        console.log(record.getId());
        if(record.getId() == recordId){
            var oldValue = record.get("shouldDelete");
            var newValue = !oldValue;
            console.log("shouldDelete was:" + oldValue);
            console.log("shouldDelete will be set to: " + newValue);
            record.set("shouldDelete", newValue);
            console.log(record.get("shouldDelete  is now:" + record.get("shouldDelete")));
        }
    }
}

function getImageHtmlFromObj(imageObj){
    return getImageHtmlFromUrlAndDescription(imageObj.imageUrl, imageObj.description, imageObj.shouldDelete, imageObj.id);
}

function getImageHtmlFromUrlAndDescription(imageUrl, imageDescription, shouldDelete, id){
    var imageContainer = document.createElement("div");

    var imageDescriptionElement = document.createElement("p");
    imageDescriptionElement.innerText = imageDescription;
    imageContainer.appendChild(imageDescriptionElement);

    var deleteCheckbox = document.createElement("input");
    deleteCheckbox.type = "checkbox";
    deleteCheckbox.id = id;
    deleteCheckbox.value = shouldDelete;
    $(deleteCheckbox).change(function(){
        markImageForDeletion(id);
    });
    imageContainer.appendChild(deleteCheckbox);

    var imageElement = document.createElement("img");
    imageElement.setAttribute("src", imageUrl);
    imageElement.setAttribute("height", "200px");
    imageElement.setAttribute("width", "200px");
    imageContainer.appendChild(imageElement);

    return imageContainer;
}