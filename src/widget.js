const announcementContainer = document.getElementById('announcement-container');
const announcementMessage = document.getElementById('announcement-message');
const event = document.getElementById('event-type');
const name = document.getElementById('event-name');

const eventsQueue = [];
const eventsMap = {
    follower: '{followerText}',
    subscriber: '{subscriberText}',
    tip: '{tipText}',
    cheer: '{cheerText}',
    host: '{hostText}',
    raid: '{raidText}',
    perk: '{perkText}'
  };

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  
window.addEventListener('onWidgetLoad', (obj) => {
  if (obj && obj.detail && obj.detail.recents) {
    const data = obj.detail.recents;

    if (data.length) {
      const mostRecent = data[0];
      event.innerHTML = mostRecent.type;
      name.innerHTML = mostRecent.name;
    }
  }
});
  
window.addEventListener('onEventReceived', (obj) => {
  if (obj && obj.detail && obj.detail.event) {
    const data = obj.detail.event;
    
    if (data.name && data.type) {
      eventsQueue.push(data);
    }
  }
});

announcementContainer.addEventListener('animationend', () => {
  announcementContainer.classList.remove('slide');
});

const eventProcess = () => {
  const data = eventsQueue.shift();

  if (data && data.name && data.type) {
    announcementMessage.innerHTML = eventsMap[data.type];
    announcementContainer.classList.add('slide');

    delay({announcementDuration} * 1000 / 2)
      .then(() => {
        event.innerHTML = data.type;
        name.innerHTML = data.name;
      })
      .then(() => window.requestAnimationFrame(eventProcess));
    } else {
      window.requestAnimationFrame(eventProcess);
    }
};

window.requestAnimationFrame(eventProcess);
