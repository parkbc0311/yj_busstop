export default async function handler(req, res) {
  const apiKey = process.env.BUS_API_KEY;

  const result = {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPreview: apiKey ? apiKey.slice(0, 10) + '...' : 'MISSING',
    testUrl: null,
    httpStatus: null,
    responsePreview: null,
    error: null,
  };

  if (!apiKey) {
    return res.status(200).json(result);
  }

  const testUrl = `https://apis.data.go.kr/6410000/busstationservice/v2/getBusStationList?serviceKey=${apiKey}&keyword=%EA%B4%91%EA%B5%90&_type=json`;
  result.testUrl = testUrl.replace(apiKey, '[KEY_HIDDEN]');

  try {
    const r = await fetch(testUrl);
    result.httpStatus = r.status;
    const text = await r.text();
    result.responsePreview = text.slice(0, 500);
    result.isXml = text.trim().startsWith('<');
    result.isJson = text.trim().startsWith('{') || text.trim().startsWith('[');
  } catch (e) {
    result.error = e.message;
  }

  return res.status(200).json(result);
}
