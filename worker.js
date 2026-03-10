/**
 * Cloudflare Worker for Secure GitHub Publishing
 * 
 * Required Secrets (Environment Variables in Cloudflare Dashboard):
 * - BLOG_PASSWORD: The custom password you want to use for publishing.
 * - GITHUB_TOKEN: A GitHub Personal Access Token (PAT) with repo write permissions.
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Or restrict to 'https://dipakkadamb.github.io'
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

async function handleOptions() {
    return new Response(null, { headers: CORS_HEADERS });
}

async function handlePost(request, env) {
    try {
        const body = await request.json();
        const { password, slug, htmlContent, jsonEntry } = body;

        // 1. Password Verification
        if (!password || password !== env.BLOG_PASSWORD) {
            return new Response(JSON.stringify({ error: "Unauthorized: Incorrect password." }), {
                status: 401,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
            });
        }

        const owner = 'dipakkadamb';
        const repo = 'dipakkadamb.github.io';
        const branch = 'main';
        const ghHeaders = {
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Cloudflare-Worker-Publisher'
        };

        // 2. Fetch current blogs.json
        const getJsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/blogs.json?ref=${branch}`;
        const getResp = await fetch(getJsonUrl, { headers: ghHeaders });
        
        let blogsJsonSha = null;
        let currentBlogs = [];

        if (getResp.ok) {
            const data = await getResp.json();
            blogsJsonSha = data.sha;
            
            // Fix text decoding for base64 from GitHub
            const binaryString = atob(data.content.replace(/\n/g, ''));
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const decodedContent = new TextDecoder('utf-8').decode(bytes);
            currentBlogs = JSON.parse(decodedContent);
        }

        // 3. Update JSON
        currentBlogs.unshift(jsonEntry);
        const updatedJsonContent = JSON.stringify(currentBlogs, null, 4);
        
        // Base64 encode JSON securely supporting Unicode
        const jsonBytes = new TextEncoder().encode(updatedJsonContent);
        const jsonBase64 = btoa(String.fromCharCode(...jsonBytes));

        // 4. Base64 encode HTML
        const htmlBytes = new TextEncoder().encode(htmlContent);
        const htmlBase64 = btoa(String.fromCharCode(...htmlBytes));

        // 5. Push HTML File
        const htmlFilename = `blogs/${slug}.html`;
        const putHtmlUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${htmlFilename}`;
        const htmlRes = await fetch(putHtmlUrl, {
            method: 'PUT',
            headers: ghHeaders,
            body: JSON.stringify({
                message: `content: published new blog article '${slug}' via Worker`,
                content: htmlBase64,
                branch: branch
            })
        });

        if (!htmlRes.ok) {
            const err = await htmlRes.text();
            throw new Error(`Failed HTML push: ${err}`);
        }

        // 6. Push JSON File
        const putJsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/blogs.json`;
        const jsonRes = await fetch(putJsonUrl, {
            method: 'PUT',
            headers: ghHeaders,
            body: JSON.stringify({
                message: `content: added '${slug}' to blogs index`,
                content: jsonBase64,
                sha: blogsJsonSha,
                branch: branch
            })
        });

        if (!jsonRes.ok) {
            const err = await jsonRes.text();
            throw new Error(`Failed JSON push: ${err}`);
        }

        return new Response(JSON.stringify({ success: true, message: "Published successfully!" }), {
            status: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
    }
}

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return handleOptions();
        } else if (request.method === 'POST') {
            return handlePost(request, env);
        }
        
        return new Response("Method not allowed", { 
            status: 405,
            headers: CORS_HEADERS
        });
    }
};
