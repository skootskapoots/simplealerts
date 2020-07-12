const audioContainer = document.getElementById('audio-container');
const audioSource = document.getElementById('audio-source');
const announcementContainer = document.getElementById('announcement-container');
const announcementMessage = document.getElementById('announcement-message');
const event = document.getElementById('event-type');
const name = document.getElementById('event-name');

let isRunning = false;
const eventsQueue = [];
const tierMap = {
  prime: 'Prime',
  1000: 'Tier 1',
  2000: 'Tier 2',
  3000: 'Tier 3'
}
const announcementMap = {
    follower: '{followerText}',
    subscriber: '{subscriberText}',
    tip: '{tipText}',
    cheer: '{cheerText}',
    host: '{hostText}',
    raid: '{raidText}',
    perk: '{perkText}'
  };

const updateFields = (eventValues) => {
  /**
   * Certain event types require certain plain language in order to make sense and make the viewer feel
   * like that are a part of the community at large. Of course, there are two cases where things are a
   * little weird, both concerning gifted subs. They are handled in their own statements to make it easier
   * to fuss about.
   */
  if (eventValues.bulkGifted) {
    event.innerHTML = `Gifted ${eventValues.amount} subs`;
    name.innerHTML = eventValues.sender;
    return;
  }

  if (eventValues.amount === 'gift') {
    event.innerHTML = `${eventValues.sender} gifted them a ${tierMap[eventValues.tier]} sub`;
    name.innerHTML = eventValues.name;
    return;
  }

  let eventMessage;
  switch (eventValues.type) {
    case 'subscriber': {
      eventMessage = `${tierMap[eventValues.tier]} sub for ${eventValues.amount} ${eventValues.amount > 1 ? 'months' : 'month'}`;
      break;
    }
    case 'tip': {
      eventMessage = `Tipped ${eventValues.amount} ${eventValues.amount > 1 ? 'dollars' : 'dollar'}`;
      break;
    }
    case 'cheer': {
      eventMessage = `Cheered with ${eventValues.amount} ${eventValues.amount > 1 ? 'bits' : 'bit'}`;
      break;
    }
    case 'host': {
      eventMessage = `Hosted for ${eventValues.amount} ${eventValues.amount > 1 ? 'viewers' : 'viewer'}`;
      break;
    }
    case 'raid': {
      eventMessage = `Raided with ${eventValues.amount} ${eventValues.amount > 1 ? 'raiders' : 'raider'}`;
      break;
    }
    case 'perk': {
      eventMessage = `Redeemed perk`;
      break;
    }
    default:
      eventMessage = eventValues.type
  }

  event.innerHTML = eventMessage;
  name.innerHTML = eventValues.name;
}

window.addEventListener('onWidgetLoad', (obj) => {
  /**
   * When the widget is initially loaded, an object is sent that will contain the last
   * events that were received. We can use this to initialize the widget.
   */
  if (obj && obj.detail && obj.detail.recents) {
    const data = obj.detail.recents;

    if (data.length) {
      const mostRecent = data[0];
      updateFields(mostRecent);
    }
  }
});
  
window.addEventListener('onEventReceived', (obj) => {
  /**
   * This fires when an event is received from StreamElements, containing an object with all
   * of the values we need for any given message.
   */
  if (obj && obj.detail && obj.detail.event) {
    const data = obj.detail.event;
    
    if (data.name && data.type && !data.isCommunityGift) {
      eventsQueue.push(new Promise(resolve => resolve(data)));
    }
  }
});

announcementContainer.addEventListener('animationend', () => {
  /**
   * When you declare an animation in CSS on a DOM element, this event fires when the animation
   * is complete. Be warned, it's finicky. If too many DOM updates are triggered on the element,
   * you can prevent this from firing, and thusly prevent the `isRunning` flag from resetting.
   */
  announcementContainer.classList.remove('slide');
  isRunning = false;
});

const eventLoop = () => {
  /**
   * This is the meat and potatoes of the widget. It uses a promise with designed delays to
   * ensure that the messages are swapped without the user seeing flicker and that the
   * `animationend` event is actually triggered on the DOM element. Without the delays, the DOM
   * updates too quickly and can prevent this event from firing, thus clogging up the event loop.
   */
  if (!isRunning && eventsQueue.length) {
    audioContainer.load();
    audioContainer.volume = {announcementVolume} / 100;
    isRunning = true;
    
    let eventValues;
    const nextEvent = eventsQueue.shift();

    nextEvent
      .then((item) => {
        // Display the slider announcement message and play sound.
        eventValues = item;
        announcementMessage.innerHTML = announcementMap[eventValues.type];
        announcementContainer.classList.add('slide');
        audioContainer.play();
      })
      .then(() => new Promise(resolve => setTimeout(resolve, {alertDuration} * 1000)))
      .then(() => {
        // While the slider is active, we change the underlying text to display the newest event.
        updateFields(eventValues);
      })
      .then(() => new Promise(resolve => setTimeout(resolve, {alertDuration} * 1000)))
      .catch((error) => console.log('Event loop error:', error))
      .finally(() => window.requestAnimationFrame(eventLoop));
  } else {
    window.requestAnimationFrame(eventLoop);
  }
};

// This kicks everything off as soon as the widget is loaded.
window.requestAnimationFrame(eventLoop);
