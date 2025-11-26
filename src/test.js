const es = new EventSource('api/v2/user/sse/validate.php?datalevel=full', { withCredentials: true });
es.addEventListener('init', e => console.log('init', JSON.parse(e.data)));
es.addEventListener('partyStatusChange', e => console.log('status', JSON.parse(e.data)));
es.addEventListener('partyUpdate', e => console.log('update', JSON.parse(e.data)));
es.addEventListener('invalidSessionId', e => console.log('invalid', JSON.parse(e.data)));
es.onopen = () => console.log('SSE open');
es.onerror = (err) => console.error('SSE error', err);