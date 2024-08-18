import {Glob} from 'bun'

type ResponseClearHtml = {
    errorMessages: string[],
    fileName: string,
    result: string,
}

async function getClearHtml(html: string): Promise<ResponseClearHtml> {
    const stream = await fetch('https://api.htmlwasher.com/public/html-processing/process-html-by-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'Html': html,
        })
    });
    return await stream.json();
}

(async () => {
    const glob = new Glob('src/pages/**');
    for (const file of glob.scanSync('.')) {
        try {
            const responseOf = await getClearHtml(await Bun.file(file).text());
            if (responseOf.errorMessages.length > 0) {
                console.error(responseOf.errorMessages);
            } else {
                const htmlOf = responseOf.result;
                await Bun.write(file, htmlOf);
                console.log(`${file} cleared`)
            }

            // Wait for 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
            console.error(error)
        }
    }
})()