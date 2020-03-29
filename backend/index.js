const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8888 });

const mockNotification = JSON.stringify({
  type: "notification",
  title: "Test"
});

let queue = [
  { uid: 1234, name: "Sam", ws: null },
  { uid: 420, name: "Bob", ws: null },
  { uid: 69, name: "Jane", ws: null }
];

const WEBSOCKET_PING_TIME = 40000;
// const WEBSOCKET_PING_TIME = 5000;

const genRandID = () => {
  // Rand number
  return Math.floor(Math.random() * 1000000);
};

let sentPings = [];

let pingMsg = { type: "ping", timestamp: new Date() };
const pingClient = client => {
  pingMsg.id = client.id;
  console.log(`   Ping sent: ${pingMsg.id}`);
  client.send(JSON.stringify(pingMsg));
};

const clientKeepAlive = client => {
  setTimeout(() => {
    if (client.readyState === WebSocket.CLOSED) {
      return;
    }
    pingClient(client);
    clientKeepAlive(client);
  }, WEBSOCKET_PING_TIME);
};

wss.on("connection", ws => {
  ws.id = genRandID();
  console.log(`Opened Connection - ${ws.id} (${wss.clients.size} total connections)`);
  const sendQueue = client => {
    let queueCopy = [];
    queue.forEach(item => {
      queueCopy.push({ uid: item.uid, name: item.name });
    });
    client.send(JSON.stringify({ type: "queue", value: queueCopy }));
  };

  const notifyUser = (user, notifContent) => {
    const uid = user.uid;
    let notificationMsg = { type: "notification", notifContent: notifContent };
    notificationMsg = JSON.stringify(notificationMsg);
    queue.forEach(item => {
      if (item.uid == uid) {
        item.ws.send(notificationMsg);
        return;
      }
    });
  };

  ws.on("close", event => {
    console.log(`Closed Connection - ${ws.id} (${wss.clients.size} total connections)`);
  });

  ws.on("message", msg => {
    msg = JSON.parse(msg);
    if (msg.type == "action") {
      if (msg.action == "add") {
        const user = msg.value;
        if (!queue.some(u => u.uid == user.uid)) {
          console.log(`+ ${user.name}(${user.uid})`);
          user.ws = ws;
          queue.push(user);
          wss.clients.forEach(sendQueue);
        } else {
          // already in queue, send notification or some shit
        }
      } else if (msg.action == "remove") {
        const user = msg.value;
        if (queue.some(u => u.uid == user.uid)) {
          console.log(`- ${user.name}(${user.uid})`);
          // Remove from queue
          for (let i = 0; i < queue.length; i++) {
            if (queue[i].uid == user.uid) {
              // queue[i].ws.send(mockNotification);
              queue.splice(i, 1);
            }
          }
          wss.clients.forEach(sendQueue);
        }
      } else if (msg.action == "sendnotif") {
        const user = msg.value;
        const { notifContent } = msg;
        console.log(`* ${user.name}(${user.uid})`);
        notifyUser(user, notifContent);
      }
    } else if (msg.type == "pingres") {
      console.log(`   Ping res:  ${msg.id}`);
    } else if (msg.type === "request") {
      if (msg.value === "queue") {
        sendQueue(ws);
      }
    } else if (msg.type === "updateid") {
      // debug variable/console output
      let wasfound = false;
      // Check if user is in queue
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].uid === msg.uid) {
          // Found user, update websocket
          wasfound = true;
          queue[i].ws = ws;
        }
      }
      console.log(`└ Updateid ${msg.uid} (found: ${wasfound})`);
    }
  });
  // Send queue
  sendQueue(ws);
  clientKeepAlive(ws);
});
