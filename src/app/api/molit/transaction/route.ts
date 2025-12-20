import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lawdCd = searchParams.get('lawdCd');
    const dealYmd = searchParams.get('dealYmd');

    if (!lawdCd || !dealYmd) {
        return NextResponse.json({ error: 'Missing required parameters: lawdCd, dealYmd' }, { status: 400 });
    }

    // UPDATED: Correct Base URL for Public Data Portal (data.go.kr)
    // Service ID: 1613000 (MOLIT), Operation: getRTMSDataSvcAptTradeDev
    const baseUrl = 'http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev';

    // Note: The serviceKey in .env must match the format expected by data.go.kr.
    // If it contains '%', it is likely already encoded.
    const serviceKey = process.env.MOLIT_API_KEY;

    if (!serviceKey) {
        return NextResponse.json({ error: 'Server misconfiguration: API Key missing' }, { status: 500 });
    }

    try {
        // Construct query parameters manually for better control over encoding
        // data.go.kr often requires the key to be passed exactly as is (if encoded) 
        // or encoded (if decoded). We assume the user creates the URL string manually to avoid double-encoding issues
        // that fetch/URLSearchParams might introduce on an already-encoded key.
        const queryParams = [
            `serviceKey=${serviceKey}`,
            `LAWD_CD=${lawdCd}`,
            `DEAL_YM=${dealYmd}`,
            `pageNo=1`,
            `numOfRows=100` // Use a reasonable default
        ].join('&');

        const fullUrl = `${baseUrl}?${queryParams}`;
        console.log('Fetching MoLIT Data from:', fullUrl.replace(serviceKey, 'HIDDEN_KEY'));

        const response = await fetch(fullUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`MoLIT API error: ${response.status} ${errorText}`);
            throw new Error(`MoLIT API answered with status ${response.status}: ${errorText.substring(0, 200)}`);
        }

        const responseText = await response.text();

        // XML to JSON handling logic
        // Most data.go.kr responses are XML by default.
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
            stack: error.stack
        });
        return NextResponse.json({
            error: 'Upstream API Error',
            details: error.message,
        }, { status: 500 });
    }
}
