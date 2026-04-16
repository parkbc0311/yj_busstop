export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.BUS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API 키가 설정되지 않았어요. Vercel 환경변수를 확인해 주세요.' });

  const { type, keyword, stationId } = req.query;

  let url = '';
  if (type === 'station') {
    url = `https://apis.data.go.kr/6410000/busstationservice/getBusStationList?serviceKey=${encodeURIComponent(apiKey)}&keyword=${encodeURIComponent(keyword)}&_type=json`;
  } else if (type === 'arrival') {
    url = `https://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList?serviceKey=${encodeURIComponent(apiKey)}&stationId=${stationId}&_type=json`;
  } else {
    return res.status(400).json({ error: 'type 파라미터가 필요해요 (station | arrival)' });
  }

  try {
    const r = await fetch(url);
    const text = await r.text();
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
