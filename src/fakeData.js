// export class DataModel{
//     constructor(id, name, parentID, type){
//         this.id = id;
//         this.name = name;
//         this.parentID = parentID;
//         this.type = type;
//     }
// }

// export const testData = [
//     new DataModel(1,'Folder 1', null, 'folder'),
//     new DataModel(2,'File 1', null, 'file'),
// ]

export const testData = [
    {
        id: 1,
        name: 'Folder 1',
        parentID: 'root',
        type: 'folder',
    },
    {
        id: 2,
        name: 'File 2.txt',
        parentID: 'root',
        type: 'file'
    },
    {
        id: 3,
        name: 'Folder 3',
        parentID: 1,
        type: 'folder'
    },
    {
        id: 4,
        name: 'Folder 4',
        parentID: 3,
        type: 'folder'
    },
    {
        id: 5,
        name: 'Folder 5',
        parentID: 4,
        type: 'folder'
    },
    {
        id: 6,
        name: 'Folder 6',
        parentID: 5,
        type: 'folder'
    },
];