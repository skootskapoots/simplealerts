const audioContainer = document.getElementById('audio-container');
const audioSource = document.getElementById('audio-source');
const announcementContainer = document.getElementById('announcement-container');
const announcementMessage = document.getElementById('announcement-message');
const event = document.getElementById('event-type');
const name = document.getElementById('event-name');

let isRunning = false;
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

window.addEventListener('onWidgetLoad', (obj) => {
  if (obj && obj.detail && obj.detail.recents) {
    const data = obj.detail.recents;

    if (data.length) {
      const mostRecent = data[0];
      if (mostRecent.bulkGifted) {
        event.innerHTML = `Gifted ${mostRecent.amount} subs`;
        name.innerHTML = mostRecent.sender;
      } else {
        event.innerHTML = mostRecent.type;
        name.innerHTML = mostRecent.name;
      }
    }
  }
});
  
window.addEventListener('onEventReceived', (obj) => {
  if (obj && obj.detail && obj.detail.event) {
    const data = obj.detail.event;
    
    if (data.name && data.type && !data.isCommunityGift) {
      eventsQueue.push(new Promise(resolve => resolve(data)));
    }
  }
});

announcementContainer.addEventListener('animationend', () => {
  announcementContainer.classList.remove('slide');
  isRunning = false;
});

const eventProcess = () => {
  if (!isRunning && eventsQueue.length) {
    audioContainer.load();
    isRunning = true;
    
    let eventValues;
    const eventPromise = eventsQueue.shift();

    eventPromise
      .then((item) => {
        eventValues = item;
        announcementMessage.innerHTML = eventsMap[item.type];
        announcementContainer.classList.add('slide');
        audioContainer.play();
      })
      .then(() => new Promise(resolve => setTimeout(resolve, {alertDuration} * 1000)))
      .then(() => {
        if (eventValues.bulkGifted) {
          event.innerHTML = `Gifted ${eventValues.amount} subs`;
          name.innerHTML = eventValues.sender;
        } else {
          event.innerHTML = eventValues.type;
          name.innerHTML = eventValues.name;
        }
      })
      .then(() => new Promise(resolve => setTimeout(resolve, {alertDuration} * 1000)))
      .catch((error) => console.log('Promise error:', error))
      .finally(() => window.requestAnimationFrame(eventProcess));
  } else {
    window.requestAnimationFrame(eventProcess);
  }
};

window.requestAnimationFrame(eventProcess);
