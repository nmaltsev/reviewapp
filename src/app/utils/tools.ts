
const tools = {
    flatten: <Type>(list: Type[][]):Type[] => {
        return list.reduce(
            (out: Type[], item:Type[]) => Array.isArray(item) ? out.concat(item) : out, 
            []
        );
    },
    joinLeft: <Type>(left:Type[], right: Type[]):Type[] => {
        let i:number = right.length;

        while (i-- > 0) {
            if (left.indexOf(right[i]) < 0) {
                left.push(right[i]);
            }
        }

        return left;
    },
    removeItem: <Type>(list:Type[], item:Type):Type[] => {
        let pos: number = list.indexOf(item);

        return pos > -1 ? list.splice(pos, 1) : list;
    },
};
const uid = (function(){
    function _generateRandToken(n: number): number {
        return ~~((1 << n *10) * Math.random());
    }
    let _sessionToken: number = _generateRandToken(2); 

    return {
        generateDocumentUID: (): string => {
            return '#' + _sessionToken + '-' + _generateRandToken(2);
        },
    };
}()); 

export {
    tools,
    uid
};