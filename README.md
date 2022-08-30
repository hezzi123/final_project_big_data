# Real time monitor and take-off land prediction
## Final Project - Big Data Course 

<a href="url"><img src="https://wordpress-network.prod.aws.skyscnr.com/wp-content/uploads/2018/05/airplane-plane-flight-city-heroimage.jpg?w=1000&h=312&crop=1" height="250" width="900" ></a>

## Explained 

In the current project, we will create a solution for data processing and display a monitor of the traffic flights to Israel through Ben Gurion Airport and enables machine learning and the formation of a predictive model from the accumulated data.

The solution will integrate cloud services and web services into a complete system.

The essence of the solution:

The system is made up of three sub-systems which together enable Near Real Time monitoring of the landing and takeoff status
using dashboard as well as creating a prediction model, for each flight, whether it will be on time or delayed in the schedule.

SubSystem A is the producer, get the data and send it to the two other subsystems.
SubSystem B is receiving the data from kafka and store it in Redis. In addition, it shows all the front part for the user.
SubSystem C gets from Kafka all the flights and allows you to analyze the histories using a machine learning algorithm and create a prediction model to the delay status of the flight. In this part we used MongoDB and BigML.

## Planes Monitor <a href="url"><img src="https://cdn-icons-png.flaticon.com/512/1565/1565822.png" height="45" width="40" ></a>

![WhatsApp Image 2022-08-28 at 2 26 09 PM](https://user-images.githubusercontent.com/57839539/187072374-6a81b2a5-1eb2-4771-ad3e-3344f0744e1e.jpeg)

## ML Monitor <a href="url"><img src="https://cdn-icons-png.flaticon.com/512/2625/2625933.png" height="50" width="40" ></a>

![WhatsApp Image 2022-08-28 at 3 02 34 PM](https://user-images.githubusercontent.com/57839539/187073773-b53dfd22-8b44-49eb-962a-eff9e33136af.jpeg)

### Presenting <a href="url"><img src="https://cdn-icons-png.flaticon.com/512/1534/1534938.png" height="50" width="40" ></a>

* SAMUEL BISMUTH
* ARIEL YECHEZKEL
* ERAN LEVY

# Running configuration

Make sure you have npm installed in your machine by running:

    sudo apt install npm

Install express with:

    npm install express

There are some more thing to install. Use npm install to install them.

To run a service locally, do cd to the folder and then run

    npm start

To run the project you need to open 3 terminals, one for each subSystem.
First run npm i, in each terminal to install node_modules.
For the first SubSystem cd to message-broker-service folder and run - npm start.
For the second SubSystem cd to intelligence-service folder and run - npm start. In addition, go to index.html file and do - open with live server or ALT+L ALT+O
For the first SubSystem cd to storage-service folder and run - node app.js.

We need to configure some environement variable in the file .env in the root of the project.
