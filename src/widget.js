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
    const data = obj['detail']['recents'];
    const event = document.getElementById('event-type');
    const name = document.getElementById('event-name');
    
    if (data.length) {
      const mostRecent = data[0];
      event.innerHTML = mostRecent['type'];
      name.innerHTML = mostRecent['name'];
    }
  });
  
  window.addEventListener('onEventReceived', (obj) => {
    const data = obj['detail']['event'];
    
    if (data["name"] && data['type']) {
      const announcementContainer = document.getElementById('announcement-container');
      const announcementMessage = document.getElementById('announcement-message');
      const event = document.getElementById('event-type');
      const name = document.getElementById('event-name');
      
      announcementMessage.innerHTML = eventsMap[data['type']];
      announcementContainer.classList.remove('slide-out');
      announcementContainer.classList.add('slide-in');
      
      setTimeout(() => {
        announcementContainer.classList.remove('slide-in');
        announcementContainer.classList.add('slide-out');
        event.innerHTML = data['type'];
        name.innerHTML = data['name'];
      }, {announcementDuration} * 1000)
    }
  });