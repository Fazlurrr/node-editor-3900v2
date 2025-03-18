import { Move, Scaling, Workflow, Clipboard, ClipboardPaste,
    Scissors, Trash2, Undo2, Redo2, ZoomIn, ZoomOut, Fullscreen, Lock} from 'lucide-react';
import { useState } from 'react';

const Toolbar = () => {
    const [mode, setMode] = useState('move');

    const iconStyle = 'w-5 h-5 ml-1.5 mt-1.5';
    const iconContainerStyle = 'w-8 h-full hover:text-black dark:hover:text-white mr-2';
    const activeIconContainerStyle = 'bg-gray-300';
    const dividerStyle = 'w-0.5 h-5 bg-[#B7C0CD] ml-2 mr-4';

    return (
        <div className="fixed top-12 bg-white h-8 w-screen z-20 border-b border-[#9facbc] text-[#61656E] dark:text-white dark:bg-navbar-dark">
            <div className='flex items-center h-full px-4 pl-5'>
                <div 
                    title="Move (V)" 
                    onClick={() => setMode('move')} 
                    className={`${iconContainerStyle} ${mode === 'move' ? activeIconContainerStyle : ''}`}
                >
                    <Move className={iconStyle} />
                </div>
                <div 
                    title="Transform (T)" 
                    onClick={() => setMode('transform')} 
                    className={`${iconContainerStyle} ${mode === 'transform' ? activeIconContainerStyle : ''}`}
                >
                    <Scaling className={iconStyle} />
                </div>
                <div 
                    title="Relation (R)" 
                    onClick={() => setMode('relation')} 
                    className={`${iconContainerStyle} ${mode === 'relation' ? activeIconContainerStyle : ''}`}
                >
                    <Workflow className={iconStyle} />
                </div>
                <div className={dividerStyle}></div>
                <div title="Copy (Ctrl+C)" className={iconContainerStyle}>
                    <Clipboard className={iconStyle} />
                </div>
                <div title="Paste (Ctrl+V)" className={iconContainerStyle}>
                    <ClipboardPaste className={iconStyle} />
                </div>
                <div title="Cut (Ctrl+X)" className={iconContainerStyle}>
                    <Scissors className={iconStyle} />
                </div>
                <div title="Delete (Backspace)" className={iconContainerStyle}>
                    <Trash2 className={iconStyle} />
                </div>
                <div className={dividerStyle}></div>
                <div title="Undo (Ctrl+Z)" className={iconContainerStyle}>
                    <Undo2 className={iconStyle} />
                </div>
                <div title="Redo (Ctrl+Shift+Z)" className={iconContainerStyle}>
                    <Redo2 className={iconStyle} />
                </div>
                <div className={dividerStyle}></div>
                <div title="Zoom In (+)" className={iconContainerStyle}>
                    <ZoomIn className={iconStyle} />
                </div>
                <div title="Zoom Out (-)" className={iconContainerStyle}>
                    <ZoomOut className={iconStyle} />
                </div>
                <div title="Fit View (Ctrl+F)" className={iconContainerStyle}>
                    <Fullscreen className={iconStyle} />
                </div>
                <div title="Lock Movement (Ctrl+L)" className={iconContainerStyle}>
                    <Lock className={iconStyle} />
                </div>
            </div>
        </div>
    );
}

export default Toolbar;