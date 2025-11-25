const eventSource = new EventSource('api/v2/user/validate.php');

eventSource.addEventListener('open', () => {
   console.log('Connection to server opened.');
});

eventSource.addEventListener('error', (event) => {
   if (event.eventPhase == EventSource.CLOSED) {
      console.log('Connection to server closed.');
      eventSource.close();
   }
});

eventSource.addEventListener('invalidSessionId', () => {
   console.log('Session ID is invalid. Please log in again.');
   eventSource.close();
});