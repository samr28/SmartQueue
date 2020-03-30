# SmartQueue
Webapp to manage user queues and notify users when it is their turn (virtual line). This app is production ready and was built during the [Devpost covid-19 global hackathon](https://covid-global-hackathon.devpost.com/).

## Usage example
### Student view
1. Student sets name by clicking on small pencil icon
2. Use the button at the bottom to easily join the queue
![Screenshot 1](https://i.imgur.com/s2cgLDZ.png)
### Instructor view
1. Instructor can see all students currently in the queue
2. First, set your meeting link by clicking on the pencil icon
3. To notify a student and send them your meeting link, click the bell icon
4. To remove a student, simply click on the red X icon next to their name
![Screenshot 2](https://i.imgur.com/uj5nhkQ.png)

## Setup
1. Install nodejs and yarn
2. Clone the repo
3. Run the backend (I recommend running it in a screen session)
   1. `cd backend/`
   2. `node index.js`
4. Build the frontend/webapp
   1. `cd webapp`
   2. Set the address of the backend websocket in `webapp/src/App.jsx`
   3. `yarn build`
   4. Point your prefered static hosting app to the `webapp/build/` directory or move the build directory to your static hosting directory (common location: `/var/www/html/`)

## Example setup with NGINX
```nginx
server {
  server_name testSmartQueue.com;
  root /home/user/SmartQueue/webapp/build;
  index index.html index.htm;

  # Main webapp
  location / {
    try_files $uri /index.html;
  }

  # Websocket/backend
  location /ws/ {
    # Set this to the port specified in backend/index.js (default:8888)
    proxy_pass http://localhost:8888;
    # Make sure all headers are passed
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
  }
}
```
