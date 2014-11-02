//import this file after dropbox datastore api:
//https://www.dropbox.com/static/api/dropbox-datastores-1.1-latest.js"

var DEFAULT_TABLE = 'imageTable';
var selectedDropBoxFiles = [];
var retrievedDatastoreObjs = [];

var client = new Dropbox.Client({key: "a8zq40gtw0w9wjy"});
if (client.isAuthenticated()) {
    console.log("authenticated!");
} else{
    client.reset();
    client.authenticate({interactive: false}, function (error) {
        if (error) {
            console.log('Authentication error: ' + error);
        }
    });
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

function markImageForDeletion(id){
    for (i = 0; i < retrievedDatastoreObjs.length; i++){
        var record = retrievedDatastoreObjs[i];
        console.log("searching for item to mark for deletion ...");
        console.log("record id: " + record.getId());
        console.log("id passed in: " + id);
        console.log(record.getId() == id);
        console.log(record.getId());
        if(record.getId() == id){
            var oldValue = record.get("shouldDelete");
            var newValue = !oldValue;
            console.log("shouldDelete was:" + oldValue);
            console.log("shouldDelete will be set to: " + newValue);
            record.set("shouldDelete", newValue);
            console.log(record.get("shouldDelete  is now:" + record.get("shouldDelete")));
        }
    }
}

function loadImagesFromDataStore(containerId){
    if(retrievedDatastoreObjs.length < 1){
        console.log("no images retrieved from data store")
    }else{
        console.log("logging images from data store");
        for (i = 0; i < retrievedDatastoreObjs.length; i++){
            var record = retrievedDatastoreObjs[i];
            var imageObj = record.getFields();
            imageObj.id = record.getId();
            console.log(imageObj);
            var imageElement = getImageHtmlFromObj(imageObj);
            document.getElementById(containerId).appendChild(imageElement);
        }
    }
}

function deleteImagesFromDataStore(){
    //find records marked for delete and delete
    for (i = 0; i < retrievedDatastoreObjs.length; i++){
        var record = retrievedDatastoreObjs[i];
        console.log("iterating through images to delete");
        var imageObj = record.getFields();
        if (imageObj.shouldDelete){
            console.log("Deleting: " + imageObj);
            htmlElement = document.getElementById(record.getId()).parentNode;
            record.deleteRecord();
            retrievedDatastoreObjs.splice(i, 1);
            $(htmlElement).remove();
        }
    }
}

function retrieveImagesInDataStore(){
    retrievedDatastoreObjs = [];
    var datastoreManager = client.getDatastoreManager();
    datastoreManager.openDefaultDatastore(function (error, datastore) {
        if (error) {
            console.log("Error opening datastore");
            alert('Error opening default datastore: ' + error);
        }else{
            console.log("retrieving table: " + DEFAULT_TABLE);
            var imageTable = datastore.getTable(DEFAULT_TABLE);

            console.log("retrieving records from table: " + DEFAULT_TABLE);
            var records = imageTable.query();

            console.log("logging records from table: " + DEFAULT_TABLE);
            if (records.length < 1){
                console.log("No data found in data store");
            }else{
                for (i = 0; i < records.length; i++){
                    records[i].set("shouldDelete", false);
                    console.log(records[i].getFields());
                    retrievedDatastoreObjs.push(records[i]);
                }
            }
        }

    });
    datastoreManager.close();
}

function preloadDropBoxImages(images, containerId){
    selectedDropBoxFiles = [];
    for (i = 0; i < images.length; i++){
        var imageUrl = images[i].link;
        console.log("File link: " + imageUrl);

        var dsImage = {
            id: "N/A",
            imageUrl: imageUrl,
            description: "default description",
            shouldDelete: false
        };
        var imageElement = getImageHtmlFromObj(dsImage);
        document.getElementById(containerId).appendChild(imageElement);

        selectedDropBoxFiles.push(dsImage);
    }
}

function storeSelectedDropBoxImagesInDataStore(){
    if ( selectedDropBoxFiles < 1 ){
        console.log("No files have been selected yet");
    }else{
        var datastoreManager = client.getDatastoreManager();
        datastoreManager.openDefaultDatastore(function (error, datastore) {
            if (error) {
                console.log("Error opening datastore, could not store image");
                alert('Error opening default datastore: ' + error);
            }else{
                var imageTable = datastore.getTable(DEFAULT_TABLE);
                for (i = 0; i < selectedDropBoxFiles.length; i++){
                    var currentImage = selectedDropBoxFiles[i];
                    imageTable.insert(currentImage);
                    console.log('Stored Image: ' + currentImage.imageUrl);
                }
            }

        });
        datastoreManager.close();
        console.log("Done storing images");
    }
}

var chooseButton = Dropbox.createChooseButton({
        // Required. Called when a user selects an item in the Chooser.
        success: function (files) {
            preloadDropBoxImages(files, "selectedImagesDB");
        },

        // Optional. Called when the user closes the dialog without selecting a file
        // and does not include any parameters.
        cancel: function () {

        },

        // Optional. "preview" (default) is a preview link to the document for sharing,
        // "direct" is an expiring link to download the contents of the file. For more
        // information about link types, see Link types below.
        linkType: "direct", // or "preview"

        // Optional. A value of false (default) limits selection to a single file, while
        // true enables multiple file selection.
        multiselect: true, // or false

        // Optional. This is a list of file extensions. If specified, the user will
        // only be able to select files with these extensions. You may also specify
        // file types, such as "video" or "images" in the list. For more information,
        // see File types below. By default, all extensions are allowed.
        extensions: ['.jpg']
    });

document.getElementById("selectButtonContainer").appendChild(chooseButton);

$("#saveToDSButton").mouseup(function(){
    storeSelectedDropBoxImagesInDataStore();
});

retrieveImagesInDataStore();
$("#loadFromDSButton").mouseup(function(){
    loadImagesFromDataStore("loadedImages");
});

$("#deleteFromDSButton").mouseup(function(){
    deleteImagesFromDataStore();
});
