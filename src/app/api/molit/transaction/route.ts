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
    const url = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev';
    const serviceKey = process.env.MOLIT_API_KEY;

    if (!serviceKey) {
        return NextResponse.json({ error: 'Server misconfiguration: API Key missing' }, { status: 500 });
    }

    try {
        const response = await axios.get(url, {
            params: {
                serviceKey: serviceKey,
                LAWD_CD: lawdCd,
                DEAL_YM: dealYmd,
            },
            transformResponse: [(data) => data] // Prevent axios from auto-parsing JSON/XML
        });

        // We return the raw string data (XML or JSON) for the client to handle,
        // or we'd parse it here. For robustness, let's just forward the data status.
        // If it's XML, valid XML string. If JSON, valid JSON string or object.

        let responseData = response.data;

        // The API might return XML even if we handle it with axios.
        // If it starts with <, it's XML.
        if (typeof responseData === 'string' && responseData.trim().startsWith('<')) {
            // We can returning as is, but let's try to extract items if possible or just pass it to client
            // For now, return as is with format 'xml'
            return NextResponse.json({
                success: true,
                data: responseData,
                format: 'xml'
            });
        }

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
            format: 'json'
        });

    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ error: 'Upstream API Error', details: error.message }, { status: 500 });
    }
}
