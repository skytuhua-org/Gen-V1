# Markdown math browser disposition

The three approved App surfaces rendered the synthetic formulas and loaded math JavaScript, CSS and fonts locally. A production build correction brought font assets below 1 MiB. The corrected build still failed the 50 ms input and long-task gates. Keep production callers on literal Markdown. The packaged Windows, assistive and detached-reading gates remain unverified. [Browser task #2283](https://github.com/skytuhua-org/Gen-V1/issues/2283) · [Native disposition #2284](https://github.com/skytuhua-org/Gen-V1/issues/2284)

## Exact inputs

| Role | Immutable source |
| --- | --- |
| Control, shared parser present and no App callers enabled | [0b151f42864ab14f5cfe48fe9480aa46e8b4db46](https://github.com/skytuhua-org/Gen-V1/commit/0b151f42864ab14f5cfe48fe9480aa46e8b4db46) |
| Three App callers, original production font variants | [f7bd12b343e68dc4429d0fc6f29bfecee8cbf1c3](https://github.com/skytuhua-org/Gen-V1/commit/f7bd12b343e68dc4429d0fc6f29bfecee8cbf1c3) |
| Three App callers, corrected production font variants | [6f3fd5cd498e844ee9f673a06a40ef67441d9de3](https://github.com/skytuhua-org/Gen-V1/commit/6f3fd5cd498e844ee9f673a06a40ef67441d9de3) |
| Detached renderer, installed package and notices | [c26352a99e85d1ee56f32a97fe4ee863bd042b2c](https://github.com/skytuhua-org/Gen-V1/commit/c26352a99e85d1ee56f32a97fe4ee863bd042b2c) |
| Production harness | [47a5ba63d677c41af76765e4782d35d21db40784](https://github.com/skytuhua-org/Gen-V1/blob/47a5ba63d677c41af76765e4782d35d21db40784/tests/e2e/markdown-math.spec.ts) |

Linux 6.18.57, Chromium 141.0.7390.37 headless, Node 24.22.3, pnpm 10.30.3 and a four-CPU quota. Paired samples used 1440×1000, reduced motion, identical synthetic source, and fresh browser contexts. Builds used `pnpm build` and were served by the real `dev:false` host on `http://127.0.0.1:4337`. The test substituted synthetic snapshots and commands through the existing fixture. Static assets, HTTP status and CSP came from the production host. Local browser timing ran on a shared executor and does not establish packaged Windows results.

## Requests and resources

All three paths requested the corrected lazy math JavaScript and CSS, then `KaTeX_Math-Italic-t53AETM-.woff2`, `KaTeX_Main-Regular-B22Nviop.woff2` and `KaTeX_Size2-Regular-Dy4dx90m.woff2`. Every response returned HTTP 200. The browser reported those KaTeX font families loaded. The local-origin-only tests blocked external URLs and observed zero external requests or CSP violations. The response CSP was `frame-src http://localhost:4338/widget/; object-src 'none'; base-uri 'self'`. The zero-load currency/code/user/Document control fetched no math asset. Blocking the stylesheet preserved literal formula source and the fixed display failure text. [Harness](https://github.com/skytuhua-org/Gen-V1/blob/47a5ba63d677c41af76765e4782d35d21db40784/tests/e2e/markdown-math.spec.ts)

The normal-build graph had 25 JavaScript chunks. Only the lazy math chunk contained the adapter and KaTeX browser entry/CSS, and no chunk contained Commander modules. The browser startup request trace showed zero math asset requests in the control even though the default-off shared parser build emits the dormant lazy files. The three-caller correction retained the original WOFF2 and WOFF font bytes and emitted them as files, leaving the package lock and notices unchanged. The installed minified CSS SHA-256 is `00e0b094171b07f58422075f469b4feac2b2f7bce1aeec943c08da4d697f4dcf`. [Lock](https://github.com/skytuhua-org/Gen-V1/blob/c26352a99e85d1ee56f32a97fe4ee863bd042b2c/pnpm-lock.yaml) · [Notices](https://github.com/skytuhua-org/Gen-V1/blob/c26352a99e85d1ee56f32a97fe4ee863bd042b2c/THIRD_PARTY_NOTICES.md)

| Build | Lazy JS gzip bytes | Lazy CSS gzip bytes | Math font bytes | Asset gates |
| --- | ---: | ---: | ---: | --- |
| Three-caller trial | 77,115 | 7,988 | 1,076,572 including 3,624 inline | Font FAIL |
| Font correction | 77,115 | 3,772 | 562,908 across 40 local files | PASS |
| Limits | 153,600 | 40,960 | 1,048,576 | |

Gzip measurements use maximum compression with a zero timestamp. Original lazy files were `math-renderer-59fm175o.js` and `math-renderer-C-EwFotM.css`. Corrected files are `math-renderer-B3aNt2vE.js` (SHA-256 `0ffcfee1db23315a6086b41f56626a68566606c98a85413004830f033b278833`) and `math-renderer-DjhoaH_c.css` (SHA-256 `ed5314186735b744d3c0605cea750bbfbc5b783e1b8aa1cb9265202232ee5e85`).

## Responsiveness

A repeated synthetic update inserted 64 fractions while one real Playwright input was typed through the existing composer. Time starts at the input event timestamp and ends at the first timer after an animation frame, a next-paint estimate. Long tasks are browser PerformanceObserver observations between the update setup and completion. The control sees the same source but retains literal formulas. Each row contains all five runs in execution order. With five samples, the nearest-rank p95 is the largest sample.

| Build | Cache | Input samples (ms) | Median (ms) | p95 (ms) | Long-task observations per run | Longest tasks per run (ms) |
| --- | --- | --- | ---: | ---: | --- | --- |
| Control | cold | 8, 9.8, 19, 8.5, 8 | 8.5 | 19.0 | 0, 2, 0, 2, 0 | 0, 71, 0, 70, 0 |
| Control | warm | 24.6, 23.1, 22.5, 19.6, 23.9 | 23.1 | 24.6 | 0, 0, 1, 1, 0 | 0, 0, 81, 62, 0 |
| Three-caller trial | cold | 100.1, 115.3, 117.1, 94.9, 92.6 | 100.1 | 117.1 | 60, 62, 65, 57, 58 | 460, 331, 400, 556, 432 |
| Three-caller trial | warm | 86.6, 141.6, 100, 112, 106.9 | 106.9 | 141.6 | 60, 60, 58, 60, 58 | 565, 264, 1135, 1168, 1037 |
| Font correction | cold | 84.7, 106.1, 121.5, 90.3, 95.9 | 95.9 | 121.5 | 61, 59, 59, 61, 56 | 295, 273, 626, 444, 693 |
| Font correction | warm | 118.4, 108.7, 109.3, 100.4, 104.6 | 108.7 | 118.4 | 57, 56, 61, 56, 57 | 546, 562, 464, 417, 563 |

Both corrected trials exceeded 50 ms for input latency and contained multiple tasks above 50 ms despite the test fixture proving one accepted leaf per frame. A separate instrumented run attributed much of the time to forced layout under the transcript scrollbar's metric read. Suppressing that callback in a diagnostic-only run moved the time to native browser work, with the 64-formula completion time still around ten seconds. The production candidate retains the existing scrollbar and controller. The measured result is a browser adoption failure.

<details>
<summary>Raw long-task durations in milliseconds</summary>

```json
{"Control":{"cold":[[],[52,71],[],[50,70],[]],"warm":[[],[],[81],[62],[]]},"Three-caller trial":{"cold":[[51,51,57,54,60,61,66,71,80,76,81,86,97,88,89,96,99,96,107,105,107,112,113,131,141,138,414,241,142,161,151,198,190,222,289,172,232,283,191,176,204,292,195,203,237,205,364,460,227,308,221,222,276,228,228,323,353,262,288,257],[58,122,67,54,59,57,77,69,79,90,97,157,88,73,80,82,93,93,98,110,122,113,128,118,130,146,137,145,137,160,130,142,139,144,154,145,153,161,161,196,173,313,185,154,175,183,180,193,194,205,241,238,212,209,235,221,227,262,280,253,331,253],[60,86,65,61,66,67,64,58,91,93,81,112,217,196,148,119,109,147,123,191,117,118,141,170,126,121,133,122,143,125,131,154,166,166,216,278,218,132,164,236,195,350,204,196,185,217,236,347,285,400,249,249,247,316,281,353,396,327,291,275,241,239,290,336,57],[50,52,56,63,61,69,79,91,99,92,89,86,91,101,93,104,145,110,111,119,125,119,124,128,132,138,150,148,147,149,461,169,161,160,178,170,175,179,154,180,181,177,556,207,194,221,210,201,212,207,212,503,224,246,250,231,235],[63,121,51,54,57,63,68,85,67,217,83,80,85,91,94,102,103,110,106,110,114,113,146,123,130,129,134,345,150,158,157,157,155,158,163,170,173,170,175,432,185,196,204,205,214,216,210,210,409,289,311,274,427,282,263,410,311,265]],"warm":[[99,104,73,74,116,129,108,87,105,209,135,110,109,149,187,149,166,311,156,159,222,156,146,149,141,139,176,181,227,368,565,337,237,253,297,318,302,267,403,277,201,216,265,299,222,285,281,245,229,262,272,290,235,250,239,229,234,248,283,255],[53,59,50,56,64,94,86,85,74,73,78,154,80,87,88,89,97,126,98,98,103,105,108,113,120,140,126,130,137,138,136,142,144,154,158,165,170,169,178,188,185,218,162,185,187,187,194,196,205,209,216,242,234,233,234,248,250,264,251,247],[52,183,58,57,59,65,68,71,74,78,80,81,89,121,93,99,99,103,105,116,112,112,119,257,133,167,165,144,147,176,189,207,194,196,167,1135,208,192,216,185,257,245,220,235,635,251,284,274,278,294,312,661,415,473,437,501,300,52],[53,59,53,65,57,63,73,74,83,236,175,88,91,84,94,97,101,99,106,115,117,137,127,129,181,228,743,185,157,217,206,174,143,160,166,164,195,1168,226,235,189,187,201,191,196,206,334,1035,226,217,227,238,250,246,241,1168,253,243,252,87],[52,55,64,64,67,80,72,75,81,84,85,115,98,149,963,113,117,113,115,119,132,129,136,139,141,139,146,151,1037,173,199,148,163,158,167,173,179,178,181,184,725,224,199,206,282,241,243,232,1003,265,248,291,267,291,275,270,293,72]]},"Font correction":{"cold":[[63,50,64,50,53,82,54,66,81,81,93,92,114,154,125,145,108,103,99,131,108,128,148,162,295,166,195,198,167,140,140,169,157,157,156,153,219,186,248,222,171,170,208,199,202,220,187,197,214,218,291,238,227,234,241,224,253,244,254,285,255],[69,54,50,58,61,60,57,64,87,110,81,118,107,155,99,100,96,98,104,107,120,107,111,115,120,125,132,147,161,138,161,158,150,148,157,166,187,163,170,168,168,153,176,177,189,194,236,228,221,266,242,245,264,243,264,268,247,273,237],[61,51,50,54,58,73,62,64,70,72,78,84,82,86,94,110,103,115,107,112,112,110,122,119,124,132,132,134,138,141,150,215,156,158,162,161,178,176,184,194,196,163,193,255,242,270,210,223,210,514,245,224,293,233,283,241,626,344,271],[55,105,51,59,58,60,59,67,63,71,74,74,245,86,86,102,92,95,102,98,103,108,113,116,119,127,125,130,145,351,151,153,149,159,162,163,157,165,179,187,308,153,190,185,186,243,226,221,235,236,423,228,220,234,235,238,239,245,444,285,281],[50,52,57,82,69,68,68,83,81,87,88,92,103,100,103,109,200,118,117,121,130,140,135,147,139,167,242,284,693,306,309,302,273,202,197,191,429,184,204,203,216,191,213,197,203,486,217,209,224,216,220,229,234,260,430,235]],"warm":[[50,61,72,63,87,85,75,87,74,150,546,94,90,103,95,97,102,102,102,108,108,113,122,125,126,133,153,516,147,150,151,164,151,164,163,159,186,175,256,410,183,182,189,188,197,220,206,204,200,491,216,220,225,244,252,258,257],[52,285,58,58,64,74,69,75,75,80,86,86,106,104,132,109,101,149,103,113,116,126,329,132,136,139,148,147,143,158,156,161,155,163,166,464,176,200,162,185,176,185,191,192,198,562,239,216,224,223,227,226,236,253,521,252],[65,114,211,50,50,51,53,58,61,67,71,68,75,78,82,92,104,108,94,98,103,106,115,113,123,331,124,128,132,141,142,133,135,141,146,147,152,166,173,417,191,174,175,165,185,182,190,190,221,464,256,285,284,248,266,325,353,308,302,229,240],[50,54,54,60,63,67,72,84,85,89,102,356,100,98,99,104,106,105,113,117,114,123,127,125,154,139,149,366,164,143,153,150,165,161,176,191,170,152,172,389,187,189,181,192,192,229,200,197,205,417,216,216,234,236,282,246],[56,54,54,267,68,66,72,71,75,78,84,83,92,97,93,97,96,98,101,105,112,114,118,122,393,139,138,134,135,139,140,142,148,153,160,165,178,374,181,175,181,189,185,198,230,210,208,563,212,209,212,221,227,258,234,539,258]]}}
```

</details>

## Acceptance disposition

| Gate | Browser disposition | Verification |
| --- | --- | --- |
| A01 capability | PASS | Paired App main/Canvas/control and registered artifact fixtures showed literal versus rendered notation. |
| A02 syntax and active runs | PASS | Recognition checks and actual App continued-run closure passed. |
| A03 App boundary | PASS for measured browser routes | Main assistant, retained Canvas assistant and owned BoundMarkdown rendered. User/Document controls stayed literal without math requests; other call sites were unchanged. Existing Markdown browser checks passed. |
| A04 copied source | PASS for measured browser routes | Exact original message and display CRLF payloads, same-position source/owner replacement, and visible source fallback were verified. |
| A05 trust and package | PASS for measured browser routes | Rejected resource/HTML commands stayed literal without connected anchors, images, executable nodes or external requests. Fresh engine macro and detached target checks passed. |
| A06 bounds and deferred source | PASS for measured parser, queue and asset failure | UTF-16/expression/budget checks, zero-load requests and blocked stylesheet source fallback passed. Timing is recorded under A09. |
| A07 ownership and lifecycle | PASS for measured browser routes | Delayed replacement, held Canvas, preserved prose selection, and 100 lifecycle cycles passed in the scoped tests. |
| A08 presentation and native access | Browser asset loading PASS; native/assistive NOT_RUN | DOM MathML and hidden visual duplication were verified. The exact packaged application, offline local-font behavior, native DPI, themes and assistive speech require the supported Windows executor. |
| A09 total responsiveness and reading | FAIL; anchor rows BLOCKED | Assets pass after correction. Both corrected timing rows fail. The accepted ANC04 controller and ANC06 native verification are unavailable for detached reading, navigation and switch/return. |
| A10 handoff | Browser evidence published; adoption pending disposition | Exact heads, notices, raw timing, asset paths and independent scoped tests are linked. The App trial remains outside the protected queue and changes no host runtime or schema. |

The broad Source Workbench App suite reproduced the same 10 failures on the exact control and caller trial, with 18 passing in each. Main/Canvas/registered artifact and shared Markdown targeted checks passed. Those broader failures do not count as passing workbench coverage.

## Corrected font closure

Every CSS reference below is emitted under `dist/web/assets`. Each emitted file was compared byte-for-byte to the installed `katex/dist/fonts` file named in the first column. The correction has no data font URLs.

| Installed font | CSS asset filename | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `KaTeX_AMS-Regular.woff2` | `KaTeX_AMS-Regular-BQhdFMY1.woff2` | 28,076 | `0cdd387c9590a1a9f9794560022dbb59654a7d86f187aa0c81495ad42d3a7308` |
| `KaTeX_AMS-Regular.woff` | `KaTeX_AMS-Regular-DMm9YOAa.woff` | 33,516 | `30da91e84c893f875e252689faebdc590b2871145e8adc7f9a9d4dbd8ce0b251` |
| `KaTeX_Caligraphic-Bold.woff` | `KaTeX_Caligraphic-Bold-BEiXGLvX.woff` | 7,716 | `1ae6bd7475590e97e7f145a89e09ccde322f7a6bc0b91607b1c8b8ee28290fed` |
| `KaTeX_Caligraphic-Bold.woff2` | `KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2` | 6,912 | `de7701e42cf1f4cf0b766c03fb27977207eee2f4fd5d76fa82188406da43ea4c` |
| `KaTeX_Caligraphic-Regular.woff` | `KaTeX_Caligraphic-Regular-CTRA-rTL.woff` | 7,656 | `3398dd02302557a793f2863f88e02d96ce10df2abffa07c8e9fa90775116e65c` |
| `KaTeX_Caligraphic-Regular.woff2` | `KaTeX_Caligraphic-Regular-Di6jR-x-.woff2` | 6,908 | `5d53e70ad607c2352162dec9e0923fb54ecdafaccbf604cd8dcf7d00facb989b` |
| `KaTeX_Fraktur-Bold.woff` | `KaTeX_Fraktur-Bold-BsDP51OF.woff` | 13,296 | `9be7ceb88004ab8ad124082246fbfcca4091e36385d4ec6ed1df67375dad50fb` |
| `KaTeX_Fraktur-Bold.woff2` | `KaTeX_Fraktur-Bold-CL6g_b3V.woff2` | 11,348 | `74444efd593c005e3f4573b44524704c0af0a937fe911cca9e94068d0d140d3f` |
| `KaTeX_Fraktur-Regular.woff2` | `KaTeX_Fraktur-Regular-CTYiF6lA.woff2` | 11,316 | `51814d270d06ff0255dba0799994fa4d8c84d11f09951d47595f4abb1f3602dc` |
| `KaTeX_Fraktur-Regular.woff` | `KaTeX_Fraktur-Regular-Dxdc4cR9.woff` | 13,208 | `5e28753be717dac97f559f49bc10be9cf3c124ddcabda6659d11cb68febc6463` |
| `KaTeX_Main-Bold.woff2` | `KaTeX_Main-Bold-Cx986IdX.woff2` | 25,324 | `0f60d1b897938ec918c8ce073092411baf9438f6739465693ff18b0f9d20b021` |
| `KaTeX_Main-Bold.woff` | `KaTeX_Main-Bold-Jm3AIy58.woff` | 29,912 | `c76c5d696297d51b9cb1639c7da4334f0e7dec81b42b11213b5e25ef671bb822` |
| `KaTeX_Main-BoldItalic.woff2` | `KaTeX_Main-BoldItalic-DxDJ3AOS.woff2` | 16,780 | `99cd42a3c072d918f2f44984a807cf7aa16e13545fd0875fc07c6c65f99e715b` |
| `KaTeX_Main-BoldItalic.woff` | `KaTeX_Main-BoldItalic-SpSLRI95.woff` | 19,412 | `a6f7ec0d846ac7ad975adb8959c37ed49b94acbc4ae436db9ce9e20287e4a64c` |
| `KaTeX_Main-Italic.woff` | `KaTeX_Main-Italic-BMLOBm91.woff` | 19,676 | `f1d6ef86f3b11a528bd5185199bd2443ecb2b0dead96d88674b5a2c12be24bdf` |
| `KaTeX_Main-Italic.woff2` | `KaTeX_Main-Italic-NWA7e6Wa.woff2` | 16,988 | `97479ca6cce906abc961ecac96faa5f9ca2e61b8e7670d475826bcdee9a7c267` |
| `KaTeX_Main-Regular.woff2` | `KaTeX_Main-Regular-B22Nviop.woff2` | 26,272 | `c2342cd8b869e01752a9321dc17213fc40d4d04c79688c1d43f2cf316abd7866` |
| `KaTeX_Main-Regular.woff` | `KaTeX_Main-Regular-Dr94JaBh.woff` | 30,772 | `c6368d87e8a1a3a5d337623d83d8dc4b868f242a9ad476237d6f8d1e0f168cdc` |
| `KaTeX_Math-BoldItalic.woff2` | `KaTeX_Math-BoldItalic-CZnvNsCZ.woff2` | 16,400 | `dc47344dbb6cb5b655c8460d561f4df5f501b90c804ad3c6cec65fe322351ab1` |
| `KaTeX_Math-BoldItalic.woff` | `KaTeX_Math-BoldItalic-iY-2wyZ7.woff` | 18,668 | `850c0af5c2238497febaf5e461d880bf458c341f42f4f330f1b1ab5698b1998e` |
| `KaTeX_Math-Italic.woff` | `KaTeX_Math-Italic-DA0__PXp.woff` | 18,748 | `8a8d244581371912b8f3f5a23e2437cb2a59cd9bcaebb0346e722c05737a2571` |
| `KaTeX_Math-Italic.woff2` | `KaTeX_Math-Italic-t53AETM-.woff2` | 16,440 | `7af58c5ec8f132a2ddde9027c6d7814decce4d3b822a11192a42a20e2e973264` |
| `KaTeX_SansSerif-Bold.woff2` | `KaTeX_SansSerif-Bold-D1sUS0GD.woff2` | 12,216 | `e99ae51144bf1232efcc1bfe5add36262c6866b0faab24fa75740e1b98577a62` |
| `KaTeX_SansSerif-Bold.woff` | `KaTeX_SansSerif-Bold-DbIhKOiC.woff` | 14,408 | `ece03cfd83e22c212cdef66feb8442d25a083beb988db3f1883f3f9738d750ba` |
| `KaTeX_SansSerif-Italic.woff2` | `KaTeX_SansSerif-Italic-C3H0VqGB.woff2` | 12,028 | `00b26ac825e2095056396e0553b8ac26d3f8ad158c3826e28b4c45b385c4714a` |
| `KaTeX_SansSerif-Italic.woff` | `KaTeX_SansSerif-Italic-DN2j7dab.woff` | 14,112 | `91ee67500cc0129aa0ace3ac5c61ff1692102f0f31d02b69347fba35dcb75bf2` |
| `KaTeX_SansSerif-Regular.woff` | `KaTeX_SansSerif-Regular-CS6fqUqJ.woff` | 12,316 | `11e4dc8a6471ff6d6ee561d53d10fde8f7489e798257ff449c5d37c197435605` |
| `KaTeX_SansSerif-Regular.woff2` | `KaTeX_SansSerif-Regular-DDBCnlJ7.woff2` | 10,344 | `68e8c73ef42afd3ccec58bf0fba302cce448938e7fc020a5e31f8a952eee1342` |
| `KaTeX_Script-Regular.woff2` | `KaTeX_Script-Regular-D3wIWfF6.woff2` | 9,644 | `036d4e95149b69ff9bcc0cd55771efeb25ffa3947293e69acd78d5ac328c684b` |
| `KaTeX_Script-Regular.woff` | `KaTeX_Script-Regular-D5yQViql.woff` | 10,588 | `d96cdf2b3bdd4d64a8fd5f74a4c467f123a8a73931cd435889f08ffaf9bf947a` |
| `KaTeX_Size1-Regular.woff` | `KaTeX_Size1-Regular-C195tn64.woff` | 6,496 | `c943cc986384f59e86bea5fd7dc50a9c4dfe567a7c05eb40d6790720dead97c9` |
| `KaTeX_Size1-Regular.woff2` | `KaTeX_Size1-Regular-mCD8mA8B.woff2` | 5,468 | `6b47c40166b6dbe21a5dfca7718413f2147fd2399be1ba605d8ad39cedf25dfe` |
| `KaTeX_Size2-Regular.woff2` | `KaTeX_Size2-Regular-Dy4dx90m.woff2` | 5,208 | `d04c54219f9eaec6d4d4fd42dfb28785975a4794d6b2fc71e566b9cd6db842dd` |
| `KaTeX_Size2-Regular.woff` | `KaTeX_Size2-Regular-oD1tc_U0.woff` | 6,188 | `2014c523c3210bcc166648c4d4cc57f05b747df07a24277bf71c51e67dc79e3d` |
| `KaTeX_Size3-Regular.woff` | `KaTeX_Size3-Regular-CTq5MqoE.woff` | 4,420 | `6ab6b62e9b62dae2c00dd90f791bd10950be0ecc3490d7d6045f51c2e8fe0949` |
| `KaTeX_Size3-Regular.woff2` | `KaTeX_Size3-Regular-gV2CO0n9.woff2` | 3,624 | `73d591271b1604960cb10bb90fee021670af7297017e0e98480b332d11f51995` |
| `KaTeX_Size4-Regular.woff` | `KaTeX_Size4-Regular-BF-4gkZK.woff` | 5,980 | `99f9c6750b489c9462bf04900bd3f939df9b829339daaaaa99ef5495cdddea58` |
| `KaTeX_Size4-Regular.woff2` | `KaTeX_Size4-Regular-Dl5lxZxV.woff2` | 4,928 | `a4af7d414440a1c1790825cfb700cf9cf43b0f2c4b04f0ebc523011ad9853ec0` |
| `KaTeX_Typewriter-Regular.woff` | `KaTeX_Typewriter-Regular-C0xS9mPB.woff` | 16,028 | `e14fed02b1aba7ce9f5afd5844b5d0321b22351febc720e0de8b8723527609f7` |
| `KaTeX_Typewriter-Regular.woff2` | `KaTeX_Typewriter-Regular-CO6r4hn1.woff2` | 13,568 | `71d517d67827787cfabdf186914cc3358eda539e37931941f2b2fd4a21f68c0b` |

To reproduce the positive and negative HTTP checks from the harness on the corrected product tree, build with `pnpm build` and run `pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts markdown-math.spec.ts --grep 'production math assets'`. Set `GEN_MATH_MEASURE=1` for the timing group. Add `GEN_MATH_CONTROL=1` when running that timing group against the literal control build.
