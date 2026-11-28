# Third-party notices

Gen V1 is a separate application. The following projects retain their own
copyright and license terms; the first-party licensing notice does not replace
or restrict the rights their licenses grant.

| Component | Provenance | License and notice |
| --- | --- | --- |
| Original Hermes Agent engine, learning and skills | Nous Research; commit `c627ec84664d43e0b18b95d9d86d8963747d56c7` | [MIT notice](third-party/hermes-agent/LICENSE), [integration and source manifest](third-party/hermes-agent/README.md) |
| Identified T3 Code account and interface components | T3 Tools Inc.; commit `8760d063e903406c8e8f695b0852c0a15fc1e00f` | [MIT notice](third-party/t3code/LICENSE), [adaptation inventory](third-party/t3code/README.md) |
| Selective Vespin Inbox column behavior | Stage Inc.; commit `7f0bfe954a958858235b91d82293043ab5541433` | [Apache-2.0 license](third-party/vespin/LICENSE), [notices](third-party/vespin/NOTICE), [adaptation inventory](third-party/vespin/provenance.json) |

The retained original Hermes files are an unchanged subset of the pinned source.
Host transport and permission integration live outside that upstream tree. The
source manifests record exact paths and hashes.

The application also uses the packages pinned in [package.json](package.json),
[pnpm-lock.yaml](pnpm-lock.yaml) and the [Python runtime requirements](third-party/hermes-agent/runtime-requirements.txt).
Their authors retain the licenses distributed with those packages. Published
provider runtimes and SDKs remain governed by their respective terms; their
presence does not imply endorsement or account entitlement.

The pinned MIT-licensed `node-pty` 1.1.0 package includes the reviewed
[Windows cleanup patch](patches/node-pty-1.1.0.patch). It closes the owned ConPTY
input socket and output worker when a terminal exits naturally. The patch applies
through pnpm in both source installations and the packaged desktop host; the
upstream package license remains included.

The manual text editor (Files surface) is built on the MIT-licensed CodeMirror 6
and Lezer packages pinned in [package.json](package.json). The pinned versions in
[pnpm-lock.yaml](pnpm-lock.yaml) cover `@codemirror/state`, `@codemirror/view`,
`@codemirror/language`, `@codemirror/commands`, `@codemirror/search`,
`@codemirror/language-data`, `@codemirror/merge` and `@lezer/highlight`, plus the
transitive `@codemirror/*` (`autocomplete`, `lang-*`, `legacy-modes`, `lint`,
`streamparser`), `@lezer/*` (`common`, `lr` and the per-language grammars
`cpp`, `css`, `go`, `html`, `java`, `javascript`, `json`, `markdown`, `php`,
`python`, `rust`, `sass`, `xml`, `yaml`), `style-mod`, `w3c-keyname` and `crelt`
packages. Each package is published under the MIT license and ships its own
LICENSE file in the installed package; copyright belongs to Marijn Haverbeke and
contributors.

The isolated math renderer uses KaTeX 0.19.1, published by Khan Academy and contributors under the MIT license. The installed package ships its LICENSE. Font metadata in the generated KaTeX fonts and the upstream stretchy-SVG source state:

Copyright (c) 2009-2010, Design Science, Inc. (<www.mathjax.org>)
Copyright (c) 2014-2018 Khan Academy (<www.khanacademy.org>),
with Reserved Font Name entries for KaTeX_AMS, KaTeX_Caligraphic, KaTeX_Fraktur, KaTeX_Main, KaTeX_Math, KaTeX_SansSerif, KaTeX_Script, KaTeX_Size1, KaTeX_Size2, KaTeX_Size3, KaTeX_Size4, KaTeX_Typewriter.

This Font Software is licensed under the SIL Open Font License, Version 1.1, reproduced below as required for redistribution of the font software and adapted glyphs.

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

The isolated streaming-Markdown repair trial uses `remend` 1.5.1, published by
Vercel, Inc. under the Apache-2.0 license. The package ships its own LICENSE in
the installed artifact; copyright and license rights remain with their authors.

Historical comparison frames under `docs/reference/` depict their original
owners' products and are identified in [the reference inventory](docs/reference-videos.md).
They are reference material, not Gen V1 product screenshots. Current product
screenshots and captioned demos are documented in [the current media index](docs/public/media/README.md). Earlier screenshots remain in `docs/screenshots/`; both collections describe their authored sample-data scope.
