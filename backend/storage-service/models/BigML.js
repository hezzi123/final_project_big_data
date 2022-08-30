const mongo = require("./ConnectMongoDB");
const bigml = require('bigml');

const { cache } = require("ejs");
const connection = new bigml.BigML('hezzi1','6da0d77cf471b455b1893ed468db03ec0d49119d'); //my API
const source = new bigml.Source(connection);
let modelInfo = {};


//here we create a new model when the user press the button Build Model
async function buildModel(){
    await mongo.mongoToCsv();
    var source = new bigml.Source(connection);
    source.create('./flightData.csv', function (error, sourceInfo) {
        if (!error && sourceInfo) {
            var dataset = new bigml.Dataset(connection);
            dataset.create(sourceInfo, function (error, datasetInfo) {
                if (!error && datasetInfo) {
                    var model = new bigml.Model(connection);
                    model.create(datasetInfo, function (error, model) {
                        if (!error && model) {
                            console.log("Model built successfully with code: " + model.code);
                            modelInfo = model;
                        } else {
                            console.log("There is a problem to create the model");
                        }
                    });
                } else {
                    console.log("There is a problem to create the dataset");
                }
            });
        } else {
            console.log("There is a problem to create the source");
        }
    });
}

//to predict the status
function predict(arr){
    
    // if(modelInfo = {}){
    //     var str = "No Model available now! Please click \"Build Model\"";
    //     console.log(str);
    //     return str;
    // }
    console.log("insert values: " + arr);

    const statusToPredict = {'_id':1,'day_type':arr[0], 'month': parseInt(arr[1]),'day':parseInt(arr[2]) ,
     'company':arr[3], 'leaving_country':arr[4], 'landing_country':arr[5], 'leaving_weather':arr[6], 'landing_weather':arr[7], 'flight_type':arr[8]};
    const prediction = new bigml.Prediction(connection);

    return new Promise((resolve,reject)=>{
        prediction.create(modelInfo, statusToPredict ,function (error, predictionInfo) {
            if (!error && predictionInfo) {
                // result to the console
                console.log("Prediction result: "+predictionInfo.object.output);
                console.log("confidence: " + predictionInfo.object.prediction_path.confidence)
                console.log("probabilities: " + predictionInfo.object.probabilities)
                const str = "-- " + predictionInfo.object.output + " --  with confidence of " + 
                (predictionInfo.object.prediction_path.confidence * 100).toString() + "%";
                resolve(str);
            } else {
                console.log("Error when the model try to predict the status");
            }
        });
        
    });
 
};

// buildModel();
module.exports = {buildModel ,predict};