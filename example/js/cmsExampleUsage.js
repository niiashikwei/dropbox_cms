
document.addEventListener("DOMContentLoaded", function(event) {
    initialize();
    createDropboxChooseButton("selectButtonContainer", selectedDropBoxFilesArray);

    $("#saveToDSButton").mouseup(function(){
        storeObjects(DEFAULT_TABLE, selectedDropBoxFilesArray);
    });

    $("#loadFromDSButton").mouseup(function(){
        retrieveObjects(DEFAULT_TABLE, retrievedDatastoreObjs, loadImagesFromDataStore);
    });

    $("#deleteFromDSButton").mouseup(function(){
        deleteObjects(retrievedDatastoreObjs, removeHtmlElementWithId);
    });
});
