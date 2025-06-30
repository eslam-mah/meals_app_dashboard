import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { create, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v2.4/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROJECT_ID = "food-app-99a54"
const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`

// ✅ دالة تحويل PEM إلى Uint8Array بشكل صحيح
function pemToUint8Array(pem: string): Uint8Array {
  const b64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\r?\n|\r/g, '')
    .trim();
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tokens, title, body } = await req.json()

    const serviceAccount = {
      type: "service_account",
      project_id: "food-app-99a54",
      private_key_id: "bfa0a1d08e9f0204cd3dd30021ebe37c3e670272",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDSJUmYuP7sDW+R\nXOOYnaay1svWBT730bpAw8MwlEZ9Y4ON9rTeSPQcrHpwyElWhEjvtRCAZxCO+4o9\nENGZ/uHoRyzosNgN2oXKc7NnuqSHj1vOklwz+ij+MYYDIeF8K/vNx6LqkQXRVCLS\nkzxO+Nlpi6mUz+O2CHS6iecM8JowSaNFAkS6Qd4UhAY12HwNL4if4TviIeD8F+N5\nS2BHECvg+OhSbnFshqmVeHQ8VI92T+Shs+nU2Kn4q1JGH94UePlIfN4f0NhzPjlS\n9OKGWp2C5AqC/L1zopPQR78ZHQyfPBLqKDSPr2R3RYmWe+9cNKWniQzx8juL2LcP\nlf7MAtFxAgMBAAECggEAEHbAZdk0i6zfzU0wPaA4U7GVZa6iiMrjIzjTHYa4YRF/\nWIt4DyQ7D9YJf7WJXWBe0Hzojo7EktctNOyQ51Y7P7X31EEqpCc3LS3UY++Q/Vfj\ncvMvixjxxjx+CdfJMS/G+g/GeUckZAqJ8eJ8Kpm/es/o2NJSvku6TXUJZ4+gHOE7\noe/XSln5e58/wNq2sSmT5cSVLGYZgqABBS9CxmrpU6WvUaAU0/fYjBf5kjcaibcV\n9ZhxrXLz5FFObsCISGN4vpHjz3+Z/nYER6+TnH7cbF6r1QrF6rWl2I4RnaqOgI/P\nb2PF32kAQ4hrbgO842eKUXjQoTtlTD5b0+U9ItcrUwKBgQD20yVeoNJt0ZRPBs2g\nziwvyalhL1hyt8tC2pF6IkjMoUme6qUpSRMwJPKBGZarGgnAQmPWcQ9DlMbaPoCs\nj8DS8oxBLL9UDUA4rJQVq9ChVgdqVWWsK3eB9zUH+x9OB7zLkuYlUYThbSbdsoT2\nhtLnNpeQC0zPMf9xdd97Q2Hs4wKBgQDZ9ReyKW1AxCJHUgUez511I6zATJAMO7Ku\nXyRmPzg3HAj8AlQdrmYch9smdLNvGgFnLI+09mo6Og0Q/l/yIH2PHKU7h+0e4f2R\nFKxFiIXNDBMvotpN3HhSuqN4yCzzz2XzV/7cmiMMn4mYcubMM+rrVqLbAdFlsBi9\nEwp/1xdMmwKBgEslk94QlqCKy12YE6jevIM8IY6OLJ6YqJDNHLeTkpiCjniMtgYw\n0l+5EAAQO1gSkF9xlxXlzCDmPfiaSPDAv5M590ushP/hHOlkWZ2Tdux31cAhCdh2\nT2dJTWMFqM1H+8n7CojYHd3ILqoWvPaVq8ZrT4+ycQswDLaNjaHorPrDAoGAO4bn\n2N3dm+G1ZvsssNSNMY/zv3Vpph2r2FndzBsaFFsQzRsptA2Mj+A+50raMs7McUxH\nV2oxawOty+VdePiMskhljFO8XEHmifg2cKsvt+fDWbBFpRxAtH+K5BLvzArp0kNH\nNSLXzbvIzZ0cEctgLrQzuFLPyNEGgKUxqeap018CgYAF/QhTX52i6s6cdqISwcOb\nhqt90GvfAv0p5wa6mNABX7NwKHavU+Y8NgfEUGi3CIyg4MS1nGBGTaFDSR8WFIp3\nf8MFlrZlGVwixLGARVrZIxypgjIPiXEOnSANy6zZ09c92XE3y9MTPz7bHD2NSKqY\n9CVwtAcK9cIUksgdFFWR2A==\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-fbsvc@food-app-99a54.iam.gserviceaccount.com",
      client_id: "109632897174191251932",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40food-app-99a54.iam.gserviceaccount.com",
      universe_domain: "googleapis.com"
    }

    const header: Header = {
      alg: "RS256",
      typ: "JWT"
    }

    const payload: Payload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      exp: getNumericDate(60 * 60), // 1 hour from now
      iat: getNumericDate(0), // now
    }

    // 👇 استخدم الدالة الجديدة هنا
    const keyBytes = pemToUint8Array(serviceAccount.private_key);
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      keyBytes,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const jwt = await create(header, payload, privateKey);

    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Send notifications using HTTP v1 API
    const results = []
    
    for (const token of tokens) {
      const message = {
        message: {
          token: token,
          notification: {
            title: title,
            body: body,
          },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
          android: {
            notification: {
              icon: '/favicon.ico',
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            }
          },
          apns: {
            payload: {
              aps: {
                badge: 1,
                sound: 'default',
              }
            }
          },
          webpush: {
            notification: {
              icon: '/favicon.ico',
            }
          }
        }
      }

      try {
        const response = await fetch(FCM_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        })

        const responseData = await response.json()
        
        if (response.ok) {
          results.push({ success: true, token, response: responseData })
        } else {
          results.push({ success: false, token, error: responseData })
        }
      } catch (error) {
        results.push({ success: false, token, error: error.message })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log('FCM HTTP v1 Results:', {
      total: tokens.length,
      success: successCount,
      failures: failureCount,
      results
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications processed with HTTP v1 API',
        total: tokens.length,
        success: successCount,
        failures: failureCount,
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('FCM HTTP v1 Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Failed to send notifications using FCM HTTP v1 API'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
