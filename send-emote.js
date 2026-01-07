export default async function handler(req, res) {
    // 1. Enable CORS (Allows your website to talk to this backend)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 3. Get Parameters from the URL
        const { server, tc, uid1, emote_id, uid2, uid3, uid4, uid5 } = req.query;

        // 4. Validate Required Parameters
        if (!server || !tc || !uid1 || !emote_id) {
            return res.status(400).json({ 
                error: 'Missing required parameters',
                required: ['server', 'tc', 'uid1', 'emote_id']
            });
        }

        // 5. Construct the Target URL
        // We manually build the query string to ensure order and encoding match your game server needs
        const urlParts = [`${server}/join?tc=${encodeURIComponent(tc)}`];
        
        urlParts.push(`uid1=${encodeURIComponent(uid1)}`);
        
        // Add optional UIDs if they exist
        if (uid2) urlParts.push(`uid2=${encodeURIComponent(uid2)}`);
        if (uid3) urlParts.push(`uid3=${encodeURIComponent(uid3)}`);
        if (uid4) urlParts.push(`uid4=${encodeURIComponent(uid4)}`);
        if (uid5) urlParts.push(`uid5=${encodeURIComponent(uid5)}`);
        
        urlParts.push(`emote_id=${encodeURIComponent(emote_id)}`);
        
        const apiUrl = urlParts.join('&');

        console.log('Proxying request to:', apiUrl);

        // 6. Fetch from the External Server
        const apiResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'NOVRA-X-Bot/1.0',
                'Accept': '*/*',
                'Connection': 'keep-alive'
            }
        });

        const responseText = await apiResponse.text();

        // 7. Return the Success Response
        return res.status(200).json({
            success: true,
            status: apiResponse.status,
            message: 'Emote sent successfully',
            data: responseText
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}