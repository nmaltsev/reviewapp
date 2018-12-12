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
    generateRandToken(n: number): number {
		return ~~((1 << n *10) * Math.random());
    },
};

export {tools};