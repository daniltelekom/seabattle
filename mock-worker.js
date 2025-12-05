// mock-worker.js — только логика (без DOM)
const endpoints = {
  '/health': () => ({ status: 'ok', service: 'Mock Backend' }),
  '/player': (data) => ({ telegram_id: data.telegram_id, username: data.username || 'Player', rating:1000, skin_ship:'default', skin_board:'wood', frame:'none' }),
  '/match/random/join': () => ({ status:'matched', match_id:'demo-123', opponent_id:999999, is_your_turn:true }),
  '/match/demo-123/place-ships': () => ({ status:'ok' }),
  '/match/demo-123/wait-ready': () => ({ status:'ready' }),
  '/match/demo-123/attack': (data) => {
    const r = Math.random();
    const hit = r < 0.3 ? 2 : r < 0.6 ? 1 : 0;
    const finished = hit === 2 && Math.random() < 0.1;
    return { hit, new_turn: 999999, finished, winner_id: finished ? (Math.random() < 0.5 ? data.telegram_id : null) : null };
  }
};

self.onmessage = (e) => {
  try {
    const { url, body } = e.data;
    const path = new URL(url).pathname;
    const handler = endpoints[path];
    if (!handler) {
      self.postMessage({ url, error: 'Not found', status: 404 });
      return;
    }
    const result = handler(body || {});
    setTimeout(() => self.postMessage({ url, result }), 60);
  } catch (err) {
    self.postMessage({ error: 'worker error', detail: String(err) });
  }
};
