import { Move, Scaling, Workflow, Clipboard, ClipboardPaste,
    Scissors, Trash2, Undo2, Redo2, ZoomIn, ZoomOut, Fullscreen, Lock, Unlock} from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { useMode } from '@/hooks/useMode';
import { useReactFlow } from 'reactflow';

interface ToolbarProps {
    isLocked: boolean;
    onLockToggle: () => void;
}


const Toolbar = ({ isLocked, onLockToggle }: ToolbarProps) => {
    const { mode, setMode } = useMode();
    const { selectedElement, copy, cut, paste, handlePaste, handleTriggerDelete } = useClipboard();
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const iconStyle = 'w-5 h-5 ml-1.5 mt-1.5';
    const iconContainerStyle = 'w-8 h-full hover:text-black dark:hover:text-white mr-1';
    const activeIconContainerStyle = 'bg-gray-200 dark:bg-gray-700';
    const dividerStyle = 'w-0.5 h-5 bg-[#B7C0CD] ml-4 mr-5';

    return (
        <div className="fixed top-12 bg-white h-8 w-screen z-20 border-b border-[#9facbc] text-[#61656E] dark:text-gray-300 dark:bg-navbar-dark">
            <div className='flex items-center h-full px-4 pl-8'>
                <div 
                    title="Move (V)" 
                    onClick={() => setMode('move')} 
                    className={`${iconContainerStyle} ${mode === 'move' ? activeIconContainerStyle : ''} cursor-pointer`}
                >
                    <Move className={iconStyle} />
                </div>
                <div 
                    title="Transform (T)" 
                    onClick={() => setMode('transform')} 
                    className={`${iconContainerStyle} ${mode === 'transform' ? activeIconContainerStyle : ''} cursor-pointer`}
                >
                    <Scaling className={iconStyle} />
                </div>
                <div 
                    title="Relation (R)" 
                    onClick={() => setMode('relation')} 
                    className={`${iconContainerStyle} ${mode === 'relation' ? activeIconContainerStyle : ''} cursor-pointer`}
                >
                    <Workflow className={iconStyle} />
                </div>
                <div className={dividerStyle}></div>
                <div title="Copy (Ctrl+C)" className={`${iconContainerStyle} cursor-pointer`}
                    onClick={() => { if (selectedElement) copy(selectedElement); }}
                >
                    <Clipboard className={iconStyle} />
                </div>
                <div title="Paste (Ctrl+V)" className={`${iconContainerStyle} cursor-pointer`}
                    onClick={() => paste(handlePaste)}
                >
                    <ClipboardPaste className={iconStyle} />
                </div>
                <div title="Cut (Ctrl+X)" className={`${iconContainerStyle} cursor-pointer`}
                    onClick={() => { if (selectedElement) cut(selectedElement, handleTriggerDelete); }}
                >
                    <Scissors className={iconStyle} />
                </div>
                <div title="Delete (Backspace)" className={`${iconContainerStyle} cursor-pointer`} 
                    onClick={() => { if (selectedElement) handleTriggerDelete(); }}
                >
                    <Trash2 className={iconStyle} />
                </div>
                <div className={dividerStyle}></div>
                <div title="Undo (Ctrl+Z)" className={`${iconContainerStyle} cursor-pointer`}>
                    <Undo2 className={iconStyle} />
                </div>
                <div title="Redo (Ctrl+Shift+Z)" className={`${iconContainerStyle} cursor-pointer`}>
                    <Redo2 className={iconStyle} />
                </div>
                <div className={dividerStyle}></div>
                <div title="Zoom In (.)" className={`${iconContainerStyle} cursor-pointer`}
                    onClick={() => zoomIn({ duration: 100 })}
                >
                    <ZoomIn className={iconStyle} />
                </div>
                <div title="Zoom Out (-)" className={`${iconContainerStyle} cursor-pointer`}
                    onClick={() => zoomOut({ duration: 100 })}
                >
                    <ZoomOut className={iconStyle} />
                </div>
                <div title="Fit View (F)" className={`${iconContainerStyle} cursor-pointer`}
                    onClick={() => fitView({ duration: 300, padding: 0.1 })}
                >
                    <Fullscreen className={iconStyle} />
                </div>
                <div title="Lock Movement (L)" className={`${iconContainerStyle} ${isLocked ? activeIconContainerStyle : ''} cursor-pointer`}
                    onClick={onLockToggle}>
                    {isLocked ? <Lock className={iconStyle} /> : <Unlock className={iconStyle} />}
                </div>
            </div>
        </div>
    );
}

export default Toolbar;