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

wss.on("connection", function connection(ws) {
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

  ws.on("message", function incoming(msg) {
    msg = JSON.parse(msg);
    if (msg.type == "action") {
      if (msg.action == "add") {
        const user = msg.value;
        if (!queue.some(u => u.uid == user.uid)) {
          console.log("+ " + user.name);
          user.ws = ws;
          queue.push(user);
          wss.clients.forEach(sendQueue);
        } else {
          // already in queue, send notification or some shit
        }
      } else if (msg.action == "remove") {
        const user = msg.value;
        if (queue.some(u => u.uid == user.uid)) {
          console.log("- " + user.name);
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
        console.log("* " + user.name);
        notifyUser(user, notifContent);
      }
    }
  });
  // Send queue
  sendQueue(ws);
});
