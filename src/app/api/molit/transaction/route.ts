import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lawdCd = searchParams.get('lawdCd');
    const dealYmd = searchParams.get('dealYmd');

    if (!lawdCd || !dealYmd) {
        return NextResponse.json({ error: 'Missing required parameters: lawdCd, dealYmd' }, { status: 400 });
    }

    // Base URL for Apartment Trade Detail
    // Using http for MoLIT as they sometimes have issues with https or certificates
    const baseUrl = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev';
    const serviceKey = process.env.MOLIT_API_KEY;

    if (!serviceKey) {
        return NextResponse.json({ error: 'Server misconfiguration: API Key missing' }, { status: 500 });
    }

    try {
        // Construct query parameters manually for fetch
        // Note: serviceKey in public data portal is often already encoded or needs specific handling.
        // We assume the key in .env is the decoded key generally, but if it has %, it might be encoded.
        // Sending it as a string concatenation is often safest for these legacy APIs.

        const queryParams = [
            `serviceKey=${serviceKey}`,
            `LAWD_CD=${lawdCd}`,
            `DEAL_YM=${dealYmd}`
        ].join('&');

        const fullUrl = `${baseUrl}?${queryParams}`;
        console.log('Fetching MoLIT Data from:', fullUrl);

        const response = await fetch(fullUrl);

        if (!response.ok) {
            throw new Error(`MoLIT API answered with status ${response.status}`);
        }

        const responseText = await response.text();

        // XML to JSON handling logic
        // If it starts with <, it's XML.
        if (responseText.trim().startsWith('<')) {
            return NextResponse.json({
                success: true,
                data: responseText,
                format: 'xml'
            });
        }

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = responseText;
        }

        return NextResponse.json({
            success: true,
            data: responseData,
            format: 'json'
        });

    } catch (error: any) {
        console.error('API Error Details:', {
            message: error.message,
        });
        return NextResponse.json({
            error: 'Upstream API Error',
            details: error.message,
        }, { status: 500 });
    }
}
