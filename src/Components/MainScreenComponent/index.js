import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { create, remove, update } from '../../driveStateSlice';

import './mainScreen.css';
import folderImg from '../../assets/folder.png';
import fileImg from '../../assets/file.png';
import newFileImg from '../../assets/add_new_button.png';
import backBtn from '../../assets/back_button.png';
import searchIcon from '../../assets/search_icon.png';

const rootDirectory = {
    id: 'root',
    name: 'Root',
    parentID: null,
    type: 'folder'
};

function MainScreen(){
    const sortByParentID = (data) => data.parentID === activeDirectory.id
    const sortByText = (data) => data.name.toLowerCase().includes(searchText.toLowerCase());
    const dispatch = useDispatch();
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [xPos, setXPos] = useState("0px");
    const [yPos, setYPos] = useState("0px");
    const [showMenu, setShowMenu] = useState(false);
    const [contextRecord, setContextRecord] = useState({});
    const [activeDirectory, setActiveDirectory] = useState(rootDirectory);
    const [path,setPath] = useState([rootDirectory]);
    const [searchText,setSearchText] = useState('');
    const [copiedRecord, setCopiedRecord] = useState(null);
    const [renameRecord, setRenameRecord] = useState(null);
    let sortByFunc = searchText ? sortByText : sortByParentID;
    const driveDataList = useSelector((state) => state.drive.value.filter(sortByFunc));
    const fullDriveDataList = useSelector((state) => state.drive.value);

    function handleContextMenu(e,record){
        e.preventDefault();
        setXPos(`${e.pageX}px`);
        setYPos(`${e.pageY}px`);
        setShowMenu(true);
        setContextRecord(record);
    }

    function closeContextMenu() {
        if(showMenu){
            setShowMenu(false);
            setContextRecord({});
        }
    }

    function handleFileClick(file){
        if(file.type === 'file') return;
        setActiveDirectory(file);
        if(searchText) {
            setPath([rootDirectory,file]);
            setSearchText('');
        }
        else setPath([...path,file]);
    }

    useEffect(() => {
        document.addEventListener("click", closeContextMenu);
        return () => {
            document.addEventListener("click", closeContextMenu);
        };
    });

    const NewFileComp = () => <div className='file_display' key='new_file' onClick={() => setShowInsertModal(true)}>
            <div title='New File/Folder' className='folder_component'>
            <img src={newFileImg} alt='New' style={{maxHeight: '72px'}}/>
        </div>
    </div>

    function onCreate(fileName, fileType){
        let newRecord = {
            id: new Date().valueOf(),
            name: fileName,
            parentID: activeDirectory.id,
            type: fileType
        }
        dispatch(create(newRecord));
        setShowInsertModal(false);
    }

    function addCopiedRecord(){
        let newObj = {...copiedRecord,parentID:activeDirectory.id,id:new Date().valueOf()};
        dispatch(create(newObj));
        let childrenNode = fullDriveDataList.filter((record) => record.parentID === copiedRecord.id);
        childrenNode.forEach(
            record => {
                let newChild = {...record,parentID:newObj.id,id:new Date().valueOf()};
                dispatch(create(newChild))
                recurciseCreateRecord(record.id,newChild.id);
            })
    }

    function recurciseCreateRecord(parentID, newParentID){
        let childrenNode = fullDriveDataList.filter((record) => record.parentID === parentID);
        childrenNode.forEach(record=>{
            let newObj = {...record,parentID:newParentID,id:new Date().valueOf()}
            dispatch(create(newObj));
            recurciseCreateRecord(record.id,newObj.id);
        });
    }

    function deleteRecord(val){
        dispatch(remove(val.id));
        let childrenNode = fullDriveDataList.filter((record) => record.parentID === val.id);
        childrenNode.forEach(
            record => {
                dispatch(remove(record.id))
                recurciseDeleteRecord(record.id);
            })
    }

    function recurciseDeleteRecord(parentID){
        let childrenNode = fullDriveDataList.filter((record) => record.parentID === parentID);
        childrenNode.forEach(record=>{
            dispatch(remove(record.id));
            recurciseDeleteRecord(record.id);
        });
    }

    function onRenameRecord(record){
        setRenameRecord(record);
        setShowRenameModal(true);
    }

    function updateRecord(fileName){
        dispatch(update({...renameRecord,name:fileName}));
        setShowRenameModal(false);
    }

    function handleCrumbClick(index) {
        if(index < 0 || index === path.length - 1) return;
        if(searchText) {
            setSearchText('');
            setActiveDirectory(rootDirectory);
            return;
        }
        setActiveDirectory(path[index]);
        setPath(path.filter((val,filterIndex) => filterIndex <= index));
    }

    return (
        <>
            <BreadCrumb path={path} searchText= {searchText} crumbClick= {handleCrumbClick} onSearch={(event) => {setSearchText(event.target.value)}} />
            <hr style={{width: '97%', color:'white'}}/>
            <div className='mainscreen'>
                {driveDataList.map((val) => (
                    <div className='file_display' key={val.id} onContextMenu={(e) => handleContextMenu(e,val)} onClick={() => handleFileClick(val)}>
                        <div title={val.name} className='folder_component'>
                            { val.type === 'folder' ? folderImgComp(val) : fileImgComp(val) }
                        </div>
                    </div>
                ))}
                <NewFileComp/>
                <InsertModal showInsertModal={showInsertModal} onCreate={onCreate} onClose={() => setShowInsertModal(false)}/>
                <RenameModal  onUpdate={updateRecord} showRenameModal={showRenameModal} onClose={() => setShowRenameModal(false)}/>
                <ContextMenu
                    showMenu={showMenu}
                    xPos={xPos}
                    yPos={yPos}
                    record={contextRecord}
                    copiedRecord={copiedRecord}
                    onCopy={() => setCopiedRecord(contextRecord)}
                    onPaste={addCopiedRecord}
                    onRename={onRenameRecord}
                    onDelete={() => deleteRecord(contextRecord)}
                />
            </div>
        </>
    )
}

