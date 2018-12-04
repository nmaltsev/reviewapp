const tools = {
    flatten: <Type>(list: Type[][]):Type[] => {
        return list.reduce((out: Type[], item:Type[]) => out.concat(item), []);
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
};

export {tools};