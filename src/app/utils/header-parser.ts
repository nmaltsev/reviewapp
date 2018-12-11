const linkexp:RegExp = /<[^>]*>\s*(\s*;\s*[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*")))*(,|$)/g;
const paramexp:RegExp = /[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*"))/g;


function parseLinkHeader(header:string): ISolidEntityLinkHeader {
    let matches:RegExpMatchArray = header.match(linkexp);
    let rels:ISolidEntityLinkHeader = {};
    for (let i:number = 0; i < matches.length; i++) {
        let split:string[] = matches[i].split('>');
        let href:string = split[0].substring(1);
        let ps:string = split[1];
        let link:Object = new Object();
        link['href'] = href;
        let s:RegExpMatchArray = ps.match(paramexp);
        for (let j:number= 0; j < s.length; j++) {
            let p:string = s[j];
            let paramsplit:string[] = p.split('=');
            let name:string = paramsplit[0];
            link[name] = unquote(paramsplit[1]);
        }

        if (link['rel'] != undefined) {
            rels[link['rel']] = link;
        }
    }   

    return rels;
}

function unquote(value: string): string {
    if (value.charAt(0) == '"' && value.charAt(value.length - 1) == '"') return value.substring(1, value.length - 1);
    return value;
}

interface ISolidEntityEntry {
    href: string;
    rel: string;
}

interface ISolidEntityLinkHeader {
    acl?:ISolidEntityEntry;
    describedBy?:ISolidEntityEntry;
    type?:ISolidEntityEntry;
}


export {
    parseLinkHeader,
    ISolidEntityLinkHeader
}