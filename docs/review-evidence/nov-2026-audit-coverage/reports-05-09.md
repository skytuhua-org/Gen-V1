# November audit coverage ledger, reports 05–09

Current GitHub main sampled at `fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b`. Read with [audit coordination #1946](https://github.com/skytuhua-org/Gen-V1/issues/1946). The input reports describe historical snapshots and local observations. Row dispositions describe tracking evidence. Current reproduction and merge acceptance require separate proof.

## Source fingerprints

| Report | SHA-256 | Indexed rows | Private rows |
| --- | --- | ---: | ---: |
| 05 | `85de3d5060ed9d9ac99990114b8aea3825dd05f5475a2982c479350143971271` | 130 | 7 |
| 06 | `d5f9e9c6f84736ad91f8a748f2c2a256d0220fd392ea3edb9a65983fd7618452` | 29 | 6 |
| 07 | `e39ac5a6d831995c09711cecd369cf124c68d72d7575e78c1f7b641a602a60ae` | 200 | 5 |
| 08 | `3220774c611a28a59806411474bb2681fb92a85342b7e788f677519ff79a4cb7` | 71 | 4 |
| 09 | `f000378d429c1387e41961ee18a6c3098edeedad3900c72730865fc14331c584` | 57 | 3 |

## Rows

Repeated summary entries, supporting inventories and historical findings can refer to the same behavior. The row ID and line number locate the original report. Private rows expose only opaque locators and routing status. A workstream number in the last column marked **route** is an investigation queue.

| Locator | Report line | Disposition | Issue or PR and evidence |
| --- | ---: | --- | --- |
| `06:L100` | 100 | Review remaining | route #1974 |
| `06:L101` | 101 | Review remaining | route #1974 |
| `06:L102` | 102 | Private routing | — |
| `06:L103` | 103 | Review remaining | route #1974 |
| `06:L104` | 104 | Review remaining | route #1974 |
| `06:L105` | 105 | Review remaining | route #1974 |
| `06:L106` | 106 | Review remaining | route #1974 |
| `06:L107` | 107 | Review remaining | route #1974 |
| `06:L108` | 108 | Review remaining | route #1974 |
| `06:L109` | 109 | Private routing | — |
| `06:L110` | 110 | Private routing | — |
| `06:L111` | 111 | Private routing | — |
| `06:L112` | 112 | Private routing | — |
| `06:L113` | 113 | Review remaining | route #1974 |
| `06:L114` | 114 | Review remaining | route #1974 |
| `06:L115` | 115 | Review remaining | route #1974 |
| `06:L116` | 116 | Review remaining | route #1974 |
| `06:L117` | 117 | Review remaining | route #1974 |
| `06:L118` | 118 | Review remaining | route #1974 |
| `06:L119` | 119 | Review remaining | route #1974 |
| `06:L120` | 120 | Review remaining | route #1974 |
| `06:L121` | 121 | Review remaining | route #1974 |
| `06:L125` | 125 | Related scope only | #1974 |
| `06:L126` | 126 | Related scope only | #1974 |
| `06:L127` | 127 | Related scope only | #1974 |
| `06:L128` | 128 | Private routing | — |
| `06:L129` | 129 | Related scope only | #1974 |
| `06:L130` | 130 | Related scope only | #1974 |
| `06:L131` | 131 | Related scope only | #1974 |
| `05:PR355` | 26 | PR heads pinned | PR #355. route #1973 |
| `05:PR641` | 27 | PR heads pinned | PR #641. route #1973 |
| `05:PR651` | 28 | PR heads pinned | PR #651. route #1973 |
| `05:PR652` | 29 | PR heads pinned | PR #652. route #1973 |
| `05:PR653` | 30 | PR heads pinned | PR #653. route #1973 |
| `05:PR670` | 31 | PR heads pinned | PR #670. route #1973 |
| `05:PR673` | 32 | PR heads pinned | PR #651, #673. route #1973 |
| `05:PR687` | 33 | PR heads pinned | PR #687. route #1973 |
| `05:PR699` | 34 | PR heads pinned | PR #699. route #1973 |
| `05:PR709` | 35 | PR heads pinned | PR #709. route #1973 |
| `05:PR733` | 36 | PR heads pinned | PR #733. route #1973 |
| `05:PR737` | 37 | PR heads pinned | PR #737. route #1973 |
| `05:PR782` | 38 | PR heads pinned | PR #782. route #1973 |
| `05:PR812` | 39 | PR heads pinned | PR #812. route #1973 |
| `05:PR869` | 40 | PR heads pinned | PR #869. route #1973 |
| `05:PR958` | 41 | PR heads pinned | PR #958. route #1973 |
| `05:PR966` | 42 | PR heads pinned | PR #966. route #1973 |
| `05:PR970` | 43 | PR heads pinned | PR #948, #970. route #1973 |
| `05:PR982` | 44 | PR heads pinned | PR #1035, #982. route #1973 |
| `05:PR1021` | 45 | PR heads pinned | PR #1021. route #1973 |
| `05:PR1035` | 46 | PR patch checked | #1035. PR #1035. Three test-only files with typed globals. Old declaration intersection/conflict still needs the merge-tree and fixture check. |
| `05:PR1036` | 47 | PR patch checked | #1036. PR #1036. Twelve test files in the current patch. Static patch restores the scope inventory. Compile and fixture behavior remain unverified. |
| `05:PR1069` | 48 | PR patch checked | #1069. PR #1069. PDF worker fixtures and corresponding source manifest entry present. Fixture execution pending. |
| `05:PR1082` | 49 | Superseded with evidence | #1082. PR #1082. Closed as semantically superseded by merged #1867. #1081 records the source and regression receipts. |
| `05:PR1127` | 50 | PR heads pinned | PR #1127. route #1973 |
| `05:PR1142` | 51 | PR heads pinned | PR #1142. route #1973 |
| `05:PR1146` | 52 | PR patch checked | #1146. PR #1146. Existing #1144. Exact head changes missing-root handling and directly tests each missing root and healthy empty roots. |
| `05:PR1151` | 53 | PR patch checked | #1151. PR #1151. Four tooling moves, imports and manifest paths inspected. Two content-neutral moves supply no text hunk. Confirm CLI callers at integration. |
| `05:PR1165` | 54 | PR patch checked | #1165. PR #1165. Current patch adds fatal UTF-8 decode and invalid/valid version output tests. Focused tests pending. |
| `05:PR1172` | 55 | PR heads pinned | PR #1172. route #1973 |
| `05:PR1193` | 56 | PR heads pinned | PR #1193. route #1973 |
| `05:PR1201` | 57 | PR heads pinned | PR #1201. route #1973 |
| `05:PR1206` | 58 | PR heads pinned | PR #1206. route #1973 |
| `05:PR1218` | 59 | PR heads pinned | PR #1218. route #1973 |
| `05:PR1222` | 60 | PR heads pinned | PR #1222. route #1973 |
| `05:PR1226` | 61 | Private routing | — |
| `05:PR1228` | 62 | PR heads pinned | PR #1228. route #1973 |
| `05:PR1261` | 63 | PR heads pinned | PR #1261. route #1973 |
| `05:PR1279` | 64 | PR heads pinned | PR #1279. route #1973 |
| `05:PR1290` | 65 | PR heads pinned | PR #1290. route #1973 |
| `05:PR1291` | 66 | PR heads pinned | PR #1291. route #1973 |
| `05:PR1292` | 67 | PR heads pinned | PR #1292. route #1973 |
| `05:PR1293` | 68 | PR heads pinned | PR #1293. route #1973 |
| `05:PR1294` | 69 | PR heads pinned | PR #1294. route #1973 |
| `05:PR1319` | 70 | PR heads pinned | PR #1319. route #1973 |
| `05:PR1334` | 71 | PR heads pinned | PR #1334. route #1973 |
| `05:PR1370` | 72 | PR heads pinned | PR #1370. route #1973 |
| `05:PR1372` | 73 | PR heads pinned | PR #1372. route #1973 |
| `05:PR1380` | 74 | PR heads pinned | PR #1380. route #1973 |
| `05:PR1386` | 75 | PR heads pinned | PR #1386. route #1973 |
| `05:PR1388` | 76 | PR heads pinned | PR #1388. route #1973 |
| `05:PR1404` | 77 | PR heads pinned | PR #1404. route #1973 |
| `05:PR1407` | 78 | PR heads pinned | PR #1407. route #1973 |
| `05:PR1410` | 79 | PR heads pinned | PR #1410. route #1973 |
| `05:PR1414` | 80 | PR heads pinned | PR #1414. route #1973 |
| `05:PR1416` | 81 | PR heads pinned | PR #1416. route #1973 |
| `05:PR1417` | 82 | PR heads pinned | PR #1417. route #1973 |
| `05:PR1421` | 83 | PR heads pinned | PR #1421. route #1973 |
| `05:PR1426` | 84 | PR heads pinned | PR #1426. route #1973 |
| `05:PR1428` | 85 | PR heads pinned | PR #1428. route #1973 |
| `05:PR1429` | 86 | Private routing | — |
| `05:PR1431` | 87 | PR heads pinned | PR #1431. route #1973 |
| `05:PR1432` | 88 | PR heads pinned | PR #1432. route #1973 |
| `05:PR1435` | 89 | PR heads pinned | PR #1435. route #1973 |
| `05:PR1436` | 90 | PR heads pinned | PR #1441, #1456, #1436. route #1973 |
| `05:PR1439` | 91 | PR heads pinned | PR #1439. route #1973 |
| `05:PR1440` | 92 | PR heads pinned | PR #1440. route #1973 |
| `05:PR1441` | 93 | PR heads pinned | PR #1436, #1456, #1441. route #1973 |
| `05:PR1442` | 94 | PR heads pinned | PR #1442. route #1973 |
| `05:PR1444` | 95 | PR heads pinned | PR #1444. route #1973 |
| `05:PR1445` | 96 | Private routing | — |
| `05:PR1447` | 97 | PR heads pinned | PR #1447. route #1973 |
| `05:PR1451` | 98 | PR heads pinned | PR #1451. route #1973 |
| `05:PR1456` | 99 | PR heads pinned | PR #1456. route #1973 |
| `05:PR1458` | 100 | PR heads pinned | PR #1458. route #1973 |
| `05:PR1459` | 101 | PR heads pinned | PR #1459. route #1973 |
| `05:PR1460` | 102 | PR heads pinned | PR #1470, #1460. route #1973 |
| `05:PR1462` | 103 | PR heads pinned | PR #1462. route #1973 |
| `05:PR1464` | 104 | PR heads pinned | PR #1464. route #1973 |
| `05:PR1470` | 105 | PR heads pinned | PR #1460, #1464, #1470. route #1973 |
| `05:PR1480` | 106 | PR heads pinned | PR #1480. route #1973 |
| `05:PR1483` | 107 | PR heads pinned | PR #1483. route #1973 |
| `05:PR1487` | 108 | PR heads pinned | PR #1487. route #1973 |
| `05:PR1488` | 109 | PR heads pinned | PR #1488. route #1973 |
| `05:PR1489` | 110 | PR heads pinned | PR #1489. route #1973 |
| `05:PR1492` | 111 | PR heads pinned | PR #1492. route #1973 |
| `05:PR1493` | 112 | PR heads pinned | PR #1493. route #1973 |
| `05:PR1498` | 113 | PR heads pinned | PR #1498. route #1973 |
| `05:PR1503` | 114 | PR heads pinned | PR #1503. route #1973 |
| `05:PR1506` | 115 | PR heads pinned | PR #1506. route #1973 |
| `05:PR1511` | 116 | PR heads pinned | PR #1511. route #1973 |
| `05:PR1514` | 117 | PR heads pinned | PR #1514. route #1973 |
| `05:PR1516` | 118 | PR heads pinned | PR #1516. route #1973 |
| `05:PR1518` | 119 | PR heads pinned | PR #1518. route #1973 |
| `05:PR1521` | 120 | PR heads pinned | PR #1521. route #1973 |
| `05:PR1541` | 121 | PR heads pinned | PR #1541. route #1973 |
| `05:PR1550` | 122 | PR heads pinned | PR #1550. route #1973 |
| `05:PR1554` | 123 | PR heads pinned | PR #1554. route #1973 |
| `05:PR1556` | 124 | Private routing | — |
| `05:PR1557` | 125 | PR heads pinned | PR #1557. route #1973 |
| `05:PR1558` | 126 | PR heads pinned | PR #1558. route #1973 |
| `05:PR1563` | 127 | Private routing | — |
| `05:PR1564` | 128 | PR heads pinned | PR #1564. route #1973 |
| `05:PR1580` | 129 | Private routing | — |
| `05:PR1593` | 130 | PR heads pinned | PR #1593. route #1973 |
| `05:PR1633` | 131 | PR heads pinned | PR #1633. route #1973 |
| `05:PR1634` | 132 | PR heads pinned | PR #1634. route #1973 |
| `05:PR1668` | 133 | PR heads pinned | PR #1668. route #1973 |
| `05:PR1670` | 134 | PR heads pinned | PR #1670. route #1973 |
| `05:PR1671` | 135 | PR heads pinned | PR #1671. route #1973 |
| `05:PR1673` | 136 | PR heads pinned | PR #1673. route #1973 |
| `05:PR1692` | 137 | PR heads pinned | PR #1692. route #1973 |
| `05:PR1694` | 138 | PR heads pinned | PR #1694. route #1973 |
| `05:PR1700` | 139 | PR heads pinned | PR #1700. route #1973 |
| `05:PR1719` | 140 | PR heads pinned | PR #1719. route #1973 |
| `05:PR1745` | 141 | PR heads pinned | PR #1745. route #1973 |
| `05:PR1786` | 142 | PR heads pinned | PR #1786. route #1973 |
| `05:PR1793` | 143 | PR heads pinned | PR #1793. route #1973 |
| `05:PR1795` | 144 | PR heads pinned | PR #1795. route #1973 |
| `05:PR1798` | 145 | PR heads pinned | PR #1798. route #1973 |
| `05:PR1799` | 146 | PR heads pinned | PR #1799. route #1973 |
| `05:L493` | 493 | PR heads pinned | PR #355. route #1973 |
| `05:L494` | 494 | PR heads pinned | PR #641, #651, #652, #653, #670, #673, #687, #699, #709, #733, #737, #782, #812. route #1973 |
| `05:L495` | 495 | PR heads pinned | PR #1035, #1036, #1069, #1082, #1146, #1151, #1165. route #1973 |
| `05:L496` | 496 | PR heads pinned | PR #1127, #1142, #1290, #1511, #1521, #1668, #1786, #1426, #1692, #1694, #1793, #1798. route #1973 |
| `05:L497` | 497 | Private routing | — |
| `05:L545` | 545 | PR heads pinned | PR #641, #670, #673, #651, #652. route #1973 |
| `05:L546` | 546 | PR heads pinned | PR #651, #652, #653. route #1973 |
| `05:L547` | 547 | PR heads pinned | PR #673, #651, #652, #641, #670, #653. route #1973 |
| `05:L548` | 548 | PR heads pinned | PR #355, #501. route #1973 |
| `07:1.1` | 13 | Named in issue scope | #1964 |
| `07:1.2` | 14 | Named in issue scope | #1964 |
| `07:1.3` | 15 | Named in issue scope | #1964 |
| `07:1.4` | 16 | Named in issue scope | #1964 |
| `07:1.5` | 17 | Named in issue scope | #1964 |
| `07:1.6` | 18 | Named in issue scope | #1964 |
| `07:1.7` | 19 | Named in issue scope | #1964 |
| `07:1.8` | 20 | Named in issue scope | #1964 |
| `07:1.9` | 21 | Named in issue scope | #1964 |
| `07:1.10` | 22 | Named in issue scope | #1964 |
| `07:1.11` | 23 | Named in issue scope | #2145. The issue explicitly requests Enter handling with no selectable palette action. |
| `07:1.12` | 24 | Named in issue scope | #1976 |
| `07:1.13` | 25 | Named in issue scope | #1964 |
| `07:2.1` | 26 | Named in issue scope | #1965 |
| `07:2.2` | 27 | Named in issue scope | #1965 |
| `07:2.3` | 28 | Named in issue scope | #1965 |
| `07:2.4` | 29 | Named in issue scope | #1965 |
| `07:2.5` | 30 | Named in issue scope | #1966 |
| `07:2.6` | 31 | Named in issue scope | #1965 |
| `07:2.7` | 32 | Private routing | — |
| `07:2.8` | 33 | Named in issue scope | #1965 |
| `07:2.9` | 34 | Named in issue scope | #1965 |
| `07:2.10` | 35 | Named in issue scope | #1965 |
| `07:2.11` | 36 | Named in issue scope | #1965 |
| `07:2.12` | 37 | Named in issue scope | #1965 |
| `07:2.13` | 38 | Related scope only | #1284, #1380 |
| `07:3.1` | 39 | Named in issue scope | #1969 |
| `07:3.2` | 40 | Named in issue scope | #1976 |
| `07:3.3` | 41 | Named in issue scope | #1976 |
| `07:3.4` | 42 | Named in issue scope | #1976 |
| `07:4.1` | 43 | Named in issue scope | #1966 |
| `07:4.2` | 44 | Named in issue scope | #1966 |
| `07:4.3` | 45 | Named in issue scope | #1966 |
| `07:4.4` | 46 | Named in issue scope | #1966 |
| `07:4.5` | 47 | Named in issue scope | #1966 |
| `07:4.6` | 48 | Named in issue scope | #1966 |
| `07:4.7` | 49 | Named in issue scope | #1966 |
| `07:4.8` | 50 | Named in issue scope | #1966 |
| `07:4.9` | 51 | Named in issue scope | #1966 |
| `07:4.10` | 52 | Named in issue scope | #1966 |
| `07:4.11` | 53 | Named in issue scope | #1966 |
| `07:4.12` | 54 | Named in issue scope | #1966 |
| `07:4.13` | 55 | Named in issue scope | #1741 |
| `07:5.1` | 56 | Named in issue scope | #1967 |
| `07:5.2` | 57 | Named in issue scope | #1704 |
| `07:5.3` | 58 | Named in issue scope | #1967 |
| `07:5.4` | 59 | Named in issue scope | #1728 |
| `07:5.5` | 60 | Named in issue scope | #1967 |
| `07:5.6` | 61 | Named in issue scope | #1967 |
| `07:5.7` | 62 | Named in issue scope | #1967 |
| `07:5.8` | 63 | Named in issue scope | #1967 |
| `07:5.9` | 64 | Named in issue scope | #1967 |
| `07:5.10` | 65 | Named in issue scope | #1967 |
| `07:5.11` | 66 | Named in issue scope | #1967 |
| `07:5.12` | 67 | Named in issue scope | #1967 |
| `07:6.1` | 68 | Named in issue scope | #1980 |
| `07:6.2` | 69 | Named in issue scope | #1981 |
| `07:6.3` | 70 | Named in issue scope | #1964 |
| `07:6.4` | 71 | Named in issue scope | #1980 |
| `07:6.5` | 72 | Private routing | — |
| `07:6.6` | 73 | Review remaining | route #1946 |
| `07:7.1` | 74 | Named in issue scope | #1969 |
| `07:7.2` | 75 | Named in issue scope | #1969 |
| `07:7.3` | 76 | Named in issue scope | #1969 |
| `07:7.4` | 77 | Named in issue scope | #1969 |
| `07:7.5` | 78 | Named in issue scope | #1969 |
| `07:8.1` | 79 | Related scope only | #1357 |
| `07:8.2` | 80 | Named in issue scope | #1975 |
| `07:8.3` | 81 | Named in issue scope | #1975 |
| `07:8.4` | 82 | Named in issue scope | #1969 |
| `07:8.5` | 83 | Named in issue scope | #1975 |
| `07:8.6` | 84 | Named in issue scope | #1975 |
| `07:8.7` | 85 | Named in issue scope | #1975 |
| `07:8.8` | 86 | Named in issue scope | #1975 |
| `07:8.9` | 87 | Named in issue scope | #1975 |
| `07:8.10` | 88 | Named in issue scope | #1969 |
| `07:8.11` | 89 | Named in issue scope | #1975 |
| `07:9.1` | 90 | Related scope only | #1357 |
| `07:9.2` | 91 | Related scope only | #1343 |
| `07:9.3` | 92 | Related scope only | #1343 |
| `07:9.4` | 93 | Named in issue scope | #1975 |
| `07:9.5` | 94 | Named in issue scope | #1969 |
| `07:9.6` | 95 | Named in issue scope | #1969 |
| `07:9.7` | 96 | Named in issue scope | #1969 |
| `07:9.8` | 97 | Named in issue scope | #1975 |
| `07:9.9` | 98 | Named in issue scope | #1975 |
| `07:9.10` | 99 | Named in issue scope | #1975 |
| `07:10.1` | 100 | Related scope only | #1974. Owner decision. #1635 and #1779 exclude production activation. |
| `07:10.2` | 101 | Related scope only | #1343 |
| `07:10.3` | 102 | Related scope only | #1974 |
| `07:10.4` | 103 | Named in issue scope | #1968 |
| `07:10.5` | 104 | Named in issue scope | #1968 |
| `07:10.6` | 105 | Named in issue scope | #1968 |
| `07:10.7` | 106 | Named in issue scope | #1965 |
| `07:10.8` | 107 | Named in issue scope | #1968 |
| `07:11.1` | 108 | Named in issue scope | #1860. Current R01 plan covers sign-in link reachability. |
| `07:11.2` | 109 | Private routing | — |
| `07:11.3` | 110 | Named in issue scope | #1966 |
| `07:11.4` | 111 | Private routing | — |
| `07:11.5` | 112 | Named in issue scope | #1969 |
| `07:11.6` | 113 | Named in issue scope | #1968 |
| `07:11.7` | 114 | Named in issue scope | #1339 |
| `07:11.8` | 115 | Private routing | — |
| `07:12.1` | 116 | Named in issue scope | #1970 |
| `07:12.2` | 117 | Named in issue scope | #1970 |
| `07:12.3` | 118 | Named in issue scope | #1970 |
| `07:12.4` | 119 | Named in issue scope | #1970 |
| `07:12.5` | 120 | Named in issue scope | #1970 |
| `07:12.6` | 121 | Named in issue scope | #1970 |
| `07:12.7` | 122 | Named in issue scope | #1970 |
| `07:12.8` | 123 | Named in issue scope | #1970 |
| `07:12.9` | 124 | Named in issue scope | #1970 |
| `07:12.10` | 125 | Named in issue scope | #1970 |
| `07:12.11` | 126 | Named in issue scope | #1970 |
| `07:12.12` | 127 | Named in issue scope | #1970 |
| `07:12.13` | 128 | Named in issue scope | #1970 |
| `07:13.1` | 129 | Named in issue scope | #1971 |
| `07:13.2` | 130 | Review remaining | route #1946 |
| `07:13.3` | 131 | Named in issue scope | #1953. Browser → Changes → restore must exercise the real path. |
| `07:13.4` | 132 | Named in issue scope | #1976 |
| `07:13.5` | 133 | Named in issue scope | #1976 |
| `07:13.6` | 134 | Named in issue scope | #1976 |
| `07:13.7` | 135 | Named in issue scope | #1971 |
| `07:13.8` | 136 | Named in issue scope | #1971 |
| `07:13.9` | 137 | Named in issue scope | #1971 |
| `07:13.10` | 138 | Named in issue scope | #1971 |
| `07:13.11` | 139 | Named in issue scope | #1971 |
| `07:13.12` | 140 | Named in issue scope | #1971 |
| `07:13.13` | 141 | Named in issue scope | #1969 |
| `07:13.14` | 142 | Named in issue scope | #1969 |
| `07:13.15` | 143 | Named in issue scope | #1971 |
| `07:13.16` | 144 | Named in issue scope | #1971 |
| `07:13.17` | 145 | Named in issue scope | #1971 |
| `07:L682` | 682 | Review remaining | route #1946 |
| `07:L683` | 683 | Review remaining | route #1946 |
| `07:L684` | 684 | Review remaining | route #1946 |
| `07:L685` | 685 | Review remaining | route #1946 |
| `07:L686` | 686 | Review remaining | route #1946 |
| `07:L687` | 687 | Review remaining | route #1946 |
| `07:L688` | 688 | Review remaining | route #1946 |
| `07:L689` | 689 | Review remaining | route #1946 |
| `07:L690` | 690 | Review remaining | route #1946 |
| `07:L691` | 691 | Review remaining | route #1946 |
| `07:L692` | 692 | Review remaining | route #1946 |
| `07:L693` | 693 | Review remaining | route #1946 |
| `07:L694` | 694 | Review remaining | route #1946 |
| `07:L695` | 695 | Review remaining | route #1946 |
| `07:L696` | 696 | Review remaining | route #1946 |
| `07:L697` | 697 | Review remaining | route #1946 |
| `07:L698` | 698 | Review remaining | route #1946 |
| `07:L699` | 699 | Review remaining | route #1946 |
| `07:L700` | 700 | Review remaining | route #1946 |
| `07:L701` | 701 | Review remaining | route #1946 |
| `07:L702` | 702 | Review remaining | route #1946 |
| `07:L703` | 703 | Review remaining | route #1946 |
| `07:L704` | 704 | Review remaining | route #1946 |
| `07:L705` | 705 | Review remaining | route #1946 |
| `07:L706` | 706 | Review remaining | route #1946 |
| `07:L707` | 707 | Review remaining | route #1946 |
| `07:L708` | 708 | Review remaining | route #1946 |
| `07:L709` | 709 | Review remaining | route #1946 |
| `07:L710` | 710 | Review remaining | route #1946 |
| `07:L711` | 711 | Review remaining | route #1946 |
| `07:L712` | 712 | Review remaining | route #1946 |
| `07:L713` | 713 | Review remaining | route #1946 |
| `07:L714` | 714 | Review remaining | route #1946 |
| `07:L715` | 715 | Review remaining | route #1946 |
| `07:L716` | 716 | Review remaining | route #1946 |
| `07:L717` | 717 | Review remaining | route #1946 |
| `07:L718` | 718 | Review remaining | route #1946 |
| `07:L719` | 719 | Review remaining | route #1946 |
| `07:L720` | 720 | Review remaining | route #1946 |
| `07:L721` | 721 | Review remaining | route #1946 |
| `07:L722` | 722 | Review remaining | route #1946 |
| `07:L723` | 723 | Review remaining | route #1946 |
| `07:L724` | 724 | Review remaining | route #1946 |
| `07:L725` | 725 | Review remaining | route #1946 |
| `07:L726` | 726 | Review remaining | route #1946 |
| `07:L727` | 727 | Review remaining | route #1946 |
| `07:L728` | 728 | Review remaining | route #1946 |
| `07:L729` | 729 | Review remaining | route #1946 |
| `07:L730` | 730 | Review remaining | route #1946 |
| `07:L731` | 731 | Review remaining | route #1946 |
| `07:L732` | 732 | Review remaining | route #1946 |
| `07:L733` | 733 | Review remaining | route #1946 |
| `07:L734` | 734 | Review remaining | route #1946 |
| `07:L735` | 735 | Review remaining | route #1946 |
| `07:L736` | 736 | Review remaining | route #1946 |
| `07:L737` | 737 | Review remaining | route #1946 |
| `07:L738` | 738 | Review remaining | route #1946 |
| `07:L739` | 739 | Review remaining | route #1946 |
| `07:L740` | 740 | Review remaining | route #1946 |
| `07:L741` | 741 | Review remaining | route #1946 |
| `07:L742` | 742 | Review remaining | route #1946 |
| `07:L743` | 743 | Review remaining | route #1946 |
| `07:L744` | 744 | Review remaining | route #1946 |
| `07:L745` | 745 | Review remaining | route #1946 |
| `07:L746` | 746 | Review remaining | route #1946 |
| `07:L747` | 747 | Review remaining | route #1946 |
| `07:L748` | 748 | Review remaining | route #1946 |
| `08:DT-1` | 19 | Private routing | — |
| `08:DT-2` | 20 | Review remaining | route #1972 |
| `08:DT-3` | 21 | Review remaining | route #1972 |
| `08:DT-4` | 22 | Review remaining | route #1972 |
| `08:DT-5` | 23 | Review remaining | route #1972 |
| `08:DT-6` | 24 | Review remaining | route #1972 |
| `08:DT-7` | 25 | Review remaining | route #1972 |
| `08:DT-8` | 26 | Review remaining | route #1972 |
| `08:DT-9` | 27 | Private routing | — |
| `08:DT-10` | 28 | Review remaining | route #1972 |
| `08:DT-11` | 29 | Review remaining | route #1972 |
| `08:DT-12` | 30 | Review remaining | route #1972 |
| `08:DT-13` | 31 | Review remaining | route #1972 |
| `08:DT-14` | 32 | Review remaining | route #1972 |
| `08:DT-15` | 33 | Review remaining | route #1972 |
| `08:DT-16` | 34 | Review remaining | route #1972 |
| `08:DT-17` | 35 | Review remaining | route #1972 |
| `08:DT-18` | 36 | Private routing | — |
| `08:DT-19` | 37 | Review remaining | route #1972 |
| `08:DT-20` | 38 | Private routing | — |
| `08:DT-21` | 39 | Review remaining | route #1972 |
| `08:DT-22` | 40 | Review remaining | route #1972 |
| `08:DT-23` | 41 | Review remaining | route #1972 |
| `08:DT-24` | 42 | Review remaining | route #1972 |
| `08:DT-25` | 43 | Review remaining | route #1972 |
| `08:DT-26` | 44 | Review remaining | route #1972 |
| `08:DT-27` | 45 | Review remaining | route #1972 |
| `08:DT-28` | 46 | Review remaining | route #1972 |
| `08:DT-29` | 47 | Review remaining | route #1972 |
| `08:DT-30` | 48 | Review remaining | route #1972 |
| `08:DT-31` | 49 | Review remaining | route #1972 |
| `08:DT-32` | 50 | Review remaining | route #1972 |
| `08:DT-33` | 51 | Review remaining | route #1972 |
| `08:DT-34` | 52 | Review remaining | route #1972 |
| `08:DT-35` | 53 | Review remaining | route #1972 |
| `08:DT-36` | 54 | Review remaining | route #1972 |
| `08:DT-37` | 55 | Review remaining | route #1972 |
| `08:DT-38` | 56 | Review remaining | route #1972 |
| `08:DT-39` | 57 | Review remaining | route #1972 |
| `08:DT-40` | 58 | Review remaining | route #1972 |
| `08:DT-41` | 59 | Review remaining | route #1972 |
| `08:DT-42` | 60 | Review remaining | route #1972 |
| `08:DT-43` | 61 | Review remaining | route #1972 |
| `08:DT-44` | 62 | Review remaining | route #1972 |
| `08:DT-45` | 63 | Review remaining | route #1972 |
| `08:DT-46` | 64 | Review remaining | route #1972 |
| `08:DT-47` | 65 | Review remaining | route #1972 |
| `08:DT-48` | 66 | Review remaining | route #1972 |
| `08:DT-49` | 67 | Review remaining | route #1972 |
| `08:DT-50` | 68 | Review remaining | route #1972 |
| `08:DT-51` | 69 | Review remaining | route #1972 |
| `08:DT-52` | 70 | Review remaining | route #1972 |
| `08:DT-53` | 71 | Review remaining | route #1972 |
| `08:DT-54` | 72 | Review remaining | route #1972 |
| `08:DT-55` | 73 | Review remaining | route #1972 |
| `08:DT-56` | 74 | Review remaining | route #1972 |
| `08:DT-57` | 75 | Review remaining | route #1972 |
| `08:DT-58` | 76 | Review remaining | route #1972 |
| `08:DT-59` | 77 | Review remaining | route #1972 |
| `08:DT-60` | 78 | Review remaining | route #1972 |
| `08:DT-61` | 79 | Review remaining | route #1972 |
| `08:DT-62` | 80 | Review remaining | route #1972 |
| `08:DT-63` | 81 | Review remaining | route #1972 |
| `08:DT-64` | 82 | Review remaining | route #1972 |
| `08:DT-65` | 83 | Review remaining | route #1972 |
| `08:DT-66` | 84 | Review remaining | route #1972 |
| `08:DT-67` | 85 | Review remaining | route #1972 |
| `08:DT-68` | 86 | Review remaining | route #1972 |
| `08:DT-69` | 87 | Review remaining | route #1972 |
| `08:DT-70` | 88 | Review remaining | route #1972 |
| `08:DT-71` | 89 | Review remaining | route #1972 |
| `09:F1` | 18 | PR patch checked | #1626. PR #1907, #1909. The ignored-local-file hazard remains source-visible on open heads #1907 and #1909. T03 owns preserving the local tree; verify both heads before integration. The fast-forward function was absent from the main file at the inspected tip. Scope remains with #1626 and the existing PRs. |
| `09:F2` | 19 | Private routing | — |
| `09:F3` | 20 | PR heads pinned | PR #1565. route #1973 |
| `09:F4` | 21 | PR heads pinned | PR #1858, #1859. route #1973 |
| `09:F5` | 22 | PR heads pinned | PR #1774. route #1973 |
| `09:F6` | 23 | PR heads pinned | PR #1775. route #1973 |
| `09:F7` | 24 | PR heads pinned | PR #1781. route #1973 |
| `09:F8` | 25 | PR heads pinned | PR #1814. route #1973 |
| `09:F9` | 26 | PR heads pinned | PR #1823. route #1973 |
| `09:F10` | 27 | PR heads pinned | PR #1902. route #1973 |
| `09:F11` | 28 | PR heads pinned | PR #1904, #1902, #1507. route #1973 |
| `09:F12` | 29 | PR heads pinned | PR #1906. route #1973 |
| `09:F13` | 30 | PR heads pinned | PR #1910. route #1973 |
| `09:F14` | 31 | PR heads pinned | PR #1919, #1774. route #1973 |
| `09:F15` | 32 | PR heads pinned | PR #1937, #1920. route #1973 |
| `09:F16` | 33 | Private routing | — |
| `09:F17` | 34 | PR heads pinned | PR #1876, #1877. route #1973 |
| `09:F18` | 35 | PR heads pinned | PR #1215. route #1973 |
| `09:F19` | 36 | PR heads pinned | PR #1233, #1347. route #1973 |
| `09:F20` | 37 | Private routing | — |
| `09:F21` | 38 | PR heads pinned | PR #1256. route #1973 |
| `09:F22` | 39 | PR heads pinned | PR #1157, #1356. route #1973 |
| `09:F23` | 40 | PR heads pinned | PR #1163, #1320, #1195, #1199, #1307. route #1973 |
| `09:F24` | 41 | PR heads pinned | PR #1164, #1353, #1528. route #1973 |
| `09:F25` | 42 | PR heads pinned | PR #1195, #1199. route #1973 |
| `09:F26` | 43 | PR heads pinned | PR #1387, #1408. route #1973 |
| `09:F27` | 44 | PR heads pinned | PR #1390, #1398. route #1973 |
| `09:F28` | 45 | PR heads pinned | PR #1422, #1450. route #1973 |
| `09:F29` | 46 | PR heads pinned | PR #1452, #1455, #1457, #1470, #1495, #1504, #1516. route #1973 |
| `09:F30` | 47 | PR heads pinned | PR #1501, #1517. route #1973 |
| `09:F31` | 48 | PR heads pinned | PR #1892, #1895. route #1973 |
| `09:F32` | 49 | PR heads pinned | PR #1259, #1597. route #1973 |
| `09:F33` | 50 | Review remaining | route #1973 |
| `09:F34` | 51 | PR heads pinned | PR #1436, #1441, #1456, #1459, #1462, #1465, #1480, #1487, #1489, #1492, #1497. route #1973 |
| `09:F35` | 52 | PR heads pinned | PR #1109, #1305, #1330, #1671. route #1973 |
| `09:F36` | 53 | PR heads pinned | PR #1258, #1576, #1778, #1783, #1791, #1905, #1785. route #1973 |
| `09:F37` | 54 | PR heads pinned | PR #1249, #1252. route #1973 |
| `09:F38` | 55 | PR heads pinned | PR #1381, #1433, #1355. route #1973 |
| `09:F39` | 56 | PR heads pinned | PR #896, #948, #1411, #1507, #1511, #1498, #1708. route #1973 |
| `09:F40` | 57 | PR heads pinned | PR #1888. route #1973 |
| `09:L114` | 114 | PR heads pinned | PR #1157, #1356. route #1973 |
| `09:L115` | 115 | PR heads pinned | PR #1163, #1320, #1195, #1199, #1307. route #1973 |
| `09:L116` | 116 | PR heads pinned | PR #1164, #1353, #1528. route #1973 |
| `09:L117` | 117 | PR heads pinned | PR #1195, #1199. route #1973 |
| `09:L118` | 118 | PR heads pinned | PR #1387, #1408. route #1973 |
| `09:L119` | 119 | PR heads pinned | PR #1390, #1398. route #1973 |
| `09:L120` | 120 | PR heads pinned | PR #1422, #1450. route #1973 |
| `09:L121` | 121 | PR heads pinned | PR #1452, #1455, #1457, #1470, #1495, #1504, #1516, #1460, #1464. route #1973 |
| `09:L122` | 122 | PR heads pinned | PR #1501, #1517. route #1973 |
| `09:L123` | 123 | PR heads pinned | PR #1810, #1853. route #1973 |
| `09:L124` | 124 | PR heads pinned | PR #1876, #1877. route #1973 |
| `09:L125` | 125 | PR heads pinned | PR #1892, #1895. route #1973 |
| `09:L126` | 126 | PR heads pinned | PR #1902, #1904, #1507. route #1973 |
| `09:L127` | 127 | PR heads pinned | PR #1858, #1859. route #1973 |
| `09:L128` | 128 | PR heads pinned | PR #1259, #1597. route #1973 |
| `09:L129` | 129 | PR heads pinned | PR #1917, #1796, #1775. route #1973 |
| `09:L130` | 130 | PR heads pinned | PR #1937, #1920. route #1973 |

