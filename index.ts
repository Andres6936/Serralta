// import {Glob} from 'bun'
//
// type ResponseClearHtml = {
//     errorMessages: string[],
//     fileName: string,
//     result: string,
// }
//
// async function getClearHtml(html: string): Promise<ResponseClearHtml> {
//     const stream = await fetch('https://api.htmlwasher.com/public/html-processing/process-html-by-text', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         body: new URLSearchParams({
//             'Html': html,
//         })
//     });
//     return await stream.json();
// }
//
//
// (async () => {
//     const glob = new Glob('src/pages/**');
//     for (const file of glob.scanSync('.')) {
//         try {
//             const responseOf = await getClearHtml(await Bun.file(file).text());
//             if (responseOf.errorMessages.length > 0) {
//                 console.error(responseOf.errorMessages);
//             } else {
//                 const htmlOf = responseOf.result;
//                 await Bun.write(file, htmlOf);
//                 console.log(`${file} cleared`)
//             }
//
//             // Wait for 3 seconds
//             await new Promise(resolve => setTimeout(resolve, 3000));
//         } catch (error) {
//             console.error(error)
//         }
//     }
// })()
//
// (async () => {
//     const regexOf = /href="([A-Z]\w+).html"/g;
//     const parts = (await Bun.file('src/pages/NotasBiblicas.astro').text()).matchAll(regexOf);
//     if (!parts) {
//         console.error('Not group capture for the text')
//         return;
//     }
//
//     for (const part of parts) {
//         const hrefOfPage = part[1];
//         const stream = await fetch(`https://www.bibleserralta.com/${hrefOfPage}.html`);
//         const buffer = await stream.arrayBuffer();
//         const decoder = new TextDecoder('iso-8859-1')
//
//         const responseOf = await getClearHtml(decoder.decode(buffer));
//         if (responseOf.errorMessages.length > 0) {
//             console.error(responseOf.errorMessages);
//         } else {
//             const htmlOf = responseOf.result;
//             await Bun.write(`src/pages/${hrefOfPage}.astro`, htmlOf);
//             console.log(`${hrefOfPage} cleared`)
//         }
//
//         // Wait for 3 seconds
//         await new Promise(resolve => setTimeout(resolve, 3000));
//     }
// })()

// import { StyleSheet } from '@master/css';
// import {render} from "@master/css/render";
//
// const css = render(await Bun.file("dist/AbrahamSacrificedIsaac/index.html").text(), {StyleSheet})
// console.log(css);