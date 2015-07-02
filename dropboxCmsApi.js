//import this file after
// dropbox datastore api: <script src="https://www.dropbox.com/static/api/2/dropins.js" id="dropboxjs" data-app-key="a8zq40gtw0w9wjy" type="text/javascript" ></script>
// dropins api: <script src="https://www.dropbox.com/static/api/dropbox-datastores-1.1-latest.js" type="text/javascript"></script>
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function deleteObjects(dropboxRecords, callback){
    //find dropboxRecords marked for delete and delete
    for (i = 0; i < dropboxRecords.length; i++){
        var record = dropboxRecords[i];
        console.log("iterating through dropboxRecords to delete");
        var obj = record.getFields();
        if (obj.shouldDelete){
            console.log("Deleting: " + obj);
            record.deleteRecord();
            dropboxRecords.splice(i, 1);
            callback(record.getId());
        }
    }
}

function retrieveObjects(tableName, retrievedObjs, callback){
    var datastoreManager = client.getDatastoreManager();
    datastoreManager.openDefaultDatastore(function (error, datastore) {
        if (error) {
            console.log("Error opening datastore");
            alert('Error opening default datastore: ' + error);
        }else{
            console.log("retrieving table: " + tableName);
            var imageTable = datastore.getTable(tableName);

            console.log("retrieving records from table: " + tableName);
            var records = imageTable.query();

            console.log("logging records from table: " + tableName);
            if (records.length < 1){
                console.log("No data found in data store");
            }else{
                for (i = 0; i < records.length; i++){
                    records[i].set("shouldDelete", false);
                    console.log(records[i].getFields());
                    retrievedObjs.push(records[i]);
                }
            }
        }
        callback(retrievedObjs);
    });
    datastoreManager.close();
}

function storeObjects(tableName, objects){
    if ( objects < 1 ){
        console.log("object array is empty");
    }else{
        var datastoreManager = client.getDatastoreManager();
        datastoreManager.openDefaultDatastore(function (error, datastore) {
            if (error) {
                console.log("Error opening datastore, could not store data");
                alert('Error opening default datastore: ' + error);
            }else{
                var table = datastore.getTable(tableName);
                for (i = 0; i < objects.length; i++){
                    var currentObject = objects[i];
                    table.insert(currentObject);
                    console.log('Stored Image: ' + currentObject.imageUrl);
                }
            }

        });
        datastoreManager.close();
        console.log("Done storing images");
    }
}

function createDropboxChooseButton(divId, array) {
    var chooseButton = Dropbox.createChooseButton({
        success: function (files) {
            for (i = 0; i < files.length; i++) {
                var imageUrl = files[i].link;
                console.log("File link: " + imageUrl);
                var dsImage = {
                    id: "N/A",
                    imageUrl: imageUrl,
                    description: "default description",
                    shouldDelete: false
                };
                var imageElement = getImageHtmlFromObj(dsImage);
                document.getElementById("selectedImagesDB").appendChild(imageElement);
                array.push(dsImage);
            }
        },
        cancel: function () {
            console.log("cancelled dropbox image chooser")
        },
        linkType: "direct", // or "preview"
        multiselect: true, // or false
        extensions: ['.jpg']
    });

    document.getElementById(divId).appendChild(chooseButton);
}

function initialize() {
    appKey = document.getElementById("dropboxjs").getAttribute("data-app-key");
    if (typeof appKey === 'undefined'){
        console.log("you're missing the app key attribute on your dropins script tag");
    }else{
        window.client = new Dropbox.Client({key: appKey});
        if (client.isAuthenticated()) {
            console.log("authenticated!");
        } else {
            console.log('Client not authenticated!');
            client.reset();
            client.authenticate({interactive: false}, function (error) {
                if (error) {
                    console.log('Authentication error: ' + error);
                } else {
                    console.log('Client successfully authenticated');
                }
            });
        }
    }
}
