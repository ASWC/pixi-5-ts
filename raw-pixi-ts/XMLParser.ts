
export class XMLParser
{
    public static parse(value:string):XMLDocument
    {
        var parser:DOMParser = new DOMParser();
        var result = parser.parseFromString(value, "text/xml");
        return result;
    }
}