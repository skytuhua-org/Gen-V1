import {describe,expect,it} from "vitest";
import {parseGoToLine,parseSourceLines} from "../apps/web/src/files/ProjectTextPreview";

describe("parseSourceLines",()=>{
	it("returns one empty line for empty text",()=>{expect(parseSourceLines("")).toEqual([{start:0,end:0}]);});
	it("keeps LF boundaries and a trailing empty line",()=>{expect(parseSourceLines("a\nb\n")).toEqual([{start:0,end:1},{start:2,end:3},{start:4,end:4}]);});
	it("keeps consecutive blank lines",()=>{expect(parseSourceLines("a\n\n\nb")).toHaveLength(4);});
	it("splits CRLF as one separator",()=>{expect(parseSourceLines("a\r\nb")).toEqual([{start:0,end:1},{start:3,end:4}]);});
	it("splits bare CR as one separator",()=>{expect(parseSourceLines("a\rb")).toEqual([{start:0,end:1},{start:2,end:3}]);});
	it("handles mixed separators",()=>{expect(parseSourceLines("a\nb\r\nc\rd")).toHaveLength(4);});
	it("preserves offsets for source slicing",()=>{const text="one\ntwo\nthree";const lines=parseSourceLines(text);expect(lines.map(l=>text.slice(l.start,l.end))).toEqual(["one","two","three"]);});
});
describe("parseGoToLine",()=>{
	it("accepts plain and signed integers",()=>{expect(parseGoToLine("5")).toBe(5);expect(parseGoToLine("  12  ")).toBe(12);expect(parseGoToLine("-3")).toBe(-3);expect(parseGoToLine("+7")).toBe(7);});
	it("rejects blank",()=>{expect(parseGoToLine("")).toBeNull();expect(parseGoToLine("   ")).toBeNull();});
	it("rejects fractions and exponents",()=>{expect(parseGoToLine("2.5")).toBeNull();expect(parseGoToLine("1e3")).toBeNull();});
	it("rejects non-numeric text",()=>{expect(parseGoToLine("abc")).toBeNull();expect(parseGoToLine("3a")).toBeNull();});
	it("rejects unsafe integers",()=>{expect(parseGoToLine("99999999999999999999")).toBeNull();});
});