const folderImgComp = (val) => <>
    <div key={'folderImg' + val.id}>
        <img src={folderImg} alt='Folder'/>
    </div>
    <span className='file_title'>{val.name}</span>
</>

const fileImgComp = (val) => {
    let fileNameSplit  = val.name.split('.');
    let extension = fileNameSplit.length > 1 ? fileNameSplit.splice(fileNameSplit.length -1, 1) : 'file';
    let name = fileNameSplit.join();
    return <>
        <div className='img_impose_txt' key={'fileImg' + val.id}>
            <img src={fileImg} alt='File'/>
            <div className='impose_txt'>{extension}</div>
        </div>
        <span className='file_title'>{name}</span>
    </> 
}

const BreadCrumb = ({path,searchText,crumbClick,onSearch}) => {
    return (
        <div className='breadcrumb'>
            <div className='breadcrumb_path'>
                <img src={backBtn} className='back_btn' alt='Back' onClick={() => crumbClick(path.length -2)}/>
                { searchText && <span>Search for '{searchText}'</span>}
                { !searchText && 
                    <span>
                        {path.map((val,index) => (
                            <span
                                key={val.id}
                                className={path.length -1 === index ? 'active' : 'non_active'}
                                onClick={() => crumbClick(index)}
                            >
                                {val.name + ' / '}
                            </span>
                        ))}
                    </span>
                }
            </div>
            <div className='input_container'>
                <input key='searchbox' type='text' placeholder='Search for anything' className='input' value={searchText} onChange={onSearch} />
                <img src={searchIcon} className='input_img' alt='Search'/>
            </div>
        </div>
    )
}

const RenameModal = ({onUpdate,showRenameModal, onClose}) => {
    const [fileName, setFileName] = useState('');
    function updateRecord(){
        onUpdate(fileName);
    }
    return <div className={showRenameModal ? 'modal display-block' : 'modal display-none'}>
        <section className='modal-main'>
            <button className='modal-close-btn' onClick={onClose}>X</button>
            <div className='modal-title'>
                Rename
            </div>
            <div  style={{padding: '20px 10px'}}>
                <input type='text' value={fileName} onChange={(event) => setFileName(event.target.value)}/>
            </div>
            <button className='active-btn-color modal-confirm-btn' onClick={updateRecord}>Update</button>
        </section>
    </div>
}

const ContextMenu = ({showMenu, xPos, yPos, record, copiedRecord, onCopy, onPaste, onRename, onDelete}) => {
    return <div>
        {showMenu ? 
            <div style={{position: 'absolute', top: yPos, left: xPos}}>
                <div className="dropdown-content">
                    <button href='#' onClick={onCopy}>Copy</button>
                    { copiedRecord && <button href='#' onClick={onPaste}>Paste</button>}
                    <button href='#' onClick={() => onRename(record)}>Rename</button>
                    <button href='#' style={{color:'red'}} onClick={onDelete}>Delete</button>
                </div>
            </div>
            : <></>
        }
    </div>
}

const InsertModal = ({showInsertModal, onCreate, onClose}) => {
    const [activeType, setActiveType] = useState('file');
    const [fileName, setFileName] = useState('');
    function createRecord(){
        onCreate(fileName, activeType);
        setFileName('');
    }
    return <div className={showInsertModal ? 'modal display-block' : 'modal display-none'}>
        <section className='modal-main'>
            <button className='modal-close-btn' onClick={onClose}>X</button>
            <div className='modal-title'>
                Create New
            </div>
            <div style={{padding: '10px'}}>
                <button 
                    className= {activeType === 'file' ? 'active-btn-color toggle-btn-1' : 'inactive-btn-color toggle-btn-1'}
                    onClick={() =>{setActiveType('file')}}
                >
                    File
                </button>
                <button
                    className= {activeType === 'folder' ? 'active-btn-color toggle-btn-2' : 'inactive-btn-color toggle-btn-2'}
                    onClick={() =>{setActiveType('folder')}}
                >
                    Folder
                </button>
            </div>
            <div  style={{paddingBottom: '10px'}}>
                <input type='text' value={fileName} onChange={(event) => setFileName(event.target.value)}/>
            </div>
            <button className='active-btn-color modal-confirm-btn' onClick={createRecord}>Create</button>
        </section>
    </div>
}

export default MainScreen;