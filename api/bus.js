export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.BUS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'BUS_API_KEY 환경변수가 없어요.' });
  }

  const { type, keyword, stationId } = req.query;
  let url = '';

  if (type === 'station') {
    url = `https://apis.data.go.kr/6410000/busstationservice/getBusStationList?serviceKey=${apiKey}&keyword=${encodeURIComponent(keyword)}&_type=json`;
  } else if (type === 'arrival') {
    url = `https://apis.data.go.kr/6410000/busarrivalservice/v2/getBusArrivalList?serviceKey=${apiKey}&stationId=${stationId}&_type=json`;
  } else {
    return res.status(400).json({ error: 'type 파라미터가 필요해요 (station | arrival)' });
  }

  try {
    const r = await fetch(url);
    const text = await r.text();

    // API가 XML 에러를 반환하는 경우 처리
    if (text.trim().startsWith('<')) {
      const codeMatch = text.match(/<returnReasonCode>(.*?)<\/returnReasonCode>/);
      const msgMatch  = text.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/);
      const errMatch  = text.match(/<errMsg>(.*?)<\/errMsg>/);
      const code = codeMatch?.[1] || '';
      const msg  = msgMatch?.[1] || errMatch?.[1] || 'XML 응답 수신';

      if (code === '30' || text.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
        return res.status(401).json({ error: `API 키 인증 실패: ${msg}. data.go.kr에서 해당 서비스 활용신청 여부와 키를 확인해 주세요.` });
      }
      return res.status(502).json({ error: `공공 API 오류 (${code || 'unknown'}): ${msg}`, raw: text.slice(0, 300) });
    }

    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
