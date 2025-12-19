import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lawdCd = searchParams.get('lawdCd');
    const dealYmd = searchParams.get('dealYmd');

    if (!lawdCd || !dealYmd) {
        return NextResponse.json({ error: 'Missing parameters (lawdCd, dealYmd)' }, { status: 400 });
    }

    // Base URL for Apartment Trade Detail
    const url = 'http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getUrtAptTrdeDetailSvc';
    const serviceKey = process.env.MOLIT_API_KEY;

    if (!serviceKey) {
        return NextResponse.json({ error: 'Server misconfiguration: API Key missing' }, { status: 500 });
    }

    try {
        const response = await axios.get(url, {
            params: {
                serviceKey: serviceKey,
                pageNo: 1,
                numOfRows: 100, // Fetch up to 100 items
                LAWD_CD: lawdCd,
                DEAL_YMD: dealYmd,
                _type: 'json' // Request JSON format (supported by many gov APIs)
            },
            transformResponse: [(data) => data] // Prevent axios from auto-parsing JSON/XML
        });

        // We return the raw string data (XML or JSON) for the client to handle,
        // or we'd parse it here. For robustness, let's just forward the data status.
        // If it's XML, valid XML string. If JSON, valid JSON string or object.

        let responseData = response.data;
        try {
            if (typeof responseData === 'string' && (responseData.startsWith('{') || responseData.startsWith('['))) {
                responseData = JSON.parse(responseData);
            }
        } catch (e) {
            // ignore
        }

        return NextResponse.json({
            success: true,
            data: responseData,
            format: typeof responseData === 'string' && responseData.trim().startsWith('<') ? 'xml' : 'json'
        });

    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ error: 'Upstream API Error', details: error.message }, { status: 500 });
    }
}
